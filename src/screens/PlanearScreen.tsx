import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { SectionHeader } from '../components/SectionHeader';
import { useMapLocation } from '../context/MapLocationContext';
import { ENV_FILTERS, MOBILITY_SUPPORT, ROUTE_OPTIONS } from '../data/routes';
import { useAdaptiveUI } from '../hooks/useAdaptiveUI';
import { useAppTheme } from '../hooks/useAppTheme';
import { getGeolocationErrorMessage } from '../utils/geolocation';
import {
  forwardGeocode,
  PLACE_COORDINATES,
  resolvePlaceCoordinates,
} from '../utils/nominatim';
import { SCROLL_BOTTOM_INSET } from '../theme/layout';
import { radii, shadows } from '../theme/shadows';

const EXPLORE_MAP_URI =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80';

type Props = {
  onOpenDetail?: () => void;
  onOpenExpert?: () => void;
  onRegisterVoiceDestination?: (handler: ((text: string) => void) | null) => void;
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

export function PlanearScreen({ onOpenDetail, onOpenExpert, onRegisterVoiceDestination }: Props) {
  const { colors, fontBold, fontRegular, isHackathon, spacing } = useAppTheme();
  const adaptive = useAdaptiveUI();
  const { locateUser, flyTo, geocodeAndFly } = useMapLocation();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [originLoading, setOriginLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [step, setStep] = useState<'search' | 'results'>('search');
  const [selectedId, setSelectedId] = useState('accessible');
  const [envFilters, setEnvFilters] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ENV_FILTERS.map((filter) => [filter.id, false])),
  );
  const [mobilityId, setMobilityId] = useState<string>(MOBILITY_SUPPORT[0]?.id ?? 'wheelchair');

  useEffect(() => {
    if (!onRegisterVoiceDestination) return;
    onRegisterVoiceDestination((text) => {
      setDestination(text.trim());
    });
    return () => onRegisterVoiceDestination(null);
  }, [onRegisterVoiceDestination]);

  const gray = colors.onSurfaceVariant;
  const hasOrigin = origin.trim().length > 0;
  const hasDestination = destination.trim().length > 0;
  const canSearch = hasOrigin && hasDestination;

  const mobilityPrimary = useMemo(
    () => MOBILITY_SUPPORT.filter((item) => item.id === 'wheelchair' || item.id === 'cane'),
    [],
  );

  const handleUseMyLocation = useCallback(async () => {
    setOriginLoading(true);
    setLocationError(null);
    if (adaptive.useHaptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const { address, coords } = await locateUser();
      setOrigin(address);
      setOriginCoords(coords);
    } catch (error) {
      setLocationError(getGeolocationErrorMessage(error));
    } finally {
      setOriginLoading(false);
    }
  }, [adaptive.useHaptics, locateUser]);

  const handleDestinationSubmit = useCallback(async () => {
    const trimmed = destination.trim();
    if (!trimmed) return;
    if (trimmed in PLACE_COORDINATES) {
      flyTo(resolvePlaceCoordinates(trimmed));
      return;
    }
    const result = await forwardGeocode(trimmed);
    if (result) flyTo({ lat: result.lat, lng: result.lng });
  }, [destination, flyTo]);

  const handleSearch = async () => {
    if (!canSearch) return;
    await geocodeAndFly(destination.trim());
    setStep('results');
  };

  const toggleEnvFilter = (id: string, value: boolean) => {
    setEnvFilters((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: spacing.edge, paddingBottom: SCROLL_BOTTOM_INSET }]}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader
          title={step === 'search' ? 'Planear ruta' : 'Selección de ruta'}
          subtitle={
            step === 'search'
              ? 'Destino accesible en Tijuana'
              : `${origin} → ${destination || 'Destino'}`
          }
        />

        {step === 'search' ? (
          <>
            <View
              style={[
                styles.field,
                {
                  borderColor: locationError ? colors.error : colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLow,
                },
              ]}
            >
              <Pressable
                accessibilityLabel="Usar mi ubicación actual"
                accessibilityHint="Obtiene tu posición GPS como punto de partida"
                accessibilityRole="button"
                disabled={originLoading}
                onPress={handleUseMyLocation}
                style={[styles.locationBtn, { minHeight: adaptive.minTouchTarget, minWidth: adaptive.minTouchTarget }]}
              >
                {originLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <MaterialIcons name="my-location" size={22} color={colors.primary} />
                )}
              </Pressable>
              <TextInput
                value={origin}
                onChangeText={(text) => {
                  setOrigin(text);
                  setLocationError(null);
                  if (!text.trim()) setOriginCoords(null);
                }}
                placeholder="Mi ubicación"
                style={[styles.input, { fontFamily: fontRegular, color: colors.onSurface }]}
                placeholderTextColor={colors.onSurfaceVariant}
              />
            </View>

            {locationError ? (
              <Text style={[styles.errorText, { fontFamily: fontRegular, color: colors.error }]}>
                {locationError}
              </Text>
            ) : null}

            {originCoords ? (
              <Text style={[styles.coordsHint, { fontFamily: fontRegular, color: gray }]}>
                GPS: {originCoords.lat.toFixed(5)}, {originCoords.lng.toFixed(5)}
              </Text>
            ) : null}

            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant },
              ]}
            >
              <MaterialIcons name="search" size={22} color={colors.primary} />
              <TextInput
                accessible
                accessibilityLabel="Campo de destino"
                accessibilityHint="Escribe o dicta a dónde quieres ir. También puedes usar el asistente de voz"
                value={destination}
                onChangeText={setDestination}
                placeholder="¿A dónde vas?"
                style={[styles.input, { fontFamily: fontRegular, fontSize: adaptive.fontSize, color: colors.onSurface }]}
                placeholderTextColor={colors.onSurfaceVariant}
                onSubmitEditing={handleDestinationSubmit}
                onBlur={handleDestinationSubmit}
              />
            </View>

            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel="Buscar rutas accesibles"
              accessibilityHint="Calcula opciones de ruta según tus filtros"
              onPress={handleSearch}
              disabled={!canSearch}
              style={[
                styles.searchBtn,
                {
                  backgroundColor: canSearch ? colors.primary : colors.surfaceContainerHigh,
                  opacity: canSearch ? 1 : 0.6,
                  minHeight: adaptive.minTouchTarget,
                },
              ]}
            >
              <MaterialIcons name="directions" size={adaptive.largeIcons ? 28 : 22} color={colors.onPrimary} />
              <Text style={[styles.searchBtnText, { fontFamily: fontBold, fontSize: adaptive.fontSize, color: colors.onPrimary }]}>
                Buscar rutas
              </Text>
            </Pressable>

            {!canSearch ? (
              <Text style={[styles.hintText, { fontFamily: fontRegular, color: gray }]}>
                {!hasOrigin
                  ? 'Toca el icono de ubicación o escribe tu punto de partida.'
                  : 'Escribe un destino para habilitar la búsqueda.'}
              </Text>
            ) : null}

            <View style={styles.sectionHeader}>
              <MaterialIcons name="filter-list" size={22} color={colors.primary} />
              <Text style={[styles.sectionTitle, { fontFamily: fontBold, color: colors.primary }]}>
                Filtros Ambientales
              </Text>
            </View>

            <View
              style={[
                styles.block,
                { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
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
                      value={envFilters[filter.id] ?? false}
                      onValueChange={(value) => toggleEnvFilter(filter.id, value)}
                      thumbColor={envFilters[filter.id] ? colors.primary : '#f4f3f4'}
                      trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
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
                { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
              ]}
            >
              <View style={[styles.mobilityRow, { gap: spacing.gutter }]}>
                {mobilityPrimary.map((item) => {
                  const selected = mobilityId === item.id;
                  const bg =
                    selected
                      ? item.id === 'cane'
                        ? colors.secondary
                        : colors.primary
                      : colors.surfaceContainerHigh;
                  const label = item.id === 'wheelchair' ? 'SILLA DE RUEDAS' : 'BASTÓN';
                  return (
                    <Pressable
                      key={item.id}
                      accessible
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={label}
                      onPress={() => setMobilityId(item.id)}
                      style={[
                        styles.mobilityTile,
                        {
                          backgroundColor: bg,
                          borderColor: selected ? bg : colors.outlineVariant,
                          minHeight: adaptive.minTouchTarget + 40,
                        },
                        selected && shadows.sm,
                      ]}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={adaptive.largeIcons ? 44 : 36}
                        color={selected ? '#ffffff' : gray}
                      />
                      <Text
                        style={[
                          styles.mobilityTileLabel,
                          { fontFamily: fontBold, color: selected ? '#ffffff' : gray },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={() => onOpenExpert?.()}
              style={[styles.expertBtn, { borderColor: colors.outlineVariant }]}
            >
              <MaterialIcons name="settings" size={20} color={colors.primary} />
              <Text style={[styles.expertBtnText, { fontFamily: fontBold, color: colors.primary }]}>
                Ajustes Avanzados (Expert Mode)
              </Text>
            </Pressable>

            {isHackathon ? (
              <View style={[styles.hint, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.hintText, { fontFamily: fontRegular, color: gray }]}>
                  Modo cyber: compara ruta rápida vs. más accesible con puntuación en tiempo real.
                </Text>
              </View>
            ) : null}

            <Pressable onPress={handleSearch} disabled={!canSearch} style={styles.exploreCard}>
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
          </>
        ) : (
          <>
            <Pressable
              onPress={() => onOpenExpert?.()}
              style={[
                styles.expertBtn,
                { backgroundColor: colors.surfaceContainer, borderColor: colors.outlineVariant },
              ]}
            >
              <MaterialIcons name="settings" size={20} color={colors.primary} />
              <Text style={[styles.expertBtnText, { fontFamily: fontRegular, color: colors.primary }]}>
                Ajustes Avanzados (Expert Mode)
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
            </Pressable>
            {ROUTE_OPTIONS.map((route) => (
              <RouteOptionCard
                key={route.id}
                route={route}
                selected={selectedId === route.id}
                onSelect={() => setSelectedId(route.id)}
                onChoose={() => onOpenDetail?.()}
              />
            ))}
            <Pressable onPress={() => setStep('search')} style={styles.backLink}>
              <MaterialIcons name="arrow-back" size={18} color={colors.primary} />
              <Text style={[styles.backText, { fontFamily: fontRegular, color: colors.primary }]}>
                Cambiar destino
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { gap: 0 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    minHeight: 52,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 12,
  },
  locationBtn: { padding: 4, minWidth: 30, alignItems: 'center' },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  errorText: { fontSize: 13, marginTop: -8, marginBottom: 8, lineHeight: 18 },
  coordsHint: { fontSize: 11, marginTop: -8, marginBottom: 10 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.pill,
    marginBottom: 16,
  },
  searchBtnText: { fontSize: 16 },
  hintText: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  hint: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18 },
  block: {
    borderWidth: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 16,
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
  filterTextWrap: { flex: 1, gap: 2, minWidth: 0 },
  filterTitle: { fontSize: 15 },
  filterSubtitle: { fontSize: 12, lineHeight: 17 },
  mobilityRow: { flexDirection: 'row', padding: 14 },
  mobilityTile: {
    flex: 1,
    minHeight: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  mobilityTileLabel: { fontSize: 11, letterSpacing: 0.6, textAlign: 'center' },
  expertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  expertBtnText: { flex: 1, fontSize: 15, textAlign: 'center' },
  exploreCard: { borderRadius: radii.md, overflow: 'hidden', minHeight: 180, ...shadows.md },
  exploreImage: { flex: 1, minHeight: 180, justifyContent: 'flex-end' },
  exploreImageInner: { borderRadius: radii.md },
  exploreOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 26, 64, 0.52)' },
  exploreText: {
    fontSize: 20,
    color: '#ffffff',
    padding: 20,
    lineHeight: 28,
    maxWidth: '85%',
  },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 8 },
  backText: { fontSize: 15 },
});
