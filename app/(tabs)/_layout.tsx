import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1B3A5C' }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
    </Tabs>
  );
}
