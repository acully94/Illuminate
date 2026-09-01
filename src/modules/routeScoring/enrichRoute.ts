import type { LatLng } from '@/types/route';

/** Midpoint of each consecutive pair of points along a path — one per segment. */
export function computeMidpoints(path: LatLng[]): LatLng[] {
  return path.slice(1).map((point, i) => {
    const prev = path[i];
    return {
      latitude: (prev.latitude + point.latitude) / 2,
      longitude: (prev.longitude + point.longitude) / 2,
    };
  });
}
