import { StyleSheet, Text, View } from 'react-native';
import type { RouteScoreBreakdown } from '@/types/route';

function colorForScore(score: number): string {
  if (score >= 70) return '#1B8A5A';
  if (score >= 45) return '#B8860B';
  return '#C0392B';
}

export function ScoreBadge({ score }: { score: RouteScoreBreakdown }) {
  const color = colorForScore(score.safetyScore);

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { backgroundColor: color }]}>
        <Text style={styles.pillText}>{Math.round(score.safetyScore)}</Text>
      </View>
      {score.unknownLightingPercent > 15 && (
        <Text style={styles.warning}>
          Lighting data unavailable for {Math.round(score.unknownLightingPercent)}% of this route
        </Text>
      )}
      {score.crimeScore === null && (
        <Text style={styles.warning}>Crime data unavailable for this area</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  warning: {
    fontSize: 11,
    color: '#8A6D00',
  },
});
