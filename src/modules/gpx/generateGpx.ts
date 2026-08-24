import type { LatLng, ScoredRoute } from '@/types/route';

/** Builds a GPX 1.1 track from a scored route's segment geometry, for import into Strava, Runna, etc. */
export function generateGpx(route: ScoredRoute, name: string): string {
  const points: LatLng[] = route.segments.flatMap((segment) => segment.path);
  const trackPoints = points.filter((point, i) => {
    if (i === 0) return true;
    const prev = points[i - 1];
    return point.latitude !== prev.latitude || point.longitude !== prev.longitude;
  });

  const trkpts = trackPoints
    .map((p) => `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Illuminate" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(name)}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeXml(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
