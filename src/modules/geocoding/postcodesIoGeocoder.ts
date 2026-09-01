import type { GeocodeResult } from './types';

/** True for anything that looks like the start of a UK postcode (full or partial outward code). */
export function looksLikePostcode(query: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?(\s*\d[A-Z]{0,2})?$/i.test(query.trim());
}

type PostcodesIoResult = { postcode: string; latitude: number; longitude: number };

/** Free, keyless UK postcode search — returns coordinates directly, no second lookup needed. */
export async function searchPostcodes(query: string): Promise<GeocodeResult[]> {
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(query)}&limit=6`);
    if (!response.ok) return [];
    const data: { result: PostcodesIoResult[] | null } = await response.json();
    return (data.result ?? []).map((item) => ({
      label: item.postcode,
      point: { latitude: item.latitude, longitude: item.longitude },
    }));
  } catch {
    return [];
  }
}
