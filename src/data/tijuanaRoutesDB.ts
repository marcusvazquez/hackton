export type LatLngPoint = { lat: number; lng: number };

export type TroncalRoute = {
  id: string;
  name: string;
  color: string;
  coordinates: LatLngPoint[];
};

export type PointCategory =
  | 'transporte'
  | 'salud'
  | 'gobierno'
  | 'barrera_critica'
  | 'barrera_motriz'
  | 'barrera_vision'
  | 'general';

export type TijuanaMapPoint = {
  id: string;
  lat: number;
  lng: number;
  type: 'punto_accesible' | 'barrera';
  title: string;
  description: string;
  delegacion: string;
  category?: PointCategory;
};

/** Vista metropolitana de Tijuana (norte-sur / este-oeste) */
export const TIJUANA_METRO_BOUNDS = {
  north: 32.555,
  south: 32.44,
  west: -117.13,
  east: -116.81,
};

export const DEFAULT_MAP_CENTER = { lat: 32.505, lng: -117.005 };

/** Destinos conocidos para búsqueda y flyTo del mapa */
export const TIJUANA_SEARCH_DESTINATIONS: Record<
  string,
  { lat: number; lng: number; zoom?: number; talkback: string }
> = {
  crit: {
    lat: 32.5189,
    lng: -116.9458,
    zoom: 16,
    talkback:
      'Ruta calculada hacia CRIT Baja California en Otay. El terreno exterior es plano y accesible.',
  },
  otay: {
    lat: 32.5189,
    lng: -116.9458,
    zoom: 16,
    talkback: 'Posicionando en Otay, cerca del CRIT Baja California.',
  },
  centro: {
    lat: 32.5354,
    lng: -117.0382,
    zoom: 16,
    talkback:
      'Posicionando en Zona Centro. Cuidado: se reportan barreras por acera rota en las inmediaciones.',
  },
  revolucion: {
    lat: 32.5354,
    lng: -117.0382,
    zoom: 16,
    talkback:
      'Posicionando en Avenida Revolución. Cuidado: se reportan dos barreras por acera rota cerca.',
  },
  'zona rio': {
    lat: 32.5302,
    lng: -117.0225,
    zoom: 15,
    talkback: 'Mapa centrado en Zona Río, Tijuana.',
  },
  'zona centro': {
    lat: 32.533,
    lng: -117.0395,
    zoom: 16,
    talkback: 'Enfocando Zona Centro con barreras reportadas en el mapa.',
  },
  'calle 2da': {
    lat: 32.533,
    lng: -117.0395,
    zoom: 17,
    talkback:
      'Enfocando barrera en Calle Segunda: rampa bloqueada por comercio ambulante.',
  },
  macroplaza: {
    lat: 32.5312,
    lng: -117.0195,
    zoom: 16,
    talkback: 'Posicionando en Macroplaza, Zona Río.',
  },
  playas: {
    lat: 32.533,
    lng: -117.118,
    zoom: 15,
    talkback: 'Posicionando en Playas de Tijuana, corredor costero.',
  },
  'la mesa': {
    lat: 32.492,
    lng: -116.962,
    zoom: 15,
    talkback: 'Posicionando en La Mesa, Tijuana.',
  },
  'san ysidro': {
    lat: 32.545,
    lng: -117.028,
    zoom: 16,
    talkback: 'Posicionando cerca de San Ysidro y la garita.',
  },
  'plaza 2000': {
    lat: 32.454,
    lng: -116.827,
    zoom: 15,
    talkback:
      'Posicionando en Plaza 2000, La Presa Este. Revisa barreras críticas en Blvd. 2000.',
  },
  'presa este': {
    lat: 32.455,
    lng: -116.827,
    zoom: 15,
    talkback: 'Delegación La Presa Este. Nodos de inclusión y barreras críticas en el mapa.',
  },
};

/**
 * Rutas troncales inclusivas simuladas — cubren el área metropolitana de Tijuana.
 * Basadas en ejes reales: Revolución, Paseo de los Héroes, Agua Caliente, Otay, Playas, La Mesa.
 */
