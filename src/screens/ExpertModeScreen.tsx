import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { EXPERT_PREFS } from '../data/expertPrefs';
import { ENV_FILTERS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { useExpertPrefs } from '../hooks/useExpertPrefs';
import { spacing } from '../theme/colors';
import { radii, shadows } from '../theme/shadows';

type Props = {
  onClose: () => void;
};

const PRIMARY_FILTER_IDS = ['ramps', 'lighting', 'quiet'] as const;

const PREF_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  avoid_stairs: 'stairs',
  min_slope: 'terrain',
  wide_sidewalk: 'swap-horiz',
  proactive_alerts: 'notifications-active',
  crowd_avoid: 'groups',
};

export function ExpertModeScreen({ onClose }: Props) {
  const { talkBackEnabled } = useAccessibility();
  const { colors, fontBold, fontRegular } = useAppTheme();
  const { prefs, setPref, activeCount } = useExpertPrefs();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(PRIMARY_FILTER_IDS),
  );
  const [realtimeNotifications, setRealtimeNotifications] = useState(true);

  const gray = colors.onSurfaceVariant;
  const primaryFilters = useMemo(
    () => ENV_FILTERS.filter((filter) =>
      PRIMARY_FILTER_IDS.includes(filter.id as (typeof PRIMARY_FILTER_IDS)[number]),
    ),
    [],
  );

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: talkBackEnabled ? '#000000' : colors.surface },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.outlineVariant },
        ]}
      >
        <Pressable accessibilityLabel="Cerrar" onPress={onClose} style={styles.headerIconBtn}>
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
        <View style={styles.headerTrailing}>
          <Pressable style={styles.headerIconBtn} accessibilityLabel="Ayuda">
            <MaterialIcons name="help-outline" size={24} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.headerIconBtn} accessibilityLabel="Perfil">
            <MaterialIcons name="person-outline" size={24} color={colors.primary} />
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
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.heroTitle, { fontFamily: fontBold, color: colors.primary }]}>
            Detailed Planning
          </Text>
          <Text style={[styles.heroSubtitle, { fontFamily: fontRegular, color: gray }]}>
            Ajusta filtros y preferencias para rutas más precisas según tu movilidad.
          </Text>
          <View
            style={[
              styles.heroImage,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <MaterialIcons name="landscape" size={48} color={gray} />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.primary }]}>
          <View style={styles.infoRow}>
            <MaterialIcons name="info-outline" size={20} color="#ffffff" />
            <Text style={[styles.infoText, { fontFamily: fontRegular }]}>
              Las preferencias expertas influyen en la puntuación de accesibilidad y en el
              orden de las rutas sugeridas.
            </Text>
          </View>
          <View style={styles.activePill}>
            <Text style={[styles.activePillText, { fontFamily: fontBold }]}>
              Active filters: {activeCount}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {primaryFilters.map((filter) => {
            const active = activeFilters.has(filter.id);
            return (
              <Pressable
                key={filter.id}
                accessibilityRole="button"
                onPress={() => toggleFilter(filter.id)}
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
        </ScrollView>

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

        <View style={styles.prefsList}>
          {EXPERT_PREFS.map((pref) => {
            const checked = prefs[pref.id] ?? false;
            const iconName = PREF_ICONS[pref.id] ?? 'tune';
            return (
              <Pressable
                key={pref.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => setPref(pref.id, !checked)}
                style={[
                  styles.prefRow,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: talkBackEnabled
                      ? '#111111'
                      : colors.surfaceContainerLowest,
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    checked
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { borderColor: colors.outlineVariant },
                  ]}
                >
                  {checked ? (
                    <MaterialIcons name="check" size={22} color="#ffffff" />
                  ) : null}
                </View>
                <MaterialIcons
                  name={iconName}
                  size={22}
                  color={checked ? colors.primary : gray}
                />
                <Text
                  style={[
                    styles.prefLabel,
                    {
                      fontFamily: fontBold,
                      color: talkBackEnabled ? '#ffffff' : colors.onSurface,
                    },
                  ]}
                >
                  {pref.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.alertsCard,
            { borderColor: colors.outlineVariant },
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
              onValueChange={setRealtimeNotifications}
              thumbColor={realtimeNotifications ? colors.primary : '#f4f3f4'}
              trackColor={{
                false: colors.outlineVariant,
                true: colors.primaryContainer,
              }}
              value={realtimeNotifications}
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
          onPress={onClose}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="save" size={22} color="#ffffff" />
          <Text style={[styles.saveBtnText, { fontFamily: fontBold }]}>Guardar Preferencias</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeBtn}>
          <Text style={[styles.closeBtnText, { fontFamily: fontRegular, color: colors.primary }]}>
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
    paddingHorizontal: spacing.edge,
    paddingVertical: 14,
    borderBottomWidth: 1,
    ...shadows.sm,
  },
  headerIconBtn: {
    width: spacing.touchMin,
    height: spacing.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
  },
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 160,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  infoCard: {
    marginHorizontal: spacing.gutter,
    borderRadius: radii.md,
    padding: spacing.gutter,
    gap: 4,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
  },
  activePill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activePillText: {
    fontSize: 12,
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    marginHorizontal: spacing.gutter,
    marginTop: 4,
  },
  chipsRow: {
    paddingHorizontal: spacing.gutter,
    paddingVertical: 8,
    gap: 0,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.gutter,
    marginTop: 8,
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
  prefsList: {
    marginHorizontal: spacing.gutter,
    marginTop: 8,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.gutter,
    marginBottom: 8,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefLabel: {
    flex: 1,
    fontSize: 16,
  },
  alertsCard: {
    margin: spacing.gutter,
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
    gap: 4,
    ...shadows.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.md,
  },
  saveBtnText: {
    fontSize: 16,
    color: '#ffffff',
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
  },
});
