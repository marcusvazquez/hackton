import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

/**
 * Retro cyber layer: grid + scanlines on web; neon frame + vignette on native.
 */
export function HackathonBackdrop() {
  const { isHackathon } = useAppTheme();

  if (!isHackathon) return null;

  if (Platform.OS === 'web') {
    return (
      <View pointerEvents="none" style={styles.webHost}>
        <View style={styles.grid} />
        <View style={styles.scanlines} />
        <View style={styles.vignetteWeb} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.nativeHost}>
      <View style={styles.nativeTopGlow} />
      <View style={styles.nativeBottomGlow} />
      <View style={styles.nativeFrameTop} />
      <View style={styles.nativeFrameBottom} />
      <View style={styles.nativeVignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  webHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
    // @ts-expect-error web-only
    backgroundImage:
      'linear-gradient(rgba(0, 251, 251, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 251, 251, 0.35) 1px, transparent 1px)',
    backgroundSize: '28px 28px',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    backgroundImage:
      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
  },
  vignetteWeb: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: 'radial-gradient(ellipse at center, transparent 40%, rgba(5, 0, 20, 0.85) 100%)',
  },
  nativeHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  nativeTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0, 251, 251, 0.08)',
  },
  nativeBottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(255, 0, 255, 0.06)',
  },
  nativeFrameTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00fbfb',
    opacity: 0.7,
  },
  nativeFrameBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ff00ff',
    opacity: 0.5,
  },
  nativeVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 0, 20, 0.35)',
  },
});
