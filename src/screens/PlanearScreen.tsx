import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteOptionCard } from '../components/RouteOptionCard';
import { ENV_FILTERS, MOBILITY_SUPPORT, ROUTE_OPTIONS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

const EXPLORE_MAP_URI =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80';

type Props = {
  onOpenDetail?: () => void;
  onOpenExpert?: () => void;
};

type EnvFilterMeta = {
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  accent: string;
};

const ENV_FILTER_META: Partial<Record<string, EnvFilterMeta>> = {
  lighting: {
    title: 'Falta de luminarias',
    subtitle: 'Evitar tramos sin alumbrado público adecuado',
    icon: 'lightbulb',
    accent: '#f97316',
  },
  quiet: {
    title: 'Zona inundable',
    subtitle: 'Desvío ante riesgo de encharcamiento o lluvia',
    icon: 'waves',
    accent: '#0369a1',
  },
};

const MOBILITY_ACCENT: Partial<Record<string, string>> = {
  wheelchair: undefined,
  cane: '#924c00',
};

function getEnvMeta(filterId: string, label: string, icon: string): EnvFilterMeta {
  const custom = ENV_FILTER_META[filterId];
  if (custom) return custom;
  return {
    title: label,
    subtitle: 'Preferencia ambiental para planificación de ruta',
    icon: icon as keyof typeof MaterialIcons.glyphMap,
    accent: '#003f87',
  };
}

export function PlanearScreen({ onOpenDetail, onOpenExpert }: Props) {
  const { colors, fontBold, fontRegular, spacing } = useAppTheme();
  const [destination, setDestination] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState('accessible');
  const [envFilters, setEnvFilters] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ENV_FILTERS.map((filter) => [filter.id, false])),
  );
  const [mobilityId, setMobilityId] = useState<string>(MOBILITY_SUPPORT[0]?.id ?? 'wheelchair');

  const gray = colors.onSurfaceVariant;

  const toggleEnvFilter = (id: string, value: boolean) => {
    setEnvFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleSearch = () => {
    if (destination.trim().length > 0) {
      setShowResults(true);
    }
  };

  const mobilityPrimary = useMemo(
    () => MOBILITY_SUPPORT.filter((item) => item.id === 'wheelchair' || item.id === 'cane'),
    [],
  );

  const mobilitySecondary = useMemo(
    () => MOBILITY_SUPPORT.filter((item) => item.id !== 'wheelchair' && item.id !== 'cane'),
    [],
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: spacing.edge, paddingBottom: SCROLL_BOTTOM_INSET }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
              paddingHorizontal: spacing.gutter,
            },
          ]}
        >
          <MaterialIcons name="search" size={22} color={colors.primary} />
          <TextInput
            value={destination}
            onChangeText={setDestination}
            onSubmitEditing={handleSearch}
            placeholder="¿A dónde vas?"
            placeholderTextColor={gray}
            returnKeyType="search"
            style={[styles.searchInput, { fontFamily: fontRegular, color: colors.onSurface }]}
          />
        </View>

        <View style={styles.sectionHeader}>
          <MaterialIcons name="filter-list" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, { fontFamily: fontBold, color: colors.primary }]}>
            Filtros Ambientales
          </Text>
        </View>

        <View
          style={[
            styles.block,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          {ENV_FILTERS.map((filter) => {
            const meta = getEnvMeta(filter.id, filter.label, filter.icon);
            return (
              <View
                key={filter.id}
                style={[styles.filterRow, { borderBottomColor: colors.outlineVariant }]}
              >
                <View style={[styles.filterIconBox, { backgroundColor: meta.accent }]}>
                  <MaterialIcons name={meta.icon} size={24} color="#ffffff" />
                </View>
                <View style={styles.filterTextWrap}>
                  <Text style={[styles.filterTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
                    {meta.title}
                  </Text>
                  <Text style={[styles.filterSubtitle, { fontFamily: fontRegular, color: gray }]}>
                    {meta.subtitle}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={meta.title}
                  onValueChange={(value) => toggleEnvFilter(filter.id, value)}
                  thumbColor={envFilters[filter.id] ? colors.primary : '#f4f3f4'}
                  trackColor={{
                    false: colors.outlineVariant,
                    true: colors.primaryContainer,
                  }}
                  value={envFilters[filter.id] ?? false}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <MaterialIcons name="accessible" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, { fontFamily: fontBold, color: colors.onSurface }]}>
            Soporte de Movilidad
          </Text>
        </View>

        <View
          style={[
            styles.block,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={[styles.mobilityRow, { gap: spacing.gutter }]}>
            {mobilityPrimary.map((item) => {
              const selected = mobilityId === item.id;
              const bg =
                selected
                  ? item.id === 'cane'
                    ? (MOBILITY_ACCENT.cane ?? colors.secondary)
                    : colors.primary
                  : colors.surfaceContainerHigh;
              const label =
                item.id === 'wheelchair' ? 'SILLA DE RUEDAS' : 'BASTÓN';
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setMobilityId(item.id)}
                  style={[
                    styles.mobilityTile,
                    { backgroundColor: bg, borderColor: selected ? bg : colors.outlineVariant },
                    selected && shadows.sm,
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={36}
                    color={selected ? '#ffffff' : colors.onSurfaceVariant}
                  />
                  <Text
                    style={[
                      styles.mobilityTileLabel,
                      {
                        fontFamily: fontBold,
                        color: selected ? '#ffffff' : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mobilitySecondary.length > 0 ? (
            <View style={[styles.mobilitySecondaryRow, { gap: spacing.gutter }]}>
              {mobilitySecondary.map((item) => {
                const selected = mobilityId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMobilityId(item.id)}
                    style={[
                      styles.mobilityChip,
                      {
                        borderColor: selected ? colors.primary : colors.outlineVariant,
                        backgroundColor: selected
                          ? colors.selectedSurface
                          : colors.surfaceContainerLow,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={selected ? colors.primary : gray}
                    />
                    <Text
                      style={[
                        styles.mobilityChipLabel,
                        {
                          fontFamily: fontRegular,
                          color: selected ? colors.primary : gray,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => onOpenExpert?.()}
          style={[styles.expertBtn, { borderColor: colors.outlineVariant }]}
        >
          <MaterialIcons name="settings" size={20} color={colors.primary} />
          <Text style={[styles.expertBtnText, { fontFamily: fontBold, color: colors.primary }]}>
            Ajustes Avanzados (Expert Mode)
          </Text>
        </Pressable>

        {showResults ? (
          <View style={styles.resultsSection}>
            {ROUTE_OPTIONS.map((route) => (
              <RouteOptionCard
                key={route.id}
                route={route}
                selected={selectedRouteId === route.id}
                onSelect={() => setSelectedRouteId(route.id)}
                onChoose={() => onOpenDetail?.()}
              />
            ))}
            <Pressable onPress={() => setShowResults(false)} style={styles.backLink}>
              <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
              <Text style={[styles.backText, { fontFamily: fontRegular, color: colors.primary }]}>
                Volver a preferencias
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleSearch}
          style={styles.exploreCard}
        >
          <ImageBackground
            source={{ uri: EXPLORE_MAP_URI }}
            style={styles.exploreImage}
            imageStyle={styles.exploreImageInner}
          >
            <View style={styles.exploreOverlay} />
            <Text style={[styles.exploreText, { fontFamily: fontBold }]}>
              Explorar Rutas Seguras en Tu Área
            </Text>
          </ImageBackground>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    gap: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radii.sm,
    minHeight: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  block: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 20,
    ...shadows.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterIconBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextWrap: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  filterTitle: {
    fontSize: 15,
  },
  filterSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  mobilityRow: {
    flexDirection: 'row',
    padding: 14,
  },
  mobilityTile: {
    flex: 1,
    minHeight: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  mobilityTileLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  mobilitySecondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  mobilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: '48%',
  },
  mobilityChipLabel: {
    fontSize: 12,
    flexShrink: 1,
  },
  expertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: 14,
    marginBottom: 20,
  },
  expertBtnText: {
    fontSize: 15,
  },
  resultsSection: {
    marginBottom: 16,
    gap: 4,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
  },
  exploreCard: {
    borderRadius: radii.md,
    overflow: 'hidden',
    minHeight: 180,
    ...shadows.md,
  },
  exploreImage: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'flex-end',
  },
  exploreImageInner: {
    borderRadius: radii.md,
  },
  exploreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 26, 64, 0.52)',
  },
  exploreText: {
    fontSize: 20,
    color: '#ffffff',
    padding: 20,
    lineHeight: 28,
    maxWidth: '85%',
  },
});
