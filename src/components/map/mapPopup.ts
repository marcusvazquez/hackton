import type { MapIncident } from '../../data/mapIncidents';
import type { TijuanaMapPoint, TroncalRoute } from '../../data/tijuanaRoutesDB';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TYPE_LABELS: Record<string, string> = {
  punto_accesible: 'Punto accesible',
  barrera: 'Barrera reportada',
  rampa_ok: 'Ruta segura',
  rampa_bloqueada: 'Rampa bloqueada',
  acera_rota: 'Acera rota',
  transporte: 'Transporte',
  salud: 'Salud',
  gobierno: 'Gobierno',
  barrera_critica: 'Barrera crítica',
  barrera_motriz: 'Barrera motriz',
  barrera_vision: 'Barrera visual',
};

function badge(label: string): string {
  return `<span class="rl-badge">${escapeHtml(label)}</span>`;
}

function row(label: string, value: string): string {
  return `<p class="rl-row"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

export function buildPointPopupHtml(point: TijuanaMapPoint): string {
  const typeLabel =
    (point.category && TYPE_LABELS[point.category]) ||
    TYPE_LABELS[point.type] ||
    'Punto en mapa';

  return `
    <div class="rl-popup">
      ${badge(typeLabel)}
      <h3 class="rl-title">${escapeHtml(point.title)}</h3>
      <p class="rl-desc">${escapeHtml(point.description)}</p>
      ${row('Delegación', point.delegacion)}
    </div>
  `;
}

export function buildIncidentPopupHtml(incident: MapIncident): string {
  const typeLabel = TYPE_LABELS[incident.type] ?? 'Incidencia';

  return `
    <div class="rl-popup">
      ${badge(typeLabel)}
      <h3 class="rl-title">${escapeHtml(incident.title)}</h3>
      <p class="rl-desc">${escapeHtml(incident.description)}</p>
      ${row('Zona', 'Centro — Tijuana')}
    </div>
  `;
}

export function buildRoutePopupHtml(route: TroncalRoute): string {
  return `
    <div class="rl-popup">
      ${badge('Ruta troncal inclusiva')}
      <h3 class="rl-title">${escapeHtml(route.name)}</h3>
      <p class="rl-desc">Corredor accesible simulado. Toca los puntos cercanos para ver barreras y nodos de inclusión.</p>
    </div>
  `;
}

export function buildUserLocationPopupHtml(address?: string | null): string {
  return `
    <div class="rl-popup">
      ${badge('Tu ubicación')}
      <h3 class="rl-title">Posición actual</h3>
      <p class="rl-desc">${escapeHtml(address ?? 'Ubicación detectada por GPS.')}</p>
    </div>
  `;
}

export const MAP_POPUP_OPTIONS = {
  maxWidth: 320,
  minWidth: 220,
  autoPan: true,
  autoPanPadding: [80, 80] as [number, number],
  closeButton: true,
  className: 'ruta-libre-popup',
} as const;

export const MAP_POPUP_CSS = `
.leaflet-popup-pane { z-index: 1000 !important; }
.ruta-libre-popup .leaflet-popup-content-wrapper {
  background: #1a2332;
  color: #e8edf5;
  border-radius: 14px;
  border: 1px solid rgba(0, 229, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);
}
.ruta-libre-popup .leaflet-popup-tip { background: #1a2332; }
.ruta-libre-popup .leaflet-popup-content {
  margin: 0;
  padding: 0;
  min-width: 200px;
}
.rl-popup { padding: 14px 16px; }
.rl-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #00e5ff;
  background: rgba(0, 229, 255, 0.12);
  border: 1px solid rgba(0, 229, 255, 0.25);
  border-radius: 6px;
  padding: 3px 8px;
  margin-bottom: 8px;
}
.rl-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.3;
}
.rl-desc {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.45;
  color: #cbd5e1;
}
.rl-row {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}
.rl-row strong { color: #64748b; font-weight: 600; }
.leaflet-interactive { cursor: pointer; }
`;

/** Enlaza popup + tooltip y fuerza apertura al hacer clic/tap. */
export function bindInteractivePopup(
  layer: import('leaflet').Layer,
  html: string,
  title: string,
): void {
  if (!('bindPopup' in layer) || typeof layer.bindPopup !== 'function') return;

  layer.bindPopup(html, MAP_POPUP_OPTIONS);
  if ('bindTooltip' in layer && typeof layer.bindTooltip === 'function') {
    layer.bindTooltip(title, {
      permanent: false,
      direction: 'top',
      offset: [0, -8],
      opacity: 0.95,
    });
  }
  layer.on('click', () => {
    if ('openPopup' in layer && typeof layer.openPopup === 'function') {
      layer.openPopup();
    }
  });
}
