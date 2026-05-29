export type FeedItem = {
  id: string;
  title: string;
  description: string;
  confirmations: number;
  timeAgo: string;
  type: 'barrier' | 'safe';
  author?: string;
  location?: string;
  tags?: string[];
  offline?: boolean;
  status?: 'reportado' | 'en_revision' | 'solucionado';
  imageUrl?: string;
  zoneName?: string;
};

export const FEED_ITEMS: FeedItem[] = [
  {
    id: '1',
    title: 'Acera rota en Av. Constitución',
    description: 'Bloqueo parcial cerca del cruce con 5ta. Se puede pasar con cuidado.',
    confirmations: 12,
    timeAgo: 'Hace 2 h',
    type: 'barrier',
    author: '@maria_tj',
    location: 'Centro',
    tags: ['Acera', 'Parcial'],
    offline: true,
    status: 'reportado',
    zoneName: 'ZONA RÍO',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200',
  },
  {
    id: '2',
    title: 'Ruta segura confirmada — Zona Río',
    description: 'Rampas y cruces accesibles verificados por la comunidad.',
    confirmations: 28,
    timeAgo: 'Hace 5 h',
    type: 'safe',
    author: '@ruta_libre',
    location: 'Zona Río',
    tags: ['Verificado', 'Rampas'],
    status: 'en_revision',
    zoneName: 'ZONA RÍO',
    imageUrl: 'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=200',
  },
  {
    id: '3',
    title: 'Rampa cerrada en Macroplaza',
    description: 'Acceso lateral disponible por el estacionamiento norte.',
    confirmations: 7,
    timeAgo: 'Hace 1 d',
    type: 'barrier',
    status: 'solucionado',
    zoneName: 'OTAY CENTENARIO',
    imageUrl: 'https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?w=200',
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
