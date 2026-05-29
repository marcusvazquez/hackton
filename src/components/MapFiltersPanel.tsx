import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMapRouting } from '../context/MapRoutingContext';
import { ENV_FILTERS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';
import {
  DISABILITY_PROFILES,
  DISABILITY_PROFILE_LABELS,
  DisabilityProfile,
} from '../types/accessibility';

const PROFILE_ICONS: Record<DisabilityProfile, keyof typeof MaterialIcons.glyphMap> = {
  silla_ruedas: 'accessible',
  discapacidad_visual: 'visibility',
  discapacidad_auditiva: 'hearing-disabled',
  movilidad_reducida: 'directions-walk',
};

export function MapFiltersPanel() {
  const { colors, fontBold, fontRegular } = useAppTheme();
  const {
    disabilityProfile,
    setDisabilityProfile,
    envFilters,
    toggleEnvFilter,
  } = useMapRouting();
  const [expanded, setExpanded] = useState(false);

  const activeCount = useMemo(
    () => Object.values(envFilters).filter(Boolean).length,
    [envFilters],
  );

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        style={[styles.collapsed, { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant }]}
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros de mapa"
      >
        <MaterialIcons name="tune" size={20} color={colors.primary} />
        <Text style={[styles.collapsedText, { fontFamily: fontBold, color: colors.onSurface }]}>
          Filtros · {activeCount} activos · {DISABILITY_PROFILE_LABELS[disabilityProfile]}
        </Text>
        <MaterialIcons name="expand-less" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.panel, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
      <Pressable onPress={() => setExpanded(false)} style={styles.panelHeader}>
        <Text style={[styles.panelTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
          Filtros rápidos
        </Text>
        <MaterialIcons name="expand-more" size={24} color={colors.onSurfaceVariant} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {ENV_FILTERS.map((f) => {
          const on = envFilters[f.id] ?? false;
          return (
            <Pressable
              key={f.id}
              onPress={() => toggleEnvFilter(f.id)}
              style={[
                styles.chip,
                {
                  borderColor: on ? colors.primary : colors.outlineVariant,
                  backgroundColor: on ? colors.primaryFixed : colors.surfaceContainer,
                },
              ]}
            >
              <MaterialIcons name={f.icon} size={18} color={on ? colors.primary : colors.onSurfaceVariant} />
              <Text
                style={[
                  styles.chipText,
                  { fontFamily: fontRegular, color: on ? colors.onPrimaryFixed : colors.onSurfaceVariant },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionLabel, { fontFamily: fontBold, color: colors.onSurface }]}>
        Perfil de discapacidad
      </Text>
      <View style={styles.mobilityGrid}>
        {DISABILITY_PROFILES.map((profile) => {
          const on = disabilityProfile === profile;
          return (
            <Pressable
              key={profile}
              onPress={() => setDisabilityProfile(profile)}
              style={[
                styles.mobilityCell,
                {
                  borderColor: on ? colors.secondary : colors.outlineVariant,
                  backgroundColor: on ? colors.secondaryFixed : colors.surfaceContainer,
                },
              ]}
            >
              <MaterialIcons
                name={PROFILE_ICONS[profile]}
                size={22}
                color={on ? colors.secondary : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.mobilityLabel,
                  { fontFamily: fontRegular, color: on ? colors.onSecondaryFixed : colors.onSurfaceVariant },
                ]}
                numberOfLines={2}
              >
                {DISABILITY_PROFILE_LABELS[profile]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  collapsedText: { fontSize: 14, flex: 1 },
  panel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.gutter,
    maxHeight: 280,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelTitle: { fontSize: 16 },
  chipScroll: { marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13 },
  sectionLabel: { fontSize: 14, marginBottom: 8 },
  mobilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mobilityCell: {
    width: '47%',
    minWidth: 120,
    alignItems: 'center',
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
  },
  mobilityLabel: { fontSize: 11, textAlign: 'center' },
});
