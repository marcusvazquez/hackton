import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  DARK_TILE_URL,
  DEFAULT_MAP_ZOOM,
  TILE_ATTRIBUTION,
  TIJUANA_CENTER,
} from '../../constants/map';
import { useMapLocation } from '../../context/MapLocationContext';
import { MAP_INCIDENTS } from '../../data/mapIncidents';
import { useAppTheme } from '../../hooks/useAppTheme';
import { createIncidentIcon, createUserLocationIcon } from './mapLeafletIcons';

const LEAFLET_CSS_ID = 'ruta-libre-leaflet-css';
const LEAFLET_CDN_CSS =
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

const leafletOverrides = `
.leaflet-container {
  background: #0d1117;
  font-family: system-ui, -apple-system, sans-serif;
}
.ruta-libre-incident-icon,
.ruta-libre-user-icon {
  background: transparent !important;
  border: none !important;
}
.leaflet-popup-content-wrapper {
  background: #1a2332;
  color: #e8edf5;
  border-radius: 12px;
  border: 1px solid rgba(0, 229, 255, 0.25);
}
.leaflet-popup-tip { background: #1a2332; }
.leaflet-popup-content {
  margin: 12px 14px;
  font-size: 14px;
  line-height: 1.45;
}
.leaflet-popup-content b {
  color: #00e5ff;
  display: block;
  margin-bottom: 4px;
}
`;

function ensureLeafletStyles() {
  if (typeof document === 'undefined') return;

  if (!document.getElementById('ruta-libre-leaflet-cdn')) {
    const link = document.createElement('link');
    link.id = 'ruta-libre-leaflet-cdn';
    link.rel = 'stylesheet';
    link.href = LEAFLET_CDN_CSS;
    document.head.appendChild(link);
  }

  if (!document.getElementById(LEAFLET_CSS_ID)) {
    const style = document.createElement('style');
    style.id = LEAFLET_CSS_ID;
    style.textContent = leafletOverrides;
    document.head.appendChild(style);
  }
}

/** Contenedor DOM real para Leaflet (solo web). */
function MapDiv({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

export function InteractiveMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const incidentMarkersRef = useRef<import('leaflet').Marker[]>([]);
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const { userLocation, flyTarget } = useMapLocation();
  const { colors, fontRegular } = useAppTheme();
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let disposed = false;

    const initMap = async () => {
      try {
        ensureLeafletStyles();
        const L = (await import('leaflet')).default;

        if (disposed || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [TIJUANA_CENTER.lat, TIJUANA_CENTER.lng],
          zoom: DEFAULT_MAP_ZOOM,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          touchZoom: true,
          zoomControl: false,
        });

        L.tileLayer(DARK_TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);

        incidentMarkersRef.current = MAP_INCIDENTS.map((incident) => {
          const marker = L.marker([incident.lat, incident.lng], {
            icon: createIncidentIcon(L, incident.type),
          });
          marker.bindPopup(
            `<b>${incident.title}</b><br/>${incident.description}`,
          );
          marker.addTo(map);
          return marker;
        });

        mapRef.current = map;
        setMapReady(true);
        setTimeout(() => map.invalidateSize(), 100);
      } catch (error) {
        if (!disposed) {
          setMapError(
            error instanceof Error ? error.message : 'No se pudo cargar el mapa.',
          );
        }
      }
    };

    const timer = setTimeout(() => void initMap(), 50);

    return () => {
      disposed = true;
      clearTimeout(timer);
      incidentMarkersRef.current.forEach((m) => m.remove());
      incidentMarkersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!flyTarget || !mapRef.current) return;
    mapRef.current.flyTo([flyTarget.lat, flyTarget.lng], flyTarget.zoom ?? DEFAULT_MAP_ZOOM, {
      duration: 1.2,
    });
  }, [flyTarget]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || typeof window === 'undefined') return;

    void (async () => {
      const L = (await import('leaflet')).default;

      if (userLocation) {
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
            icon: createUserLocationIcon(L),
          })
            .addTo(map)
            .bindPopup('<b>Tu ubicación</b><br/>Posición actual');
        } else {
          userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        }
      } else {
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
      }
    })();
  }, [userLocation, mapReady]);

  if (mapError) {
    return (
      <View style={[styles.fallback, { backgroundColor: colors.surfaceDim }]}>
        <Text style={[styles.fallbackText, { fontFamily: fontRegular, color: colors.onSurfaceVariant }]}>
          {mapError}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <MapDiv containerRef={containerRef} />
      {!mapReady ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
