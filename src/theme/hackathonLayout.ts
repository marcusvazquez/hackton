import type { TabId } from '../types/navigation';
import { FLOATING_NAV_CLEARANCE } from './layoutConstants';

/** Tipografía legible en pantallas estrechas (Press Start solo en 1–2 palabras). */
export const hackathonTypography = {
  /** Press Start 2P — títulos mínimos (marca, // decorativo). */
  pixel: 8,
  pixelMd: 9,
  /** VT323 — títulos de sección y UI principal. */
  sectionTitle: 16,
  /** VT323 — cuerpo y navegación. */
  body: 16,
  bodySm: 14,
  bodyXs: 12,
  lineBody: 18,
  lineBodySm: 16,
  /** Chips de barrera (evita desborde en celdas ~47% ancho). */
  chipLabel: 12,
  chipLine: 15,
} as const;

/** Brillo tipo LED en texto (web + nativo donde aplica). */
export function hackathonNeonText(accent: string) {
  return {
    color: accent,
    textShadowColor: accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  } as const;
}

/** Etiquetas cortas para la barra inferior (evitan solapamiento). */
export const HACKATHON_TAB_LABELS: Record<TabId, string> = {
  mapa: 'Mapa',
  planear: 'Ruta',
  reportar: 'Aviso',
  comunidad: 'Red',
};

/** Pila vertical de overlays en el mapa (modo hackathon). */
export const hackathonMapStack = {
  searchTop: 6,
  /** Debajo de la barra de búsqueda (~52px). */
  locationTop: 60,
  /** Debajo del aviso de ubicación compacto (~44px). */
  filtersTop: 112,
  alertStripTop: 164,
  /** FAB reporte (derecha, más bajo). */
  reportFabBottom: FLOATING_NAV_CLEARANCE + 16,
  statusCardBottom: FLOATING_NAV_CLEARANCE + 8,
  statusCardRight: 76,
  /** Micrófono global — encima del FAB de reporte. */
  voiceIndicatorBottom: FLOATING_NAV_CLEARANCE + 88,
  /** Guía IA — arriba de ambos. */
  aiFabBottom: FLOATING_NAV_CLEARANCE + 160,
} as const;

export const hackathonSearch = {
  padding: 8,
  inputSize: 16,
  placeholderSize: 16,
  iconSize: 22,
  directionsPadding: 8,
} as const;
