import 'react-native-gesture-handler';

import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ExploreByTouchLayer } from './src/components/ExploreByTouchLayer';
import { ReduceMotionStyles } from './src/components/ReduceMotionStyles';
import { AccessibilityProvider, useAccessibility } from './src/context/AccessibilityContext';
import { MapLocationProvider } from './src/context/MapLocationContext';
import { MapRoutingProvider } from './src/context/MapRoutingContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { AppShell } from './src/navigation/AppShell';
import { PersonTypeScreen } from './src/screens/PersonTypeScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { colors as defaultColors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
    PressStart2P_400Regular,
    VT323_400Regular,
    ...MaterialIcons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={defaultColors.primary} size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackMessage="Error al cargar ParaTodos. Revisa la consola del navegador (F12).">
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
          <AccessibilityProvider>
            <OfflineProvider>
              <MapLocationProvider>
                <MapRoutingProvider>
                  <ReduceMotionStyles />
                  <RootNavigator />
                </MapRoutingProvider>
              </MapLocationProvider>
            </OfflineProvider>
          </AccessibilityProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootNavigator() {
  const { hasSeenWelcome, hasCompletedOnboarding, isHydrated, personType } = useAccessibility();

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={defaultColors.primary} size="large" />
      </View>
    );
  }

  return (
    <ExploreByTouchLayer enabled={personType === 'visual'}>
      {!hasSeenWelcome ? (
        <WelcomeScreen onContinue={() => undefined} />
      ) : !hasCompletedOnboarding ? (
        <PersonTypeScreen onComplete={() => undefined} />
      ) : (
        <AppShell />
      )}
    </ExploreByTouchLayer>
  );
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
