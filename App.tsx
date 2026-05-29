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
import { BottomNav } from './src/components/BottomNav';
import { NetStatusBanner } from './src/components/NetStatusBanner';
import { HackathonBackdrop } from './src/components/HackathonBackdrop';
import { ReduceMotionStyles } from './src/components/ReduceMotionStyles';
import { ScreenTransition } from './src/components/ScreenTransition';
import { AccessibilityProvider, useAccessibility } from './src/context/AccessibilityContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { ExpertModeModal } from './src/screens/ExpertModeModal';
import { MapScreen } from './src/screens/MapScreen';
import { PersonTypeScreen } from './src/screens/PersonTypeScreen';
import { PlanearScreen } from './src/screens/PlanearScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useAppTheme } from './src/hooks/useAppTheme';
import { colors as defaultColors } from './src/theme/colors';
import { TabId } from './src/types/navigation';

type OverlayScreen = 'perfil' | 'detalle' | 'settings' | 'expert' | null;

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
        return (
          <PlanearScreen
            onOpenDetail={() => setOverlay('detalle')}
            onOpenExpert={() => setOverlay('expert')}
          />
        );
      case 'reportar':
        return <ReportScreen onReportSuccess={handleReportSuccess} />;
      case 'comunidad':
        return <CommunityScreen onGoToReport={() => setActiveTab('reportar')} />;
      default:
        return null;
    }
  };

  if (overlay === 'expert') {
    return (
      <View style={shellStyle}>
        <HackathonBackdrop />
        <StatusBar style={statusStyle} />
        <ExpertModeModal onClose={() => setOverlay(null)} />
      </View>
    );
  }

  if (overlay === 'settings') {
    return (
      <View style={shellStyle}>
        <HackathonBackdrop />
        <StatusBar style={statusStyle} />
        <SettingsScreen onBack={() => setOverlay(null)} />
      </View>
    );
  }

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
        onSettingsPress={() => setOverlay('settings')}
      />
      <NetStatusBanner />
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
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AccessibilityProvider>
          <OfflineProvider>
            <ReduceMotionStyles />
            <RootNavigator />
          </OfflineProvider>
        </AccessibilityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
