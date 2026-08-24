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
      {segments.map((segment) => (
        <Polyline key={segment.id} coordinates={segment.path} strokeColor={segmentColor(segment)} strokeWidth={4} />
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
