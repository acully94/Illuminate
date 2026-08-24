import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DistancePicker } from '@/components/DistancePicker';
import { DEFAULT_ORIGIN, isInsideLaunchRegion } from '@/modules/config/appConfig';
import type { LatLng } from '@/types/route';

export default function Planner() {
  const [origin, setOrigin] = useState<LatLng>(DEFAULT_ORIGIN);
  const [distanceMeters, setDistanceMeters] = useState(5000);
  const [locationLabel, setLocationLabel] = useState('Central London (default)');

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({});
      const point: LatLng = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setOrigin(point);
      setLocationLabel(isInsideLaunchRegion(point) ? 'Your current location' : 'Your current location (outside launch region)');
    })();
  }, []);

  const outsideRegion = !isInsideLaunchRegion(origin);

  function findRoutes() {
    router.push({
      pathname: '/results',
      params: {
        lat: String(origin.latitude),
        lng: String(origin.longitude),
        distance: String(distanceMeters),
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Plan a route</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Starting point</Text>
        <Text style={styles.value}>{locationLabel}</Text>
        {outsideRegion && (
          <Text style={styles.warning}>
            Illuminate currently only has good data coverage inside the M25 — routes outside this
            area may have limited lighting and crime data.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Distance</Text>
        <DistancePicker valueMeters={distanceMeters} onChange={setDistanceMeters} />
      </View>

      <Pressable style={styles.cta} onPress={findRoutes}>
        <Text style={styles.ctaText}>Find routes</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B3A5C',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  warning: {
    fontSize: 13,
    color: '#8A6D00',
  },
  cta: {
    marginTop: 'auto',
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
