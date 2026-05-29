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
  { id: 'ramps', label: 'Rampas', icon: 'ramp-right' as const },
  { id: 'elevators', label: 'Elevadores', icon: 'elevator' as const },
  { id: 'restrooms', label: 'Baños', icon: 'wc' as const },
  { id: 'lighting', label: 'Iluminación', icon: 'light-mode' as const },
  { id: 'quiet', label: 'Zona tranquila', icon: 'volume-off' as const },
  { id: 'shade', label: 'Sombra', icon: 'wb-cloudy' as const },
];
