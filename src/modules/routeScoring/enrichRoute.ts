import { crimeDataSource, lightingDataSource } from '@/modules/geoData';
import type { RawRoute } from '@/modules/routing';
import type { RouteSegment } from '@/types/route';
import { haversineDistanceMeters } from '@/utils/geo';

/** Splits a raw path into segments and attaches lighting/crime data to each. */
export async function enrichRoute(route: RawRoute): Promise<RouteSegment[]> {
  const midpoints = route.path.slice(1).map((point, i) => {
    const prev = route.path[i];
    return {
      latitude: (prev.latitude + point.latitude) / 2,
      longitude: (prev.longitude + point.longitude) / 2,
    };
  });

  const [litStatuses, crimeRisks] = await Promise.all([
    lightingDataSource.getLitStatus(midpoints),
    crimeDataSource.getCrimeRisk(midpoints),
  ]);

  return midpoints.map((midpoint, i) => {
    const start = route.path[i];
    const end = route.path[i + 1];
    return {
      id: `${route.id}-segment-${i}`,
      path: [start, end],
      distanceMeters: haversineDistanceMeters(start, end),
      lit: litStatuses[i],
      crimeRisk: crimeRisks[i],
    };
  });
}
