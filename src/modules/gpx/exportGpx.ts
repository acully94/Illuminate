import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ScoredRoute } from '@/types/route';
import { generateGpx } from './generateGpx';

/**
 * Writes the route to a .gpx file and hands it to the OS share sheet — save to Files,
 * AirDrop, email, or upload manually into Strava/Runna. Illuminate only produces the
 * route; it isn't trying to replace those apps' run tracking.
 */
export async function exportRouteAsGpx(route: ScoredRoute, name: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  const fileName = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.gpx`;
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(generateGpx(route, name));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/gpx+xml',
    dialogTitle: 'Export route',
    UTI: 'com.topografix.gpx',
  });
}
