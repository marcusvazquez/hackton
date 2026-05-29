import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onPress: () => void;
  size?: number;
};

export function ReportFab({ onPress, size = 60 }: Props) {
  const { reduceMotion } = useAccessibility();
  const { colors, isHackathon } = useAppTheme();
  const overlay = useMapOverlayInsets();
  const fabSize = isHackathon ? Math.min(size, 52) : size;
  const { fabEnter } = useAnimations();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const [ripples, setRipples] = useState<number[]>([]);

  const handlePressIn = () => {
    if (reduceMotion) return;
    scale.value = withTiming(1.08, { duration: 200 });
    rotate.value = withTiming(-8, { duration: 200 });
  };

  const handlePressOut = () => {
    if (reduceMotion) return;
    scale.value = withTiming(1, { duration: 200 });
    rotate.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    if (!reduceMotion) {
      scale.value = withSequence(
        withTiming(0.92, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );
      const id = Date.now();
      setRipples((prev) => [...prev, id]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r !== id));
      }, 500);
    }
    onPress();
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      entering={fabEnter}
      style={[styles.wrapper, { bottom: overlay.reportFabBottom }]}
    >
      <Pressable
        accessible={true}
        importantForAccessibility="yes"
        accessibilityRole="button"
        accessibilityLabel="Reportar obstáculo"
        accessibilityHint="Abre la pantalla para reportar barreras en tu ruta"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.fab,
            {
              width: fabSize,
              height: fabSize,
              backgroundColor: colors.secondaryContainer,
              borderColor: isHackathon ? colors.primary : '#ffffff',
            },
            fabStyle,
          ]}
        >
          {ripples.map((id) => (
            <Ripple key={id} />
          ))}
          <MaterialIcons
            name="add-a-photo"
            size={fabSize >= 72 ? 40 : fabSize >= 52 ? 28 : 32}
            color={colors.onSecondaryContainer}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function Ripple() {
  const { reduceMotion } = useAccessibility();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    if (reduceMotion) return;
    scale.value = withTiming(2.5, { duration: 500 });
    opacity.value = withTiming(0, { duration: 500 });
  }, [reduceMotion, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ripple, style]} />;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: spacing.edge,
    zIndex: 20,
  },
  fab: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...shadows.lg,
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
