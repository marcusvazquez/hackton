import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const OFFLINE_AMBER = '#f97316';

export function NetStatusBanner() {
  const { isOnline } = useNetworkStatus();
  const { colors, fontBold, isHackathon, fontNav } = useAppTheme();
  const { reduceMotion } = useAccessibility();

  const backgroundColor = isOnline ? colors.safeGreen : OFFLINE_AMBER;
  const statusKey = isOnline ? 'online' : 'offline';
  const enterAnim = reduceMotion ? undefined : FadeIn.duration(200);
  const exitAnim = reduceMotion ? undefined : FadeOut.duration(200);

  return (
    <View style={[styles.banner, { backgroundColor, height: isHackathon ? 36 : 44 }]}>
      <Animated.View key={statusKey} entering={enterAnim} exiting={exitAnim} style={styles.row}>
        <MaterialIcons name={isOnline ? 'wifi' : 'wifi-off'} size={isHackathon ? 16 : 18} color="#ffffff" />
        <Text
          style={[
            styles.label,
            {
              fontFamily: isHackathon ? fontNav : fontBold,
              fontSize: isHackathon ? 16 : 14,
            },
          ]}
          numberOfLines={1}
        >
          {isOnline ? (isHackathon ? 'Online' : 'Modo: Online') : isHackathon ? 'Sin red' : 'Modo: Sin Conexión'}
        </Text>
        <MaterialIcons
          name={isOnline ? 'cloud-done' : 'cloud-off'}
          size={18}
          color="#ffffff"
          style={styles.trailingIcon}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
  },
  trailingIcon: {
    marginLeft: 'auto',
  },
});
