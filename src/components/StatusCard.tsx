import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useMapLocation } from '../context/MapLocationContext';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { useMapOverlayInsets } from '../hooks/useMapOverlayInsets';
import { hackathonTypography } from '../theme/hackathonLayout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onPressVer: () => void;
  highContrast?: boolean;
  fontSize?: number;
  minTouchTarget?: number;
};

export function StatusCard({
  onPressVer,
  highContrast = false,
  fontSize = 16,
  minTouchTarget = 44,
}: Props) {
  const { reduceMotion, speak, personType } = useAccessibility();
  const { flyToZonaCentroBarrera } = useMapLocation();
  const { colors, fontBold, fontRegular, isHackathon, fontNav } = useAppTheme();
  const overlay = useMapOverlayInsets();
  const titleSize = isHackathon ? hackathonTypography.bodySm : fontSize;
  const subtitleSize = isHackathon ? hackathonTypography.bodyXs : fontSize - 3;
  const { statusCardEnter } = useAnimations();
  const scale = useSharedValue(1);

  const handlePress = () => {
    flyToZonaCentroBarrera();
    if (personType === 'visual') {
      void speak('Zona Centro. Dos barreras reportadas cerca de ti.');
    }
    if (!reduceMotion) {
      scale.value = withSequence(
        withTiming(0.97, { duration: 75 }),
        withTiming(1, { duration: 75 }),
      );
    }
    setTimeout(onPressVer, reduceMotion ? 0 : 150);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={statusCardEnter}
      style={[
        styles.wrapper,
        {
          bottom: overlay.statusCardBottom,
          right: overlay.statusCardRight ?? 90,
        },
        cardStyle,
      ]}
    >
      <View
        style={[
          styles.card,
          shadows.md,
          {
            backgroundColor: highContrast ? '#111111' : colors.surfaceContainerLowest,
            borderColor: highContrast ? '#ffffff' : colors.outlineVariant,
            borderWidth: highContrast ? 2 : 1,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.secondaryFixed }]}>
          <MaterialIcons name="report" size={24} color={colors.onSecondaryFixed} />
        </View>
        <View style={styles.content}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                fontFamily: isHackathon ? fontNav : fontBold,
                fontSize: titleSize,
                lineHeight: isHackathon ? hackathonTypography.lineBodySm : undefined,
                color: highContrast ? '#ffffff' : colors.onSurface,
              },
            ]}
          >
            Cerca: Zona Centro
          </Text>
          <Text
            numberOfLines={2}
            style={[
              styles.subtitle,
              {
                fontFamily: fontRegular,
                fontSize: subtitleSize,
                lineHeight: isHackathon ? hackathonTypography.lineBodySm : undefined,
                color: highContrast ? '#e5e5e5' : colors.onSurfaceVariant,
              },
            ]}
          >
            2 barreras reportadas cerca de ti.
          </Text>
        </View>
        <Pressable 
          accessible={true}
          importantForAccessibility="yes"
          accessibilityRole="button"
          accessibilityLabel="Ver 2 barreras reportadas cerca de ti en Zona Centro"
          accessibilityHint="Muestra el detalle de las barreras en Zona Centro"
          onPress={handlePress} 
          style={[styles.verButton, { backgroundColor: colors.secondary, minHeight: minTouchTarget }]}
        >
          <Text
            style={[
              styles.verText,
              {
                fontFamily: isHackathon ? fontNav : fontBold,
                fontSize: isHackathon ? hackathonTypography.pixelMd : 16,
                color: colors.onSecondary,
              },
            ]}
          >
            Ver
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.onSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.edge,
    zIndex: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: 12,
  },
  iconCircle: {
    padding: 10,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  verButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    gap: 2,
  },
  verText: {
    fontSize: 16,
  },
});
