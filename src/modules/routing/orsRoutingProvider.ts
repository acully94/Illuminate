import { ORS_API_KEY } from '@/modules/config/env';
import type { LatLng } from '@/types/route';
import type { LoopRouteRequest, PointToPointRouteRequest, RawRoute, RoutingProvider } from './types';

const BASE_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

type OrsFeature = {
  properties: { summary: { distance: number; duration: number } };
  geometry: { coordinates: [number, number][] };
};

type OrsResponse = { features: OrsFeature[] };

async function postDirections(body: Record<string, unknown>): Promise<OrsFeature[]> {
  if (!ORS_API_KEY) {
    throw new Error('No OpenRouteService API key configured (EXPO_PUBLIC_ORS_API_KEY).');
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message = detail?.error?.message ?? `OpenRouteService request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }

  const data: OrsResponse = await response.json();
  return data.features;
}

function toRawRoute(id: string, feature: OrsFeature): RawRoute {
  const path: LatLng[] = feature.geometry.coordinates.map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
  return {
    id,
    path,
    distanceMeters: feature.properties.summary.distance,
    durationSeconds: feature.properties.summary.duration,
  };
}

/**
 * Real pedestrian routing via OpenRouteService. ORS doesn't take "give me a
 * 5km loop" as a single deterministic answer either — this uses its purpose-built
 * `round_trip` option (one request per alternative, varying `seed`) for loops, and
 * its native `alternative_routes` option (one request, several routes back) for
 * point-to-point — rather than the manual waypoint-jitter approach the mock
 * provider used as a stand-in for this in Phase 1.
 */
export class OrsRoutingProvider implements RoutingProvider {
  async getLoopAlternatives(request: LoopRouteRequest, count: number): Promise<RawRoute[]> {
    const requests = Array.from({ length: count }, (_, seed) =>
      postDirections({
        coordinates: [[request.origin.longitude, request.origin.latitude]],
        options: {
          round_trip: {
            length: request.distanceMeters,
            points: 5,
            seed,
          },
        },
      }),
    );

    const results = await Promise.all(requests);
    return results.map((features, i) => toRawRoute(`ors-loop-${i}`, features[0]));
  }

  async getPointToPointAlternatives(
    request: PointToPointRouteRequest,
    count: number,
  ): Promise<RawRoute[]> {
    const features = await postDirections({
      coordinates: [
        [request.origin.longitude, request.origin.latitude],
        [request.destination.longitude, request.destination.latitude],
      ],
      alternative_routes: {
        target_count: count,
        weight_factor: 1.6,
        share_factor: 0.6,
      },
    });

    // ORS only returns as many distinct alternatives as the road network actually supports.
    return features.map((feature, i) => toRawRoute(`ors-p2p-${i}`, feature));
  }
}
