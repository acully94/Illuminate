import { MockRoutingProvider } from './mockRoutingProvider';

export type { LoopRouteRequest, PointToPointRouteRequest, RawRoute, RoutingProvider } from './types';

// Phase 1 wiring: mocked provider. Swap for the OpenRouteService adapter in Phase 2
// by changing this line — nothing else in the app depends on the concrete class.
export const routingProvider = new MockRoutingProvider();
