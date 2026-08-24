import { SCORE_WEIGHTS } from '@/modules/config/appConfig';
import type { RouteScoreBreakdown, RouteSegment } from '@/types/route';

/** Pure scoring function — no network/UI dependencies, only what enrichRoute already fetched. */
export function scoreSegments(segments: RouteSegment[]): RouteScoreBreakdown {
  const totalDistance = segments.reduce((sum, s) => sum + s.distanceMeters, 0) || 1;

  const litDistance = segments
    .filter((s) => s.lit === true)
    .reduce((sum, s) => sum + s.distanceMeters, 0);
  const unknownLightingDistance = segments
    .filter((s) => s.lit === null)
    .reduce((sum, s) => sum + s.distanceMeters, 0);

  const litCoveragePercent = (litDistance / totalDistance) * 100;
  const unknownLightingPercent = (unknownLightingDistance / totalDistance) * 100;

  const crimeSegments = segments.filter((s) => s.crimeRisk !== null);
  const crimeScore =
    crimeSegments.length === 0
      ? null
      : 100 -
        (crimeSegments.reduce((sum, s) => sum + (s.crimeRisk ?? 0), 0) / crimeSegments.length) *
          100;

  // When crime data is unavailable, fall back to lighting alone rather than inventing a crime signal.
  const safetyScore =
    crimeScore === null
      ? litCoveragePercent
      : litCoveragePercent * SCORE_WEIGHTS.lighting + crimeScore * SCORE_WEIGHTS.crime;

  return {
    litCoveragePercent,
    unknownLightingPercent,
    crimeScore,
    safetyScore,
  };
}
