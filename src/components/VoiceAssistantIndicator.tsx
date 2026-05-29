import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { VoiceInputState } from '../hooks/useVoiceInput';
import { useTouchExploreTarget } from '../hooks/useTouchExploreTarget';
import { useAppTheme } from '../hooks/useAppTheme';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { hackathonTypography } from '../theme/hackathonLayout';
import { useAccessibility } from '../context/AccessibilityContext';
import { shadows } from '../theme/shadows';

type Props = {
  state: VoiceInputState;
  onPress: () => void;
};

function PulseRing({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.8, { duration: 1200, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(withTiming(0, { duration: 1200 }), -1, false);
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        { borderColor: color, backgroundColor: `${color}22` },
        style,
        { animationDelay: delay } as object,
      ]}
    />
  );
}

export function VoiceAssistantIndicator({ state, onPress }: Props) {
  const { colors, isHackathon, fontNav } = useAppTheme();
  const overlay = useMapOverlayInsets();
  const { reduceMotion } = useAccessibility();
  const { ref: exploreRef, onLayout: onExploreLayout } = useTouchExploreTarget(
    'Asistente de voz',
    state === 'listening'
      ? 'Toca para detener la escucha'
      : 'Toca para hablar con el asistente de voz',
  );
  const isActive = state === 'listening' || state === 'processing' || state === 'speaking';
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'speaking' && !reduceMotion) {
      iconScale.value = withRepeat(withTiming(1.15, { duration: 500 }), -1, true);
      return;
    }
    iconScale.value = 1;
  }, [iconScale, reduceMotion, state]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const iconName =
    state === 'speaking'
      ? 'volume-high'
      : state === 'listening'
        ? 'mic'
        : state === 'idle' || state === 'error'
          ? 'mic-off'
          : 'mic';

  const statusText =
    state === 'listening'
      ? 'Escuchando...'
      : state === 'processing'
        ? 'Procesando...'
        : null;

  const fabSize = isHackathon ? 48 : 56;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: overlay.voiceIndicatorBottom ?? 90 }]}
    >
      {state === 'listening' && !reduceMotion ? (
        <View style={styles.ringsWrap} pointerEvents="none">
          <PulseRing delay={0} color={colors.primary} />
          <PulseRing delay={200} color={colors.primary} />
          <PulseRing delay={400} color={colors.primary} />
        </View>
      ) : null}

      <Pressable
        ref={exploreRef}
        onLayout={onExploreLayout}
        accessible
        accessibilityLabel="Asistente de voz"
        accessibilityRole="button"
        accessibilityHint={
          state === 'listening'
            ? 'Toca para detener la escucha'
            : 'Toca para hablar con el asistente de voz'
        }
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            width: fabSize,
            height: fabSize,
            minWidth: fabSize,
            minHeight: fabSize,
            borderRadius: fabSize / 2,
            backgroundColor: isActive ? colors.primary : colors.surface,
            borderColor: colors.primary,
            opacity: pressed ? 0.9 : 1,
          },
          Platform.OS === 'android' ? styles.androidElevation : shadows.lg,
          isHackathon && { 
            shadowColor: colors.primary, 
            shadowOpacity: isActive ? 0.8 : 0.4, 
            shadowRadius: isActive ? 16 : 8,
            shadowOffset: { width: 0, height: 0 },
            borderColor: colors.primary,
            borderWidth: 2,
            backgroundColor: isActive ? colors.primaryContainer : '#12121f'
          }
        ]}
      >
        {state === 'processing' ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Animated.View style={iconAnimStyle}>
            <Ionicons
              name={iconName}
              size={isHackathon ? 24 : 28}
              color={isActive || isHackathon ? colors.primary : colors.primary}
            />
          </Animated.View>
        )}
      </Pressable>

      {statusText && !isHackathon ? (
        <Text style={[styles.status, { color: colors.onSurface }]}>{statusText}</Text>
      ) : null}
      {statusText && isHackathon ? (
        <Text
          style={[
            styles.status,
            {
              fontFamily: fontNav,
              fontSize: hackathonTypography.bodyXs,
              color: colors.primary,
            },
          ]}
          numberOfLines={1}
        >
          {statusText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    zIndex: 40,
  },
  ringsWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  fab: {
    width: 56,
    height: 56,
    minWidth: 56,
    minHeight: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidElevation: {
    elevation: 6,
  },
  status: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegible_400Regular',
  },
});
