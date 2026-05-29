import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteOptionCard } from '../components/RouteOptionCard';
import { SectionHeader } from '../components/SectionHeader';
import { useMapLocation } from '../context/MapLocationContext';
import { ROUTE_OPTIONS } from '../data/routes';
import { useAppTheme } from '../hooks/useAppTheme';
import { getGeolocationErrorMessage } from '../utils/geolocation';
import {
  forwardGeocode,
  PLACE_COORDINATES,
  resolvePlaceCoordinates,
} from '../utils/nominatim';
import { spacing } from '../theme/colors';
import { radii } from '../theme/shadows';

type Props = {
  onOpenDetail?: () => void;
};

export function PlanearScreen({ onOpenDetail }: Props) {
  const { colors, fontBold, fontRegular, isHackathon } = useAppTheme();
  const { locateUser, flyTo, geocodeAndFly } = useMapLocation();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [originLoading, setOriginLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [step, setStep] = useState<'search' | 'results'>('search');
  const [selectedId, setSelectedId] = useState('accessible');

  const hasOrigin = origin.trim().length > 0;
  const hasDestination = destination.trim().length > 0;
  const canSearch = hasOrigin && hasDestination;

  const handleUseMyLocation = useCallback(async () => {
    setOriginLoading(true);
    setLocationError(null);
    try {
      const { address, coords } = await locateUser();
      setOrigin(address);
      setOriginCoords(coords);
    } catch (error) {
      setLocationError(getGeolocationErrorMessage(error));
    } finally {
      setOriginLoading(false);
    }
  }, [locateUser]);

  const handleDestinationSubmit = useCallback(async () => {
    const trimmed = destination.trim();
    if (!trimmed) return;

    if (trimmed in PLACE_COORDINATES) {
      flyTo(resolvePlaceCoordinates(trimmed));
      return;
    }

    const result = await forwardGeocode(trimmed);
    if (result) {
      flyTo({ lat: result.lat, lng: result.lng });
    }
  }, [destination, flyTo]);

  const handleSearch = async () => {
    if (!canSearch) return;
    await geocodeAndFly(destination.trim());
    setStep('results');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
                accessibilityRole="button"
                disabled={originLoading}
                onPress={handleUseMyLocation}
                style={styles.locationBtn}
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
              <Text
                style={[styles.coordsHint, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}
              >
                GPS: {originCoords.lat.toFixed(5)}, {originCoords.lng.toFixed(5)}
              </Text>
            ) : null}

            <View
              style={[
                styles.field,
                { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <MaterialIcons name="place" size={22} color={colors.secondary} />
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="¿A dónde vas?"
                style={[styles.input, { fontFamily: fontRegular, color: colors.onSurface }]}
                placeholderTextColor={colors.onSurfaceVariant}
                onSubmitEditing={handleDestinationSubmit}
                onBlur={handleDestinationSubmit}
              />
            </View>

            <Pressable
              onPress={handleSearch}
              disabled={!canSearch}
              accessibilityState={{ disabled: !canSearch }}
              style={[
                styles.searchBtn,
                {
                  backgroundColor: canSearch ? colors.primary : colors.surfaceContainerHigh,
                  opacity: canSearch ? 1 : 0.6,
                },
              ]}
            >
              <MaterialIcons name="directions" size={22} color={colors.onPrimary} />
              <Text style={[styles.searchBtnText, { fontFamily: fontBold, color: colors.onPrimary }]}>
                Buscar rutas
              </Text>
            </Pressable>

            {!canSearch ? (
              <Text
                style={[styles.hintText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}
              >
                {!hasOrigin
                  ? 'Toca el icono de ubicación o escribe tu punto de partida.'
                  : 'Escribe un destino para habilitar la búsqueda.'}
              </Text>
            ) : null}

            {isHackathon ? (
              <View style={[styles.hint, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.hintText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
                  Modo cyber: compara ruta rápida vs. más accesible con puntuación en tiempo real.
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
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
  scroll: {
    padding: spacing.edge,
    paddingBottom: 120,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    minHeight: 52,
  },
  locationBtn: {
    padding: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  errorText: { fontSize: 13, marginTop: -8, marginBottom: 8, lineHeight: 18 },
  coordsHint: { fontSize: 11, marginTop: -8, marginBottom: 10 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: radii.md,
    marginTop: 8,
  },
  searchBtnText: { fontSize: 16 },
  hint: {
    marginTop: spacing.gutter,
    padding: 12,
    borderWidth: 1,
    borderRadius: radii.md,
    borderStyle: 'dashed',
  },
  hintText: { fontSize: 13, lineHeight: 20, marginBottom: 8 },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  backText: { fontSize: 15 },
});
