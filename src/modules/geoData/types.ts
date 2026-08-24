import type { LatLng } from '@/types/route';

/**
 * Provider-agnostic interface for "is this stretch of path lit". Real adapters
 * (OSM `lit` tags now, OS NGD later) implement this; the scoring engine only
 * ever talks to this interface.
 */
export interface LightingDataSource {
  /** Returns null for a point when no lighting data exists there — callers must not assume false. */
  getLitStatus(points: LatLng[]): Promise<Array<boolean | null>>;
}

/**
 * Provider-agnostic interface for area-level crime signal (e.g. data.police.uk).
 * Coverage is regional (England & Wales) — return null outside coverage rather
 * than fabricating a score.
 */
export interface CrimeDataSource {
  /** 0 (low) - 1 (high) relative risk per point, or null where out of coverage. */
  getCrimeRisk(points: LatLng[]): Promise<Array<number | null>>;
}
