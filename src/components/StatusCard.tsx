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
import { useAnimations } from '../hooks/useAnimations';
import { colors, spacing } from '../theme/colors';
import { mapOverlay } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onPressVer: () => void;
};

export function StatusCard({ onPressVer }: Props) {
  const { reduceMotion } = useAccessibility();
  const { statusCardEnter } = useAnimations();
  const scale = useSharedValue(1);

  const handlePress = () => {
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
      <View style={[styles.card, shadows.md]}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="report" size={24} color={colors.onSecondaryFixed} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Cerca: Zona Centro</Text>
          <Text style={styles.subtitle}>2 barreras reportadas cerca de ti.</Text>
        </View>
        <Pressable onPress={handlePress} style={styles.verButton}>
          <Text style={styles.verText}>Ver</Text>
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
    right: spacing.edge,
    zIndex: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.xl,
    padding: 18,
  },
  iconCircle: {
    backgroundColor: colors.secondaryFixed,
    padding: 12,
    borderRadius: 999,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 20,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  verButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    gap: 2,
  },
  verText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 18,
    color: colors.onSecondary,
  },
});
