export type IncidentType = 'rampa_ok' | 'rampa_bloqueada' | 'acera_rota';

export type MapIncident = {
  id: string;
  lat: number;
  lng: number;
  type: IncidentType;
  title: string;
  description: string;
};

/** Incidencias simuladas — Zona Centro, Tijuana */
export const MAP_INCIDENTS: MapIncident[] = [
  {
    id: 'rampa-1',
    lat: 32.5342,
    lng: -117.0388,
    type: 'rampa_ok',
    title: 'Rampa accesible',
    description: 'Rampa en buen estado junto a Av. Revolución. Ancho ≥ 90 cm.',
  },
  {
    id: 'rampa-2',
    lat: 32.5328,
    lng: -117.0365,
    type: 'rampa_bloqueada',
    title: 'Rampa bloqueada',
    description: 'Obstáculo temporal (vendedor ambulante). Reportado hace 2 h.',
  },
  {
    id: 'acera-1',
    lat: 32.5355,
    lng: -117.0401,
    type: 'acera_rota',
    title: 'Acera rota',
    description: 'Baches y desnivel de ~8 cm. Usar acera opuesta si es posible.',
  },
  {
    id: 'rampa-3',
    lat: 32.5315,
    lng: -117.0372,
    type: 'rampa_ok',
    title: 'Ruta segura',
    description: 'Cruce peatonal con rampa y señalización táctil confirmada.',
  },
  {
    id: 'acera-2',
    lat: 32.5331,
    lng: -117.035,
    type: 'acera_rota',
    title: 'Acera estrecha',
    description: 'Ancho insuficiente para silla de ruedas en hora pico.',
  },
];

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  rampa_ok: 'RUTA SEGURA',
  rampa_bloqueada: 'RAMPA CERRADA',
  acera_rota: 'ACERA ROTA',
};
