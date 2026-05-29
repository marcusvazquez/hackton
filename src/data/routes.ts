export type LatLng = { lat: number; lng: number };

export type SegmentTag =
  | 'escaleras'
  | 'escaleras_largas'
  | 'altos_desniveles'
  | 'ancho_insuficiente'
  | 'obstruccion_total'
  | 'rampa'
  | 'acera_amplia'
  | 'pavimento_tactil'
  | 'cruce_sonoro'
  | 'interseccion_compleja'
  | 'obra_sin_confinamiento'
  | 'senalizacion_visual'
  | 'paso_cebra'
  | 'pasamanos'
  | 'descanso'
  | 'pendiente_alta'
  | 'oscuro'
  | 'inundable';

export type RouteGraphNode = {
  id: string;
  lat: number;
  lng: number;
  tags: SegmentTag[];
};

export type RouteGraphEdge = {
  id: string;
  from: string;
  to: string;
  tags: SegmentTag[];
  slopePercent: number;
  sidewalkWidthM: number;
  lengthM: number;
  /** Rampa homologada disponible como alternativa en el tramo. */
  hasRampAlternative?: boolean;
  /** Reporte activo de obstrucción total de acera. */
  hasTotalObstruction?: boolean;
  /** Banca, plaza o zona de resguardo para descanso. */
  hasRestFurniture?: boolean;
  /** Pasamanos continuo en escaleras o rampas. */
  hasHandrail?: boolean;
};

export type HazardZone = {
  id: string;
  type: 'flood' | 'dark';
  /** Vinculado a filtros ENV_FILTERS: quiet → flood, lighting → dark */
  envFilterId: 'quiet' | 'lighting';
  polygon: LatLng[];
  label: string;
};

export type RouteCriticalMarker = {
  id: string;
  lat: number;
  lng: number;
  icon: 'accessible' | 'warning' | 'bolt';
  title: string;
  description: string;
};

export type RouteOption = {
  id: string;
  label: string;
  subtitle: string;
  duration: string;
  distance: string;
  accessibilityScore: number;
  tags: string[];
  recommended?: boolean;
  type: 'fastest' | 'accessible';
};

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'fast',
    label: 'Ruta más rápida',
    subtitle: 'Av. Revolución → Blvd. Agua Caliente',
    duration: '18 min',
    distance: '4.2 km',
    accessibilityScore: 62,
    tags: ['2 barreras', 'Sin rampas en 1 cruce'],
    type: 'fastest',
  },
  {
    id: 'accessible',
    label: 'Ruta más accesible',
    subtitle: 'Zona Río → Paseo de los Héroes',
    duration: '24 min',
    distance: '5.1 km',
    accessibilityScore: 94,
    tags: ['Rampas OK', 'Acera continua', 'Cruces seguros'],
    recommended: true,
    type: 'accessible',
  },
];

export const MOBILITY_SUPPORT = [
  { id: 'wheelchair', label: 'Silla de ruedas', icon: 'accessible' as const },
  { id: 'cane', label: 'Bastón / muleta', icon: 'directions-walk' as const },
  { id: 'visual', label: 'Baja visión', icon: 'visibility' as const },
  { id: 'hearing', label: 'Auditiva', icon: 'hearing' as const },
  { id: 'cognitive', label: 'Cognitiva', icon: 'psychology' as const },
  { id: 'other', label: 'Otra', icon: 'more-horiz' as const },
];

export const ENV_FILTERS = [
  { id: 'ramps', label: 'Rampas', icon: 'ramp-right' as const, accent: '#00fbfb' },
  { id: 'elevators', label: 'Elevadores', icon: 'elevator' as const, accent: '#60ff99' },
  { id: 'restrooms', label: 'Baños', icon: 'wc' as const, accent: '#ff4a8e' },
  { id: 'lighting', label: 'Iluminación', icon: 'light-mode' as const, accent: '#ffdd00' },
  { id: 'quiet', label: 'Zona tranquila', icon: 'volume-off' as const, accent: '#00dddd' },
  { id: 'shade', label: 'Sombra', icon: 'wb-cloudy' as const, accent: '#a78bfa' },
] as const;

