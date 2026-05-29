import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { hackathonColors } from '../theme/hackathonColors';
import { hackathonNeonText } from '../theme/hackathonLayout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const { completeWelcome, reduceMotion } = useAccessibility();
  const { colors, fontBold, fontRegular, fontPixel, isHackathon } = useAppTheme();
  const fadeIn = reduceMotion ? undefined : FadeIn.duration(500);
  const fadeDown = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.duration(600).delay(delay);

  const handleStart = () => {
    completeWelcome();
    onContinue();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Animated.View entering={fadeIn} style={styles.glowOrb} />

      <Animated.View entering={fadeDown(100)} style={styles.hero}>
        <View style={[styles.logoRing, { borderColor: colors.primary, shadowColor: colors.primary }]}>
          <Image
            accessibilityLabel="Logo ParaTodos"
            source={require('../../assets/paratodos-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <Text
          style={[
            styles.brandName,
            {
              fontFamily: isHackathon ? fontPixel : fontBold,
              color: colors.primary,
            },
            isHackathon && styles.brandNamePixel,
            isHackathon && hackathonNeonText(hackathonColors.primary),
          ]}
        >
          ParaTodos
        </Text>
        <Text
          style={[
            styles.tagline,
            {
              fontFamily: fontRegular,
              color: isHackathon ? colors.tertiary : colors.onSurfaceVariant,
            },
            isHackathon && styles.taglinePixel,
            isHackathon && hackathonNeonText(hackathonColors.neonGreen),
          ]}
        >
          CONECTA, MAPEA. INCLUYE.
        </Text>
        <Text style={[styles.pitch, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          Rutas accesibles en Tijuana con IA, mapa comunitario y reportes en tiempo real.
        </Text>
      </Animated.View>

      <Animated.View entering={fadeDown(280)} style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Comenzar"
          accessibilityHint="Continúa para elegir tu perfil de movilidad"
          onPress={handleStart}
          style={[
            styles.cta,
            {
              backgroundColor: colors.primary,
              borderColor: isHackathon ? colors.secondary : colors.primary,
            },
            shadows.md,
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              {
                fontFamily: isHackathon ? fontPixel : fontBold,
                color: colors.onPrimary,
              },
              isHackathon && styles.ctaTextPixel,
            ]}
          >
            Comenzar
          </Text>
        </Pressable>
        <Text style={[styles.footnote, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          HackFox 2026 · Tijuana sin barreras
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  glowOrb: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 251, 251, 0.12)',
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  logoRing: {
    padding: 18,
    borderRadius: radii.xl,
    borderWidth: 2,
    marginBottom: 8,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  logo: {
    width: 120,
    height: 120,
  },
  brandName: {
    fontSize: 32,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  brandNamePixel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  taglinePixel: {
    fontSize: 14,
    letterSpacing: 3,
    lineHeight: 18,
  },
  pitch: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  cta: {
    width: '100%',
    maxWidth: 360,
    minHeight: 56,
    borderRadius: radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 18,
  },
  ctaTextPixel: {
    fontSize: 10,
    letterSpacing: 1,
  },
  footnote: {
    fontSize: 12,
    textAlign: 'center',
  },
});
