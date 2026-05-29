export type MarkerType = 'safe' | 'barrier' | 'barrier-critical' | 'poi';

export type MapMarkerData = {
  id: string;
  type: MarkerType;
  label: string;
  top: string;
  left: string;
  icon: string;
  /** Real latitude for MapView */
  latitude: number;
  /** Real longitude for MapView */
  longitude: number;
};

export const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfgXuU-B0NGk_qWdvrnA7fr0scIK6ZmunbK-9pI3X06qX_OHt-77GKxEcv1Tg2H_jitGpq9OrBfXNlsDohARmUaI_OQqjIDbvbv9463Jal_uwnD6iGLfY_P334R_4TtAsp9XovIO2tqi7VSFbWNR1-3Pnic6KdcMXbPHCBqgU45IGrD8bXAZsYGoP_mJIynUi3PNMNNLrmuoq9USDEO-DtGhMBDs_n91erJw7ZvDdtPn4kQ-m6fDRqtE6235N2OyHCmfgtC1y3v2';

/** Default center: Zona Río, Tijuana */
export const DEFAULT_REGION = {
  latitude: 32.5149,
  longitude: -117.0382,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export const MARKERS: MapMarkerData[] = [
  {
    id: 'safe',
    type: 'safe',
    label: 'RUTA SEGURA',
    top: '50%',
    left: '33%',
    icon: 'check-circle',
    latitude: 32.5155,
    longitude: -117.0395,
  },
  {
    id: 'barrier1',
    type: 'barrier',
    label: 'ACERA ROTA',
    top: '33%',
    left: '75%',
    icon: 'warning',
    latitude: 32.5170,
    longitude: -117.0345,
  },
  {
    id: 'barrier2',
    type: 'barrier-critical',
    label: 'RAMPA CERRADA',
    top: '67%',
    left: '50%',
    icon: 'block',
    latitude: 32.5130,
    longitude: -117.0370,
  },
  {
    id: 'park',
    type: 'poi',
    label: 'Área Verde',
    top: '25%',
    left: '25%',
    icon: 'park',
    latitude: 32.5180,
    longitude: -117.0410,
  },
  {
    id: 'wc',
    type: 'poi',
    label: 'Accesible',
    top: '67%',
    left: '67%',
    icon: 'wc',
    latitude: 32.5132,
    longitude: -117.0350,
  },
  {
    id: 'coffee',
    type: 'poi',
    label: 'Descanso',
    top: '75%',
    left: '25%',
    icon: 'coffee',
    latitude: 32.5120,
    longitude: -117.0405,
  },
];

export const SEARCH_SUGGESTIONS = [
  'Centro de Tijuana',
  'Av. Revolución',
  'Zona Río',
  'CRIT Otay',
  'Playas de Tijuana',
  'La Mesa',
  'Macroplaza',
  'San Ysidro',
  'Plaza 2000',
  'La Presa Este',
  'Calle 2da',
];
