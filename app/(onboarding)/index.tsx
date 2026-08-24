import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Illuminate</Text>
        <Text style={styles.subtitle}>
          Walking and running routes scored for lighting and safety, based on the data that's
          actually available for each area.
        </Text>
      </View>
      <Link href="/(onboarding)/permissions" style={styles.cta}>
        <Text style={styles.ctaText}>Get started</Text>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A5C',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#D6E2EC',
    lineHeight: 22,
  },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1B3A5C',
  },
});
