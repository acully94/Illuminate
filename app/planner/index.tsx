import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DistancePicker } from '@/components/DistancePicker';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DEFAULT_ORIGIN, isInsideLaunchRegion } from '@/modules/config/appConfig';
import { mockGeocode } from '@/modules/geocoding';
import { useSettings } from '@/modules/settings';
import type { LatLng } from '@/types/route';

type PlanMode = 'loop' | 'point-to-point';

export default function Planner() {
  const { settings } = useSettings();

  const [mode, setMode] = useState<PlanMode>('loop');
  const [distanceMeters, setDistanceMeters] = useState(5000);

  const [startPoint, setStartPoint] = useState<LatLng>(DEFAULT_ORIGIN);
  const [startText, setStartText] = useState('Central London (default)');

  const [endPoint, setEndPoint] = useState<LatLng | null>(null);
  const [endText, setEndText] = useState('');
  const [endError, setEndError] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({});
      const point: LatLng = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setStartPoint(point);
      setStartText('Your current location');
    })();
  }, []);

  function resolveStart(text: string) {
    setStartText(text);
    if (text === 'Your current location') return;
    const result = mockGeocode(text);
    if (result) setStartPoint(result.point);
  }

  function resolveEnd(text: string) {
    setEndText(text);
    if (!text.trim()) {
      setEndPoint(null);
      setEndError(false);
      return;
    }
    const result = mockGeocode(text);
    if (result) {
      setEndPoint(result.point);
      setEndError(false);
    } else {
      setEndPoint(null);
      setEndError(true);
    }
  }

  const outsideRegion = !isInsideLaunchRegion(startPoint);
  const canFindRoutes = mode === 'loop' || (endPoint !== null && !endError);

  function findRoutes() {
    if (mode === 'loop') {
      router.push({
        pathname: '/results',
        params: {
          kind: 'loop',
          lat: String(startPoint.latitude),
          lng: String(startPoint.longitude),
          distance: String(distanceMeters),
        },
      });
    } else if (endPoint) {
      router.push({
        pathname: '/results',
        params: {
          kind: 'point-to-point',
          lat: String(startPoint.latitude),
          lng: String(startPoint.longitude),
          destLat: String(endPoint.latitude),
          destLng: String(endPoint.longitude),
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Plan a route" />

      <View style={styles.section}>
        <Text style={styles.label}>Route type</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.toggleOption, mode === 'loop' && styles.toggleOptionSelected]}
            onPress={() => setMode('loop')}
          >
            <Text style={[styles.toggleText, mode === 'loop' && styles.toggleTextSelected]}>
              Loop (back to start)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleOption, mode === 'point-to-point' && styles.toggleOptionSelected]}
            onPress={() => setMode('point-to-point')}
          >
            <Text style={[styles.toggleText, mode === 'point-to-point' && styles.toggleTextSelected]}>
              Point to point
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Starting point</Text>
        <TextInput
          style={styles.input}
          value={startText}
          onChangeText={resolveStart}
          placeholder="Enter a starting point"
        />
        {outsideRegion && (
          <Text style={styles.warning}>
            Illuminate currently only has good data coverage inside the M25 — routes outside this
            area may have limited lighting and crime data.
          </Text>
        )}
      </View>

      {mode === 'point-to-point' && (
        <View style={styles.section}>
          <Text style={styles.label}>End point</Text>
          <TextInput
            style={styles.input}
            value={endText}
            onChangeText={resolveEnd}
            placeholder="Enter an end point"
          />
          {endError && <Text style={styles.warning}>Couldn't match that end point — try a nearby landmark.</Text>}
        </View>
      )}

      {mode === 'loop' && (
        <View style={styles.section}>
          <Text style={styles.label}>Distance</Text>
          <DistancePicker valueMeters={distanceMeters} unit={settings.unit} onChange={setDistanceMeters} />
        </View>
      )}

      <Pressable
        style={[styles.cta, !canFindRoutes && styles.ctaDisabled]}
        onPress={findRoutes}
        disabled={!canFindRoutes}
      >
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
  section: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleOption: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleOptionSelected: {
    backgroundColor: '#1B3A5C',
    borderColor: '#1B3A5C',
  },
  toggleText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 13,
  },
  toggleTextSelected: {
    color: '#fff',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