/** Nodos del grafo peatonal — Zona Centro / Río, Tijuana */
export const ROUTE_GRAPH_NODES: RouteGraphNode[] = [
  { id: 'centro', lat: 32.5339, lng: -117.0382, tags: ['pavimento_tactil', 'cruce_sonoro'] },
  { id: 'revolucion', lat: 32.5367, lng: -117.0384, tags: ['rampa', 'pavimento_tactil'] },
  { id: 'plaza-rio', lat: 32.5256, lng: -117.0128, tags: ['rampa', 'cruce_sonoro'] },
  { id: 'zona-rio', lat: 32.525, lng: -117.018, tags: ['pavimento_tactil'] },
  { id: 'macroplaza', lat: 32.5312, lng: -117.0195, tags: ['rampa'] },
  { id: 'calle-oscura', lat: 32.5325, lng: -117.036, tags: ['oscuro', 'ancho_insuficiente'] },
  { id: 'escalinata', lat: 32.535, lng: -117.037, tags: ['escaleras', 'escaleras_largas', 'altos_desniveles'] },
  { id: 'cruce-complejo', lat: 32.5345, lng: -117.0355, tags: ['interseccion_compleja'] },
  { id: 'obra-centro', lat: 32.5332, lng: -117.0365, tags: ['obra_sin_confinamiento'] },
  { id: 'banca-macro', lat: 32.5308, lng: -117.0198, tags: ['descanso'] },
  { id: 'rampa-norte', lat: 32.5342, lng: -117.0388, tags: ['rampa'] },
  { id: 'encharcamiento', lat: 32.5268, lng: -117.0155, tags: ['inundable'] },
  { id: 'paseo-heroes', lat: 32.528, lng: -117.022, tags: ['pavimento_tactil', 'cruce_sonoro', 'rampa'] },
  { id: 'blvd-agua', lat: 32.527, lng: -117.025, tags: ['rampa', 'pendiente_alta'] },
];

