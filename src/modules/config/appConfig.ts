import type { LatLng } from '@/types/route';

/** Rough bounding box for "inside the M25" — the locked Phase 1-4 launch region. */
export const LAUNCH_REGION_BOUNDS = {
  north: 51.72,
  south: 51.29,
  east: 0.35,
  west: -0.58,
};

export const DEFAULT_ORIGIN: LatLng = {
  latitude: 51.5072,
  longitude: -0.1276,
};

export const DISTANCE_OPTIONS_METERS = [2000, 3000, 5000, 10000] as const;

export const SCORE_WEIGHTS = {
  lighting: 0.6,
  crime: 0.4,
};

export function isInsideLaunchRegion(point: LatLng): boolean {
  return (
    point.latitude <= LAUNCH_REGION_BOUNDS.north &&
    point.latitude >= LAUNCH_REGION_BOUNDS.south &&
    point.longitude <= LAUNCH_REGION_BOUNDS.east &&
    point.longitude >= LAUNCH_REGION_BOUNDS.west
  );
}
