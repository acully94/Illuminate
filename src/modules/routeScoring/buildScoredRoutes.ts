import { crimeDataSource, lightingDataSource } from '@/modules/geoData';
import { routingProvider } from '@/modules/routing';
import type { RawRoute } from '@/modules/routing';
import type { RouteMode, RouteRequest, RouteSegment, ScoredRoute } from '@/types/route';
import { haversineDistanceMeters } from '@/utils/geo';
import { computeMidpoints } from './enrichRoute';
import { scoreSegments } from './scoreRoute';

const ALTERNATIVES_PER_REQUEST = 3;

/**
 * Requests route alternatives (loop or point-to-point), scores each one, then
 * labels them fastest / safest / balanced. Route engines don't have a "safe
 * mode" — this re-scoring and selection step is what actually produces it.
 *
 * Lighting/crime data is fetched once for all alternatives' points combined,
 * not once per alternative — both are shared, rate-limited public services
 * (Overpass, data.police.uk), and the alternatives for one search usually
 * cover overlapping ground anyway.
 */
export async function buildScoredRoutes(request: RouteRequest): Promise<Record<RouteMode, ScoredRoute>> {
  const rawRoutes: RawRoute[] =
    request.kind === 'loop'
      ? await routingProvider.getLoopAlternatives(
          { origin: request.origin, distanceMeters: request.distanceMeters },
          ALTERNATIVES_PER_REQUEST,
        )
      : await routingProvider.getPointToPointAlternatives(
          { origin: request.origin, destination: request.destination },
          ALTERNATIVES_PER_REQUEST,
        );

  const midpointsByRoute = rawRoutes.map((raw) => computeMidpoints(raw.path));
  const allMidpoints = midpointsByRoute.flat();

  const [litStatuses, crimeRisks] = await Promise.all([
    lightingDataSource.getLitStatus(allMidpoints),
    crimeDataSource.getCrimeRisk(allMidpoints),
  ]);

  let cursor = 0;
  const scored = rawRoutes.map((raw, routeIndex) => {
    const midpoints = midpointsByRoute[routeIndex];
    const segments: RouteSegment[] = midpoints.map((midpoint, i) => {
      const start = raw.path[i];
      const end = raw.path[i + 1];
      const globalIndex = cursor + i;
      return {
        id: `${raw.id}-segment-${i}`,
        path: [start, end],
        distanceMeters: haversineDistanceMeters(start, end),
        lit: litStatuses[globalIndex],
        crimeRisk: crimeRisks[globalIndex],
      };
    });
    cursor += midpoints.length;

    return {
      id: raw.id,
      mode: 'balanced' as RouteMode,
      distanceMeters: raw.distanceMeters,
      durationSeconds: raw.durationSeconds,
      segments,
      score: scoreSegments(segments),
    };
  });

  const fastest = scored.reduce((best, r) =>
    r.durationSeconds < best.durationSeconds ? r : best,
  );
  const safest = scored.reduce((best, r) => (r.score.safetyScore > best.score.safetyScore ? r : best));
  const balanced =
    scored.find((r) => r.id !== fastest.id && r.id !== safest.id) ?? scored[0];

  return {
    fastest: { ...fastest, mode: 'fastest' },
    safest: { ...safest, mode: 'safest' },
    balanced: { ...balanced, mode: 'balanced' },
  };
}
