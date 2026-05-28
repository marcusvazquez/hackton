export type FeedItem = {
  id: string;
  title: string;
  description: string;
  confirmations: number;
  timeAgo: string;
  type: 'barrier' | 'safe';
};

export const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    title: 'Acera rota en Av. Constitución',
    description: 'Bloqueo parcial cerca del cruce con 5ta. Se puede pasar con cuidado.',
    confirmations: 12,
    timeAgo: 'Hace 2 h',
    type: 'barrier',
  },
  {
    id: '2',
    title: 'Ruta segura confirmada — Zona Río',
    description: 'Rampas y cruces accesibles verificados por la comunidad.',
    confirmations: 28,
    timeAgo: 'Hace 5 h',
    type: 'safe',
  },
  {
    id: '3',
    title: 'Rampa cerrada en Macroplaza',
    description: 'Acceso lateral disponible por el estacionamiento norte.',
    confirmations: 7,
    timeAgo: 'Hace 1 d',
    type: 'barrier',
  },
  {
    id: '4',
    title: 'Baño accesible en Plaza Río',
    description: 'Confirmado con espacio amplio y barras de apoyo.',
    confirmations: 15,
    timeAgo: 'Hace 1 d',
    type: 'safe',
  },
  {
    id: '5',
    title: 'Vehículo en banqueta — Centro',
    description: 'Obstruye paso de silla de ruedas. Reportado nuevamente.',
    confirmations: 9,
    timeAgo: 'Hace 2 d',
    type: 'barrier',
  },
];
