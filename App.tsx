import 'react-native-gesture-handler';

import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppHeader } from './src/components/AppHeader';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BottomNav } from './src/components/BottomNav';
import { HackathonBackdrop } from './src/components/HackathonBackdrop';
import { ReduceMotionStyles } from './src/components/ReduceMotionStyles';
import { ScreenTransition } from './src/components/ScreenTransition';
import { AccessibilityProvider, useAccessibility } from './src/context/AccessibilityContext';
import { MapLocationProvider } from './src/context/MapLocationContext';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { MapScreen } from './src/screens/MapScreen';
import { PersonTypeScreen } from './src/screens/PersonTypeScreen';
import { PlanearScreen } from './src/screens/PlanearScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { useAppTheme } from './src/hooks/useAppTheme';
import { colors as defaultColors } from './src/theme/colors';
import { TabId } from './src/types/navigation';

type OverlayScreen = 'perfil' | 'detalle' | null;

function AppShell() {
  const { talkBackEnabled } = useAccessibility();
  const { colors, isHackathon } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabId>('mapa');
  const [overlay, setOverlay] = useState<OverlayScreen>(null);

  const shellStyle = [
    styles.root,
    talkBackEnabled && styles.rootTalkBack,
    !talkBackEnabled && { backgroundColor: colors.surface },
  ];
  const statusStyle = talkBackEnabled || isHackathon ? 'light' : 'dark';

  const handleReportSuccess = useCallback(() => {
    setActiveTab('mapa');
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'mapa':
        return (
          <MapScreen
            onOpenDetail={() => setOverlay('detalle')}
            onReport={() => setActiveTab('reportar')}
          />
        );
      case 'planear':
        return <PlanearScreen onOpenDetail={() => setOverlay('detalle')} />;
      case 'reportar':
        return <ReportScreen onReportSuccess={handleReportSuccess} />;
      case 'comunidad':
        return <CommunityScreen />;
      default:
        return null;
    }
  };

  if (overlay === 'perfil') {
    return (
      <View style={shellStyle}>
        <HackathonBackdrop />
        <StatusBar style={statusStyle} />
        <ProfileScreen onBack={() => setOverlay(null)} />
      </View>
    );
  }

  if (overlay === 'detalle') {
    return (
      <View style={shellStyle}>
        <HackathonBackdrop />
        <StatusBar style={statusStyle} />
        <DetailScreen onBack={() => setOverlay(null)} />
      </View>
    );
  }

  return (
    <View style={shellStyle}>
      <HackathonBackdrop />
      <StatusBar style={statusStyle} />
      <AppHeader
        onMenuPress={() => setOverlay('perfil')}
        onSearchPress={() => setActiveTab('mapa')}
      />
      <View style={styles.main}>
        <ScreenTransition screenKey={activeTab}>
          {renderTabContent()}
        </ScreenTransition>
      </View>
      <View pointerEvents="box-none" style={styles.navLayer}>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </View>
  );
}

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
            <MapLocationProvider>
              <ReduceMotionStyles />
              <RootNavigator />
            </MapLocationProvider>
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
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: defaultColors.surface,
  },
  rootTalkBack: {
    backgroundColor: '#000000',
  },
  main: {
    flex: 1,
  },
  navLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: defaultColors.surface,
  },
});
