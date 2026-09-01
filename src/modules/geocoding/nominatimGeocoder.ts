import type { GeocodeResult } from './types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Nominatim's usage policy requires a real identifying User-Agent — no API key, but this is mandatory.
const USER_AGENT = 'Illuminate-App/1.0 (https://github.com/acully94/Illuminate)';

type NominatimResult = { display_name: string; lat: string; lon: string };

function shortLabel(displayName: string): string {
  return displayName.split(',').slice(0, 2).join(',').trim();
}

/** Free named-place search (landmarks, streets, areas) via OpenStreetMap's Nominatim. */
export async function searchPlacesByName(query: string): Promise<GeocodeResult[]> {
  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&countrycodes=gb&limit=6`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return [];
    const data: NominatimResult[] = await response.json();
    return data.map((item) => ({
      label: shortLabel(item.display_name),
      fullLabel: item.display_name,
      point: { latitude: Number(item.lat), longitude: Number(item.lon) },
    }));
  } catch {
    return [];
  }
}
