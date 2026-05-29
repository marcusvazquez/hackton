import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { getVoiceHint } from '../data/personTypes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { mapOverlay } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

export function VoiceAssistantCard() {
  const { reduceMotion, personType } = useAccessibility();
  const { colors, glass, fontBold, fontRegular, isHackathon } = useAppTheme();
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.2);

  useEffect(() => {
    if (reduceMotion) {
      pingScale.value = 1;
      pingOpacity.value = 0.2;
      return;
    }
    pingScale.value = withRepeat(withTiming(1.6, { duration: 1000 }), -1, false);
    pingOpacity.value = withRepeat(withTiming(0, { duration: 1000 }), -1, false);
  }, [reduceMotion, pingOpacity, pingScale]);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  const entering = reduceMotion
    ? undefined
    : FadeInUp.duration(400).delay(450).easing(Easing.bezier(0.16, 1, 0.3, 1));

  return (
    <Animated.View entering={entering} style={styles.wrapper}>
      <View
        style={[
          styles.card,
          shadows.sm,
          isHackathon
            ? {
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                borderColor: 'rgba(255, 0, 170, 0.35)',
              }
            : {
                backgroundColor: 'rgba(0, 63, 135, 0.08)',
                borderColor: 'rgba(0, 86, 179, 0.25)',
              },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.micWrap}>
            {!reduceMotion && (
              <Animated.View style={[styles.ping, { backgroundColor: colors.primary }, pingStyle]} />
            )}
            <MaterialIcons name="mic" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.headerLabel, { fontFamily: fontBold, color: colors.primary }]}>
            Modo Asistente de Voz Activo
          </Text>
        </View>
        <View
          style={[
            styles.messageBox,
            { backgroundColor: glass.light, borderColor: glass.border },
          ]}
        >
          <MaterialIcons name="volume-up" size={22} color={colors.onSurfaceVariant} />
          <Text style={[styles.message, { fontFamily: fontRegular, color: colors.onSurface }]}>
            {getVoiceHint(personType)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: mapOverlay.voiceCardBottom,
    left: spacing.edge,
    right: spacing.edge,
    zIndex: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  micWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ping: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 999,
  },
  headerLabel: {
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flex: 1,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
