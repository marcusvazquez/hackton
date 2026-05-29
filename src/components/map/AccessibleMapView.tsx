import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, {
  Circle,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import { DEFAULT_MAP_ZOOM, TIJUANA_CENTER } from '../../constants/map';
import { useMapLocation } from '../../context/MapLocationContext';
import { useMapRouting } from '../../context/MapRoutingContext';
import { MAP_INCIDENTS } from '../../data/mapIncidents';
import { useAppTheme } from '../../hooks/useAppTheme';

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2430' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3ff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3444' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1624' }] },
];

function regionFromCenter(lat: number, lng: number, zoom = DEFAULT_MAP_ZOOM): Region {
  const delta = 360 / 2 ** (zoom + 1);
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

function CriticalMarkerPin({
  icon,
  color,
}: {
  icon: 'accessible' | 'warning' | 'bolt';
  color: string;
}) {
  return (
    <View style={[styles.markerPin, { backgroundColor: color }]}>
      <MaterialIcons name={icon} size={18} color="#ffffff" />
    </View>
  );
}

export function AccessibleMapView() {
  const mapRef = useRef<MapView>(null);
  const { colors } = useAppTheme();
  const { flyTarget } = useMapLocation();
  const { routeResult, destination } = useMapRouting();

  const initialRegion = useMemo(
    () => regionFromCenter(TIJUANA_CENTER.lat, TIJUANA_CENTER.lng),
    [],
  );

  useEffect(() => {
    if (!flyTarget || !mapRef.current) return;
    mapRef.current.animateToRegion(
      regionFromCenter(flyTarget.lat, flyTarget.lng, flyTarget.zoom ?? DEFAULT_MAP_ZOOM),
      800,
    );
  }, [flyTarget]);

  useEffect(() => {
    if (!routeResult || !mapRef.current) return;
    const allCoords = [
      ...routeResult.primary.coordinates,
      ...routeResult.alternative.coordinates,
    ];
    if (allCoords.length < 2) return;

    mapRef.current.fitToCoordinates(
      allCoords.map((c) => ({ latitude: c.lat, longitude: c.lng })),
      {
        edgePadding: { top: 120, right: 48, bottom: 200, left: 48 },
        animated: true,
      },
    );
  }, [routeResult]);

  const hazardPolygons = routeResult?.activeHazardZones ?? [];

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_DEFAULT}
      initialRegion={initialRegion}
      customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}
      userInterfaceStyle="dark"
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
    >
      {hazardPolygons.map((zone) => (
        <Polygon
          key={zone.id}
          coordinates={zone.polygon.map((p) => ({
            latitude: p.lat,
            longitude: p.lng,
          }))}
          fillColor={zone.type === 'flood' ? 'rgba(3, 105, 161, 0.2)' : 'rgba(249, 115, 22, 0.2)'}
          strokeColor={zone.type === 'flood' ? '#0369a1' : '#f97316'}
          strokeWidth={2}
        />
      ))}

      {routeResult ? (
        <>
          <Polyline
            coordinates={routeResult.alternative.coordinates.map((c) => ({
              latitude: c.lat,
              longitude: c.lng,
            }))}
            strokeColor={colors.onSurfaceVariant}
            strokeWidth={4}
            lineDashPattern={[12, 10]}
            zIndex={1}
          />
          <Polyline
            coordinates={routeResult.primary.coordinates.map((c) => ({
              latitude: c.lat,
              longitude: c.lng,
            }))}
            strokeColor={colors.primary}
            strokeWidth={5}
            zIndex={2}
          />
        </>
      ) : null}

      {routeResult?.criticalMarkers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          title={marker.title}
          description={marker.description}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <CriticalMarkerPin
            icon={marker.icon}
            color={
              marker.icon === 'accessible'
                ? colors.safeGreen
                : marker.icon === 'warning'
                  ? colors.secondaryContainer
                  : '#f97316'
            }
          />
        </Marker>
      ))}

      {MAP_INCIDENTS.map((incident) => (
        <Circle
          key={incident.id}
          center={{ latitude: incident.lat, longitude: incident.lng }}
          radius={35}
          fillColor={
            incident.type === 'rampa_ok'
              ? 'rgba(22, 163, 74, 0.15)'
              : 'rgba(186, 26, 26, 0.15)'
          }
          strokeColor={incident.type === 'rampa_ok' ? colors.safeGreen : colors.error}
          strokeWidth={1}
        />
      ))}

      {destination ? (
        <Marker
          coordinate={{ latitude: destination.lat, longitude: destination.lng }}
          title="Destino"
          pinColor={colors.primary}
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  markerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
