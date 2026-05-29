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
import { hackathonNeonText, hackathonTypography } from '../theme/hackathonLayout';
import { radii, shadows } from '../theme/shadows';

type Props = {
  barrier: BarrierType;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onAttachPhoto?: () => void;
  iconOnly?: boolean;
  minTouchTarget?: number;
  largeIcons?: boolean;
  fontSize?: number;
};

export function BarrierChip({
  barrier,
  index,
  selected,
  onSelect,
  onAttachPhoto,
  iconOnly = false,
  minTouchTarget = 112,
  largeIcons = false,
  fontSize = 14,
}: Props) {
  const { reduceMotion, talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon, fontNav } = useAppTheme();
  const labelFont = isHackathon ? fontNav : fontBold;
  const chipFontSize = isHackathon ? hackathonTypography.chipLabel : fontSize;
  const chipLineHeight = isHackathon ? hackathonTypography.chipLine : 20;
  const neonChip = isHackathon && !talkBackEnabled;
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

  const chipMinHeight = neonChip ? Math.max(minTouchTarget, 100) : minTouchTarget;

  const iconColor = neonChip
    ? selected
      ? colors.onPrimary
      : barrier.accent
    : selected
      ? colors.onPrimary
      : talkBackEnabled
        ? '#ffffff'
        : colors.primary;

  const iconBg = neonChip
    ? selected
      ? barrier.accent
      : `${barrier.accent}28`
    : selected
      ? colors.primary
      : talkBackEnabled
        ? '#1a1a1a'
        : colors.primaryFixed;

  return (
    <Animated.View entering={chipEnter(index)} style={[styles.gridItem, iconOnly && styles.gridItemIconOnly, chipStyle]}>
      <Pressable
        accessible
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={barrier.label}
        accessibilityHint={selected ? 'Barrera seleccionada' : 'Toca para seleccionar este tipo de barrera'}
        onPress={handlePress}
        style={[
          styles.chip,
          { minHeight: chipMinHeight },
          neonChip && styles.chipNeon,
          neonChip
            ? {
                borderColor: selected ? barrier.accent : colors.outlineVariant,
                backgroundColor: selected ? `${barrier.accent}18` : colors.surfaceContainerLowest,
                ...(selected
                  ? {
                      shadowColor: barrier.accent,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.55,
                      shadowRadius: 10,
                      elevation: 8,
                    }
                  : {}),
              }
            : talkBackEnabled
              ? styles.chipTalkBack
              : {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLowest,
                },
          selected &&
            !neonChip &&
            (talkBackEnabled
              ? styles.chipSelectedTalkBack
              : {
                  borderColor: colors.primary,
                  backgroundColor: colors.selectedSurface,
                }),
        ]}
      >
        <View
          style={[
            styles.iconBox,
            neonChip && styles.iconBoxNeon,
            {
              backgroundColor: iconBg,
              borderLeftColor: barrier.accent,
              borderLeftWidth: neonChip ? 4 : 3,
            },
          ]}
        >
          <MaterialIcons
            name={barrier.icon as keyof typeof MaterialIcons.glyphMap}
            size={neonChip ? (largeIcons ? 32 : 28) : largeIcons ? 36 : 26}
            color={iconColor}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          />
        </View>
        {!iconOnly ? (
          <View style={styles.labelCol}>
            <Text
              style={[
                styles.label,
                { fontFamily: labelFont, fontSize: chipFontSize, lineHeight: chipLineHeight },
                talkBackEnabled && !neonChip && styles.labelTalkBack,
                !talkBackEnabled && !neonChip && { color: colors.onSurface },
                neonChip && !selected && { color: colors.onSurface },
                neonChip && selected && hackathonNeonText(barrier.accent),
                neonChip && styles.labelNeon,
                selected && !neonChip && !talkBackEnabled && { color: colors.primary },
                selected && talkBackEnabled && !neonChip && styles.labelSelectedTalkBack,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit={isHackathon}
              minimumFontScale={0.85}
            >
              {barrier.label}
            </Text>
            {selected && onAttachPhoto ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Adjuntar foto del obstáculo"
                accessibilityHint="Abre la cámara o galería para documentar la barrera"
                onPress={(e) => {
                  e.stopPropagation?.();
                  onAttachPhoto();
                }}
                hitSlop={8}
                style={styles.photoBtn}
              >
                <MaterialIcons name="add-a-photo" size={14} color={colors.primary} />
                <Text
                  style={[
                    styles.photoHint,
                    { fontFamily: fontRegular, color: colors.primary },
                    talkBackEnabled && styles.photoHintTalkBack,
                  ]}
                >
                  Adjuntar foto (opcional)
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
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
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '47%',
    maxWidth: '47%',
  },
  gridItemIconOnly: {
    width: '30%',
  },
  chipNeon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 8,
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
  iconBoxNeon: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    marginBottom: 2,
  },
  labelCol: {
    gap: 4,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  labelNeon: {
    textAlign: 'center',
    width: '100%',
  },
  labelTalkBack: {
    color: '#ffffff',
  },
  labelSelectedTalkBack: {
    color: '#93c5fd',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  photoHint: {
    fontSize: 11,
    lineHeight: 14,
  },
  photoHintTalkBack: {
    color: '#aaaaaa',
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
