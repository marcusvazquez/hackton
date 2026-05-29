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
import { mapOverlay } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onPressVer: () => void;
};

export function StatusCard({ onPressVer }: Props) {
  const { reduceMotion } = useAccessibility();
  const { flyToZonaCentroBarrera } = useMapLocation();
  const { colors, fontBold, fontRegular } = useAppTheme();
  const { statusCardEnter } = useAnimations();
  const scale = useSharedValue(1);

  const handlePress = () => {
    flyToZonaCentroBarrera();
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
    <Animated.View entering={statusCardEnter} style={[styles.wrapper, cardStyle]}>
      <View
        style={[
          styles.card,
          shadows.md,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.secondaryFixed }]}>
          <MaterialIcons name="report" size={24} color={colors.onSecondaryFixed} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: fontBold, color: colors.onSurface }]}>
            Cerca: Zona Centro
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
            2 barreras reportadas cerca de ti.
          </Text>
        </View>
        <Pressable 
          accessible={true}
          importantForAccessibility="yes"
          accessibilityRole="button"
          accessibilityLabel="Ver 2 barreras reportadas cerca de ti en Zona Centro"
          onPress={handlePress} 
          style={[styles.verButton, { backgroundColor: colors.secondary }]}
        >
          <Text style={[styles.verText, { fontFamily: fontBold, color: colors.onSecondary }]}>Ver</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.onSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: mapOverlay.statusCardBottom,
    left: spacing.edge,
    right: 90,
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
