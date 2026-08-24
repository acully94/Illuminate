import { routingProvider } from '@/modules/routing';
import type { LatLng, RouteMode, ScoredRoute } from '@/types/route';
import { enrichRoute } from './enrichRoute';
import { scoreSegments } from './scoreRoute';

const ALTERNATIVES_PER_REQUEST = 3;

/**
 * Requests loop route alternatives, scores each one, then labels them
 * fastest / safest / balanced. Route engines don't have a "safe mode" —
 * this re-scoring and selection step is what actually produces it.
 */
export async function buildScoredRoutes(
  origin: LatLng,
  distanceMeters: number,
): Promise<Record<RouteMode, ScoredRoute>> {
  const rawRoutes = await routingProvider.getLoopAlternatives(
    { origin, distanceMeters },
    ALTERNATIVES_PER_REQUEST,
  );

  const scored = await Promise.all(
    rawRoutes.map(async (raw) => {
      const segments = await enrichRoute(raw);
      const score = scoreSegments(segments);
      return {
        id: raw.id,
        mode: 'balanced' as RouteMode,
        distanceMeters: raw.distanceMeters,
        durationSeconds: raw.durationSeconds,
        segments,
        score,
      };
    }),
  );

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
