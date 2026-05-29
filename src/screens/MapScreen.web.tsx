import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  DimensionValue,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MapFiltersPanel } from '../components/MapFiltersPanel';
import { ReportFab } from '../components/ReportFab';
import { SearchBar } from '../components/SearchBar';
import { StatusCard } from '../components/StatusCard';
import { VoiceAssistantCard } from '../components/VoiceAssistantCard';
import { useAccessibility } from '../context/AccessibilityContext';
import { DEFAULT_REGION, MapMarkerData, MARKERS } from '../data/markers';
import { useAppTheme } from '../hooks/useAppTheme';
import { spacing } from '../theme/colors';

type Props = {
  onOpenDetail: () => void;
  onReport: () => void;
};

const MARKER_COLORS: Record<string, string> = {
  safe: '#16a34a',
  barrier: '#f59e0b',
  'barrier-critical': '#dc2626',
  poi: '#003f87',
};

function markerPosition(marker: MapMarkerData) {
  const latSpan = DEFAULT_REGION.latitudeDelta;
  const lngSpan = DEFAULT_REGION.longitudeDelta;
  const top =
    ((DEFAULT_REGION.latitude + latSpan / 2 - marker.latitude) / latSpan) * 100;
  const left =
    ((marker.longitude - (DEFAULT_REGION.longitude - lngSpan / 2)) / lngSpan) * 100;
  return {
    top: `${Math.min(92, Math.max(8, top))}%`,
    left: `${Math.min(92, Math.max(8, left))}%`,
  };
}

export function MapScreen({ onOpenDetail, onReport }: Props) {
  const { colors, isHackathon } = useAppTheme();
  const { talkBackEnabled, speak } = useAccessibility();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${DEFAULT_REGION.latitude},${DEFAULT_REGION.longitude}&zoom=13&size=800x1200&maptype=mapnik`;

  useEffect(() => {
    let cancelled = false;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permiso de ubicación denegado');
          setLocationLoading(false);
          if (talkBackEnabled) {
            void speak('Permiso de ubicación denegado. Mostrando mapa de Tijuana.');
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (talkBackEnabled) {
          void speak('Ubicación detectada. Mapa centrado en tu posición actual.');
        }
      } catch {
        if (!cancelled) {
          setLocationError('No se pudo obtener la ubicación');
        }
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    };

    void getLocation();

    return () => {
      cancelled = true;
    };
  }, [talkBackEnabled, speak]);

  const handleMarkerPress = (marker: MapMarkerData) => {
    if (talkBackEnabled) {
      void speak(`Marcador: ${marker.label}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceDim }]}>
      <View style={styles.mapArea}>
        <Image
          accessibilityLabel="Mapa de rutas accesibles en Tijuana"
          accessibilityRole="image"
          resizeMode="cover"
          source={{ uri: mapUrl }}
          style={StyleSheet.absoluteFillObject}
        />

        {MARKERS.map((marker) => {
          const pos = markerPosition(marker);
          return (
            <Pressable
              key={marker.id}
              accessibilityLabel={`Marcador: ${marker.label}, Tipo: ${marker.type}`}
              accessibilityRole="button"
              onPress={() => handleMarkerPress(marker)}
              style={[
                styles.markerDot,
                {
                  top: pos.top as DimensionValue,
                  left: pos.left as DimensionValue,
                  backgroundColor: MARKER_COLORS[marker.type] ?? colors.primary,
                },
              ]}
            />
          );
        })}

        {locationLoading ? (
          <View style={styles.locationLoading}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={[styles.locationText, { color: colors.onSurface }]}>
              Obteniendo ubicación…
            </Text>
          </View>
        ) : null}

        {locationError && !locationLoading ? (
          <View style={styles.locationLoading}>
            <MaterialIcons name="location-off" size={18} color={colors.error} />
            <Text style={[styles.locationText, { color: colors.error }]}>
              {locationError}
            </Text>
          </View>
        ) : null}

        {userLocation && !locationLoading ? (
          <View style={styles.locationBadge}>
            <MaterialIcons name="my-location" size={16} color={colors.safeGreen} />
            <Text style={[styles.locationBadgeText, { color: colors.onSurface }]}>
              {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Text>
          </View>
        ) : null}

        <SearchBar />
        <VoiceAssistantCard />
        {isHackathon ? (
          <View style={styles.filtersWrap}>
            <MapFiltersPanel />
          </View>
        ) : null}
        <StatusCard onPressVer={onOpenDetail} />
        <ReportFab onPress={onReport} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  markerDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 5,
    marginLeft: -7,
    marginTop: -7,
  },
  locationLoading: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegible_400Regular',
  },
  locationBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locationBadgeText: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegible_400Regular',
  },
  filtersWrap: {
    position: 'absolute',
    top: 120,
    left: spacing.edge,
    right: spacing.edge,
    zIndex: 15,
  },
});
