import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { HackathonBackdrop } from '../components/HackathonBackdrop';
import { DetailScreen } from '../screens/DetailScreen';
import { ExpertModeModal } from '../screens/ExpertModeModal';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OverlayId } from '../types/navigation';

type Props = {
  overlay: OverlayId;
  shellStyle: ViewStyle | ViewStyle[];
  statusStyle: 'light' | 'dark' | 'auto';
  onClose: () => void;
};

export function OverlayLayer({ overlay, shellStyle, statusStyle, onClose }: Props) {
  return (
    <View style={[styles.root, shellStyle]}>
      <HackathonBackdrop />
      <StatusBar style={statusStyle} />
      {overlay === 'expert' && <ExpertModeModal onClose={onClose} />}
      {overlay === 'settings' && <SettingsScreen onBack={onClose} />}
      {overlay === 'perfil' && <ProfileScreen onBack={onClose} />}
      {overlay === 'detalle' && <DetailScreen onBack={onClose} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
