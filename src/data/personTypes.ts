import type { PersonType } from '../context/AccessibilityContext';

export type PersonTypeId = Exclude<PersonType, null>;

export type PersonTypeOption = {
  id: PersonTypeId;
  title: string;
  description: string;
  icon: string;
};

export const PERSON_TYPES: PersonTypeOption[] = [
  {
    id: 'visual',
    title: 'Discapacidad visual',
    description: 'Guía por voz, alto contraste y exploración táctil.',
    icon: 'visibility',
  },
  {
    id: 'motriz',
    title: 'Discapacidad motriz',
    description: 'Rutas con rampas, botones grandes y aceras amplias.',
    icon: 'accessible',
  },
  {
    id: 'auditiva',
    title: 'Discapacidad auditiva',
    description: 'Alertas visuales, subtítulos y vibración.',
    icon: 'hearing-disabled',
  },
  {
    id: 'cognitiva',
    title: 'Discapacidad cognitiva',
    description: 'Instrucciones simples, menos estímulos y rutas claras.',
    icon: 'psychology',
  },
];

export function getPersonTypeLabel(id: PersonType | null): string {
  if (!id) return 'Sin seleccionar';
  return PERSON_TYPES.find((t) => t.id === id)?.title ?? 'Sin seleccionar';
}

export function getPersonTypeDescription(id: PersonType | null): string {
  if (!id) return 'Elige un perfil para personalizar rutas, alertas y la interfaz.';
  return PERSON_TYPES.find((t) => t.id === id)?.description ?? '';
}

export function getVoiceHint(id: PersonType | null): string {
  switch (id) {
    case 'visual':
      return '"En 20 metros, rampa accesible a la derecha"';
    case 'motriz':
      return '"En 30 metros, banco de descanso a la izquierda"';
    case 'auditiva':
      return '"Próximo cruce: semáforo con señal visual activa"';
    case 'cognitiva':
      return '"Sigue recto dos cuadras, luego gira a la derecha"';
    default:
      return '"En 20 metros, rampa accesible a la derecha"';
  }
}
