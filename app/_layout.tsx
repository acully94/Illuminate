import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SavedRoutesProvider } from '@/modules/savedRoutes';
import { SettingsProvider } from '@/modules/settings';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <SavedRoutesProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </SavedRoutesProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
