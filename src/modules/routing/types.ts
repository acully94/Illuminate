import type { LatLng } from '@/types/route';

export type LoopRouteRequest = {
  origin: LatLng;
  distanceMeters: number;
};

export type PointToPointRouteRequest = {
  origin: LatLng;
  destination: LatLng;
};

/** Raw route geometry from a routing engine — no safety scoring attached yet. */
export type RawRoute = {
  id: string;
  path: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
};

/**
 * Provider-agnostic routing client. Real adapters (OpenRouteService now,
 * GraphHopper later) implement this; nothing above this layer knows which
 * engine produced a route.
 *
 * Loop routing (start = end, hit a target distance) is not a single API call
 * on most engines — `getLoopAlternatives` is expected to generate candidate
 * waypoints/variations itself and return several raw routes for the caller
 * to score and choose between, rather than asking the engine for one
 * "correct" answer. `getPointToPointAlternatives` is the same idea for
 * routes between two distinct points.
 */
export interface RoutingProvider {
  getLoopAlternatives(request: LoopRouteRequest, count: number): Promise<RawRoute[]>;
  getPointToPointAlternatives(request: PointToPointRouteRequest, count: number): Promise<RawRoute[]>;
}
