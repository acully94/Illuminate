import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/modules/settings';
import type { DistanceUnit } from '@/modules/settings/types';
import { secondsPerKmToUnitPace, unitPaceToSecondsPerKm } from '@/utils/format';

function splitPace(secondsPerUnit: number): { min: string; sec: string } {
  const minutes = Math.floor(secondsPerUnit / 60);
  const seconds = Math.round(secondsPerUnit % 60);
  return { min: String(minutes), sec: String(seconds).padStart(2, '0') };
}

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  const [walkMin, setWalkMin] = useState('0');
  const [walkSec, setWalkSec] = useState('00');
  const [runMin, setRunMin] = useState('0');
  const [runSec, setRunSec] = useState('00');

  // Re-derive the displayed pace fields whenever the unit changes (or on first load).
  useEffect(() => {
    const w = splitPace(secondsPerKmToUnitPace(settings.walkingSecondsPerKm, settings.unit));
    const r = splitPace(secondsPerKmToUnitPace(settings.runningSecondsPerKm, settings.unit));
    setWalkMin(w.min);
    setWalkSec(w.sec);
    setRunMin(r.min);
    setRunSec(r.sec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.unit]);

  function commitWalkingPace(min: string, sec: string) {
    const totalUnitSeconds = (Number(min) || 0) * 60 + (Number(sec) || 0);
    if (totalUnitSeconds <= 0) return;
    updateSettings({ walkingSecondsPerKm: unitPaceToSecondsPerKm(totalUnitSeconds, settings.unit) });
  }

  function commitRunningPace(min: string, sec: string) {
    const totalUnitSeconds = (Number(min) || 0) * 60 + (Number(sec) || 0);
    if (totalUnitSeconds <= 0) return;
    updateSettings({ runningSecondsPerKm: unitPaceToSecondsPerKm(totalUnitSeconds, settings.unit) });
  }

  const exampleDistance = settings.unit === 'mi' ? 3 : 5;
  const exampleRunSeconds = exampleDistance * ((Number(runMin) || 0) * 60 + (Number(runSec) || 0));
  const exampleMinutes = Math.round(exampleRunSeconds / 60);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Settings', headerTintColor: '#1B3A5C' }} />

      <View style={styles.section}>
        <Text style={styles.label}>Distance unit</Text>
        <View style={styles.row}>
          {(['km', 'mi'] as DistanceUnit[]).map((unit) => (
            <Pressable
              key={unit}
              style={[styles.toggleOption, settings.unit === unit && styles.toggleOptionSelected]}
              onPress={() => updateSettings({ unit })}
            >
              <Text style={[styles.toggleText, settings.unit === unit && styles.toggleTextSelected]}>
                {unit === 'km' ? 'Kilometres' : 'Miles'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Walking pace (min per {settings.unit})</Text>
        <View style={styles.paceRow}>
          <TextInput
            style={styles.paceInput}
            keyboardType="number-pad"
            value={walkMin}
            onChangeText={setWalkMin}
            onBlur={() => commitWalkingPace(walkMin, walkSec)}
          />
          <Text style={styles.paceColon}>:</Text>
          <TextInput
            style={styles.paceInput}
            keyboardType="number-pad"
            value={walkSec}
            onChangeText={setWalkSec}
            onBlur={() => commitWalkingPace(walkMin, walkSec)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Running pace (min per {settings.unit})</Text>
        <Text style={styles.hint}>
          Use your normal conversational pace — the one you can hold a conversation at.
        </Text>
        <View style={styles.paceRow}>
          <TextInput
            style={styles.paceInput}
            keyboardType="number-pad"
            value={runMin}
            onChangeText={setRunMin}
            onBlur={() => commitRunningPace(runMin, runSec)}
          />
          <Text style={styles.paceColon}>:</Text>
          <TextInput
            style={styles.paceInput}
            keyboardType="number-pad"
            value={runSec}
            onChangeText={setRunSec}
            onBlur={() => commitRunningPace(runMin, runSec)}
          />
        </View>
        <Text style={styles.example}>
          At this pace, a {exampleDistance} {settings.unit} run takes about {exampleMinutes} min.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 28,
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
  hint: {
    fontSize: 13,
    color: '#666',
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
  },
  toggleTextSelected: {
    color: '#fff',
  },
  paceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paceInput: {
    width: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    textAlign: 'center',
    color: '#222',
  },
  paceColon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  example: {
    marginTop: 4,
    fontSize: 13,
    color: '#1B3A5C',
    fontWeight: '600',
  },
});
