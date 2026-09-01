import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KEYBOARD_DONE_ID } from './KeyboardDoneBar';
import { searchPlaces, type GeocodeResult } from '@/modules/geocoding';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

export function PlaceAutocomplete({
  value,
  onSelect,
  placeholder,
}: {
  value: string;
  onSelect: (result: GeocodeResult) => void;
  placeholder: string;
}) {
  const [text, setText] = useState(value);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  // Reflect externally-set values (e.g. "Your current location" from GPS) without re-searching.
  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    if (text.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    const thisRequest = ++requestId.current;
    setLoading(true);
    const timeout = setTimeout(async () => {
      const found = await searchPlaces(text);
      if (requestId.current === thisRequest) {
        setResults(found);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [text, open]);

  function handleChangeText(next: string) {
    setText(next);
    setOpen(true);
  }

  function handleSelect(result: GeocodeResult) {
    setText(result.label);
    setOpen(false);
    setResults([]);
    Keyboard.dismiss();
    onSelect(result);
  }

  return (
    <View>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
        inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_DONE_ID : undefined}
      />
      {open && loading && <ActivityIndicator style={styles.loading} size="small" color="#1B3A5C" />}
      {open && !loading && results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((result) => (
            <Pressable key={result.fullLabel ?? result.label} style={styles.dropdownItem} onPress={() => handleSelect(result)}>
              <Text style={styles.dropdownItemText} numberOfLines={2}>
                {result.fullLabel ?? result.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {open && !loading && text.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
        <Text style={styles.noResults}>No matches — try a full postcode or a nearby landmark.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
  },
  loading: {
    marginTop: 8,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#222',
  },
  noResults: {
    marginTop: 6,
    fontSize: 13,
    color: '#8A6D00',
  },
});
