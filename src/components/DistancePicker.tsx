import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DISTANCE_OPTIONS_METERS } from '@/modules/config/appConfig';

export function DistancePicker({
  valueMeters,
  onChange,
}: {
  valueMeters: number;
  onChange: (meters: number) => void;
}) {
  return (
    <View style={styles.row}>
      {DISTANCE_OPTIONS_METERS.map((meters) => {
        const selected = meters === valueMeters;
        return (
          <Pressable
            key={meters}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(meters)}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {meters / 1000} km
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