export const tijuanaTroncalRoutes: TroncalRoute[] = [
  {
    id: 'revolucion-norte-sur',
    name: 'Av. Revolución (Centro)',
    color: '#7C4DFF',
    coordinates: [
      { lat: 32.528, lng: -117.044 },
      { lat: 32.532, lng: -117.041 },
      { lat: 32.536, lng: -117.038 },
      { lat: 32.54, lng: -117.035 },
      { lat: 32.544, lng: -117.032 },
    ],
  },
  {
    id: 'paseo-heroes',
    name: 'Paseo de los Héroes (Zona Río)',
    color: '#00E5FF',
    coordinates: [
      { lat: 32.522, lng: -117.038 },
      { lat: 32.526, lng: -117.032 },
      { lat: 32.53, lng: -117.026 },
      { lat: 32.534, lng: -117.02 },
      { lat: 32.538, lng: -117.014 },
    ],
  },
  {
    id: 'agua-caliente',
    name: 'Blvd. Agua Caliente',
    color: '#18FFFF',
    coordinates: [
      { lat: 32.518, lng: -117.048 },
      { lat: 32.522, lng: -117.04 },
      { lat: 32.526, lng: -117.032 },
      { lat: 32.53, lng: -117.024 },
      { lat: 32.534, lng: -117.016 },
    ],
  },
  {
    id: 'eje-rio-centro',
    name: 'Conexión Zona Río — Centro',
    color: '#00E676',
    coordinates: [
      { lat: 32.528, lng: -117.018 },
      { lat: 32.53, lng: -117.024 },
      { lat: 32.532, lng: -117.03 },
      { lat: 32.534, lng: -117.036 },
      { lat: 32.536, lng: -117.042 },
    ],
  },
  {
    id: 'otay-crit-centro',
    name: 'Eje Otay — CRIT — Zona Centro',
    color: '#FFAB40',
    coordinates: [
      { lat: 32.508, lng: -116.948 },
      { lat: 32.514, lng: -116.958 },
      { lat: 32.52, lng: -116.972 },
      { lat: 32.526, lng: -116.99 },
      { lat: 32.532, lng: -117.008 },
      { lat: 32.536, lng: -117.028 },
    ],
  },
  {
    id: 'la-mesa-otay',
    name: 'Corredor La Mesa — Otay',
    color: '#FFD740',
    coordinates: [
      { lat: 32.478, lng: -116.948 },
      { lat: 32.486, lng: -116.952 },
      { lat: 32.494, lng: -116.958 },
      { lat: 32.502, lng: -116.962 },
      { lat: 32.51, lng: -116.968 },
      { lat: 32.518, lng: -116.972 },
    ],
  },
  {
    id: 'playas-centro',
    name: 'Eje Playas — Centro',
    color: '#40C4FF',
    coordinates: [
      { lat: 32.528, lng: -117.115 },
      { lat: 32.53, lng: -117.1 },
      { lat: 32.532, lng: -117.085 },
      { lat: 32.534, lng: -117.07 },
      { lat: 32.536, lng: -117.055 },
      { lat: 32.538, lng: -117.04 },
    ],
  },
  {
    id: 'sanchez-taboada',
    name: 'Sánchez Taboada — Libertad',
    color: '#EA80FC',
    coordinates: [
      { lat: 32.498, lng: -117.068 },
      { lat: 32.504, lng: -117.06 },
      { lat: 32.51, lng: -117.052 },
      { lat: 32.516, lng: -117.044 },
      { lat: 32.522, lng: -117.036 },
    ],
  },
  {
    id: 'cerro-colorado',
    name: 'Cerro Colorado — El Florido',
    color: '#FF5252',
    coordinates: [
      { lat: 32.468, lng: -116.86 },
      { lat: 32.474, lng: -116.875 },
      { lat: 32.48, lng: -116.89 },
      { lat: 32.486, lng: -116.905 },
      { lat: 32.492, lng: -116.92 },
    ],
  },
  {
    id: 'garita-san-ysidro',
    name: 'Corredor Garita — Centro',
    color: '#69F0AE',
    coordinates: [
      { lat: 32.548, lng: -117.038 },
      { lat: 32.544, lng: -117.042 },
      { lat: 32.54, lng: -117.046 },
      { lat: 32.536, lng: -117.05 },
      { lat: 32.532, lng: -117.054 },
    ],
  },
  {
    id: 'hipodromo-chapultepec',
    name: 'Hipódromo — Chapultepec',
    color: '#B388FF',
    coordinates: [
      { lat: 32.508, lng: -117.008 },
      { lat: 32.512, lng: -117.012 },
      { lat: 32.516, lng: -117.016 },
      { lat: 32.52, lng: -117.02 },
      { lat: 32.524, lng: -117.024 },
    ],
  },
  {
    id: 'tomas-aquino',
    name: 'Tomás Aquino — Industrial',
    color: '#84FFFF',
    coordinates: [
      { lat: 32.512, lng: -116.978 },
      { lat: 32.516, lng: -116.988 },
      { lat: 32.52, lng: -116.998 },
      { lat: 32.524, lng: -117.008 },
      { lat: 32.528, lng: -117.018 },
    ],
  },
  {
    id: 'presa-este-plaza2000',
    name: 'La Presa Este — Blvd. 2000 / Plaza 2000',
    color: '#FF6E40',
    coordinates: [
      { lat: 32.468, lng: -116.855 },
      { lat: 32.462, lng: -116.84 },
      { lat: 32.456, lng: -116.83 },
      { lat: 32.452, lng: -116.826 },
      { lat: 32.448, lng: -116.822 },
    ],
  },
];

