import type { LatLng } from '@/types/route';
import { offsetMeters, pathDistanceMeters } from '@/utils/geo';
import type { LoopRouteRequest, RawRoute, RoutingProvider } from './types';

const AVERAGE_WALKING_SPEED_MPS = 1.4;
const POINTS_PER_LOOP = 16;

// Deterministic per-alternative jitter so re-requesting the same inputs gives stable shapes.
function seededJitter(seed: number, index: number): number {
  const value = Math.sin(seed * 991 + index * 57.13);
  return value - Math.floor(value);
}

function buildLoop(origin: LatLng, distanceMeters: number, alternativeIndex: number): LatLng[] {
  const radius = distanceMeters / (2 * Math.PI);
  const rotationOffset = (alternativeIndex * 2 * Math.PI) / 5;

  const points: LatLng[] = [];
  for (let i = 0; i <= POINTS_PER_LOOP; i += 1) {
    const angle = (i / POINTS_PER_LOOP) * 2 * Math.PI + rotationOffset;
    const wobble = 0.85 + seededJitter(alternativeIndex, i) * 0.3; // keeps it from being a perfect circle
    const north = Math.cos(angle) * radius * wobble;
    const east = Math.sin(angle) * radius * wobble;
    points.push(i === POINTS_PER_LOOP ? origin : offsetMeters(origin, north, east));
  }
  return points;
}

/**
 * Stands in for the OpenRouteService adapter during Phase 1. Real pedestrian
 * routing engines don't take "give me a 5km loop" as a single request, so
 * this mirrors the intended real strategy: generate several candidate loop
 * geometries around the target distance and hand them back for the scoring
 * engine to evaluate and choose between.
 */
export class MockRoutingProvider implements RoutingProvider {
  async getLoopAlternatives(request: LoopRouteRequest, count: number): Promise<RawRoute[]> {
    const alternatives: RawRoute[] = [];
    for (let i = 0; i < count; i += 1) {
      const path = buildLoop(request.origin, request.distanceMeters, i);
      const distanceMeters = pathDistanceMeters(path);
      alternatives.push({
        id: `mock-route-${i}`,
        path,
        distanceMeters,
        durationSeconds: distanceMeters / AVERAGE_WALKING_SPEED_MPS,
      });
    }
    return alternatives;
  }
}
