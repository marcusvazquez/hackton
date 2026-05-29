import 'react-native-gesture-handler';

import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ReduceMotionStyles } from './src/components/ReduceMotionStyles';
import { AccessibilityProvider, useAccessibility } from './src/context/AccessibilityContext';
import { MapLocationProvider } from './src/context/MapLocationContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { AppShell } from './src/navigation/AppShell';
import { PersonTypeScreen } from './src/screens/PersonTypeScreen';
import { colors as defaultColors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={defaultColors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackMessage="Error al cargar Ruta Libre. Revisa la consola del navegador (F12).">
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <AccessibilityProvider>
            <OfflineProvider>
              <MapLocationProvider>
                <ReduceMotionStyles />
                <RootNavigator />
              </MapLocationProvider>
            </OfflineProvider>
          </AccessibilityProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootNavigator() {
  const { hasCompletedOnboarding, isHydrated } = useAccessibility();

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={defaultColors.primary} size="large" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <PersonTypeScreen onComplete={() => undefined} />;
  }

  return <AppShell />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: defaultColors.surface,
  },
});
