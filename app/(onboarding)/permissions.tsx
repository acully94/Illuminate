import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Permissions() {
  const [requesting, setRequesting] = useState(false);

  async function requestAndContinue() {
    setRequesting(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } finally {
      setRequesting(false);
      router.replace('/(tabs)/home');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Find routes near you</Text>
        <Text style={styles.subtitle}>
          Illuminate uses your location to start route planning from where you are. You can
          always enter a different start point instead.
        </Text>
      </View>
      <Pressable style={styles.cta} onPress={requestAndContinue} disabled={requesting}>
        <Text style={styles.ctaText}>{requesting ? 'Requesting…' : 'Allow location'}</Text>
      </Pressable>
      <Pressable style={styles.skip} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.skipText}>Not now</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B3A5C',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  cta: {
    backgroundColor: '#1B3A5C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
  },
  skip: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    color: '#888',
    fontWeight: '600',
  },
});
