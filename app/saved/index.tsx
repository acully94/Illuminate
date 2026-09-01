import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSavedRoutes } from '@/modules/savedRoutes';
import { useSettings } from '@/modules/settings';
import { formatDistance } from '@/utils/format';

export default function SavedRoutesScreen() {
  const { savedRoutes, removeRoute } = useSavedRoutes();
  const { settings } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="My routes" />
      {savedRoutes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No saved routes yet — save one from a route's detail screen after planning it.
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={savedRoutes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/saved/[id]', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Pressable onPress={() => removeRoute(item.id)} hitSlop={8}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
              <Text style={styles.meta}>{formatDistance(item.route.distanceMeters, settings.unit)}</Text>
              <ScoreBadge score={item.route.score} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  empty: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    padding: 24,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3A5C',
    flex: 1,
  },
  remove: {
    fontSize: 13,
    color: '#C0392B',
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
});
