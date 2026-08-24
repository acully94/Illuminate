import { MockCrimeDataSource } from './mockCrimeDataSource';
import { MockLightingDataSource } from './mockLightingDataSource';

export type { CrimeDataSource, LightingDataSource } from './types';

// Phase 1 wiring: mocked sources. Swap for the OSM/data.police.uk adapters in Phase 3-4
// by changing these two lines — nothing else in the app depends on the concrete class.
export const lightingDataSource = new MockLightingDataSource();
export const crimeDataSource = new MockCrimeDataSource();
