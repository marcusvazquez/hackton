import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ScannerMode } from './EnvironmentScanner';
import { useAppTheme } from '../hooks/useAppTheme';

type Props = {
  mode?: ScannerMode;
  onClose: () => void;
};

type ScannerComponent = React.ComponentType<Props>;

/**
 * Loads EnvironmentScanner (and expo-camera) only when the user opens the scanner,
 * so a camera native-module failure does not crash the whole app at startup.
 */
export function LazyEnvironmentScanner({ mode, onClose }: Props) {
  const { colors, fontBold, fontRegular } = useAppTheme();
  const [Scanner, setScanner] = useState<ScannerComponent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import('./EnvironmentScanner')
      .then((mod) => {
        if (!cancelled) {
          setScanner(() => mod.EnvironmentScanner);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'No se pudo cargar el módulo de cámara';
          setError(message);
          console.error('[ParaTodos] EnvironmentScanner load failed:', err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { fontFamily: fontBold, color: colors.error }]}>
          Cámara no disponible
        </Text>
        <Text style={[styles.message, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          {error}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.btn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.btnText, { fontFamily: fontBold, color: colors.onPrimary }]}>
            Cerrar
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!Scanner) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loading, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Abriendo cámara…
        </Text>
      </View>
    );
  }

  return <Scanner mode={mode} onClose={onClose} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loading: {
    marginTop: 12,
    fontSize: 14,
  },
  btn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  btnText: {
    fontSize: 16,
  },
});
