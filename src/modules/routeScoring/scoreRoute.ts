import { SCORE_WEIGHTS } from '@/modules/config/appConfig';
import type { RouteScoreBreakdown, RouteSegment } from '@/types/route';

/** Pure scoring function — no network/UI dependencies, only what's already on each segment. */
export function scoreSegments(segments: RouteSegment[]): RouteScoreBreakdown {
  const totalDistance = segments.reduce((sum, s) => sum + s.distanceMeters, 0) || 1;

  const litDistance = segments
    .filter((s) => s.lit === true)
    .reduce((sum, s) => sum + s.distanceMeters, 0);
  const unlitDistance = segments
    .filter((s) => s.lit === false)
    .reduce((sum, s) => sum + s.distanceMeters, 0);
  const knownLightingDistance = litDistance + unlitDistance;
  const unknownLightingDistance = totalDistance - knownLightingDistance;

  const unknownLightingPercent = (unknownLightingDistance / totalDistance) * 100;
  // Only measured against the distance we actually have data for — a segment with
  // no `lit` tag is unknown, not unlit, so it must not drag this down either way.
  const litCoveragePercent = knownLightingDistance === 0 ? null : (litDistance / knownLightingDistance) * 100;

  const crimeSegments = segments.filter((s) => s.crimeRisk !== null);
  const crimeScore =
    crimeSegments.length === 0
      ? null
      : 100 -
        (crimeSegments.reduce((sum, s) => sum + (s.crimeRisk ?? 0), 0) / crimeSegments.length) *
          100;

  // Missing data falls back to whichever signal is available, rather than treated as
  // dangerous — a route we have no information about isn't evidence of a bad route.
  const safetyScore =
    litCoveragePercent === null
      ? crimeScore
      : crimeScore === null
        ? litCoveragePercent
        : litCoveragePercent * SCORE_WEIGHTS.lighting + crimeScore * SCORE_WEIGHTS.crime;

  return {
    litCoveragePercent,
    unknownLightingPercent,
    crimeScore,
    safetyScore,
  };
}
