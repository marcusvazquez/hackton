import type { LatLng, RouteGraphEdge, SegmentTag } from '../data/routes';
import type { PersonTypeId } from '../data/personTypes';

/** Perfiles de discapacidad soportados por el motor de enrutamiento adaptativo. */
export type DisabilityProfile =
  | 'silla_ruedas'
  | 'discapacidad_visual'
  | 'discapacidad_auditiva'
  | 'movilidad_reducida';

export const DISABILITY_PROFILES: readonly DisabilityProfile[] = [
  'silla_ruedas',
  'discapacidad_visual',
  'discapacidad_auditiva',
  'movilidad_reducida',
] as const;

export const DISABILITY_PROFILE_LABELS: Record<DisabilityProfile, string> = {
  silla_ruedas: 'Silla de ruedas',
  discapacidad_visual: 'Discapacidad visual',
  discapacidad_auditiva: 'Discapacidad auditiva',
  movilidad_reducida: 'Movilidad reducida',
};

/** Segmento de calle en el grafo peatonal con metadatos de accesibilidad. */
export type StreetSegment = RouteGraphEdge & {
  tags: SegmentTag[];
  /** Indica si existe rampa homologada como alternativa en el mismo tramo. */
  hasRampAlternative?: boolean;
  /** Reportes activos de obstrucción total en acera. */
  hasTotalObstruction?: boolean;
  /** Mobiliario urbano de descanso (banca, plaza, resguardo). */
  hasRestFurniture?: boolean;
  /** Tramo con pasamanos continuo. */
  hasHandrail?: boolean;
};

export type AudioGuidanceStep = {
  stepIndex: number;
  nodeId: string;
  message: string;
  distanceM: number;
  priority: 'normal' | 'high';
};

export type VisualNavigationAlert = {
  stepIndex: number;
  nodeId: string;
  type: 'turn' | 'crossing' | 'hazard' | 'direction_change';
  subtitle: string;
  hapticPattern: 'light' | 'medium' | 'heavy' | 'pulse';
  visualAlerts: true;
};

export type AdaptiveRoutePath = {
  id: 'accessible' | 'commercial';
  coordinates: LatLng[];
  distanceM: number;
  durationMin: number;
  accessibilityScore: number;
  tags: string[];
  nodePath: string[];
  audioGuidance?: AudioGuidanceStep[];
  visualAlerts?: VisualNavigationAlert[];
};

export type RoutingEngineInput = {
  origin: LatLng;
  destination: LatLng;
  profile: DisabilityProfile;
  envFilters: Record<string, boolean>;
};

export function isDisabilityProfile(value: string): value is DisabilityProfile {
  return (DISABILITY_PROFILES as readonly string[]).includes(value);
}

export function personTypeToDisabilityProfile(
  personType: PersonTypeId | null,
): DisabilityProfile {
  switch (personType) {
    case 'motriz':
      return 'silla_ruedas';
    case 'visual':
      return 'discapacidad_visual';
    case 'auditiva':
      return 'discapacidad_auditiva';
    case 'cognitiva':
      return 'movilidad_reducida';
    default:
      return 'silla_ruedas';
  }
}

export function disabilityProfileLabel(profile: DisabilityProfile): string {
  return DISABILITY_PROFILE_LABELS[profile];
}
