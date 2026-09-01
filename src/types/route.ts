export type LatLng = {
  latitude: number;
  longitude: number;
};

export type RouteMode = 'fastest' | 'balanced' | 'safest';

export type RouteRequest =
  | { kind: 'loop'; origin: LatLng; distanceMeters: number }
  | { kind: 'point-to-point'; origin: LatLng; destination: LatLng };

/** A single stretch of a route, annotated with whatever safety signals are available for it. */
export type RouteSegment = {
  id: string;
  path: LatLng[];
  distanceMeters: number;
  /** null when no lighting data exists for this segment — never guess a value. */
  lit: boolean | null;
  /** 0 (low) - 1 (high) relative crime signal for the area this segment passes through, or null if out of data.police.uk coverage. */
  crimeRisk: number | null;
};

export type RouteScoreBreakdown = {
  /**
   * 0-100. Share of the route's *known-lighting* distance (lit=true or lit=false
   * segments only) that's lit — segments with no data are excluded from this, not
   * treated as unlit. Null when there's no lighting data for any part of the route.
   */
  litCoveragePercent: number | null;
  /** 0-100. Share of the route's distance with no lighting data at all — the honest "we don't know" signal. */
  unknownLightingPercent: number;
  /** 0-100, higher is safer. Null when the route falls entirely outside crime-data coverage. */
  crimeScore: number | null;
  /** 0-100 composite safety score. Null only when neither lighting nor crime data exists for this route at all. */
  safetyScore: number | null;
};

export type ScoredRoute = {
  id: string;
  mode: RouteMode;
  distanceMeters: number;
  durationSeconds: number;
  segments: RouteSegment[];
  score: RouteScoreBreakdown;
};
