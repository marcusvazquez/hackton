import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { BarrierType } from '../data/barriers';
import { radii, shadows } from '../theme/shadows';

type Props = {
  barrier: BarrierType;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function BarrierChip({ barrier, index, selected, onSelect }: Props) {
  const { reduceMotion, talkBackEnabled } = useAccessibility();
  const { colors, fontBold } = useAppTheme();
  const { chipEnter } = useAnimations();
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    checkScale.value = reduceMotion
      ? selected ? 1 : 0
      : withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected, reduceMotion, checkScale]);

  const handlePress = () => {
    if (!reduceMotion) {
      scale.value = withSequence(
        withTiming(1.03, { duration: 75 }),
        withTiming(1, { duration: 75 }),
      );
    }
    onSelect(barrier.id);
  };

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const iconColor = selected
    ? colors.onPrimary
    : talkBackEnabled
      ? '#ffffff'
      : colors.primary;

  const iconBg = selected
    ? colors.primary
    : talkBackEnabled
      ? '#1a1a1a'
      : colors.primaryFixed;

  return (
    <Animated.View entering={chipEnter(index)} style={[styles.gridItem, chipStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={handlePress}
        style={[
          styles.chip,
          talkBackEnabled
            ? styles.chipTalkBack
            : {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLowest,
              },
          selected &&
            (talkBackEnabled
              ? styles.chipSelectedTalkBack
              : {
                  borderColor: colors.primary,
                  backgroundColor: colors.selectedSurface,
                }),
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBg, borderLeftColor: barrier.accent }]}>
          <MaterialIcons
            name={barrier.icon as keyof typeof MaterialIcons.glyphMap}
            size={26}
            color={iconColor}
          />
        </View>
        <Text
          style={[
            styles.label,
            { fontFamily: fontBold },
            talkBackEnabled && styles.labelTalkBack,
            !talkBackEnabled && { color: colors.onSurface },
            selected && !talkBackEnabled && { color: colors.primary },
            selected && talkBackEnabled && styles.labelSelectedTalkBack,
          ]}
        >
          {barrier.label}
        </Text>
        {selected && (
          <Animated.View
            entering={reduceMotion ? undefined : ZoomIn.duration(180)}
            style={[styles.check, { backgroundColor: colors.primary }, checkStyle]}
          >
            <MaterialIcons name="check" size={14} color={colors.onPrimary} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    width: '47%',
  },
  chip: {
    minHeight: 112,
    borderRadius: radii.lg,
    borderWidth: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 14,
    gap: 10,
    position: 'relative',
    ...shadows.sm,
  },
  chipTalkBack: {
    backgroundColor: '#0a0a0a',
    borderColor: '#444444',
  },
  chipSelectedTalkBack: {
    borderColor: '#93c5fd',
    backgroundColor: '#0d1f3d',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 3,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  labelTalkBack: {
    color: '#ffffff',
  },
  labelSelectedTalkBack: {
    color: '#93c5fd',
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
