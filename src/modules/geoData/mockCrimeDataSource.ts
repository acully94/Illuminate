import type { LatLng } from '@/types/route';
import { isInsideLaunchRegion } from '@/modules/config/appConfig';
import type { CrimeDataSource } from './types';

function seededFraction(point: LatLng): number {
  const seed = Math.sin(point.latitude * 43758.5453 + point.longitude * 15731.7431);
  return seed - Math.floor(seed);
}

/**
 * Stands in for the data.police.uk adapter during Phase 1. Mirrors real
 * coverage: null outside the England & Wales launch region, a risk fraction
 * inside it.
 */
export class MockCrimeDataSource implements CrimeDataSource {
  async getCrimeRisk(points: LatLng[]): Promise<Array<number | null>> {
    return points.map((point) => {
      if (!isInsideLaunchRegion(point)) return null;
      return seededFraction(point);
    });
  }
}
