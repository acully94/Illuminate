import { Platform, StyleSheet, Text, View } from 'react-native';
import type { LatLng, RouteSegment } from '@/types/route';

const SEGMENT_COLORS = {
  lit: '#1B8A5A',
  unlit: '#C0392B',
  unknown: '#999999',
};

function segmentColor(segment: RouteSegment): string {
  if (segment.lit === true) return SEGMENT_COLORS.lit;
  if (segment.lit === false) return SEGMENT_COLORS.unlit;
  return SEGMENT_COLORS.unknown;
}

/** Merges consecutive same-color segments into one polyline each — real routing
 * geometry can carry hundreds of tiny segments, and rendering one Polyline per
 * segment doesn't scale the way it did for the ~20-point mock loops. */
function toColoredPolylines(segments: RouteSegment[]): { id: string; color: string; path: LatLng[] }[] {
  const polylines: { id: string; color: string; path: LatLng[] }[] = [];

  for (const segment of segments) {
    const color = segmentColor(segment);
    const current = polylines[polylines.length - 1];
    if (current && current.color === color) {
      current.path.push(...segment.path.slice(1));
    } else {
      polylines.push({ id: segment.id, color, path: [...segment.path] });
    }
  }

  return polylines;
}

export function RouteMapPreview({ origin, segments }: { origin: LatLng; segments: RouteSegment[] }) {
  if (Platform.OS === 'web') {
    // react-native-maps has no web target — map rendering SDK for web is still open (Section 7).
    return (
      <View style={[styles.map, styles.webFallback]}>
        <Text style={styles.webFallbackText}>Map preview isn't available on web yet</Text>
      </View>
    );
  }

  const MapView = require('react-native-maps').default;
  const { Polyline } = require('react-native-maps');
  const polylines = toColoredPolylines(segments);

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {polylines.map((polyline) => (
        <Polyline
          key={polyline.id}
          coordinates={polyline.path}
          strokeColor={polyline.color}
          strokeWidth={4}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFallbackText: {
    color: '#666',
  },
});
