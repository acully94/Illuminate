import { useEffect, useState } from 'react';
import { buildScoredRoutes } from '@/modules/routeScoring';
import type { LatLng, RouteMode, ScoredRoute } from '@/types/route';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; routes: Record<RouteMode, ScoredRoute> };

export function useScoredRoutes(origin: LatLng, distanceMeters: number): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    buildScoredRoutes(origin, distanceMeters)
      .then((routes) => {
        if (!cancelled) setState({ status: 'ready', routes });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to generate routes',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [origin.latitude, origin.longitude, distanceMeters]);

  return state;
}
