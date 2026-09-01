import { isInsideLaunchRegion } from '@/modules/config/appConfig';
import type { LatLng } from '@/types/route';
import { haversineDistanceMeters } from '@/utils/geo';
import type { CrimeDataSource } from './types';

const MAX_SAMPLE_POINTS = 8;
/** Crime counts near a sample point at/above this are treated as maximum (1.0) relative risk. */
const CRIME_COUNT_SATURATION = 40;

// data.police.uk publishes monthly with a lag — try the most recently likely-available
// month first, then fall back one further back if that month isn't published yet.
const MONTHS_BACK_TO_TRY = [3, 4];

// Module-level cache: crime density doesn't change between renders, and route
// alternatives for the same search often sample overlapping areas.
const cache = new Map<string, Promise<number[] | null>>();

function crimeMonth(monthsBack: number): string {
  const date = new Date();
  date.setDate(1); // avoid month rollover surprises when setMonth crosses a shorter month
  date.setMonth(date.getMonth() - monthsBack);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

async function fetchCrimeLocations(point: LatLng, date: string): Promise<Array<{ latitude: number; longitude: number }> | null> {
  const response = await fetch(
    `https://data.police.uk/api/crimes-street/all-crime?lat=${point.latitude}&lng=${point.longitude}&date=${date}`,
  );
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data)) return null;
  return data
    .filter((crime) => crime?.location?.latitude && crime?.location?.longitude)
    .map((crime) => ({
      latitude: Number(crime.location.latitude),
      longitude: Number(crime.location.longitude),
    }));
}

/** Relative 0-1 risk for one sample point, cached per point+month. */
async function riskForSamplePoint(point: LatLng): Promise<number | null> {
  const key = `${point.latitude.toFixed(3)},${point.longitude.toFixed(3)}`;
  if (cache.has(key)) {
    const cached = await cache.get(key)!;
    return cached ? cached[0] : null;
  }

  const promise = (async (): Promise<number[] | null> => {
    for (const monthsBack of MONTHS_BACK_TO_TRY) {
      const locations = await fetchCrimeLocations(point, crimeMonth(monthsBack)).catch(() => null);
      if (locations !== null) {
        return [Math.min(locations.length / CRIME_COUNT_SATURATION, 1)];
      }
    }
    return null;
  })();

  cache.set(key, promise);
  const result = await promise;
  return result ? result[0] : null;
}

function pickSamplePoints(points: LatLng[]): LatLng[] {
  if (points.length <= MAX_SAMPLE_POINTS) return points;
  const step = (points.length - 1) / (MAX_SAMPLE_POINTS - 1);
  return Array.from({ length: MAX_SAMPLE_POINTS }, (_, i) => points[Math.round(i * step)]);
}

/**
 * Real adapter for data.police.uk. Coverage is England & Wales (this app is scoped
 * further, to inside the M25) — null outside that, and null if a request fails,
 * rather than a fabricated score. Queries a handful of sample points spread across
 * the batch (not one per point — data.police.uk's per-point search radius is
 * already about a mile, so dense per-point sampling would be redundant and slow),
 * then assigns each point the risk of its nearest sample.
 */
export class DataPoliceUkCrimeDataSource implements CrimeDataSource {
  async getCrimeRisk(points: LatLng[]): Promise<Array<number | null>> {
    const inCoverage = points.filter(isInsideLaunchRegion);
    if (inCoverage.length === 0) return points.map(() => null);

    const samples = pickSamplePoints(inCoverage);
    const sampleRisks = await Promise.all(samples.map(riskForSamplePoint));

    return points.map((point) => {
      if (!isInsideLaunchRegion(point)) return null;

      let nearestIndex = 0;
      let nearestDistance = Infinity;
      samples.forEach((sample, i) => {
        const distance = haversineDistanceMeters(point, sample);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      });
      return sampleRisks[nearestIndex];
    });
  }
}
