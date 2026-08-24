import type { LatLng } from '@/types/route';
import { northEastMetersFrom, offsetMeters, pathDistanceMeters } from '@/utils/geo';
import type { LoopRouteRequest, PointToPointRouteRequest, RawRoute, RoutingProvider } from './types';

const AVERAGE_WALKING_SPEED_MPS = 1.4;
const POINTS_PER_LOOP = 16;
const POINTS_PER_LEG = 12;

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

/** A gently bowed path between two points — each alternative bows a different amount/direction. */
function buildPointToPoint(origin: LatLng, destination: LatLng, alternativeIndex: number): LatLng[] {
  const { north: destNorth, east: destEast } = northEastMetersFrom(origin, destination);
  const straightDistance = Math.sqrt(destNorth ** 2 + destEast ** 2) || 1;
  const perpNorth = -destEast / straightDistance;
  const perpEast = destNorth / straightDistance;
  const bowMeters = straightDistance * 0.12 * (alternativeIndex - 1); // spreads alternatives either side of the direct line

  const points: LatLng[] = [];
  for (let i = 0; i <= POINTS_PER_LEG; i += 1) {
    const t = i / POINTS_PER_LEG;
    const bow = Math.sin(t * Math.PI) * bowMeters;
    const north = destNorth * t + perpNorth * bow;
    const east = destEast * t + perpEast * bow;
    points.push(i === POINTS_PER_LEG ? destination : offsetMeters(origin, north, east));
  }
  return points;
}

function toRawRoute(id: string, path: LatLng[]): RawRoute {
  const distanceMeters = pathDistanceMeters(path);
  return {
    id,
    path,
    distanceMeters,
    durationSeconds: distanceMeters / AVERAGE_WALKING_SPEED_MPS,
  };
}

/**
 * Stands in for the OpenRouteService adapter during Phase 1. Real pedestrian
 * routing engines don't take "give me a 5km loop" (or "give me 3 distinct
 * routes between A and B") as a single request, so this mirrors the intended
 * real strategy: generate several candidate geometries and hand them back
 * for the scoring engine to evaluate and choose between.
 */
export class MockRoutingProvider implements RoutingProvider {
  async getLoopAlternatives(request: LoopRouteRequest, count: number): Promise<RawRoute[]> {
    const alternatives: RawRoute[] = [];
    for (let i = 0; i < count; i += 1) {
      alternatives.push(toRawRoute(`mock-loop-${i}`, buildLoop(request.origin, request.distanceMeters, i)));
    }
    return alternatives;
  }

  async getPointToPointAlternatives(request: PointToPointRouteRequest, count: number): Promise<RawRoute[]> {
    const alternatives: RawRoute[] = [];
    for (let i = 0; i < count; i += 1) {
      alternatives.push(
        toRawRoute(`mock-p2p-${i}`, buildPointToPoint(request.origin, request.destination, i)),
      );
    }
    return alternatives;
  }
}
