import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DistancePicker } from '@/components/DistancePicker';
import { KeyboardDoneBar } from '@/components/KeyboardDoneBar';
import { PlaceAutocomplete } from '@/components/PlaceAutocomplete';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DEFAULT_ORIGIN, isInsideLaunchRegion } from '@/modules/config/appConfig';
import type { GeocodeResult } from '@/modules/geocoding';
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

  function handleSelectStart(result: GeocodeResult) {
    setStartPoint(result.point);
    setStartText(result.label);
  }

  function handleSelectEnd(result: GeocodeResult) {
    setEndPoint(result.point);
    setEndText(result.label);
  }

  const outsideRegion = !isInsideLaunchRegion(startPoint);
  const canFindRoutes = mode === 'loop' || endPoint !== null;

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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
          <PlaceAutocomplete value={startText} onSelect={handleSelectStart} placeholder="Postcode, address, or landmark" />
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
            <PlaceAutocomplete value={endText} onSelect={handleSelectEnd} placeholder="Postcode, address, or landmark" />
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
      </ScrollView>
      <KeyboardDoneBar />
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
  warning: {
    fontSize: 13,
    color: '#8A6D00',
  },
  cta: {
    marginTop: 8,
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
