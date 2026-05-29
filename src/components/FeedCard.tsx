import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAccessibility } from '../context/AccessibilityContext';
import { FeedItem } from '../data/community';
import { useAnimations } from '../hooks/useAnimations';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  item: FeedItem;
  confirmedByMe: boolean;
  onToggleConfirm: (id: string) => void;
  onViewOnMap?: (item: FeedItem) => void;
  premium?: boolean;
  simplified?: boolean;
  fontSize?: number;
  onReadAloud?: (text: string) => void;
  showReadAloud?: boolean;
};

export function FeedCard({
  item,
  confirmedByMe,
  onToggleConfirm,
  onViewOnMap,
  premium = false,
  simplified = false,
  fontSize = 16,
  onReadAloud,
  showReadAloud = false,
}: Props) {
  const { reduceMotion, talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const { feedEnter } = useAnimations();
  const btnScale = useSharedValue(1);

  const isSafe = item.type === 'seguro';
  const hasMapCoords = item.lat != null && item.lng != null;
  const isResolved = item.status === 'solucionado';

  const statusBadgeConfig =
    item.status === 'reportado'
      ? { bg: '#f97316', icon: 'warning' as const, label: 'REPORTADO' }
      : item.status === 'en_revision'
        ? { bg: colors.surfaceContainerHigh, icon: 'search' as const, label: 'EN REVISIÓN' }
        : item.status === 'solucionado'
          ? { bg: colors.safeGreen, icon: 'check-circle' as const, label: 'SOLUCIONADO' }
          : null;

  const handleConfirm = () => {
    if (!reduceMotion) {
      btnScale.value = withSequence(
        withTiming(0.93, { duration: 100 }),
        withTiming(1, { duration: 100 }),
      );
    }
    onToggleConfirm(item.id);
  };

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const cardBg = premium
    ? confirmedByMe
      ? { backgroundColor: 'rgba(24, 24, 27, 0.85)', borderColor: 'rgba(59,130,246,0.5)' }
      : { backgroundColor: 'rgba(9, 9, 11, 0.8)', borderColor: '#27272a' }
    : confirmedByMe
      ? { backgroundColor: 'rgba(255,255,255,0.95)', borderColor: colors.primary }
      : { backgroundColor: 'rgba(255,255,255,0.85)', borderColor: colors.outlineVariant };

  const descriptionSize = simplified ? fontSize : fontSize - 3;
  const titleSize = simplified ? fontSize + 2 : fontSize;

  return (
    <Animated.View
      entering={!reduceMotion ? feedEnter : undefined}
      style={[
        styles.card,
        item.status ? styles.cardWithStatusBadge : undefined,
        confirmedByMe && styles.cardConfirmed,
        talkBackEnabled ? styles.cardTalkBack : cardBg,
      ]}
    >
      {statusBadgeConfig ? (
        <View style={[styles.statusBadge, { backgroundColor: statusBadgeConfig.bg }]}>
          <MaterialIcons name={statusBadgeConfig.icon} size={14} color="#ffffff" />
          <Text style={[styles.statusBadgeText, { fontFamily: fontBold }]}>
            {statusBadgeConfig.label}
          </Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text
            style={[
              styles.usuario,
              { fontFamily: fontBold, color: premium ? '#9ca3af' : colors.primary },
            ]}
          >
            {item.usuario}
          </Text>
          <View
            style={[
              styles.zonaPill,
              {
                backgroundColor: premium ? '#27272a' : colors.surfaceContainerHigh,
                borderColor: premium ? '#3f3f46' : 'transparent',
                borderWidth: premium ? 1 : 0,
              },
            ]}
          >
            <MaterialIcons
              name="place"
              size={11}
              color={premium ? '#60a5fa' : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.zonaText,
                {
                  fontFamily: fontBold,
                  color: premium ? '#d1d5db' : colors.onSurfaceVariant,
                },
              ]}
            >
              {item.zona}
            </Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          {!simplified && item.isReincidente ? (
            <View style={[styles.badge, styles.badgeReincidente]}>
              <Text style={[styles.badgeText, { fontFamily: fontBold }]}>⚠️ Reincidente</Text>
            </View>
          ) : null}
          {!simplified && item.isAiVerified ? (
            <View style={[styles.badge, styles.badgeAi]}>
              <Text style={[styles.badgeText, { fontFamily: fontBold }]}>🤖 IA OK</Text>
            </View>
          ) : null}
          {!simplified && item.offline && isHackathon ? (
            <View style={[styles.badge, { borderColor: colors.secondary }]}>
              <Text style={[styles.badgeText, { fontFamily: fontBold, color: colors.secondary }]}>
                OFFLINE
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.bodyRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} contentFit="cover" />
        ) : null}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: isSafe
                ? premium
                  ? 'rgba(16,185,129,0.15)'
                  : colors.safeGreen + '22'
                : premium
                  ? 'rgba(245,158,11,0.15)'
                  : colors.secondaryContainer,
            },
          ]}
        >
          <Text style={styles.iconEmoji}>{isSafe ? '✅' : '⚠️'}</Text>
        </View>
        <View style={styles.body}>
          <Text
            style={[
              styles.title,
              { fontFamily: fontBold, fontSize: titleSize, lineHeight: titleSize + 6 },
              talkBackEnabled
                ? styles.textTalkBack
                : { color: premium ? '#ffffff' : colors.onSurface },
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.description,
              { fontFamily: fontRegular, fontSize: descriptionSize, lineHeight: descriptionSize + 6 },
              talkBackEnabled
                ? styles.subtitleTalkBack
                : { color: premium ? '#9ca3af' : colors.onSurfaceVariant },
            ]}
          >
            {simplified ? item.zona : item.description}
          </Text>
          {showReadAloud && onReadAloud ? (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="Leer publicación en voz alta"
              accessibilityHint="Reproduce el título y la descripción con síntesis de voz"
              onPress={() => onReadAloud(`${item.title}. ${item.description}`)}
              style={[styles.readAloudBtn, { borderColor: colors.primary }]}
            >
              <MaterialIcons name="volume-up" size={18} color={colors.primary} />
              <Text style={[styles.readAloudText, { fontFamily: fontBold, color: colors.primary, fontSize: descriptionSize }]}>
                Leer en voz alta
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: premium ? '#27272a' : colors.outlineVariant },
        ]}
      />

      <View style={styles.footer}>
        <Text
          style={[
            styles.confirmCount,
            {
              fontFamily: fontBold,
              color: premium ? '#6b7280' : colors.onSurfaceVariant,
            },
          ]}
        >
          ⏱️ {item.timeAgo} · {item.confirmations} verificaciones
        </Text>

        <View style={styles.footerActions}>
          {hasMapCoords && onViewOnMap ? (
            <Pressable
              accessibilityLabel={`Ver ${item.title} en el mapa`}
              accessibilityRole="button"
              onPress={() => onViewOnMap(item)}
              style={[
                styles.mapBtn,
                {
                  backgroundColor: premium ? '#18181b' : colors.surfaceContainerHigh,
                  borderColor: premium ? '#3f3f46' : colors.outlineVariant,
                },
              ]}
            >
              <MaterialIcons
                name="visibility"
                size={18}
                color={premium ? '#9ca3af' : colors.onSurfaceVariant}
              />
            </Pressable>
          ) : null}

          {isResolved ? (
            <View style={styles.resolvedRow}>
              <MaterialIcons name="thumb-up" size={18} color={colors.onSurfaceVariant} />
              <Text
                style={[styles.resolvedCount, { fontFamily: fontBold, color: colors.onSurfaceVariant }]}
              >
                {item.confirmations}
              </Text>
            </View>
          ) : (
            <Animated.View style={btnStyle}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: confirmedByMe }}
                onPress={handleConfirm}
                style={[
                  styles.confirmBtn,
                  confirmedByMe
                    ? { backgroundColor: colors.primary }
                    : premium
                      ? { backgroundColor: '#ffffff' }
                      : { backgroundColor: colors.primaryContainer },
                ]}
              >
                <MaterialIcons
                  name="thumb-up"
                  size={16}
                  color={
                    confirmedByMe
                      ? colors.onPrimary
                      : premium
                        ? '#000000'
                        : colors.onPrimaryContainer
                  }
                />
                <Text
                  style={[
                    styles.confirmText,
                    {
                      fontFamily: fontBold,
                      color: confirmedByMe
                        ? colors.onPrimary
                        : premium
                          ? '#000000'
                          : colors.onPrimaryContainer,
                    },
                  ]}
                >
                  {confirmedByMe ? 'Confirmado' : 'Confirmar'}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    gap: 12,
    position: 'relative',
    ...shadows.sm,
  },
  cardWithStatusBadge: {
    paddingTop: 36,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  statusBadgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  cardConfirmed: {
    borderWidth: 2,
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvedCount: {
    fontSize: 14,
  },
  cardTalkBack: {
    backgroundColor: '#111111',
    borderColor: '#ffffff44',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-end',
    maxWidth: '45%',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeReincidente: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderColor: 'rgba(245,158,11,0.25)',
  },
  badgeAi: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  badgeText: {
    fontSize: 9,
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usuario: {
    fontSize: 12,
  },
  zonaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  zonaText: {
    fontSize: 10,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmCount: {
    fontSize: 10,
    flex: 1,
  },
  mapBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  confirmText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textTalkBack: {
    color: '#ffffff',
  },
  subtitleTalkBack: {
    color: '#cccccc',
  },
  readAloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  readAloudText: {
    fontSize: 12,
  },
});
