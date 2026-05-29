export type PersonTypeId =
  | 'wheelchair'
  | 'visual'
  | 'hearing'
  | 'reduced-mobility'
  | 'cognitive'
  | 'unspecified';

export type PersonTypeOption = {
  id: PersonTypeId;
  title: string;
  description: string;
  icon: string;
};

export const PERSON_TYPES: PersonTypeOption[] = [
  {
    id: 'wheelchair',
    title: 'Silla de ruedas',
    description: 'Rutas con rampas, pendientes suaves y aceras amplias.',
    icon: 'accessible',
  },
  {
    id: 'visual',
    title: 'Discapacidad visual',
    description: 'Guía por voz, alto contraste y señales táctiles.',
    icon: 'visibility',
  },
  {
    id: 'hearing',
    title: 'Discapacidad auditiva',
    description: 'Alertas visuales y subtítulos en instrucciones.',
    icon: 'hearing-disabled',
  },
  {
    id: 'reduced-mobility',
    title: 'Movilidad reducida',
    description: 'Menos escalones, descansos frecuentes y tramos cortos.',
    icon: 'directions-walk',
  },
  {
    id: 'cognitive',
    title: 'Neurodiversidad',
    description: 'Instrucciones simples, menos estímulos y rutas claras.',
    icon: 'psychology',
  },
  {
    id: 'unspecified',
    title: 'Prefiero no decir',
    description: 'Usar configuración general de accesibilidad.',
    icon: 'person',
  },
];

export function getPersonTypeLabel(id: PersonTypeId | null): string {
  if (!id) return 'Sin seleccionar';
  return PERSON_TYPES.find((t) => t.id === id)?.title ?? 'Sin seleccionar';
}

export function getVoiceHint(id: PersonTypeId | null): string {
  switch (id) {
    case 'wheelchair':
      return '"En 20 metros, rampa accesible a la derecha"';
    case 'visual':
      return '"En 20 metros, rampa accesible a la derecha"';
    case 'hearing':
      return '"Próximo cruce: semáforo con señal sonora activa"';
    case 'reduced-mobility':
      return '"En 30 metros, banco de descanso a la izquierda"';
    case 'cognitive':
      return '"Sigue recto dos cuadras, luego gira a la derecha"';
    default:
      return '"En 20 metros, rampa accesible a la derecha"';
  }
}
