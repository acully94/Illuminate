import type { LatLng } from '@/types/route';

const EARTH_RADIUS_METERS = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

export function pathDistanceMeters(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += haversineDistanceMeters(path[i - 1], path[i]);
  }
  return total;
}

/** Offsets a point by the given metres along north/east axes — flat-earth approximation, fine at this scale. */
export function offsetMeters(origin: LatLng, north: number, east: number): LatLng {
  const latitude = origin.latitude + (north / EARTH_RADIUS_METERS) * (180 / Math.PI);
  const longitude =
    origin.longitude +
    (east / (EARTH_RADIUS_METERS * Math.cos(toRadians(origin.latitude)))) * (180 / Math.PI);
  return { latitude, longitude };
}

/** Inverse of offsetMeters — how far north/east `point` is from `origin`, in metres. */
export function northEastMetersFrom(origin: LatLng, point: LatLng): { north: number; east: number } {
  const north = toRadians(point.latitude - origin.latitude) * EARTH_RADIUS_METERS;
  const east =
    toRadians(point.longitude - origin.longitude) * EARTH_RADIUS_METERS * Math.cos(toRadians(origin.latitude));
  return { north, east };
}
