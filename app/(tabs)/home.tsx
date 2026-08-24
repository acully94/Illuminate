import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>Where do you want to go?</Text>
        <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <Text style={styles.settingsButtonText}>Settings</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>
        Plan a walking or running route scored for lighting and area safety, using the data
        that's actually available for it.
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  greeting: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: '#1B3A5C',
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  settingsButtonText: {
    color: '#1B3A5C',
    fontWeight: '600',
    fontSize: 13,
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
