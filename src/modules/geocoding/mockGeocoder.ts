import { DEFAULT_ORIGIN } from '@/modules/config/appConfig';
import type { LatLng } from '@/types/route';
import { offsetMeters } from '@/utils/geo';

export type GeocodeResult = { label: string; point: LatLng };

/** A handful of recognisable London-area landmarks so common searches resolve to somewhere real. */
const KNOWN_PLACES: GeocodeResult[] = [
  { label: 'Hyde Park', point: { latitude: 51.5073, longitude: -0.1657 } },
  { label: 'Richmond Park', point: { latitude: 51.4427, longitude: -0.2751 } },
  { label: 'Clapham Common', point: { latitude: 51.4618, longitude: -0.1487 } },
  { label: 'Wimbledon Common', point: { latitude: 51.439, longitude: -0.236 } },
  { label: 'Victoria Park', point: { latitude: 51.5361, longitude: -0.036 } },
  { label: 'Greenwich Park', point: { latitude: 51.4769, longitude: -0.0005 } },
];

/**
 * Stands in for a real geocoder (a Phase 2+ concern once a places/address API is picked).
 * Matches known landmarks by name, and otherwise derives a deterministic nearby point from
 * the query text so any typed input resolves to a stable, re-enterable location rather than
 * silently failing — same "mocked but honest and functional" approach as the routing/scoring
 * mocks elsewhere in Phase 1.
 */
export function mockGeocode(query: string): GeocodeResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const exact = KNOWN_PLACES.find((place) => place.label.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const partial = KNOWN_PLACES.find((place) =>
    place.label.toLowerCase().includes(trimmed.toLowerCase()),
  );
  if (partial) return partial;

  let hash = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0;
  }
  const north = (hash % 4000) - 2000;
  const east = ((hash >> 8) % 4000) - 2000;

  return { label: trimmed, point: offsetMeters(DEFAULT_ORIGIN, north, east) };
}
