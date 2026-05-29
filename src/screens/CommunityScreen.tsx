import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedCard } from '../components/FeedCard';
import { NetStatusBanner } from '../components/NetStatusBanner';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOfflineContext } from '../context/OfflineContext';
import { FEED_ITEMS } from '../data/community';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';

type Props = {
  onGoToReport?: () => void;
};

export function CommunityScreen({ onGoToReport }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const { isOnline } = useNetworkStatus();
  const { syncQueue } = useOfflineContext();
  const offlineCount = FEED_ITEMS.filter((i) => i.offline).length;
  const pendingSync = syncQueue.filter((item) => item.status === 'pending').length;

  return (
    <View
      style={[
        styles.wrapper,
        talkBackEnabled ? styles.containerTalkBack : { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.container}
      >
        <NetStatusBanner />

        {!isOnline ? (
          <View
            style={[
              styles.offlineNotice,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
          >
            <Text
              style={[
                styles.offlineNoticeText,
                {
                  fontFamily: fontRegular,
                  color: colors.onSurfaceVariant,
                },
              ]}
            >
              Algunas funciones están limitadas. Esta sección se actualizará al recuperar la
              conexión.
            </Text>
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <Text
            style={[
              styles.communityTitle,
              {
                fontFamily: fontBold,
                color: talkBackEnabled ? '#ffffff' : colors.onSurface,
              },
            ]}
          >
            Actividad Comunitaria
          </Text>
          <Pressable accessibilityRole="button" style={styles.filterBtn}>
            <MaterialIcons name="tune" size={20} color={colors.primary} />
            <Text style={[styles.filterText, { fontFamily: fontRegular, color: colors.primary }]}>
              Filtrar
            </Text>
          </Pressable>
        </View>

        {isHackathon && (offlineCount > 0 || pendingSync > 0) ? (
          <View
            style={[
              styles.offlineBadge,
              { borderColor: colors.secondary, backgroundColor: colors.secondaryFixed },
            ]}
          >
            <Text style={[styles.offlineText, { fontFamily: fontBold, color: colors.secondary }]}>
              SYS.OFFLINE
            </Text>
            <Text
              style={[
                styles.offlineSub,
                { fontFamily: fontRegular, color: colors.onSecondaryFixed },
              ]}
            >
              {pendingSync || offlineCount} en cola
            </Text>
          </View>
        ) : null}

        {isHackathon ? (
          <View style={[styles.statsRow, { borderColor: colors.outlineVariant }]}>
            <View style={styles.stat}>
              <MaterialIcons name="groups" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { fontFamily: fontBold, color: colors.onSurface }]}>
                {FEED_ITEMS.length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { fontFamily: fontRegular, color: colors.onSurfaceVariant },
                ]}
              >
                activos
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
            <View style={styles.stat}>
              <MaterialIcons name="verified" size={20} color={colors.safeGreen} />
              <Text style={[styles.statValue, { fontFamily: fontBold, color: colors.onSurface }]}>
                {FEED_ITEMS.filter((i) => i.type === 'safe').length}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { fontFamily: fontRegular, color: colors.onSurfaceVariant },
                ]}
              >
                verificados
              </Text>
            </View>
          </View>
        ) : null}

        {FEED_ITEMS.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}

        {Platform.OS === 'web' && <View style={{ height: 80 }} />}
      </ScrollView>

      <Pressable
        accessibilityLabel="Reportar con foto"
        onPress={() => onGoToReport?.()}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <MaterialIcons name="add-a-photo" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  containerTalkBack: {
    backgroundColor: '#000000',
  },
  content: {
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
  },
  offlineNotice: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
    marginTop: spacing.gutter,
  },
  offlineNoticeText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.gutter,
    marginBottom: spacing.gutter,
    gap: 12,
  },
  communityTitle: {
    fontSize: 18,
    flex: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterText: {
    fontSize: 14,
  },
  offlineBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: spacing.gutter,
  },
  offlineText: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
  offlineSub: {
    fontSize: 10,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
