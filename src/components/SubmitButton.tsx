import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { radii, shadows } from '../theme/shadows';

type ButtonState = 'idle' | 'loading' | 'success';

type Props = {
  disabled?: boolean;
  onSuccess: () => void;
};

export function SubmitButton({ disabled, onSuccess }: Props) {
  const { reduceMotion } = useAccessibility();
  const { colors, fontBold } = useAppTheme();
  const [state, setState] = useState<ButtonState>('idle');
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const checkRotate = useSharedValue(-10);

  useEffect(() => {
    if (state !== 'success' || reduceMotion) return;

    scale.value = withSequence(
      withTiming(1.04, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    );
    checkScale.value = withTiming(1, { duration: 300 });
    checkRotate.value = withTiming(0, { duration: 300 });

    const timer = setTimeout(() => {
      setState('idle');
      onSuccess();
    }, 2000);

    return () => clearTimeout(timer);
  }, [state, reduceMotion, onSuccess, scale, checkScale, checkRotate]);

  const handlePress = () => {
    if (disabled || state !== 'idle') return;
    setState('loading');

    setTimeout(() => {
      setState('success');
      if (reduceMotion) {
        setTimeout(() => {
          setState('idle');
          onSuccess();
        }, 2000);
      }
    }, 1500);
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }, { rotate: `${checkRotate.value}deg` }],
  }));

  const bgColor =
    state === 'success' ? colors.safeGreen : colors.secondaryContainer;

  return (
    <Animated.View style={buttonStyle}>
      <Pressable
        accessibilityLabel="Enviar reporte"
        disabled={disabled || state === 'loading'}
        onPress={handlePress}
        style={[styles.button, { backgroundColor: bgColor }, disabled && styles.disabled]}
      >
        {state === 'loading' && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.onSecondaryContainer} size="small" />
          </View>
        )}
        {state === 'success' && (
          <Animated.View style={[styles.successRow, checkStyle]}>
            <MaterialIcons name="check" size={22} color={colors.onPrimary} />
            <Text style={[styles.successText, { fontFamily: fontBold, color: colors.onPrimary }]}>
              ¡Reporte Enviado!
            </Text>
          </Animated.View>
        )}
        {state === 'idle' && (
          <Text
            style={[
              styles.text,
              { fontFamily: fontBold, color: colors.onSecondaryContainer },
            ]}
          >
            Enviar reporte
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    ...shadows.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
  },
  loadingRow: {
    paddingVertical: 4,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 18,
  },
});
