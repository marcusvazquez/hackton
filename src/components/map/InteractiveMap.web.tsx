import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  DARK_TILE_URL,
  DEFAULT_MAP_ZOOM,
  TILE_ATTRIBUTION,
} from '../../constants/map';
import { useMapLocation } from '../../context/MapLocationContext';
import { useMapRouting } from '../../context/MapRoutingContext';
import {
  DEFAULT_MAP_CENTER,
  getAllTijuanaMapPoints,
  getTijuanaMetroBounds,
  tijuanaTroncalRoutes,
} from '../../data/tijuanaRoutesDB';
import { MAP_INCIDENTS } from '../../data/mapIncidents';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getCircleMarkerOptions,
  getIncidentCircleOptions,
} from './mapLeafletIcons';
import {
  MAP_POPUP_CSS,
  bindInteractivePopup,
  buildIncidentPopupHtml,
  buildPointPopupHtml,
  buildRoutePopupHtml,
  buildUserLocationPopupHtml,
} from './mapPopup';

const LEAFLET_CSS_ID = 'ruta-libre-leaflet-css';
const LEAFLET_CDN_CSS =
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

const leafletOverrides = `
.leaflet-container {
  background: #0d1117;
  font-family: system-ui, -apple-system, sans-serif;
}
${MAP_POPUP_CSS}
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
  const layersRef = useRef<{
    incidents: import('leaflet').CircleMarker[];
    points: import('leaflet').CircleMarker[];
    polylines: import('leaflet').Polyline[];
  }>({ incidents: [], points: [], polylines: [] });
  const routeLayersRef = useRef<import('leaflet').Layer[]>([]);
  const userMarkerRef = useRef<import('leaflet').CircleMarker | null>(null);
  const { userLocation, userAddress, flyTarget } = useMapLocation();
  const { routeResult, destination } = useMapRouting();
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
          center: [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
          zoom: DEFAULT_MAP_ZOOM,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          touchZoom: true,
          zoomControl: false,
        });

        L.tileLayer(DARK_TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);

        layersRef.current.polylines = tijuanaTroncalRoutes.map((route) => {
          const line = L.polyline(
            route.coordinates.map((pt) => [pt.lat, pt.lng] as [number, number]),
            {
              color: route.color,
              weight: 6,
              opacity: 0.85,
              interactive: true,
            },
          ).addTo(map);
          bindInteractivePopup(
            line,
            buildRoutePopupHtml(route),
            route.name,
          );
          return line;
        });

        const pointsLayer = L.layerGroup().addTo(map);

        layersRef.current.points = getAllTijuanaMapPoints().map((point) => {
          const marker = L.circleMarker(
            [point.lat, point.lng],
            getCircleMarkerOptions(point.type, point.category),
          );
          bindInteractivePopup(
            marker,
            buildPointPopupHtml(point),
            point.title,
          );
          marker.addTo(pointsLayer);
          return marker;
        });

        layersRef.current.incidents = MAP_INCIDENTS.map((incident) => {
          const marker = L.circleMarker(
            [incident.lat, incident.lng],
            getIncidentCircleOptions(incident.type),
          );
          bindInteractivePopup(
            marker,
            buildIncidentPopupHtml(incident),
            incident.title,
          );
          marker.addTo(map);
          return marker;
        });

        map.fitBounds(getTijuanaMetroBounds(), {
          padding: [40, 40],
          maxZoom: 12,
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
      layersRef.current.incidents.forEach((m) => m.remove());
      layersRef.current.points.forEach((m) => m.remove());
      layersRef.current.polylines.forEach((p) => p.remove());
      layersRef.current = { incidents: [], points: [], polylines: [] };
      routeLayersRef.current.forEach((l) => l.remove());
      routeLayersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!flyTarget || !mapRef.current) return;
    mapRef.current.flyTo(
      [flyTarget.lat, flyTarget.lng],
      flyTarget.zoom ?? DEFAULT_MAP_ZOOM,
      { duration: 1.5, easeLinearity: 0.25 },
    );
  }, [flyTarget]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || typeof window === 'undefined') return;

    void (async () => {
      const L = (await import('leaflet')).default;

      if (userLocation) {
        const popupHtml = buildUserLocationPopupHtml(userAddress);
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.circleMarker(
            [userLocation.lat, userLocation.lng],
            {
              radius: 11,
              fillColor: '#00e5ff',
              color: '#ffffff',
              weight: 3,
              fillOpacity: 1,
              interactive: true,
            },
          ).addTo(map);
          bindInteractivePopup(
            userMarkerRef.current,
            popupHtml,
            'Tu ubicación',
          );
        } else {
          userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
          userMarkerRef.current.setPopupContent(popupHtml);
        }
      } else {
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
      }
    })();
  }, [userLocation, userAddress, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || typeof window === 'undefined') return;

    void (async () => {
      const L = (await import('leaflet')).default;

      routeLayersRef.current.forEach((layer) => layer.remove());
      routeLayersRef.current = [];

      if (routeResult) {
        for (const zone of routeResult.activeHazardZones) {
          const polygon = L.polygon(
            zone.polygon.map((p) => [p.lat, p.lng] as [number, number]),
            {
              color: zone.type === 'flood' ? '#0369a1' : '#f97316',
              fillColor: zone.type === 'flood' ? '#0369a1' : '#f97316',
              fillOpacity: 0.2,
              weight: 2,
            },
          ).addTo(map);
          routeLayersRef.current.push(polygon);
        }

        const altLine = L.polyline(
          routeResult.alternative.coordinates.map((c) => [c.lat, c.lng] as [number, number]),
          { color: colors.onSurfaceVariant, weight: 4, dashArray: '12 10', opacity: 0.9 },
        ).addTo(map);
        routeLayersRef.current.push(altLine);

        const primaryLine = L.polyline(
          routeResult.primary.coordinates.map((c) => [c.lat, c.lng] as [number, number]),
          { color: colors.primary, weight: 5, opacity: 1 },
        ).addTo(map);
        routeLayersRef.current.push(primaryLine);

        for (const marker of routeResult.criticalMarkers) {
          const iconHtml =
            marker.icon === 'accessible'
              ? `<div style="background:#16a34a;width:28px;height:28px;border-radius:14px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">♿</div>`
              : marker.icon === 'warning'
                ? `<div style="background:#f88400;width:28px;height:28px;border-radius:14px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">!</div>`
                : `<div style="background:#f97316;width:28px;height:28px;border-radius:14px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">⚡</div>`;
          const m = L.marker([marker.lat, marker.lng], {
            icon: L.divIcon({ html: iconHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] }),
          })
            .bindPopup(`<b>${marker.title}</b><br/>${marker.description}`)
            .addTo(map);
          routeLayersRef.current.push(m);
        }

        const bounds = primaryLine.getBounds();
        map.fitBounds(bounds, { padding: [120, 48] });
      }

      if (destination) {
        const destMarker = L.marker([destination.lat, destination.lng])
          .bindPopup('<b>Destino</b>')
          .addTo(map);
        routeLayersRef.current.push(destMarker);
      }
    })();
  }, [routeResult, destination, mapReady, colors]);

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
