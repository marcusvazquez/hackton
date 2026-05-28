import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnimations } from '../hooks/useAnimations';
import { useInView } from '../hooks/useInView';
import { FeedItem } from '../data/community';
import { colors, spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  item: FeedItem;
};

export function FeedCard({ item }: Props) {
  const { reduceMotion } = useAccessibility();
  const { feedEnter } = useAnimations();
  const { ref, inView } = useInView(0.15);
  const [count, setCount] = useState(item.confirmations);
  const [animating, setAnimating] = useState(false);
  const btnScale = useSharedValue(1);
  const oldY = useSharedValue(0);
  const oldOpacity = useSharedValue(1);
  const newY = useSharedValue(-8);
  const newOpacity = useSharedValue(0);

  const handleConfirm = () => {
    if (animating) return;

    if (!reduceMotion) {
      btnScale.value = withSequence(
        withTiming(0.93, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );
    }

    setAnimating(true);

    if (!reduceMotion) {
      oldY.value = withTiming(8, { duration: 200 });
      oldOpacity.value = withTiming(0, { duration: 200 });
      newY.value = withTiming(0, { duration: 200 });
      newOpacity.value = withTiming(1, { duration: 200 });
    }

    setTimeout(() => {
      setCount((c) => c + 1);
      oldY.value = 0;
      oldOpacity.value = 1;
      newY.value = -8;
      newOpacity.value = 0;
      setAnimating(false);
    }, reduceMotion ? 0 : 200);
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const oldCountStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: oldY.value }],
    opacity: oldOpacity.value,
  }));

  const newCountStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: newY.value }],
    opacity: newOpacity.value,
    position: 'absolute',
  }));

  const isSafe = item.type === 'safe';
  const visible = inView || Platform.OS !== 'web';

  return (
    <View ref={ref} collapsable={false} style={!visible ? styles.placeholder : undefined}>
      {visible ? (
      <Animated.View entering={!reduceMotion ? feedEnter : undefined} style={styles.card}>
        <View style={[styles.badge, { backgroundColor: isSafe ? colors.safeGreen : colors.secondaryContainer }]}>
          <MaterialIcons
            name={isSafe ? 'check-circle' : 'warning'}
            size={20}
            color={isSafe ? '#fff' : colors.onSecondaryContainer}
          />
        </View>
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.footer}>
            <Text style={styles.time}>{item.timeAgo}</Text>
            <View style={styles.confirmRow}>
              <View style={styles.countWrap}>
                <Animated.Text style={[styles.count, oldCountStyle]}>{count}</Animated.Text>
                {!reduceMotion && (
                  <Animated.Text style={[styles.count, newCountStyle]}>{count + 1}</Animated.Text>
                )}
              </View>
              <Text style={styles.confirmLabel}> confirmaciones</Text>
              <Animated.View style={btnStyle}>
                <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
                  <Text style={styles.confirmText}>Confirmar</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>
      </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    minHeight: 120,
    marginBottom: spacing.gutter,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    ...shadows.sm,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 16,
    color: colors.onSurface,
  },
  description: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  footer: {
    marginTop: 12,
  },
  time: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 12,
    color: colors.outline,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  countWrap: {
    height: 20,
    overflow: 'hidden',
    minWidth: 16,
  },
  count: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  confirmLabel: {
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  confirmBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  confirmText: {
    fontFamily: 'AtkinsonHyperlegible_700Bold',
    fontSize: 14,
    color: colors.onPrimaryContainer,
  },
});
