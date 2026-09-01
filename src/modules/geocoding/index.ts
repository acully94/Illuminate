import { looksLikePostcode, searchPostcodes } from './postcodesIoGeocoder';
import { searchPlacesByName } from './nominatimGeocoder';
import type { GeocodeResult } from './types';

export type { GeocodeResult } from './types';

/**
 * Real geocoding, replacing the Phase 1 mock. UK postcodes go to postcodes.io (free,
 * keyless, purpose-built, returns coordinates directly); anything else — landmarks,
 * streets, place names — goes to Nominatim (OpenStreetMap's free search). Falls back
 * to Nominatim if a postcode-shaped query comes back empty, since "E14" could also be
 * the start of a place name.
 */
export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  if (looksLikePostcode(trimmed)) {
    const postcodeResults = await searchPostcodes(trimmed);
    if (postcodeResults.length > 0) return postcodeResults;
  }

  return searchPlacesByName(trimmed);
}