/** Aristas con metadatos de accesibilidad */
export const ROUTE_GRAPH_EDGES: RouteGraphEdge[] = [
  { id: 'e1', from: 'centro', to: 'revolucion', tags: ['pavimento_tactil', 'acera_amplia', 'senalizacion_visual', 'paso_cebra'], slopePercent: 3, sidewalkWidthM: 1.8, lengthM: 320 },
  { id: 'e2', from: 'centro', to: 'calle-oscura', tags: ['oscuro', 'ancho_insuficiente', 'obstruccion_total'], slopePercent: 2, sidewalkWidthM: 0.9, lengthM: 180, hasTotalObstruction: true },
  { id: 'e3', from: 'centro', to: 'rampa-norte', tags: ['rampa', 'acera_amplia'], slopePercent: 4, sidewalkWidthM: 1.5, lengthM: 140, hasRampAlternative: true },
  { id: 'e4', from: 'revolucion', to: 'escalinata', tags: ['escaleras', 'escaleras_largas', 'altos_desniveles'], slopePercent: 18, sidewalkWidthM: 1.2, lengthM: 90 },
  { id: 'e5', from: 'revolucion', to: 'cruce-complejo', tags: ['interseccion_compleja', 'paso_cebra'], slopePercent: 1, sidewalkWidthM: 1.4, lengthM: 200 },
  { id: 'e6', from: 'rampa-norte', to: 'cruce-complejo', tags: ['rampa', 'cruce_sonoro', 'senalizacion_visual', 'paso_cebra'], slopePercent: 3, sidewalkWidthM: 1.6, lengthM: 250, hasRampAlternative: true },
  { id: 'e7', from: 'centro', to: 'macroplaza', tags: ['rampa', 'pavimento_tactil', 'descanso'], slopePercent: 5, sidewalkWidthM: 1.7, lengthM: 480, hasRampAlternative: true, hasRestFurniture: true },
  { id: 'e8', from: 'macroplaza', to: 'zona-rio', tags: ['pavimento_tactil', 'descanso'], slopePercent: 2, sidewalkWidthM: 1.5, lengthM: 350, hasRestFurniture: true },
  { id: 'e9', from: 'zona-rio', to: 'paseo-heroes', tags: ['pavimento_tactil', 'cruce_sonoro', 'senalizacion_visual'], slopePercent: 2, sidewalkWidthM: 1.8, lengthM: 280 },
  { id: 'e10', from: 'paseo-heroes', to: 'plaza-rio', tags: ['rampa', 'acera_amplia', 'descanso'], slopePercent: 4, sidewalkWidthM: 2.0, lengthM: 400, hasRampAlternative: true, hasRestFurniture: true },
  { id: 'e11', from: 'zona-rio', to: 'encharcamiento', tags: ['inundable'], slopePercent: 1, sidewalkWidthM: 1.3, lengthM: 220 },
  { id: 'e12', from: 'encharcamiento', to: 'plaza-rio', tags: ['inundable', 'oscuro'], slopePercent: 2, sidewalkWidthM: 1.1, lengthM: 300 },
  { id: 'e13', from: 'macroplaza', to: 'blvd-agua', tags: ['pendiente_alta'], slopePercent: 7, sidewalkWidthM: 1.4, lengthM: 260 },
  { id: 'e14', from: 'blvd-agua', to: 'paseo-heroes', tags: ['rampa', 'pasamanos'], slopePercent: 5, sidewalkWidthM: 1.6, lengthM: 180, hasRampAlternative: true, hasHandrail: true },
  { id: 'e15', from: 'calle-oscura', to: 'cruce-complejo', tags: ['oscuro', 'obra_sin_confinamiento'], slopePercent: 3, sidewalkWidthM: 1.0, lengthM: 160 },
  { id: 'e16', from: 'centro', to: 'cruce-complejo', tags: ['cruce_sonoro', 'senalizacion_visual', 'paso_cebra'], slopePercent: 2, sidewalkWidthM: 1.5, lengthM: 210 },
  { id: 'e17', from: 'centro', to: 'obra-centro', tags: ['obra_sin_confinamiento', 'interseccion_compleja'], slopePercent: 1, sidewalkWidthM: 1.3, lengthM: 120 },
  { id: 'e18', from: 'macroplaza', to: 'banca-macro', tags: ['descanso', 'pavimento_tactil'], slopePercent: 1, sidewalkWidthM: 1.6, lengthM: 80, hasRestFurniture: true },
  { id: 'e19', from: 'banca-macro', to: 'zona-rio', tags: ['descanso', 'pavimento_tactil'], slopePercent: 2, sidewalkWidthM: 1.5, lengthM: 90, hasRestFurniture: true },
];

/** Zonas de alerta ambiental — se muestran cuando el filtro correspondiente está activo */
export const HAZARD_ZONES: HazardZone[] = [
  {
    id: 'flood-zona-rio',
    type: 'flood',
    envFilterId: 'quiet',
    label: 'Zona inundable — Río',
    polygon: [
      { lat: 32.5242, lng: -117.017 },
      { lat: 32.5278, lng: -117.013 },
      { lat: 32.5285, lng: -117.0165 },
      { lat: 32.5255, lng: -117.0195 },
    ],
  },
  {
    id: 'flood-plaza',
    type: 'flood',
    envFilterId: 'quiet',
    label: 'Encharcamiento — Plaza Río',
    polygon: [
      { lat: 32.5248, lng: -117.014 },
      { lat: 32.5265, lng: -117.011 },
      { lat: 32.5272, lng: -117.0135 },
      { lat: 32.5255, lng: -117.0155 },
    ],
  },
  {
    id: 'dark-callejon-centro',
    type: 'dark',
    envFilterId: 'lighting',
    label: 'Falta de luminarias — Callejón Centro',
    polygon: [
      { lat: 32.532, lng: -117.0375 },
      { lat: 32.5332, lng: -117.0358 },
      { lat: 32.5328, lng: -117.0352 },
      { lat: 32.5316, lng: -117.0368 },
    ],
  },
  {
    id: 'dark-pasaje-revolucion',
    type: 'dark',
    envFilterId: 'lighting',
    label: 'Tramo oscuro — Av. Revolución',
    polygon: [
      { lat: 32.5358, lng: -117.0392 },
      { lat: 32.5365, lng: -117.0378 },
      { lat: 32.5359, lng: -117.0372 },
      { lat: 32.5352, lng: -117.0386 },
    ],
  },
];
