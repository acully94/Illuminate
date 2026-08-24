import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteCard } from '@/components/RouteCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useScoredRoutes } from '@/hooks/useScoredRoutes';
import type { RouteMode, RouteRequest } from '@/types/route';

export default function Results() {
  const params = useLocalSearchParams<{
    kind: string;
    lat: string;
    lng: string;
    distance?: string;
    destLat?: string;
    destLng?: string;
  }>();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Route options" />

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
                  pathname: '/route/[mode]',
                  params: { mode, ...params },
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
