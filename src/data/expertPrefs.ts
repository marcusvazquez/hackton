export type ExpertPref = {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
};

export const EXPERT_PREFS: ExpertPref[] = [
  {
    id: 'avoid_stairs',
    label: 'Evitar escaleras',
    description: 'Priorizar rutas con rampas o elevadores.',
    defaultOn: true,
  },
  {
    id: 'min_slope',
    label: 'Pendiente mínima',
    description: 'Penalizar tramos con inclinación mayor al 5%.',
    defaultOn: true,
  },
  {
    id: 'wide_sidewalk',
    label: 'Acera amplia',
    description: 'Preferir aceras de al menos 1.2 m.',
    defaultOn: false,
  },
  {
    id: 'proactive_alerts',
    label: 'Alertas proactivas',
    description: 'Avisar antes de barreras conocidas en la ruta.',
    defaultOn: true,
  },
  {
    id: 'crowd_avoid',
    label: 'Evitar zonas concurridas',
    description: 'Rutas alternativas en horas pico.',
    defaultOn: false,
  },
];
