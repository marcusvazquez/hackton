import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ENV_FILTERS, MOBILITY_SUPPORT } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';

export function MapFiltersPanel() {
  const { colors, fontBold, fontRegular } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['ramps']));
  const [mobility, setMobility] = useState('wheelchair');

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
          Filtros · {activeFilters.size} activos
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
          const on = activeFilters.has(f.id);
          return (
            <Pressable
              key={f.id}
              onPress={() => toggleFilter(f.id)}
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
        Apoyo de movilidad
      </Text>
      <View style={styles.mobilityGrid}>
        {MOBILITY_SUPPORT.map((m) => {
          const on = mobility === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMobility(m.id)}
              style={[
                styles.mobilityCell,
                {
                  borderColor: on ? colors.secondary : colors.outlineVariant,
                  backgroundColor: on ? colors.secondaryFixed : colors.surfaceContainer,
                },
              ]}
            >
              <MaterialIcons name={m.icon} size={22} color={on ? colors.secondary : colors.onSurfaceVariant} />
              <Text
                style={[
                  styles.mobilityLabel,
                  { fontFamily: fontRegular, color: on ? colors.onSecondaryFixed : colors.onSurfaceVariant },
                ]}
                numberOfLines={2}
              >
                {m.label}
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
    width: '30%',
    minWidth: 96,
    alignItems: 'center',
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
  },
  mobilityLabel: { fontSize: 11, textAlign: 'center' },
});
