import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FeedCard } from '../components/FeedCard';
import { SectionHeader } from '../components/SectionHeader';
import { useAccessibility } from '../context/AccessibilityContext';
import { FEED_ITEMS } from '../data/community';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii } from '../theme/shadows';

export function CommunityScreen() {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const offlineCount = FEED_ITEMS.filter((i) => i.offline).length;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[
        styles.container,
        talkBackEnabled ? styles.containerTalkBack : { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.headerRow}>
        <SectionHeader
          title="Reportes en vivo"
          subtitle="Confirmaciones de la comunidad en Tijuana"
        />
        {isHackathon && offlineCount > 0 ? (
          <View style={[styles.offlineBadge, { borderColor: colors.secondary, backgroundColor: colors.secondaryFixed }]}>
            <Text style={[styles.offlineText, { fontFamily: fontBold, color: colors.secondary }]}>
              SYS.OFFLINE
            </Text>
            <Text style={[styles.offlineSub, { fontFamily: fontRegular, color: colors.onSecondaryFixed }]}>
              {offlineCount} en cola
            </Text>
          </View>
        ) : null}
      </View>

      {isHackathon ? (
        <View style={[styles.statsRow, { borderColor: colors.outlineVariant }]}>
          <View style={styles.stat}>
            <MaterialIcons name="groups" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { fontFamily: fontBold, color: colors.onSurface }]}>
              {FEED_ITEMS.length}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
              activos
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
          <View style={styles.stat}>
            <MaterialIcons name="verified" size={20} color={colors.safeGreen} />
            <Text style={[styles.statValue, { fontFamily: fontBold, color: colors.onSurface }]}>
              {FEED_ITEMS.filter((i) => i.type === 'safe').length}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
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
  );
}

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  offlineBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
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
    marginTop: -8,
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
});
