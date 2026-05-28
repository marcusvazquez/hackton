export type MarkerType = 'safe' | 'barrier' | 'barrier-critical' | 'poi';

export type MapMarkerData = {
  id: string;
  type: MarkerType;
  label: string;
  top: string;
  left: string;
  icon: string;
};

export const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtfgXuU-B0NGk_qWdvrnA7fr0scIK6ZmunbK-9pI3X06qX_OHt-77GKxEcv1Tg2H_jitGpq9OrBfXNlsDohARmUaI_OQqjIDbvbv9463Jal_uwnD6iGLfY_P334R_4TtAsp9XovIO2tqi7VSFbWNR1-3Pnic6KdcMXbPHCBqgU45IGrD8bXAZsYGoP_mJIynUi3PNMNNLrmuoq9USDEO-DtGhMBDs_n91erJw7ZvDdtPn4kQ-m6fDRqtE6235N2OyHCmfgtC1y3v2';

export const MARKERS: MapMarkerData[] = [
  { id: 'safe', type: 'safe', label: 'RUTA SEGURA', top: '50%', left: '33%', icon: 'check-circle' },
  {
    id: 'barrier1',
    type: 'barrier',
    label: 'ACERA ROTA',
    top: '33%',
    left: '75%',
    icon: 'warning',
  },
  {
    id: 'barrier2',
    type: 'barrier-critical',
    label: 'RAMPA CERRADA',
    top: '67%',
    left: '50%',
    icon: 'block',
  },
  { id: 'park', type: 'poi', label: 'Área Verde', top: '25%', left: '25%', icon: 'park' },
  { id: 'wc', type: 'poi', label: 'Accesible', top: '67%', left: '67%', icon: 'wc' },
  { id: 'coffee', type: 'poi', label: 'Descanso', top: '75%', left: '25%', icon: 'coffee' },
];

export const SEARCH_SUGGESTIONS = [
  'Centro de Tijuana',
  'Plaza Río',
  'Zona Río',
  'Av. Revolución',
  'Macroplaza',
];
