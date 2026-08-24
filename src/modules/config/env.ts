/**
 * EXPO_PUBLIC_-prefixed vars are inlined into the client bundle by Expo at build time —
 * there is no server between the app and OpenRouteService yet (that's a Phase 6 concern,
 * once there's a Supabase backend to proxy through), so this key is technically extractable
 * from the app bundle. Fine for a free-tier dev/prototype key; revisit before public release.
 */
export const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY ?? null;
