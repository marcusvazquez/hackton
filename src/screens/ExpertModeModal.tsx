import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { EXPERT_PREFS, ExpertPref } from '../data/expertPrefs';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

const MODAL_STORAGE_KEY = '@ruta_libre/expert_mode_modal';
const EXPERT_PREFS_KEY = '@ruta_libre/expert_prefs';

const HERO_IMAGE_URI =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80';

const PRIMARY_FILTERS = [
  { id: 'shade', label: 'Sombreado', icon: 'wb-sunny' as const },
  { id: 'green', label: 'Zonas Verdes', icon: 'eco' as const },
  { id: 'lighting', label: 'Iluminación', icon: 'bedtime' as const },
] as const;

type PrimaryFilterId = (typeof PRIMARY_FILTERS)[number]['id'];

type AccessibilityDetailId =
  | 'avoid_stairs'
  | 'min_slope'
  | 'wide_sidewalk'
  | 'crowd_avoid';

const ACCESSIBILITY_DETAILS: {
  id: AccessibilityDetailId;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  pref: ExpertPref;
}[] = [
  {
    id: 'avoid_stairs',
    label: 'Sin escaleras',
    icon: 'layers',
    pref: EXPERT_PREFS.find((p) => p.id === 'avoid_stairs')!,
  },
  {
    id: 'min_slope',
    label: 'Pavimento táctil',
    icon: 'texture',
    pref: EXPERT_PREFS.find((p) => p.id === 'min_slope')!,
  },
  {
    id: 'crowd_avoid',
    label: 'Cruces sonoros',
    icon: 'hearing',
    pref: EXPERT_PREFS.find((p) => p.id === 'crowd_avoid')!,
  },
  {
    id: 'wide_sidewalk',
    label: 'Ancho de acera',
    icon: 'view-column',
    pref: EXPERT_PREFS.find((p) => p.id === 'wide_sidewalk')!,
  },
];

export type ExpertModeModalState = {
  primaryFilters: Record<PrimaryFilterId, boolean>;
  accessibilityDetails: Record<AccessibilityDetailId, boolean>;
  proactiveAlerts: boolean;
};

type Props = {
  onClose: () => void;
};

function buildDefaultPrimaryFilters(): Record<PrimaryFilterId, boolean> {
  return {
    shade: true,
    green: true,
    lighting: true,
  };
}

function buildDefaultAccessibilityDetails(): Record<AccessibilityDetailId, boolean> {
  return {
    avoid_stairs: EXPERT_PREFS.find((p) => p.id === 'avoid_stairs')?.defaultOn ?? true,
    min_slope: EXPERT_PREFS.find((p) => p.id === 'min_slope')?.defaultOn ?? true,
    wide_sidewalk: EXPERT_PREFS.find((p) => p.id === 'wide_sidewalk')?.defaultOn ?? false,
    crowd_avoid: EXPERT_PREFS.find((p) => p.id === 'crowd_avoid')?.defaultOn ?? false,
  };
}

function buildDefaultState(): ExpertModeModalState {
  return {
    primaryFilters: buildDefaultPrimaryFilters(),
    accessibilityDetails: buildDefaultAccessibilityDetails(),
    proactiveAlerts:
      EXPERT_PREFS.find((p) => p.id === 'proactive_alerts')?.defaultOn ?? true,
  };
}

async function persistExpertPrefs(state: ExpertModeModalState): Promise<void> {
  const expertRecord = Object.fromEntries(
    EXPERT_PREFS.map((pref) => {
      const detailValue = state.accessibilityDetails[pref.id as AccessibilityDetailId];
      if (pref.id === 'proactive_alerts') {
        return [pref.id, state.proactiveAlerts];
      }
      if (detailValue !== undefined) {
        return [pref.id, detailValue];
      }
      return [pref.id, pref.defaultOn];
    }),
  );
  await AsyncStorage.multiSet([
    [MODAL_STORAGE_KEY, JSON.stringify(state)],
    [EXPERT_PREFS_KEY, JSON.stringify(expertRecord)],
  ]);
}

