import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMapPreview } from '@/components/RouteMapPreview';
import { ScoreBadge } from '@/components/ScoreBadge';
import { useScoredRoutes } from '@/hooks/useScoredRoutes';
import type { RouteMode } from '@/types/route';

export default function RunDetail() {
  const { mode, lat, lng, distance } = useLocalSearchParams<{
    mode: RouteMode;
    lat: string;
    lng: string;
    distance: string;
  }>();
  const origin = { latitude: Number(lat), longitude: Number(lng) };
  const distanceMeters = Number(distance);

  const state = useScoredRoutes(origin, distanceMeters);

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1B3A5C" />
      </SafeAreaView>
    );
  }

  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{state.message}</Text>
      </SafeAreaView>
    );
  }

  const route = state.routes[mode];
  const km = (route.distanceMeters / 1000).toFixed(1);
  const minutes = Math.round(route.durationSeconds / 60);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <RouteMapPreview origin={origin} segments={route.segments} />
        <Text style={styles.title}>{km} km loop · ~{minutes} min</Text>
        <ScoreBadge score={route.score} />
        <Pressable
          style={styles.cta}
          onPress={() => Alert.alert('Run tracking', 'Live run tracking is coming in a later phase.')}
        >
          <Text style={styles.ctaText}>Start run</Text>
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
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B3A5C',
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
