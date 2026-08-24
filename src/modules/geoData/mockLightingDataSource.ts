import type { LatLng } from '@/types/route';
import type { LightingDataSource } from './types';

// Deterministic pseudo-random from a coordinate, so re-scoring the same mock
// route gives stable results instead of flickering between renders.
function seededFraction(point: LatLng): number {
  const seed = Math.sin(point.latitude * 12345.6789 + point.longitude * 98765.4321);
  return seed - Math.floor(seed);
}

/**
 * Stands in for the OSM `lit`-tag adapter during Phase 1. Roughly mirrors the
 * real world: most points are lit, a meaningful slice are known-unlit, and a
 * small slice are unknown — never all lit, so the UI's "data unavailable"
 * path gets exercised too.
 */
export class MockLightingDataSource implements LightingDataSource {
  async getLitStatus(points: LatLng[]): Promise<Array<boolean | null>> {
    return points.map((point) => {
      const fraction = seededFraction(point);
      if (fraction < 0.08) return null;
      return fraction > 0.25;
    });
  }
}