/** Puntos inclusivos y barreras distribuidos por delegación en toda la ciudad */
const tijuanaMapPoints: TijuanaMapPoint[] = [
  // —— CENTRO / REVOLUCIÓN ——
  {
    id: 'rev-1',
    lat: 32.5354,
    lng: -117.0382,
    type: 'punto_accesible',
    title: 'Av. Revolución — cruce accesible',
    description: 'Rampa y señalización táctil confirmada.',
    delegacion: 'Centro',
  },
  {
    id: 'barrier-2da',
    lat: 32.533,
    lng: -117.0395,
    type: 'barrera',
    title: 'Rampa bloqueada — Calle 2da',
    description: 'Obstáculo por comercio ambulante.',
    delegacion: 'Centro',
  },
  {
    id: 'barrier-rev',
    lat: 32.5328,
    lng: -117.0365,
    type: 'barrera',
    title: 'Acera rota — Revolución',
    description: 'Desnivel de ~8 cm.',
    delegacion: 'Centro',
  },
  {
    id: 'safe-centro',
    lat: 32.5342,
    lng: -117.0388,
    type: 'punto_accesible',
    title: 'Ruta segura — 3ra a 4ta',
    description: 'Tramo sin barreras confirmado.',
    delegacion: 'Centro',
  },
  {
    id: 'centro-plaza',
    lat: 32.537,
    lng: -117.034,
    type: 'punto_accesible',
    title: 'Plaza Santa Cecilia',
    description: 'Acceso peatonal amplio.',
    delegacion: 'Centro',
  },
  {
    id: 'centro-5ta',
    lat: 32.531,
    lng: -117.042,
    type: 'barrera',
    title: '5ta esquina — desnivel',
    description: 'Rampas irregulares en cruce.',
    delegacion: 'Centro',
  },

  // —— ZONA RÍO ——
  {
    id: 'rio-macro',
    lat: 32.5312,
    lng: -117.0195,
    type: 'punto_accesible',
    title: 'Macroplaza',
    description: 'Elevadores y rampas en accesos.',
    delegacion: 'Zona Río',
  },
  {
    id: 'rio-heroes',
    lat: 32.528,
    lng: -117.025,
    type: 'punto_accesible',
    title: 'Paseo de los Héroes',
    description: 'Acera continua y ancha.',
    delegacion: 'Zona Río',
  },
  {
    id: 'rio-cecut',
    lat: 32.526,
    lng: -117.012,
    type: 'punto_accesible',
    title: 'CECUT / Río',
    description: 'Rampas en acceso principal.',
    delegacion: 'Zona Río',
  },
  {
    id: 'rio-plaza-rio',
    lat: 32.524,
    lng: -117.018,
    type: 'punto_accesible',
    title: 'Plaza Río',
    description: 'Estacionamiento con espacio PMR.',
    delegacion: 'Zona Río',
  },
  {
    id: 'rio-barrera',
    lat: 32.529,
    lng: -117.015,
    type: 'barrera',
    title: 'Obra en acera — Río',
    description: 'Desvío temporal señalizado.',
    delegacion: 'Zona Río',
  },

  // —— OTAY ——
  {
    id: 'crit-otay',
    lat: 32.5189,
    lng: -116.9458,
    type: 'punto_accesible',
    title: 'CRIT Baja California',
    description: 'Acceso plano y rampas en buen estado.',
    delegacion: 'Otay',
  },
  {
    id: 'otay-mall',
    lat: 32.516,
    lng: -116.958,
    type: 'punto_accesible',
    title: 'Plaza Otay',
    description: 'Rampas en todos los accesos.',
    delegacion: 'Otay',
  },
  {
    id: 'otay-industrial',
    lat: 32.512,
    lng: -116.968,
    type: 'barrera',
    title: 'Blvd. Industrial — acera estrecha',
    description: 'Ancho insuficiente para silla de ruedas.',
    delegacion: 'Otay',
  },
  {
    id: 'otay-virrey',
    lat: 32.52,
    lng: -116.952,
    type: 'punto_accesible',
    title: 'Virreyes — corredor seguro',
    description: 'Ruta comunitaria validada.',
    delegacion: 'Otay',
  },

  // —— LA MESA ——
  {
    id: 'mesa-centro',
    lat: 32.492,
    lng: -116.962,
    type: 'punto_accesible',
    title: 'Centro La Mesa',
    description: 'Cruces con rampa en buen estado.',
    delegacion: 'La Mesa',
  },
  {
    id: 'mesa-barrera',
    lat: 32.488,
    lng: -116.968,
    type: 'barrera',
    title: 'Acera rota — La Mesa',
    description: 'Baches reportados hace 1 día.',
    delegacion: 'La Mesa',
  },
  {
    id: 'mesa-lopez',
    lat: 32.496,
    lng: -116.955,
    type: 'punto_accesible',
    title: 'Blvd. López Mateos',
    description: 'Eje con rampas en intersecciones.',
    delegacion: 'La Mesa',
  },

  // —— PLAYAS ——
  {
    id: 'playas-malecon',
    lat: 32.533,
    lng: -117.118,
    type: 'punto_accesible',
    title: 'Malecón Playas',
    description: 'Tramo plano y pavimentado.',
    delegacion: 'Playas',
  },
  {
    id: 'playas-ensenada',
    lat: 32.53,
    lng: -117.108,
    type: 'punto_accesible',
    title: 'Av. Ensenada',
    description: 'Rampas en cruces principales.',
    delegacion: 'Playas',
  },
  {
    id: 'playas-barrera',
    lat: 32.528,
    lng: -117.112,
    type: 'barrera',
    title: 'Escaleras sin rampa',
    description: 'Acceso a playa sin alternativa cercana.',
    delegacion: 'Playas',
  },

  // —— SÁNCHEZ TABOADA / LIBERTAD ——
  {
    id: 'staboada-1',
    lat: 32.508,
    lng: -117.055,
    type: 'punto_accesible',
    title: 'Sánchez Taboada — parque',
    description: 'Sendero accesible confirmado.',
    delegacion: 'Sánchez Taboada',
  },
  {
    id: 'libertad-1',
    lat: 32.502,
    lng: -117.048,
    type: 'barrera',
    title: 'Libertad — acera interrumpida',
    description: 'Poste en medio de rampa.',
    delegacion: 'Libertad',
  },

  // —— CERRO COLORADO / EL FLORIDO ——
  {
    id: 'florido-1',
    lat: 32.478,
    lng: -116.878,
    type: 'punto_accesible',
    title: 'El Florido — plaza',
    description: 'Acceso sin escalones.',
    delegacion: 'El Florido',
  },
  {
    id: 'cerro-barrera',
    lat: 32.472,
    lng: -116.892,
    type: 'barrera',
    title: 'Cerro Colorado — pendiente fuerte',
    description: 'Pendiente > 8% en tramo de 40 m.',
    delegacion: 'Cerro Colorado',
  },

  // —— SAN YSIDRO / GARITA ——
  {
    id: 'garita-1',
    lat: 32.548,
    lng: -117.038,
    type: 'punto_accesible',
    title: 'Zona Garita — acceso peatonal',
    description: 'Rampas en puente peatonal cercano.',
    delegacion: 'San Ysidro',
  },
  {
    id: 'garita-barrera',
    lat: 32.546,
    lng: -117.032,
    type: 'barrera',
    title: 'Congestión peatonal',
    description: 'Acera saturada en hora pico.',
    delegacion: 'San Ysidro',
  },

  // —— HIPÓDROMO / CHAPULTEPEC ——
  {
    id: 'hipodromo-1',
    lat: 32.514,
    lng: -117.01,
    type: 'punto_accesible',
    title: 'Hipódromo — calle 9',
    description: 'Rampas en esquinas principales.',
    delegacion: 'Hipódromo',
  },
  {
    id: 'chapultepec-1',
    lat: 32.51,
    lng: -117.006,
    type: 'punto_accesible',
    title: 'Chapultepec',
    description: 'Corredor validado por usuarios.',
    delegacion: 'Chapultepec',
  },

  // —— TOMÁS AQUINO / BUENA VISTA ——
  {
    id: 'aquino-1',
    lat: 32.518,
    lng: -116.982,
    type: 'punto_accesible',
    title: 'Tomás Aquino',
    description: 'Acceso a parque industrial.',
    delegacion: 'Tomás Aquino',
  },
  {
    id: 'buenavista-1',
    lat: 32.536,
    lng: -117.028,
    type: 'barrera',
    title: 'Buena Vista — obra vial',
    description: 'Desvío sin señalización táctil.',
    delegacion: 'Buena Vista',
  },

  // —— LA PRESA ESTE / PLAZA 2000 ——
  {
    id: 'presa-plaza-sendero',
    lat: 32.4522,
    lng: -116.8258,
    type: 'punto_accesible',
    title: 'Plaza Sendero / Plaza 2000 (Zonas de Ascenso Adaptadas)',
    description:
      'Bahías de transporte público con rampas de acceso a banquetas comerciales principales.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'transporte',
  },
  {
    id: 'presa-imss-39',
    lat: 32.4495,
    lng: -116.821,
    type: 'punto_accesible',
    title: 'Unidad de Medicina Familiar IMSS No. 39',
    description:
      'Clínica periférica con rampa de acceso universal en la entrada principal y cajones azules.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'salud',
  },
  {
    id: 'presa-subdelegacion',
    lat: 32.457,
    lng: -116.8285,
    type: 'punto_accesible',
    title: 'Subdelegación Municipal Presa Este',
    description:
      'Oficina gubernamental con accesibilidad en planta baja para trámites comunitarios.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'gobierno',
  },
  {
    id: 'presa-cruce-2000',
    lat: 32.453,
    lng: -116.8265,
    type: 'barrera',
    title: 'Cruce de Alto Riesgo - Blvd. 2000 frente a Plaza 2000',
    description:
      'Falta de semáforo peatonal adaptado o rampa en camellón central. Cruce de alta velocidad industrial.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'barrera_critica',
  },
  {
    id: 'presa-casablanca',
    lat: 32.461,
    lng: -116.835,
    type: 'barrera',
    title: 'Ausencia de Banquetas Continuas - Corredor Casablanca',
    description:
      'Tramos de terracería y baches profundos que bloquean por completo sillas de ruedas y perfiles de adulto mayor.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'barrera_motriz',
  },
  {
    id: 'presa-parada-terraceria',
    lat: 32.4505,
    lng: -116.824,
    type: 'barrera',
    title: 'Parada de Transporte Sin Refugio ni Señalización',
    description:
      'Los camiones bajan pasaje sobre el acotamiento de terracería. Riesgo extremo de caída para discapacidad visual.',
    delegacion: 'La Presa Este / Plaza 2000',
    category: 'barrera_vision',
  },
];

