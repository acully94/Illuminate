import type { LatLng } from '@/types/route';

export type GeocodeResult = {
  /** Short label shown once selected — the input field shouldn't stay full of a long address. */
  label: string;
  /** Full address, shown in the dropdown for disambiguation, when available. */
  fullLabel?: string;
  point: LatLng;
};
