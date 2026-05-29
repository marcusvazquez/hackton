import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';

type PulseVariant = 'barrier' | 'safe';

type Props = {
  children: React.ReactNode;
  variant?: PulseVariant;
  style?: ViewStyle;
};

const pulseColors: Record<PulseVariant, string> = {
  barrier: 'rgba(248, 132, 0, 0.5)',
  safe: 'rgba(22, 163, 74, 0.5)',
};

const pulseDuration: Record<PulseVariant, number> = {
  barrier: 2000,
  safe: 3000,
};

export function PulseRing({ children, variant = 'barrier', style }: Props) {
  const { reduceMotion } = useAccessibility();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      opacity.value = 0;
      return;
    }

    scale.value = withRepeat(
      withTiming(2.2, { duration: pulseDuration[variant], easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: pulseDuration[variant], easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [reduceMotion, opacity, scale, variant]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      {!reduceMotion && (
        <Animated.View
          style={[
            styles.ring,
            { borderColor: pulseColors[variant] },
            ringStyle,
          ]}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
  },
});
