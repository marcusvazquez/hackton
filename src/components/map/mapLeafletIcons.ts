import type { DivIcon } from 'leaflet';
import { IncidentType } from '../../data/mapIncidents';

const INCIDENT_STYLES: Record<
  IncidentType,
  { bg: string; border: string; glyph: string }
> = {
  rampa_ok: { bg: '#16a34a', border: '#ffffff', glyph: '✓' },
  rampa_bloqueada: { bg: '#dc2626', border: '#ffffff', glyph: '✕' },
  acera_rota: { bg: '#d97706', border: '#ffffff', glyph: '!' },
};

export function createIncidentIcon(
  L: typeof import('leaflet'),
  type: IncidentType,
): DivIcon {
  const style = INCIDENT_STYLES[type];
  return L.divIcon({
    className: 'ruta-libre-incident-icon',
    html: `<div style="
      width:40px;height:40px;border-radius:12px;
      background:${style.bg};border:2px solid ${style.border};
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:18px;
      box-shadow:0 4px 12px rgba(0,0,0,0.45);
      font-family:system-ui,sans-serif;
    ">${style.glyph}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
}

export function createUserLocationIcon(L: typeof import('leaflet')): DivIcon {
  return L.divIcon({
    className: 'ruta-libre-user-icon',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#00e5ff;border:3px solid #fff;
      box-shadow:0 0 0 6px rgba(0,229,255,0.35), 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
