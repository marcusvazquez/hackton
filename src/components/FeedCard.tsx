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
import { useAppTheme } from '../hooks/useAppTheme';
import { FeedItem } from '../data/community';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  item: FeedItem;
};

export function FeedCard({ item }: Props) {
  const { reduceMotion, talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
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
      <Animated.View
        entering={!reduceMotion ? feedEnter : undefined}
        style={[
          styles.card,
          talkBackEnabled
            ? styles.cardTalkBack
            : {
                backgroundColor: colors.surfaceContainerLowest,
                borderColor: colors.outlineVariant,
              },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: isSafe ? colors.safeGreen : colors.secondaryContainer }]}>
          <MaterialIcons
            name={isSafe ? 'check-circle' : 'warning'}
            size={20}
            color={isSafe ? '#fff' : colors.onSecondaryContainer}
          />
        </View>
        <View style={styles.body}>
          {(item.author || item.location) && !talkBackEnabled ? (
            <View style={styles.metaRow}>
              {item.author ? (
                <Text style={[styles.author, { fontFamily: fontBold, color: colors.primary }]}>
                  {item.author}
                </Text>
              ) : null}
              {item.location ? (
                <View style={styles.locRow}>
                  <MaterialIcons name="place" size={12} color={colors.onSurfaceVariant} />
                  <Text style={[styles.location, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                    {item.location}
                  </Text>
                </View>
              ) : null}
              {item.offline && isHackathon ? (
                <View style={[styles.offlinePill, { borderColor: colors.secondary }]}>
                  <Text style={[styles.offlinePillText, { fontFamily: fontBold, color: colors.secondary }]}>
                    OFFLINE
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          <Text
            style={[
              styles.title,
              { fontFamily: fontBold },
              talkBackEnabled ? styles.textTalkBack : { color: colors.onSurface },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.description,
              { fontFamily: fontRegular },
              talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
            ]}
          >
            {item.description}
          </Text>
          {item.tags && item.tags.length > 0 && !talkBackEnabled ? (
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { borderColor: colors.outlineVariant }]}>
                  <Text style={[styles.tagText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.footer}>
            <Text
              style={[
                styles.time,
                { fontFamily: fontRegular },
                talkBackEnabled ? styles.subtitleTalkBack : { color: colors.outline },
              ]}
            >
              {item.timeAgo}
            </Text>
            <View style={styles.confirmRow}>
              <View style={styles.countWrap}>
                <Animated.Text
                  style={[
                    styles.count,
                    { fontFamily: fontBold, color: colors.primary },
                    oldCountStyle,
                  ]}
                >
                  {count}
                </Animated.Text>
                {!reduceMotion && (
                  <Animated.Text
                    style={[
                      styles.count,
                      { fontFamily: fontBold, color: colors.primary },
                      newCountStyle,
                    ]}
                  >
                    {count + 1}
                  </Animated.Text>
                )}
              </View>
              <Text
                style={[
                  styles.confirmLabel,
                  { fontFamily: fontRegular },
                  talkBackEnabled ? styles.subtitleTalkBack : { color: colors.onSurfaceVariant },
                ]}
              >
                {' '}
                confirmaciones
              </Text>
              <Animated.View style={btnStyle}>
                <Pressable
                  onPress={handleConfirm}
                  style={[styles.confirmBtn, { backgroundColor: colors.primaryContainer }]}
                >
                  <Text
                    style={[
                      styles.confirmText,
                      { fontFamily: fontBold, color: colors.onPrimaryContainer },
                    ]}
                  >
                    Confirmar
                  </Text>
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
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    ...shadows.sm,
  },
  cardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  author: {
    fontSize: 12,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  location: {
    fontSize: 12,
  },
  offlinePill: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  offlinePillText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
  },
  title: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 12,
  },
  time: {
    fontSize: 12,
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
    fontSize: 14,
  },
  confirmLabel: {
    fontSize: 14,
    flex: 1,
  },
  confirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  confirmText: {
    fontSize: 14,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
});
