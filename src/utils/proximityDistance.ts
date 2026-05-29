import type { PersonType } from '../context/AccessibilityContext';
import type { EnvironmentScanResult, HazardLevel } from '../services/environmentVision';

/**
 * Sin bbox ni sensor de profundidad: mapeo inverso de severidad → metros aproximados.
 * none → camino despejado; high → obstáculo muy cercano en el encuadre frontal.
 */
const HAZARD_TO_METERS: Record<HazardLevel, number> = {
  none: 2.5,
  low: 1.5,
  medium: 0.75,
  high: 0.35,
};

/**
 * Estima distancia en metros a partir del análisis de visión (Gemini).
 *
 * 1) Si `estimatedDistanceMeters` viene en la respuesta de la IA, se usa (clamp 0.15–5 m).
 * 2) Si no, se usa el proxy por `hazardLevel` (tabla HAZARD_TO_METERS).
 *
 * Fórmula bbox (no usada hoy; reservada si se integra ML on-device):
 *   fillRatio = max(bbox.width, bbox.height) relativo al viewport (0–1)
 *   distanceMeters ≈ 0.25 / max(fillRatio, 0.05)
 *   Ej.: 5% pantalla → ~5 m; 60% → ~0.42 m
 */
export function estimateDistanceMetersFromScan(result: EnvironmentScanResult): number {
  const fromAi = result.estimatedDistanceMeters;
  if (typeof fromAi === 'number' && Number.isFinite(fromAi)) {
    return Math.min(5, Math.max(0.15, fromAi));
  }

  let meters = HAZARD_TO_METERS[result.hazardLevel];

  if (result.objects.length > 0 && result.hazardLevel === 'none') {
    meters = 1.4;
  }

  return meters;
}

/**
 * Perfiles auditiva/cognitiva: umbral más conservador (vibran un poco antes).
 * visual/motriz: distancia sin ajuste.
 */
export function adjustDistanceForPersonType(meters: number, personType: PersonType): number {
  if (personType === 'auditiva' || personType === 'cognitiva') {
    return Math.max(0.15, meters - 0.25);
  }
  return meters;
}
