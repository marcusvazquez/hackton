import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FeedCard } from '../components/FeedCard';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  CategoryTab,
  COMMUNITY_CATEGORY_TABS,
  COMMUNITY_ZONES,
  FEED_ITEMS,
  FeedItem,
  filterFeedByCategory,
  filterFeedByZone,
  INITIAL_USER_POINTS,
  POINTS_PER_CONFIRM,
} from '../data/community';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { speakMessage } from '../utils/playGeneratedAudio';
import { spacing } from '../theme/colors';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

type FilterZone = (typeof COMMUNITY_ZONES)[number];

type Props = {
  onGoToReport?: () => void;
  onViewOnMap?: (item: FeedItem) => void;
};

export function CommunityScreen({ onGoToReport, onViewOnMap }: Props) {
  const { talkBackEnabled, speak, personType } = useAccessibility();
  const adaptive = useAdaptiveUI();
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const { isOnline } = useNetworkStatus();

  const [activeCategory, setActiveCategory] = useState<CategoryTab>('todos');
  const [filtroZona, setFiltroZona] = useState<FilterZone>('Todos');
  const [usuarioPuntos, setUsuarioPuntos] = useState(INITIAL_USER_POINTS);
  const [reportes, setReportes] = useState<FeedItem[]>(FEED_ITEMS);
  const [confirmados, setConfirmados] = useState<Record<string, boolean>>({});

  const reportesFiltrados = useMemo(() => {
    const byCategory = filterFeedByCategory(reportes, activeCategory);
    return filterFeedByZone(byCategory, filtroZona);
  }, [reportes, activeCategory, filtroZona]);

  const handleConfirmar = useCallback(
    (id: string) => {
      const yaConfirmado = confirmados[id] ?? false;

      setReportes((prev) =>
        prev.map((rep) =>
          rep.id === id
            ? {
                ...rep,
                confirmations: yaConfirmado
                  ? rep.confirmations - 1
                  : rep.confirmations + 1,
              }
            : rep,
        ),
      );

      setConfirmados((prev) => ({ ...prev, [id]: !yaConfirmado }));
      setUsuarioPuntos((prev) =>
        yaConfirmado ? prev - POINTS_PER_CONFIRM : prev + POINTS_PER_CONFIRM,
      );
    },
    [confirmados],
  );

  const premium = isHackathon;
  const isVisual = personType === 'visual';
  const isCognitiva = personType === 'cognitiva';

  const handleReadAloud = useCallback((text: string) => {
    void speakMessage(text);
  }, []);

  return (
    <View
      style={[
        styles.container,
        talkBackEnabled
          ? styles.containerTalkBack
          : premium
            ? styles.containerPremium
            : { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.listScroll}
        stickyHeaderIndices={premium ? undefined : [0]}
      >
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
                { fontFamily: fontRegular, color: colors.onSurfaceVariant },
              ]}
            >
              Algunas funciones están limitadas. Esta sección se actualizará al recuperar la
              conexión.
            </Text>
          </View>
        ) : null}

        {!premium ? (
          <View
            style={[
              styles.topHeader,
              shadows.sm,
              talkBackEnabled
                ? styles.headerTalkBack
                : { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant },
            ]}
          >
            <View style={styles.headerTitleRow}>
              <View style={[styles.liveDot, { backgroundColor: colors.safeGreen }]} />
              <Text style={[styles.headerTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
                Reportes de Comunidad
              </Text>
            </View>
          </View>
        ) : null}

        {premium ? (
          <View style={styles.auditPanel}>
            <View style={styles.auditHeader}>
              <MaterialIcons name="auto-awesome" size={16} color="#fbbf24" />
              <Text style={[styles.auditLabel, { fontFamily: fontBold }]}>
                Auditoría Ciudadana Digital
              </Text>
            </View>
            <Text style={[styles.auditTitle, { fontFamily: fontBold }]}>
              Validación Colectiva
            </Text>
            <Text style={[styles.auditDesc, { fontFamily: fontRegular }]}>
              Confirma los reportes activos de otros usuarios para actualizar el mapa interactivo
              de Tijuana en tiempo real.
            </Text>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filtersRow,
            premium
              ? styles.filtersRowPremium
              : { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant },
          ]}
          style={styles.filtersScroll}
        >
          {COMMUNITY_CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setActiveCategory(tab.id)}
                style={[
                  styles.filterChip,
                  premium
                    ? active
                      ? styles.filterChipPremiumActive
                      : styles.filterChipPremium
                    : active
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : {
                          backgroundColor: colors.surfaceContainerHigh,
                          borderColor: colors.outlineVariant,
                        },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      fontFamily: fontBold,
                      color: premium
                        ? active
                          ? '#000000'
                          : '#9ca3af'
                        : active
                          ? colors.onPrimary
                          : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filtersRow,
            premium ? styles.filtersRowPremium : { paddingTop: 0 },
          ]}
          style={styles.filtersScroll}
        >
          {COMMUNITY_ZONES.map((zona) => {
            const active = filtroZona === zona;
            return (
              <Pressable
                key={zona}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFiltroZona(zona)}
                style={[
                  styles.filterChip,
                  styles.zoneChip,
                  premium
                    ? active
                      ? styles.filterChipPremiumActive
                      : styles.filterChipPremium
                    : active
                      ? { backgroundColor: colors.secondary, borderColor: colors.secondary }
                      : {
                          backgroundColor: colors.surfaceContainerHigh,
                          borderColor: colors.outlineVariant,
                        },
                ]}
              >
                <MaterialIcons
                  name={zona === 'Todos' ? 'public' : 'place'}
                  size={13}
                  color={
                    premium
                      ? active
                        ? '#000000'
                        : '#9ca3af'
                      : active
                        ? colors.onSecondary
                        : colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.filterText,
                    {
                      fontFamily: fontBold,
                      color: premium
                        ? active
                          ? '#000000'
                          : '#9ca3af'
                        : active
                          ? colors.onSecondary
                          : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {zona === 'Todos' ? 'Todas las zonas' : zona}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {reportesFiltrados.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            premium={premium}
            confirmedByMe={confirmados[item.id] ?? false}
            onToggleConfirm={handleConfirmar}
            onViewOnMap={onViewOnMap}
            simplified={isCognitiva || adaptive.simplifiedUI}
            fontSize={adaptive.fontSize}
            showReadAloud={isVisual}
            onReadAloud={handleReadAloud}
          />
        ))}

        {reportesFiltrados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text
              style={[
                styles.emptyText,
                {
                  fontFamily: fontRegular,
                  color: premium ? '#9ca3af' : colors.onSurfaceVariant,
                },
              ]}
            >
              No hay reportes activos en esta categoría o zona.
            </Text>
          </View>
        ) : null}

        {Platform.OS === 'web' ? <View style={{ height: 80 }} /> : null}
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
  container: {
    flex: 1,
  },
  containerTalkBack: {
    backgroundColor: '#000000',
  },
  containerPremium: {
    backgroundColor: '#000000',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.edge,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 0,
  },
  headerTalkBack: {
    backgroundColor: '#111111',
    borderBottomColor: '#333333',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 18,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  pointsText: {
    fontSize: 12,
  },
  auditPanel: {
    marginBottom: spacing.gutter,
    padding: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(30,58,138,0.4)',
    backgroundColor: '#0f172a',
    ...shadows.md,
  },
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditLabel: {
    fontSize: 10,
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  auditTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 6,
  },
  auditDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 18,
  },
  auditPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  auditPoints: {
    fontSize: 13,
    color: '#fbbf24',
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.edge,
    paddingVertical: 10,
    marginBottom: 4,
  },
  filtersRowPremium: {
    paddingTop: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  filterChipPremium: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
  },
  filterChipPremiumActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 11,
  },
  listScroll: {
    flex: 1,
  },
  content: {
    padding: spacing.edge,
    paddingBottom: SCROLL_BOTTOM_INSET,
    gap: 16,
  },
  offlineNotice: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.gutter,
    marginBottom: spacing.gutter,
  },
  offlineNoticeText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Above nav
    left: 16, // Moved to left to avoid AI FAB
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
