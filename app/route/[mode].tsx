import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMapPreview } from '@/components/RouteMapPreview';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useScoredRoutes } from '@/hooks/useScoredRoutes';
import { exportRouteAsGpx } from '@/modules/gpx';
import { useSettings } from '@/modules/settings';
import type { RouteMode, RouteRequest } from '@/types/route';
import { formatDistance, formatDuration, paceDurationSeconds } from '@/utils/format';

const MODE_LABELS: Record<RouteMode, string> = {
  fastest: 'Fastest',
  balanced: 'Balanced',
  safest: 'Safest',
};

export default function RouteDetail() {
  const params = useLocalSearchParams<{
    mode: RouteMode;
    kind: string;
    lat: string;
    lng: string;
    distance?: string;
    destLat?: string;
    destLng?: string;
  }>();
  const { settings } = useSettings();
  const [exporting, setExporting] = useState(false);

  const origin = { latitude: Number(params.lat), longitude: Number(params.lng) };
  const request: RouteRequest =
    params.kind === 'point-to-point'
      ? {
          kind: 'point-to-point',
          origin,
          destination: { latitude: Number(params.destLat), longitude: Number(params.destLng) },
        }
      : { kind: 'loop', origin, distanceMeters: Number(params.distance) };

  const state = useScoredRoutes(request);

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Route" />
        <ActivityIndicator size="large" color="#1B3A5C" />
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Route" />
        <Text style={styles.error}>{state.message}</Text>
      </SafeAreaView>
    );
  }

  const route = state.routes[params.mode];
  const distance = formatDistance(route.distanceMeters, settings.unit);
  const walking = formatDuration(paceDurationSeconds(route.distanceMeters, settings.walkingSecondsPerKm));
  const running = formatDuration(paceDurationSeconds(route.distanceMeters, settings.runningSecondsPerKm));

  async function handleExport() {
    setExporting(true);
    try {
      await exportRouteAsGpx(route, `Illuminate ${MODE_LABELS[params.mode]} Route`);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={`${MODE_LABELS[params.mode]} route`} />
      <ScrollView contentContainerStyle={styles.content}>
        <RouteMapPreview origin={origin} segments={route.segments} />
        <Text style={styles.title}>{distance}</Text>
        <Text style={styles.times}>
          Walking {walking} · Running {running}
        </Text>
        <ScoreBadge score={route.score} />
        <Text style={styles.exportHint}>
          Export this route as a GPX file, then import it into Strava, Runna, or your running app.
        </Text>
        <Pressable style={styles.cta} onPress={handleExport} disabled={exporting}>
          <Text style={styles.ctaText}>{exporting ? 'Preparing…' : 'Export route (GPX)'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3A5C',
  },
  times: {
    fontSize: 14,
    color: '#444',
  },
  error: {
    color: '#C0392B',
    padding: 24,
  },
  exportHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  cta: {
    marginTop: 4,
    backgroundColor: '#1B3A5C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
