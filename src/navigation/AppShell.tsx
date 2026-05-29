import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { HackathonBackdrop } from '../components/HackathonBackdrop';
import { NetStatusBanner } from '../components/NetStatusBanner';
import { ScreenTransition } from '../components/ScreenTransition';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { CommunityScreen } from '../screens/CommunityScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlanearScreen } from '../screens/PlanearScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { OverlayId, TabId } from '../types/navigation';
import { OverlayLayer } from './OverlayLayer';

export function AppShell() {
  const { talkBackEnabled } = useAccessibility();
  const { colors, isHackathon } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabId>('mapa');
  const [overlay, setOverlay] = useState<OverlayId | null>(null);

  const shellStyle = [
    styles.root,
    talkBackEnabled && styles.rootTalkBack,
    !talkBackEnabled && { backgroundColor: colors.surface },
  ];
  const statusStyle = talkBackEnabled || isHackathon ? 'light' : 'dark';

  const closeOverlay = useCallback(() => setOverlay(null), []);

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

  if (overlay) {
    return (
      <OverlayLayer
        overlay={overlay}
        shellStyle={shellStyle as ViewStyle[]}
        statusStyle={statusStyle}
        onClose={closeOverlay}
      />
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
        <ScreenTransition screenKey={activeTab}>{renderTabContent()}</ScreenTransition>
      </View>
      <View pointerEvents="box-none" style={styles.navLayer}>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootTalkBack: { backgroundColor: '#000000' },
  main: { flex: 1 },
  navLayer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
