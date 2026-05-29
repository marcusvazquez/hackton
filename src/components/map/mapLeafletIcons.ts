import type { CircleMarkerOptions } from 'leaflet';
import { IncidentType } from '../../data/mapIncidents';
import type { PointCategory } from '../../data/tijuanaRoutesDB';

const INCIDENT_COLORS: Record<IncidentType, string> = {
  rampa_ok: '#16a34a',
  rampa_bloqueada: '#dc2626',
  acera_rota: '#d97706',
};

const CATEGORY_COLORS: Record<PointCategory, string> = {
  transporte: '#00E676',
  salud: '#18FFFF',
  gobierno: '#7C4DFF',
  barrera_critica: '#FF1744',
  barrera_motriz: '#FF5252',
  barrera_vision: '#FF9100',
  general: '#94A3B8',
};

export function getPointMarkerColor(
  type: 'punto_accesible' | 'barrera',
  category?: PointCategory,
): string {
  if (category && category in CATEGORY_COLORS) {
    return CATEGORY_COLORS[category];
  }
  return type === 'punto_accesible' ? '#00E676' : '#FF5252';
}

export function getCircleMarkerOptions(
  type: 'punto_accesible' | 'barrera',
  category?: PointCategory,
): CircleMarkerOptions {
  const fillColor = getPointMarkerColor(type, category);
  const isCritical =
    category === 'barrera_critica' ||
    category === 'barrera_motriz' ||
    category === 'barrera_vision';

  return {
    radius: isCritical ? 12 : type === 'punto_accesible' ? 10 : 9,
    fillColor,
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.95,
    interactive: true,
    bubblingMouseEvents: false,
  };
}

export function getIncidentCircleOptions(type: IncidentType): CircleMarkerOptions {
  return {
    radius: 13,
    fillColor: INCIDENT_COLORS[type],
    color: '#ffffff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.95,
    interactive: true,
    bubblingMouseEvents: false,
  };
}

export function createUserLocationIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: 'ruta-libre-user-location-pin',
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:#00e5ff;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(0,229,255,0.35), 0 2px 8px rgba(0,0,0,0.4);
      pointer-events:auto;
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
