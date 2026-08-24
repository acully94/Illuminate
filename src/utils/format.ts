import type { DistanceUnit } from '@/modules/settings/types';

const METERS_PER_MILE = 1609.344;

export function metersToDisplayDistance(meters: number, unit: DistanceUnit): number {
  return unit === 'mi' ? meters / METERS_PER_MILE : meters / 1000;
}

export function formatDistance(meters: number, unit: DistanceUnit): string {
  return `${metersToDisplayDistance(meters, unit).toFixed(1)} ${unit}`;
}

/** Applies a seconds-per-km pace to a distance, returning total duration in seconds. */
export function paceDurationSeconds(distanceMeters: number, secondsPerKm: number): number {
  return (distanceMeters / 1000) * secondsPerKm;
}

export function formatDuration(totalSeconds: number): string {
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}

/** Converts a canonical seconds-per-km pace into seconds-per-display-unit, for editing in the current unit. */
export function secondsPerKmToUnitPace(secondsPerKm: number, unit: DistanceUnit): number {
  return unit === 'mi' ? secondsPerKm * (METERS_PER_MILE / 1000) : secondsPerKm;
}

export function unitPaceToSecondsPerKm(secondsPerUnit: number, unit: DistanceUnit): number {
  return unit === 'mi' ? secondsPerUnit / (METERS_PER_MILE / 1000) : secondsPerUnit;
}

export function formatPace(secondsPerUnit: number): string {
  const minutes = Math.floor(secondsPerUnit / 60);
  const seconds = Math.round(secondsPerUnit % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
