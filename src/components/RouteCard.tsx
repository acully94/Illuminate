import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScoredRoute } from '@/types/route';
import { ScoreBadge } from './ScoreBadge';

const MODE_LABELS: Record<ScoredRoute['mode'], string> = {
  fastest: 'Fastest',
  balanced: 'Balanced',
  safest: 'Safest',
};

export function RouteCard({ route, onPress }: { route: ScoredRoute; onPress: () => void }) {
  const km = (route.distanceMeters / 1000).toFixed(1);
  const minutes = Math.round(route.durationSeconds / 60);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{MODE_LABELS[route.mode]}</Text>
        <Text style={styles.meta}>
          {km} km · {minutes} min
        </Text>
      </View>
      <ScoreBadge score={route.score} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
});
