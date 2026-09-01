import { DataPoliceUkCrimeDataSource } from './dataPoliceUkCrimeDataSource';
import { OsmLightingDataSource } from './osmLightingDataSource';

export type { CrimeDataSource, LightingDataSource } from './types';

// Phase 3-4 wiring: real adapters. Both are free, keyless public APIs, so unlike
// routing there's no mock fallback to wire in — nothing else in the app depends
// on which concrete class is used here.
export const lightingDataSource = new OsmLightingDataSource();
export const crimeDataSource = new DataPoliceUkCrimeDataSource();
