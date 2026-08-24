export type DistanceUnit = 'km' | 'mi';

export type AppSettings = {
  unit: DistanceUnit;
  /** Canonical pace storage, independent of display unit: seconds to cover one kilometre. */
  walkingSecondsPerKm: number;
  runningSecondsPerKm: number;
};
