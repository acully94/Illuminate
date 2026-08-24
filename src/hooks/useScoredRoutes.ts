import { useEffect, useState } from 'react';
import { buildScoredRoutes } from '@/modules/routeScoring';
import type { RouteMode, RouteRequest, ScoredRoute } from '@/types/route';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; routes: Record<RouteMode, ScoredRoute> };

export function useScoredRoutes(request: RouteRequest): State {
  const [state, setState] = useState<State>({ status: 'loading' });
  const requestKey = JSON.stringify(request);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    buildScoredRoutes(request)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return state;
}
