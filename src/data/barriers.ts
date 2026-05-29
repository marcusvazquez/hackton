export type BarrierType = {
  id: string;
  label: string;
  icon: string;
  /** Tono del badge de icono (Material Icons con buen soporte en web y móvil). */
  accent: string;
};

/** Acentos neón alineados con hackathonColors (modo hackathon). */
export const BARRIER_TYPES: BarrierType[] = [
  { id: 'acera', label: 'Acera rota', icon: 'construction', accent: '#ff8866' },
  { id: 'rampa', label: 'Rampa cerrada', icon: 'block', accent: '#ffdd00' },
  { id: 'banqueta', label: 'Banqueta obstruida', icon: 'report-problem', accent: '#ff4466' },
  { id: 'senal', label: 'Señalización', icon: 'traffic', accent: '#ffdd00' },
  { id: 'elevador', label: 'Elevador fuera', icon: 'elevator', accent: '#00fbfb' },
  { id: 'pendiente', label: 'Pendiente pronunciada', icon: 'terrain', accent: '#60ff99' },
  { id: 'vehiculo', label: 'Vehículo estacionado', icon: 'directions-car', accent: '#ff4a8e' },
  { id: 'otro', label: 'Otro', icon: 'more-horiz', accent: '#00dddd' },
];
