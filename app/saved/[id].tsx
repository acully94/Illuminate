import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMapPreview } from '@/components/RouteMapPreview';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { exportRouteAsGpx } from '@/modules/gpx';
import { useSavedRoutes } from '@/modules/savedRoutes';
import { useSettings } from '@/modules/settings';
import { formatDistance, formatDuration, paceDurationSeconds } from '@/utils/format';

export default function SavedRouteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { savedRoutes } = useSavedRoutes();
  const { settings } = useSettings();
  const [exporting, setExporting] = useState(false);

  const saved = savedRoutes.find((r) => r.id === id);

  if (!saved) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Saved route" />
        <Text style={styles.error}>This saved route no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const { route, label } = saved;
  const origin = route.segments[0]?.path[0] ?? { latitude: 51.5072, longitude: -0.1276 };
  const distance = formatDistance(route.distanceMeters, settings.unit);
  const walking = formatDuration(paceDurationSeconds(route.distanceMeters, settings.walkingSecondsPerKm));
  const running = formatDuration(paceDurationSeconds(route.distanceMeters, settings.runningSecondsPerKm));

  async function handleExport() {
    setExporting(true);
    try {
      await exportRouteAsGpx(route, label);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={saved.label} />
      <ScrollView contentContainerStyle={styles.content}>
        <RouteMapPreview origin={origin} segments={route.segments} />
        <Text style={styles.title}>{distance}</Text>
        <Text style={styles.times}>
          Walking {walking} · Running {running}
        </Text>
        <ScoreBadge score={route.score} />
        <Text style={styles.savedAt}>Saved {new Date(saved.savedAt).toLocaleDateString()}</Text>
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
  savedAt: {
    fontSize: 12,
    color: '#888',
  },
  error: {
    color: '#C0392B',
    padding: 24,
  },
  cta: {
    marginTop: 8,
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
