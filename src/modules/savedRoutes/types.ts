import type { ScoredRoute } from '@/types/route';

export type SavedRoute = {
  id: string;
  savedAt: string;
  label: string;
  route: ScoredRoute;
};
