import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMapRouting } from '../context/MapRoutingContext';
import { ENV_FILTERS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { hackathonNeonText, hackathonTypography } from '../theme/hackathonLayout';
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
  const { colors, fontBold, fontRegular, isHackathon, fontNav } = useAppTheme();
  const labelFont = isHackathon ? fontNav : fontBold;
  const bodyFont = isHackathon ? fontNav : fontRegular;
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
        style={[
          styles.collapsed,
          {
            backgroundColor: colors.surfaceContainer,
            borderColor: colors.outlineVariant,
            paddingHorizontal: isHackathon ? 10 : 14,
            paddingVertical: isHackathon ? 8 : 10,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros de mapa"
      >
        <MaterialIcons name="tune" size={20} color={colors.primary} />
        <Text
          style={[
            styles.collapsedText,
            {
              fontFamily: labelFont,
              color: colors.onSurface,
              fontSize: isHackathon ? hackathonTypography.bodySm : 14,
            },
          ]}
          numberOfLines={1}
        >
          {isHackathon
            ? `Filtros (${activeCount}) · ${DISABILITY_PROFILE_LABELS[disabilityProfile]}`
            : `Filtros · ${activeCount} activos · ${DISABILITY_PROFILE_LABELS[disabilityProfile]}`}
        </Text>
        <MaterialIcons name="expand-less" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.panel, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
      <Pressable onPress={() => setExpanded(false)} style={styles.panelHeader}>
        <Text
          style={[
            styles.panelTitle,
            {
              fontFamily: labelFont,
              color: colors.onSurface,
              fontSize: isHackathon ? hackathonTypography.body : undefined,
            },
          ]}
        >
          Filtros rápidos
        </Text>
        <MaterialIcons name="expand-more" size={24} color={colors.onSurfaceVariant} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {ENV_FILTERS.map((f) => {
          const on = envFilters[f.id] ?? false;
          const accent = 'accent' in f ? f.accent : colors.primary;
          const neon = isHackathon;
          return (
            <Pressable
              key={f.id}
              onPress={() => toggleEnvFilter(f.id)}
              style={[
                styles.chip,
                neon && styles.chipNeon,
                neon
                  ? {
                      borderColor: on ? accent : colors.outlineVariant,
                      backgroundColor: on ? `${accent}18` : colors.surfaceContainer,
                      ...(on
                        ? {
                            shadowColor: accent,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.45,
                            shadowRadius: 8,
                            elevation: 6,
                          }
                        : {}),
                    }
                  : {
                      borderColor: on ? colors.primary : colors.outlineVariant,
                      backgroundColor: on ? colors.primaryFixed : colors.surfaceContainer,
                    },
              ]}
            >
              <MaterialIcons
                name={f.icon}
                size={18}
                color={neon ? (on ? accent : colors.onSurfaceVariant) : on ? colors.primary : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.chipText,
                  {
                    fontFamily: bodyFont,
                    fontSize: isHackathon ? hackathonTypography.bodySm : undefined,
                  },
                  neon && !on && { color: colors.onSurfaceVariant },
                  neon && on && hackathonNeonText(accent),
                  !neon && {
                    color: on ? colors.onPrimaryFixed : colors.onSurfaceVariant,
                  },
                ]}
                numberOfLines={1}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text
        style={[
          styles.sectionLabel,
          {
            fontFamily: labelFont,
            color: colors.onSurface,
            fontSize: isHackathon ? hackathonTypography.bodySm : undefined,
          },
        ]}
      >
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
                  {
                    fontFamily: bodyFont,
                    color: on ? colors.onSecondaryFixed : colors.onSurfaceVariant,
                    fontSize: isHackathon ? hackathonTypography.bodyXs : undefined,
                  },
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
  chipNeon: {
    borderWidth: 2,
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
