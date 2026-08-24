import { ORS_API_KEY } from '@/modules/config/env';
import { MockRoutingProvider } from './mockRoutingProvider';
import { OrsRoutingProvider } from './orsRoutingProvider';
import type { RoutingProvider } from './types';

export type { LoopRouteRequest, PointToPointRouteRequest, RawRoute, RoutingProvider } from './types';

// Phase 2 wiring: real OpenRouteService routing when a key is configured, otherwise
// fall back to the Phase 1 mock so the app still runs without one. Nothing else in
// the app depends on which concrete provider is active.
if (!ORS_API_KEY) {
  console.warn(
    '[routing] No EXPO_PUBLIC_ORS_API_KEY set — using mock routes. See .env.example.',
  );
}

export const routingProvider: RoutingProvider = ORS_API_KEY
  ? new OrsRoutingProvider()
  : new MockRoutingProvider();
