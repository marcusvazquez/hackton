export type BarrierType = {
  id: string;
  label: string;
  icon: string;
  /** Tono del badge de icono (Material Icons con buen soporte en web y móvil). */
  accent: string;
};

export const BARRIER_TYPES: BarrierType[] = [
  { id: 'acera', label: 'Acera rota', icon: 'construction', accent: '#c2410c' },
  { id: 'rampa', label: 'Rampa cerrada', icon: 'block', accent: '#b45309' },
  { id: 'banqueta', label: 'Banqueta obstruida', icon: 'report-problem', accent: '#dc2626' },
  { id: 'senal', label: 'Señalización', icon: 'traffic', accent: '#ca8a04' },
  { id: 'elevador', label: 'Elevador fuera', icon: 'elevator', accent: '#0369a1' },
  { id: 'pendiente', label: 'Pendiente pronunciada', icon: 'terrain', accent: '#15803d' },
  { id: 'vehiculo', label: 'Vehículo estacionado', icon: 'directions-car', accent: '#4338ca' },
  { id: 'otro', label: 'Otro', icon: 'more-horiz', accent: '#475569' },
];
