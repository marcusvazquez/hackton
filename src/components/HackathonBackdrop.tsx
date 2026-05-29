import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

/** Decoración sutil de fondo para el modo hackathon (inspirado en v2_cyber). */
export function HackathonBackdrop() {
  const { isHackathon } = useAppTheme();

  if (!isHackathon) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.topGlow} />
      {Platform.OS === 'web' ? (
        <View style={styles.scanlines} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    opacity: 0.9,
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    backgroundColor: '#000000',
    // @ts-expect-error web-only repeating gradient
    backgroundImage:
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
  },
});
