import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Where do you want to walk?</Text>
      <Text style={styles.subtitle}>
        Plan a loop route scored for lighting and area safety, using the data that's actually
        available for it.
      </Text>

      <Pressable style={styles.cta} onPress={() => router.push('/planner')}>
        <Text style={styles.ctaText}>Plan a route</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B3A5C',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
  },
  cta: {
    marginTop: 24,
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
