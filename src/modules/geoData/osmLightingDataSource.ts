import type { LatLng } from '@/types/route';
import { distanceToSegmentMeters, paddedBoundingBox } from '@/utils/geo';
import type { LightingDataSource } from './types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const QUERY_TIMEOUT_MS = 20000;
const QUERY_PADDING_METERS = 80;
/** A point further than this from any OSM way isn't considered "on" it — treated as unknown. */
const MATCH_RADIUS_METERS = 35;

type Way = { path: LatLng[]; lit: boolean | null };

async function fetchWays(points: LatLng[]): Promise<Way[]> {
  const bbox = paddedBoundingBox(points, QUERY_PADDING_METERS);
  const query = `[out:json][timeout:25];(way["highway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east}););out geom;`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Overpass request failed (HTTP ${response.status})`);
    }
    const data = await response.json();
    const elements: Array<{ type: string; geometry?: Array<{ lat: number; lon: number }>; tags?: Record<string, string> }> =
      data.elements ?? [];

    return elements
      .filter((el) => el.type === 'way' && el.geometry && el.geometry.length >= 2)
      .map((el) => ({
        path: el.geometry!.map((point) => ({ latitude: point.lat, longitude: point.lon })),
        lit: el.tags?.lit === 'yes' ? true : el.tags?.lit === 'no' ? false : null,
      }));
  } finally {
    clearTimeout(timeout);
  }
}

function nearestWay(point: LatLng, ways: Way[]): { way: Way; distance: number } | null {
  let best: { way: Way; distance: number } | null = null;
  for (const way of ways) {
    let distance = Infinity;
    for (let i = 1; i < way.path.length; i += 1) {
      distance = Math.min(distance, distanceToSegmentMeters(point, way.path[i - 1], way.path[i]));
    }
    if (!best || distance < best.distance) best = { way, distance };
  }
  return best;
}

/**
 * Real adapter for OSM `lit` tags, via a single Overpass query covering the whole
 * batch of points (not one query per point — Overpass is a shared, rate-limited
 * public service). A point with no nearby `highway` way, or a way with no `lit`
 * tag at all, comes back null — never guessed. If the query itself fails
 * (Overpass is occasionally slow/unavailable), the whole batch degrades to
 * null rather than breaking route generation.
 */
export class OsmLightingDataSource implements LightingDataSource {
  async getLitStatus(points: LatLng[]): Promise<Array<boolean | null>> {
    if (points.length === 0) return [];

    let ways: Way[];
    try {
      ways = await fetchWays(points);
    } catch (error) {
      console.warn('[lighting] Overpass query failed, returning unknown for this route:', error);
      return points.map(() => null);
    }

    return points.map((point) => {
      const match = nearestWay(point, ways);
      return match && match.distance <= MATCH_RADIUS_METERS ? match.way.lit : null;
    });
  }
}
