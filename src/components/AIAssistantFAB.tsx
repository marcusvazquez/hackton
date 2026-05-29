import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { hackathonTypography } from '../theme/hackathonLayout';
import { shadows, radii } from '../theme/shadows';

type Props = {
  onPress: () => void;
};

export function AIAssistantFAB({ onPress }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isHackathon, fontBold, fontNav } = useAppTheme();
  const overlay = useMapOverlayInsets();
  const { reduceMotion, talkBackEnabled } = useAccessibility();
  const { fabEnter } = useAnimations();

  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (!reduceMotion) {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [reduceMotion, glowScale, glowOpacity]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      entering={fabEnter}
      style={[
        styles.container,
        {
          bottom: isHackathon
            ? overlay.aiFabBottom
            : Math.max(insets.bottom, 16) + 72,
        },
      ]}
    >
      <View style={styles.glowContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: isHackathon ? colors.primary : colors.primaryContainer },
            glowStyle,
          ]}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir asistente de Inteligencia Artificial"
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: isHackathon ? '#12121f' : colors.primaryContainer },
          shadows.lg,
          isHackathon && styles.fabHackathon,
          isHackathon && { borderColor: colors.primary, height: 48, paddingHorizontal: 12 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialIcons
          name="auto-awesome"
          size={isHackathon ? 22 : 24}
          color={isHackathon ? colors.primary : colors.onPrimaryContainer}
        />
        {!talkBackEnabled && !isHackathon && (
          <Text
            style={[
              styles.label,
              {
                fontFamily: fontBold,
                color: colors.onPrimaryContainer,
              },
            ]}
          >
            Guía IA
          </Text>
        )}
        {!talkBackEnabled && isHackathon ? (
          <Text
            style={[
              styles.label,
              {
                fontFamily: fontNav,
                fontSize: hackathonTypography.bodySm,
                textTransform: 'none',
                color: colors.primary,
                textShadowColor: colors.primary,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 6,
              },
            ]}
            numberOfLines={1}
          >
            IA
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: radii.pill,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fabHackathon: {
    borderWidth: 1.5,
    shadowColor: '#00fbfb',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  glowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  glow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    filter: 'blur(10px)',
  },
});