export function getAllTijuanaMapPoints(): TijuanaMapPoint[] {
  return tijuanaMapPoints;
}

export function getTijuanaMetroBounds(): [[number, number], [number, number]] {
  return [
    [TIJUANA_METRO_BOUNDS.south, TIJUANA_METRO_BOUNDS.west],
    [TIJUANA_METRO_BOUNDS.north, TIJUANA_METRO_BOUNDS.east],
  ];
}

/** Resuelve búsqueda de texto a destino en el mapa */
export function resolveTijuanaSearch(query: string): {
  lat: number;
  lng: number;
  zoom: number;
  talkback: string;
} | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (q.includes('crit') || q.includes('teletón') || q.includes('teleton')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.crit, zoom: 16 };
  }
  if (q.includes('otay')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.otay, zoom: 16 };
  }
  if (q.includes('revolución') || q.includes('revolucion')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.revolucion, zoom: 16 };
  }
  if (q.includes('centro') && !q.includes('zona rio')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.centro, zoom: 16 };
  }
  if (q.includes('zona rio') || q.includes('zona río')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['zona rio'], zoom: 15 };
  }
  if (q.includes('macroplaza')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.macroplaza, zoom: 16 };
  }
  if (q.includes('2da') || q.includes('segunda')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['calle 2da'], zoom: 17 };
  }
  if (q.includes('playas')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS.playas, zoom: 15 };
  }
  if (q.includes('mesa')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['la mesa'], zoom: 15 };
  }
  if (q.includes('garita') || q.includes('ysidro') || q.includes('ísidro')) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['san ysidro'], zoom: 16 };
  }
  if (
    q.includes('plaza 2000') ||
    q.includes('plaza sendero') ||
    q.includes('blvd 2000') ||
    q.includes('blvd. 2000')
  ) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['plaza 2000'], zoom: 15 };
  }
  if (q.includes('presa este') || (q.includes('presa') && !q.includes('express'))) {
    return { ...TIJUANA_SEARCH_DESTINATIONS['presa este'], zoom: 15 };
  }

  return null;
}
