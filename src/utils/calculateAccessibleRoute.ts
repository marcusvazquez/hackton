import { HAZARD_ZONES, LatLng, RouteCriticalMarker } from '../data/routes';
import {
  AdaptiveRoutePath,
  DisabilityProfile,
  personTypeToDisabilityProfile,
} from '../types/accessibility';
import { calculateAdaptiveRoute } from './routingEngine';

export type MobilityProfile = DisabilityProfile | string;

export type ExpertPrefs = {
  avoid_stairs: boolean;
  min_slope: boolean;
  wide_sidewalk: boolean;
  crowd_avoid: boolean;
};

export type EnvFilters = Record<string, boolean>;

export type RoutePath = AdaptiveRoutePath;

export type AccessibleRouteResult = {
  primary: RoutePath;
  alternative: RoutePath;
  criticalMarkers: RouteCriticalMarker[];
  activeHazardZones: typeof HAZARD_ZONES;
  profile: DisabilityProfile;
};

export type CalculateRouteInput = {
  origin: LatLng;
  destination: LatLng;
  mobilityProfile: MobilityProfile;
  expertPrefs: ExpertPrefs;
  envFilters: EnvFilters;
};

function resolveDisabilityProfile(mobilityProfile: MobilityProfile): DisabilityProfile {
  switch (mobilityProfile) {
    case 'silla_ruedas':
    case 'discapacidad_visual':
    case 'discapacidad_auditiva':
    case 'movilidad_reducida':
      return mobilityProfile;
    case 'wheelchair':
      return 'silla_ruedas';
    case 'visual':
    case 'cane':
      return 'discapacidad_visual';
    case 'hearing':
      return 'discapacidad_auditiva';
    case 'reduced-mobility':
      return 'movilidad_reducida';
    default:
      return personTypeToDisabilityProfile(null);
  }
}

/**
 * Calcula rutas accesibles adaptativas según perfil de discapacidad,
 * preferencias expertas y filtros ambientales activos.
 */
export function calculateAccessibleRoute(input: CalculateRouteInput): AccessibleRouteResult {
  const profile = resolveDisabilityProfile(input.mobilityProfile);
  const envFilters = { ...input.envFilters };

  if (input.expertPrefs.avoid_stairs) {
    envFilters.ramps = true;
  }
  if (input.expertPrefs.wide_sidewalk) {
    envFilters.shade = envFilters.shade ?? false;
  }
  if (input.expertPrefs.crowd_avoid) {
    envFilters.quiet = true;
  }

  const result = calculateAdaptiveRoute({
    origin: input.origin,
    destination: input.destination,
    profile,
    envFilters,
  });

  return {
    ...result,
    profile,
  };
}

export { calculateAdaptiveRoute } from './routingEngine';
export type { DisabilityProfile, AudioGuidanceStep, VisualNavigationAlert } from '../types/accessibility';
