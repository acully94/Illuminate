import { router, Stack } from 'expo-router';
import { Pressable, Text } from 'react-native';

/** Native back button (from the Stack) plus an explicit jump-to-home shortcut, for screens nested a few levels deep. */
export function ScreenHeader({ title }: { title: string }) {
  return (
    <Stack.Screen
      options={{
        headerShown: true,
        title,
        headerTintColor: '#1B3A5C',
        headerRight: () => (
          <Pressable onPress={() => router.replace('/(tabs)/home')} hitSlop={8}>
            <Text style={{ color: '#1B3A5C', fontWeight: '600' }}>Home</Text>
          </Pressable>
        ),
      }}
    />
  );
}
