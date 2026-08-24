import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DISTANCE_OPTIONS_METERS } from '@/modules/config/appConfig';
import type { DistanceUnit } from '@/modules/settings/types';
import { metersToDisplayDistance } from '@/utils/format';

const METERS_PER_MILE = 1609.344;

function metersToUnit(meters: number, unit: DistanceUnit): number {
  return metersToDisplayDistance(meters, unit);
}

function unitToMeters(value: number, unit: DistanceUnit): number {
  return unit === 'mi' ? value * METERS_PER_MILE : value * 1000;
}

export function DistancePicker({
  valueMeters,
  unit,
  onChange,
}: {
  valueMeters: number;
  unit: DistanceUnit;
  onChange: (meters: number) => void;
}) {
  const isPreset = DISTANCE_OPTIONS_METERS.some(
    (preset) => Math.abs(preset - valueMeters) < 1,
  );
  const [customText, setCustomText] = useState(
    isPreset ? '' : metersToUnit(valueMeters, unit).toFixed(1),
  );
  const [customSelected, setCustomSelected] = useState(!isPreset);

  function selectPreset(meters: number) {
    setCustomSelected(false);
    onChange(meters);
  }

  function selectCustom(text: string) {
    setCustomSelected(true);
    setCustomText(text);
    const value = Number(text);
    if (!Number.isNaN(value) && value > 0) {
      onChange(unitToMeters(value, unit));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DISTANCE_OPTIONS_METERS.map((meters) => {
          const selected = !customSelected && meters === valueMeters;
          return (
            <Pressable
              key={meters}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => selectPreset(meters)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {metersToUnit(meters, unit).toFixed(0)} {unit}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.customRow, customSelected && styles.customRowSelected]}>
        <TextInput
          style={styles.customInput}
          placeholder={`Custom distance (${unit})`}
          keyboardType="decimal-pad"
          value={customText}
          onChangeText={selectCustom}
          onFocus={() => customText && selectCustom(customText)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#1B3A5C',
    borderColor: '#1B3A5C',
  },
  optionText: {
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  customRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  customRowSelected: {
    borderColor: '#1B3A5C',
  },
  customInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
  },
});