export function ExpertModeModal({ onClose }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular } = useAppTheme();
  const [draft, setDraft] = useState<ExpertModeModalState>(buildDefaultState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const gray = colors.onSurfaceVariant;

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const [modalRaw, prefsRaw] = await Promise.all([
          AsyncStorage.getItem(MODAL_STORAGE_KEY),
          AsyncStorage.getItem(EXPERT_PREFS_KEY),
        ]);
        if (!mounted) return;

        const defaults = buildDefaultState();
        if (modalRaw) {
          const parsed = JSON.parse(modalRaw) as Partial<ExpertModeModalState>;
          setDraft({
            primaryFilters: {
              ...defaults.primaryFilters,
              ...parsed.primaryFilters,
            },
            accessibilityDetails: {
              ...defaults.accessibilityDetails,
              ...parsed.accessibilityDetails,
            },
            proactiveAlerts: parsed.proactiveAlerts ?? defaults.proactiveAlerts,
          });
        } else if (prefsRaw) {
          const prefs = JSON.parse(prefsRaw) as Record<string, boolean>;
          setDraft({
            ...defaults,
            accessibilityDetails: {
              avoid_stairs: prefs.avoid_stairs ?? defaults.accessibilityDetails.avoid_stairs,
              min_slope: prefs.min_slope ?? defaults.accessibilityDetails.min_slope,
              wide_sidewalk: prefs.wide_sidewalk ?? defaults.accessibilityDetails.wide_sidewalk,
              crowd_avoid: prefs.crowd_avoid ?? defaults.accessibilityDetails.crowd_avoid,
            },
            proactiveAlerts: prefs.proactive_alerts ?? defaults.proactiveAlerts,
          });
        } else {
          setDraft(defaults);
        }
      } catch {
        if (mounted) setDraft(buildDefaultState());
      } finally {
        if (mounted) setIsHydrated(true);
      }
    };

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const activeFilterCount = useMemo(() => {
    const primaryActive = Object.values(draft.primaryFilters).filter(Boolean).length;
    const detailActive = Object.values(draft.accessibilityDetails).filter(Boolean).length;
    const alertsActive = draft.proactiveAlerts ? 1 : 0;
    return primaryActive + detailActive + alertsActive;
  }, [draft]);

  const togglePrimaryFilter = (id: PrimaryFilterId) => {
    setDraft((prev) => ({
      ...prev,
      primaryFilters: {
        ...prev.primaryFilters,
        [id]: !prev.primaryFilters[id],
      },
    }));
  };

  const toggleAccessibilityDetail = (id: AccessibilityDetailId) => {
    setDraft((prev) => ({
      ...prev,
      accessibilityDetails: {
        ...prev.accessibilityDetails,
        [id]: !prev.accessibilityDetails[id],
      },
    }));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await persistExpertPrefs(draft);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [draft, onClose]);

  if (!isHydrated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]} />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: talkBackEnabled ? '#000000' : colors.surface },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.outlineVariant }]}>
        <Pressable accessibilityLabel="Cerrar sin guardar" onPress={onClose} style={styles.headerSide}>
          <MaterialIcons name="close" size={24} color={colors.primary} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
          ]}
        >
          Expert Mode
        </Text>
        <View style={styles.headerSide}>
          <Pressable accessibilityLabel="Ayuda" style={styles.headerIconBtn}>
            <MaterialIcons name="help-outline" size={24} color={colors.primary} />
          </Pressable>
          <Pressable accessibilityLabel="Perfil" style={styles.headerIconBtn}>
            <MaterialIcons name="account-circle" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.heroTitle, { fontFamily: fontBold, color: colors.primary }]}>
            Detailed Planning
          </Text>
          <Text style={[styles.heroSubtitle, { fontFamily: fontRegular, color: gray }]}>
            Fine-tune route scoring with environmental and accessibility constraints for Tijuana.
          </Text>
          <Image
            source={{ uri: HERO_IMAGE_URI }}
            style={styles.heroImage}
            contentFit="cover"
            accessibilityLabel="City accessibility planning map"
          />
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.infoText, { fontFamily: fontRegular }]}>
            Expert preferences influence accessibility scores and the order of suggested routes
            across the Planear tab.
          </Text>
          <View style={styles.activePill}>
            <Text style={[styles.activePillText, { fontFamily: fontBold }]}>
              Active filters: {activeFilterCount}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
          ]}
        >
          Primary Filters
        </Text>
        <View style={styles.chipsWrap}>
          {PRIMARY_FILTERS.map((filter) => {
            const active = draft.primaryFilters[filter.id];
            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => togglePrimaryFilter(filter.id)}
                style={[
                  styles.chip,
                  active
                    ? {
                        borderColor: colors.primary,
                        backgroundColor: colors.primaryFixed,
                      }
                    : {
                        borderColor: colors.outlineVariant,
                        backgroundColor: colors.surfaceContainerLowest,
                      },
                ]}
              >
                <MaterialIcons
                  name={filter.icon}
                  size={18}
                  color={active ? colors.primary : gray}
                />
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      fontFamily: fontRegular,
                      color: active ? colors.primary : gray,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitleInline,
              { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
            ]}
          >
            Detalles de Accesibilidad
          </Text>
          <Text style={[styles.expertBadge, { fontFamily: fontBold, color: colors.secondary }]}>
            EXPERT SETTINGS
          </Text>
        </View>

        <View
          style={[
            styles.detailsList,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {ACCESSIBILITY_DETAILS.map((item, index) => {
            const checked = draft.accessibilityDetails[item.id];
            const isLast = index === ACCESSIBILITY_DETAILS.length - 1;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => toggleAccessibilityDetail(item.id)}
                style={[
                  styles.detailRow,
                  !isLast && {
                    borderBottomColor: colors.outlineVariant,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <MaterialIcons
                  name={checked ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={colors.primary}
                />
                <MaterialIcons
                  name={item.icon}
                  size={22}
                  color={checked ? colors.primary : gray}
                />
                <Text
                  style={[
                    styles.detailLabel,
                    {
                      fontFamily: fontRegular,
                      color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.alertsCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.alertsTitle, { fontFamily: fontBold, color: colors.primary }]}>
            Alertas Proactivas
          </Text>
          <Text style={[styles.alertsDesc, { fontFamily: fontRegular, color: gray }]}>
            Recibe avisos antes de llegar a barreras conocidas en tu ruta planificada.
          </Text>
          <View style={styles.alertsSwitchRow}>
            <Text
              style={[
                styles.alertsSwitchLabel,
                {
                  fontFamily: fontBold,
                  color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                },
              ]}
            >
              Notificaciones en tiempo real
            </Text>
            <Switch
              accessibilityLabel="Notificaciones en tiempo real"
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, proactiveAlerts: value }))
              }
              thumbColor={draft.proactiveAlerts ? colors.primary : '#f4f3f4'}
              trackColor={{
                false: colors.outlineVariant,
                true: colors.primaryContainer,
              }}
              value={draft.proactiveAlerts}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.outlineVariant, backgroundColor: colors.surface },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
        >
          <MaterialIcons name="save" size={22} color="#ffffff" />
          <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}>Guardar Preferencias</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={[styles.closeBtn, { borderColor: colors.outlineVariant }]}
        >
          <Text
            style={[
              styles.closeBtnText,
              { fontFamily: fontBold, color: talkBackEnabled ? '#ffffff' : colors.onSurface },
            ]}
          >
            Cerrar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.edge,
    paddingVertical: 14,
    borderBottomWidth: 1,
    ...shadows.sm,
  },
  headerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 88,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.gutter,
  },
  heroCard: {
    margin: spacing.gutter,
    padding: spacing.edge,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 8,
    ...shadows.sm,
  },
  heroTitle: {
    fontSize: 22,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.sm,
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: spacing.gutter,
    borderRadius: radii.md,
    padding: spacing.gutter,
    gap: 8,
    ...shadows.md,
  },
  infoText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
  },
  activePill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  activePillText: {
    fontSize: 12,
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    marginHorizontal: spacing.gutter,
    marginTop: 4,
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.gutter,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.gutter,
    marginBottom: 8,
    gap: 8,
  },
  sectionTitleInline: {
    fontSize: 18,
    flex: 1,
  },
  expertBadge: {
    fontSize: 11,
    letterSpacing: 1,
  },
  detailsList: {
    marginHorizontal: spacing.gutter,
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.gutter,
    ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.gutter,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
  },
  alertsCard: {
    marginHorizontal: spacing.gutter,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    padding: spacing.gutter,
    gap: 8,
  },
  alertsTitle: {
    fontSize: 18,
  },
  alertsDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertsSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  alertsSwitchLabel: {
    flex: 1,
    fontSize: 15,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.edge,
    paddingVertical: spacing.gutter,
    gap: 10,
    ...shadows.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.sm,
  },
  saveBtnText: {
    fontSize: 16,
    color: '#ffffff',
  },
  closeBtn: {
    height: 48,
    borderWidth: 1,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
  },
});
