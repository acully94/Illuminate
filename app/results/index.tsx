import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteCard } from '@/components/RouteCard';
import { useScoredRoutes } from '@/hooks/useScoredRoutes';
import type { RouteMode } from '@/types/route';

export default function Results() {
  const { lat, lng, distance } = useLocalSearchParams<{ lat: string; lng: string; distance: string }>();
  const origin = { latitude: Number(lat), longitude: Number(lng) };
  const distanceMeters = Number(distance);

  const state = useScoredRoutes(origin, distanceMeters);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Route options</Text>

      {state.status === 'loading' && (
        <ActivityIndicator style={styles.loading} size="large" color="#1B3A5C" />
      )}

      {state.status === 'error' && <Text style={styles.error}>{state.message}</Text>}

      {state.status === 'ready' && (
        <ScrollView contentContainerStyle={styles.list}>
          {(['safest', 'balanced', 'fastest'] as RouteMode[]).map((mode) => (
            <RouteCard
              key={mode}
              route={state.routes[mode]}
              onPress={() =>
                router.push({
                  pathname: '/run/[mode]',
                  params: { mode, lat, lng, distance },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B3A5C',
  },
  loading: {
    marginTop: 40,
  },
  error: {
    color: '#C0392B',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
});
