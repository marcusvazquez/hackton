import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AIAssistant, AIAssistantHandle } from '../components/AIAssistant';
import { AIAssistantFAB } from '../components/AIAssistantFAB';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { LazyEnvironmentScanner } from '../components/LazyEnvironmentScanner';
import { HackathonBackdrop } from '../components/HackathonBackdrop';
import { NetStatusBanner } from '../components/NetStatusBanner';
import { SecureWebBanner } from '../components/SecureWebBanner';
import { ScreenTransition } from '../components/ScreenTransition';
import { VoiceAssistantIndicator } from '../components/VoiceAssistantIndicator';
import { useAccessibility } from '../context/AccessibilityContext';
import { useMapLocation } from '../context/MapLocationContext';
import { FeedItem } from '../data/community';
import { useAppTheme } from '../hooks/useAppTheme';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { CommunityScreen } from '../screens/CommunityScreen';
import { MapScreen } from '../screens/MapScreen';
import { PlanearScreen } from '../screens/PlanearScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { OverlayId, TabId } from '../types/navigation';
import { OverlayLayer } from './OverlayLayer';

export function AppShell() {
  const { talkBackEnabled, personType } = useAccessibility();
  const { colors, isHackathon } = useAppTheme();
  const { flyTo } = useMapLocation();
  const [activeTab, setActiveTab] = useState<TabId>('mapa');
  const [overlay, setOverlay] = useState<OverlayId | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState<'scan' | 'guided'>('scan');
  const aiRef = useRef<AIAssistantHandle>(null);
  const planearVoiceHandlerRef = useRef<((text: string) => void) | null>(null);

  const voice = useVoiceInput({
    onTranscription: async (text) => {
      if (activeTab === 'planear' && personType === 'visual' && planearVoiceHandlerRef.current) {
        planearVoiceHandlerRef.current(text);
        return 'Destino actualizado con tu voz';
      }
      const reply = await aiRef.current?.submitVoiceText(text);
      return reply ?? '';
    },
  });

  const shellStyle = [
    styles.root,
    talkBackEnabled && !isHackathon && styles.rootTalkBack,
    (!talkBackEnabled || isHackathon) && { backgroundColor: colors.surface },
  ];
  const statusStyle = talkBackEnabled || isHackathon ? 'light' : 'dark';

  const closeOverlay = useCallback(() => setOverlay(null), []);

  const handleReportSuccess = useCallback(() => {
    setActiveTab('mapa');
  }, []);

  const openScanner = useCallback((mode: 'scan' | 'guided') => {
    setScannerMode(mode);
    setShowScanner(true);
  }, []);

  const handleViewFeedOnMap = useCallback(
    (item: FeedItem) => {
      if (item.lat != null && item.lng != null) {
        flyTo({ lat: item.lat, lng: item.lng });
        setActiveTab('mapa');
      }
    },
    [flyTo],
  );

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
            onRegisterVoiceDestination={(handler) => {
              planearVoiceHandlerRef.current = handler;
            }}
          />
        );
      case 'reportar':
        return <ReportScreen onReportSuccess={handleReportSuccess} />;
      case 'comunidad':
        return (
          <CommunityScreen
            onGoToReport={() => setActiveTab('reportar')}
            onViewOnMap={handleViewFeedOnMap}
          />
        );
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
      <SecureWebBanner />
      <View style={styles.main}>
        <ScreenTransition screenKey={activeTab}>{renderTabContent()}</ScreenTransition>
      </View>
      <View pointerEvents="box-none" style={styles.navLayer}>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
      
      {!showScanner && (
        <AIAssistantFAB onPress={() => aiRef.current?.openSheet()} />
      )}

      {(!isHackathon || activeTab !== 'mapa' || voice.state !== 'idle') && (
        <VoiceAssistantIndicator state={voice.state} onPress={voice.toggleListening} />
      )}
      
      <AIAssistant 
        ref={aiRef} 
        activeTab={activeTab} 
        overlay={null} 
        onOpenScanner={openScanner}
      />

      {showScanner ? (
        <LazyEnvironmentScanner mode={scannerMode} onClose={() => setShowScanner(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootTalkBack: { backgroundColor: '#000000' },
  main: { flex: 1 },
  navLayer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});
