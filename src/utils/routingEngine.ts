import {
  HAZARD_ZONES,
  LatLng,
  RouteCriticalMarker,
  RouteGraphEdge,
  RouteGraphNode,
  ROUTE_GRAPH_EDGES,
  ROUTE_GRAPH_NODES,
} from '../data/routes';
import type {
  AdaptiveRoutePath,
  AudioGuidanceStep,
  DisabilityProfile,
  RoutingEngineInput,
  StreetSegment,
  VisualNavigationAlert,
} from '../types/accessibility';

export type AdaptiveRouteResult = {
  primary: AdaptiveRoutePath;
  alternative: AdaptiveRoutePath;
  criticalMarkers: RouteCriticalMarker[];
  activeHazardZones: typeof HAZARD_ZONES;
};

const INFINITE_COST = Number.POSITIVE_INFINITY;
const WHEELCHAIR_MAX_SLOPE = 6;
const WIDE_SIDEWALK_MIN_M = 1.2;
const EXTRA_WIDE_SIDEWALK_M = 1.8;
const REDUCED_MOBILITY_STEEP_SLOPE = 8;
const REDUCED_MOBILITY_LONG_SLOPE_M = 150;

function toStreetSegment(edge: RouteGraphEdge): StreetSegment {
  return {
    ...edge,
    hasRampAlternative: edge.hasRampAlternative ?? edge.tags.includes('rampa'),
    hasTotalObstruction:
      edge.hasTotalObstruction ??
      edge.tags.includes('obstruccion_total'),
    hasRestFurniture:
      edge.hasRestFurniture ?? edge.tags.includes('descanso'),
    hasHandrail: edge.hasHandrail ?? edge.tags.includes('pasamanos'),
  };
}

function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNode(coord: LatLng, nodes: RouteGraphNode[]): RouteGraphNode {
  return nodes.reduce((best, node) => {
    const d = haversineM(coord, node);
    const bestD = haversineM(coord, best);
    return d < bestD ? node : best;
  });
}

function buildAdjacency(edges: RouteGraphEdge[]): Map<string, RouteGraphEdge[]> {
  const adj = new Map<string, RouteGraphEdge[]>();
  for (const edge of edges) {
    for (const [from, to] of [
      [edge.from, edge.to],
      [edge.to, edge.from],
    ] as const) {
      const list = adj.get(from) ?? [];
      list.push({ ...edge, from, to: to as string });
      adj.set(from, list);
    }
  }
  return adj;
}

function hasTag(segment: StreetSegment, tag: string): boolean {
  return segment.tags.includes(tag as StreetSegment['tags'][number]);
}

function isExtraWideSidewalk(segment: StreetSegment): boolean {
  return hasTag(segment, 'acera_amplia') || segment.sidewalkWidthM >= EXTRA_WIDE_SIDEWALK_M;
}

function hasStairsWithoutRamp(segment: StreetSegment): boolean {
  const hasStairs = hasTag(segment, 'escaleras') || hasTag(segment, 'escaleras_largas');
  if (!hasStairs) return false;
  return !segment.hasRampAlternative && !hasTag(segment, 'rampa');
}

function isHighTrafficCrossingWithoutAudible(segment: StreetSegment): boolean {
  return hasTag(segment, 'interseccion_compleja') && !hasTag(segment, 'cruce_sonoro');
}

function isProlongedSteepSlope(segment: StreetSegment): boolean {
  return (
    (hasTag(segment, 'pendiente_alta') || segment.slopePercent > REDUCED_MOBILITY_STEEP_SLOPE) &&
    segment.lengthM >= REDUCED_MOBILITY_LONG_SLOPE_M
  );
}

function isLongStairsWithoutHandrail(segment: StreetSegment): boolean {
  return hasTag(segment, 'escaleras_largas') && !segment.hasHandrail;
}

/** Exclusiones absolutas (costo infinito) por perfil de discapacidad. */
export function isSegmentExcluded(
  segment: StreetSegment,
  profile: DisabilityProfile,
): boolean {
  switch (profile) {
    case 'silla_ruedas':
      if (hasStairsWithoutRamp(segment)) return true;
      if (segment.slopePercent > WHEELCHAIR_MAX_SLOPE) return true;
      if (segment.sidewalkWidthM < WIDE_SIDEWALK_MIN_M) return true;
      if (segment.hasTotalObstruction) return true;
      return false;

    case 'discapacidad_visual':
      if (isHighTrafficCrossingWithoutAudible(segment)) return true;
      if (hasTag(segment, 'obra_sin_confinamiento')) return true;
      return false;

    case 'discapacidad_auditiva':
      return false;

    case 'movilidad_reducida':
      if (isLongStairsWithoutHandrail(segment)) return true;
      if (isProlongedSteepSlope(segment)) return true;
      return false;

    default:
      return false;
  }
}

/** Modificadores de costo por perfil (menor = más prioritario). */
export function segmentCost(
  segment: StreetSegment,
  profile: DisabilityProfile,
  mode: 'accessible' | 'commercial',
  envFilters: Record<string, boolean>,
): number {
  if (mode === 'accessible' && isSegmentExcluded(segment, profile)) {
    return INFINITE_COST;
  }

  let cost = segment.lengthM;

  if (mode === 'commercial') {
    if (hasTag(segment, 'escaleras')) cost *= 0.85;
    return cost;
  }

  switch (profile) {
    case 'silla_ruedas':
      if (hasTag(segment, 'rampa') || segment.hasRampAlternative) cost *= 0.5;
      if (isExtraWideSidewalk(segment)) cost *= 0.8;
      break;

    case 'discapacidad_visual':
      if (hasTag(segment, 'pavimento_tactil')) cost *= 0.4;
      if (hasTag(segment, 'interseccion_compleja')) cost *= 1.8;
      else cost *= 0.95;
      break;

    case 'discapacidad_auditiva':
      if (
        hasTag(segment, 'senalizacion_visual') ||
        hasTag(segment, 'paso_cebra') ||
        hasTag(segment, 'cruce_sonoro')
      ) {
        cost *= 0.75;
      }
      break;

    case 'movilidad_reducida':
      cost = segment.lengthM;
      if (segment.hasRestFurniture || hasTag(segment, 'descanso')) cost *= 0.85;
      break;

    default:
      break;
  }

  if (envFilters.lighting && hasTag(segment, 'oscuro')) cost *= 25;
  if (envFilters.quiet && hasTag(segment, 'inundable')) cost *= 30;

  return cost;
}

type DijkstraResult = {
  path: string[];
  weightedCost: number;
  edges: StreetSegment[];
};

function dijkstra(
  startId: string,
  endId: string,
  profile: DisabilityProfile,
  mode: 'accessible' | 'commercial',
  envFilters: Record<string, boolean>,
): DijkstraResult | null {
  const adj = buildAdjacency(ROUTE_GRAPH_EDGES);
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: RouteGraphEdge } | null>();
  const visited = new Set<string>();

  for (const node of ROUTE_GRAPH_NODES) {
    dist.set(node.id, INFINITE_COST);
    prev.set(node.id, null);
  }
  dist.set(startId, 0);

  while (visited.size < ROUTE_GRAPH_NODES.length) {
    let u: string | null = null;
    let minD = INFINITE_COST;
    for (const [id, d] of dist) {
      if (!visited.has(id) && d < minD) {
        minD = d;
        u = id;
      }
    }
    if (u === null || minD === INFINITE_COST) break;
    if (u === endId) break;
    visited.add(u);

    for (const edge of adj.get(u) ?? []) {
      const segment = toStreetSegment(edge);
      const edgeCost = segmentCost(segment, profile, mode, envFilters);
      if (edgeCost === INFINITE_COST) continue;

      const alt = (dist.get(u) ?? INFINITE_COST) + edgeCost;
      if (alt < (dist.get(edge.to) ?? INFINITE_COST)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, { nodeId: u, edge });
      }
    }
  }

  if ((dist.get(endId) ?? INFINITE_COST) === INFINITE_COST) return null;

  const path: string[] = [];
  const edges: StreetSegment[] = [];
  let cur: string | null = endId;

  while (cur) {
    path.unshift(cur);
    const step = prev.get(cur);
    if (step?.edge) {
      edges.unshift(toStreetSegment(step.edge));
    }
    cur = step?.nodeId ?? null;
  }

  return { path, weightedCost: dist.get(endId) ?? 0, edges };
}

function pathToCoordinates(
  nodeIds: string[],
  origin: LatLng,
  destination: LatLng,
): LatLng[] {
  const coords: LatLng[] = [origin];
  for (const id of nodeIds) {
    const node = ROUTE_GRAPH_NODES.find((n) => n.id === id);
    if (node) coords.push({ lat: node.lat, lng: node.lng });
  }
  coords.push(destination);
  return coords;
}

function totalPathDistance(coords: LatLng[]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i += 1) {
    total += haversineM(coords[i], coords[i + 1]);
  }
  return total;
}

function computeAccessibilityScore(
  edges: StreetSegment[],
  profile: DisabilityProfile,
  envFilters: Record<string, boolean>,
): number {
  let score = 100;

  for (const segment of edges) {
    if (isSegmentExcluded(segment, profile)) score -= 40;
    if (hasTag(segment, 'rampa')) score += 5;
    if (hasTag(segment, 'pavimento_tactil')) score += 6;
    if (hasTag(segment, 'cruce_sonoro')) score += 5;
    if (hasTag(segment, 'senalizacion_visual')) score += 4;
    if (hasTag(segment, 'descanso')) score += 3;
    if (hasTag(segment, 'escaleras') || hasTag(segment, 'escaleras_largas')) score -= 20;
    if (hasTag(segment, 'ancho_insuficiente') || segment.hasTotalObstruction) score -= 15;
    if (segment.slopePercent > WHEELCHAIR_MAX_SLOPE) score -= 12;
    if (hasTag(segment, 'obra_sin_confinamiento')) score -= 18;
    if (envFilters.lighting && hasTag(segment, 'oscuro')) score -= 20;
    if (envFilters.quiet && hasTag(segment, 'inundable')) score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

function buildRouteTags(
  edges: StreetSegment[],
  mode: 'accessible' | 'commercial',
  profile: DisabilityProfile,
): string[] {
  const tags = new Set<string>();

  for (const segment of edges) {
    if (hasTag(segment, 'rampa')) tags.add('Rampas homologadas');
    if (hasTag(segment, 'pavimento_tactil')) tags.add('Pavimento táctil');
    if (hasTag(segment, 'cruce_sonoro')) tags.add('Cruces sonoros');
    if (hasTag(segment, 'senalizacion_visual')) tags.add('Señalización visual');
    if (hasTag(segment, 'descanso')) tags.add('Descansos frecuentes');
    if (hasTag(segment, 'acera_amplia')) tags.add('Acera amplia');
    if (hasTag(segment, 'escaleras')) tags.add('Escaleras');
    if (hasTag(segment, 'inundable')) tags.add('Zona inundable');
    if (hasTag(segment, 'oscuro')) tags.add('Tramo oscuro');
  }

  if (mode === 'accessible') {
    tags.add(`Ruta ${profile.replace(/_/g, ' ')}`);
  } else {
    tags.add('Ruta comercial');
  }

  return Array.from(tags).slice(0, 5);
}

function describeSegment(segment: StreetSegment): string {
  if (hasTag(segment, 'rampa')) return 'Continúa por rampa homologada';
  if (hasTag(segment, 'pavimento_tactil')) return 'Sigue el pavimento táctil continuo';
  if (hasTag(segment, 'cruce_sonoro')) return 'Cruce peatonal con señal sonora activa';
  if (hasTag(segment, 'paso_cebra')) return 'Cruza en paso de cebra señalizado';
  if (hasTag(segment, 'descanso')) return 'Punto de descanso disponible a la izquierda';
  if (hasTag(segment, 'interseccion_compleja')) return 'Atención: intersección compleja adelante';
  return `Avanza ${Math.round(segment.lengthM)} metros por acera`;
}

function buildAudioGuidance(
  path: string[],
  edges: StreetSegment[],
): AudioGuidanceStep[] {
  return edges.map((segment, index) => ({
    stepIndex: index,
    nodeId: path[index + 1] ?? path[path.length - 1],
    message: describeSegment(segment),
    distanceM: segment.lengthM,
    priority: hasTag(segment, 'interseccion_compleja') || hasTag(segment, 'obra_sin_confinamiento')
      ? 'high'
      : 'normal',
  }));
}

function buildVisualAlerts(
  path: string[],
  edges: StreetSegment[],
): VisualNavigationAlert[] {
  const alerts: VisualNavigationAlert[] = [];

  edges.forEach((segment, index) => {
    const nodeId = path[index + 1] ?? path[path.length - 1];

    if (
      hasTag(segment, 'paso_cebra') ||
      hasTag(segment, 'cruce_sonoro') ||
      hasTag(segment, 'interseccion_compleja')
    ) {
      alerts.push({
        stepIndex: index,
        nodeId,
        type: 'crossing',
        subtitle: hasTag(segment, 'cruce_sonoro')
          ? 'CRUCE · Semáforo con señal visual'
          : 'CRUCE · Paso de cebra señalizado',
        hapticPattern: 'heavy',
        visualAlerts: true,
      });
    }

    if (hasTag(segment, 'senalizacion_visual')) {
      alerts.push({
        stepIndex: index,
        nodeId,
        type: 'direction_change',
        subtitle: `SIGUE RECTO · ${Math.round(segment.lengthM)} m con señalización clara`,
        hapticPattern: 'pulse',
        visualAlerts: true,
      });
    }

    if (hasTag(segment, 'inundable') || hasTag(segment, 'oscuro')) {
      alerts.push({
        stepIndex: index,
        nodeId,
        type: 'hazard',
        subtitle: 'ALERTA · Tramo con riesgo ambiental',
        hapticPattern: 'medium',
        visualAlerts: true,
      });
    }

    if (index > 0 && path[index] !== path[index - 1]) {
      alerts.push({
        stepIndex: index,
        nodeId,
        type: 'turn',
        subtitle: 'CAMBIO DE DIRECCIÓN · Revisa señalización visual',
        hapticPattern: 'light',
        visualAlerts: true,
      });
    }
  });

  return alerts;
}

function buildCriticalMarkers(path: string[]): RouteCriticalMarker[] {
  const markers: RouteCriticalMarker[] = [];
  const seen = new Set<string>();

  for (const id of path) {
    const node = ROUTE_GRAPH_NODES.find((n) => n.id === id);
    if (!node || seen.has(id)) continue;
    seen.add(id);

    if (node.tags.includes('rampa')) {
      markers.push({
        id: `rampa-${id}`,
        lat: node.lat,
        lng: node.lng,
        icon: 'accessible',
        title: 'Rampa confirmada',
        description: 'Tramo con rampa homologada y pendiente ≤ 6%.',
      });
    }
    if (
      node.tags.some((t) =>
        [
          'escaleras',
          'escaleras_largas',
          'altos_desniveles',
          'ancho_insuficiente',
          'interseccion_compleja',
          'obra_sin_confinamiento',
        ].includes(t),
      )
    ) {
      markers.push({
        id: `warn-${id}`,
        lat: node.lat + 0.00015,
        lng: node.lng + 0.00015,
        icon: 'warning',
        title: 'Infraestructura deficiente',
        description: 'Punto con barreras reportadas en el trayecto alternativo.',
      });
    }
    if (node.tags.includes('inundable') || node.tags.includes('oscuro')) {
      markers.push({
        id: `bolt-${id}`,
        lat: node.lat - 0.00012,
        lng: node.lng - 0.00012,
        icon: 'bolt',
        title: 'Alerta ambiental',
        description: 'Zona con riesgo de encharcamiento o falta de luminarias.',
      });
    }
    if (node.tags.includes('descanso')) {
      markers.push({
        id: `rest-${id}`,
        lat: node.lat + 0.00008,
        lng: node.lng - 0.00008,
        icon: 'accessible',
        title: 'Zona de descanso',
        description: 'Mobiliario urbano para pausa cada ~100 m.',
      });
    }
  }

  return markers;
}

function buildRoutePath(
  result: DijkstraResult,
  input: RoutingEngineInput,
  mode: 'accessible' | 'commercial',
): AdaptiveRoutePath {
  const coordinates = pathToCoordinates(result.path, input.origin, input.destination);
  const distanceM = totalPathDistance(coordinates);
  const walkingSpeedMpm = mode === 'accessible' ? 75 : 90;

  const routePath: AdaptiveRoutePath = {
    id: mode,
    coordinates,
    distanceM,
    durationMin: Math.max(1, Math.round(distanceM / walkingSpeedMpm)),
    accessibilityScore: computeAccessibilityScore(result.edges, input.profile, input.envFilters),
    tags: buildRouteTags(result.edges, mode, input.profile),
    nodePath: result.path,
  };

  if (input.profile === 'discapacidad_visual') {
    routePath.audioGuidance = buildAudioGuidance(result.path, result.edges);
  }

  if (input.profile === 'discapacidad_auditiva') {
    routePath.visualAlerts = buildVisualAlerts(result.path, result.edges);
  }

  return routePath;
}

/**
 * Motor de enrutamiento adaptativo por tipo de discapacidad.
 * Evalúa la matriz de pesos del grafo con exclusiones absolutas y
 * modificadores de prioridad según el perfil activo.
 */
export function calculateAdaptiveRoute(input: RoutingEngineInput): AdaptiveRouteResult {
  const startNode = nearestNode(input.origin, ROUTE_GRAPH_NODES);
  const endNode = nearestNode(input.destination, ROUTE_GRAPH_NODES);

  const accessibleResult =
    dijkstra(startNode.id, endNode.id, input.profile, 'accessible', input.envFilters) ??
    dijkstra(startNode.id, endNode.id, input.profile, 'commercial', input.envFilters);

  const commercialResult =
    dijkstra(startNode.id, endNode.id, input.profile, 'commercial', input.envFilters) ??
    accessibleResult;

  const accessiblePath = accessibleResult ?? {
    path: [startNode.id, endNode.id],
    weightedCost: 0,
    edges: [],
  };
  const commercialPath = commercialResult ?? accessiblePath;

  const activeHazardZones = HAZARD_ZONES.filter(
    (zone) => input.envFilters[zone.envFilterId] === true,
  );

  return {
    primary: buildRoutePath(accessiblePath, input, 'accessible'),
    alternative: buildRoutePath(commercialPath, input, 'commercial'),
    criticalMarkers: buildCriticalMarkers(
      Array.from(new Set([...accessiblePath.path, ...commercialPath.path])),
    ),
    activeHazardZones,
  };
}

export { toStreetSegment, haversineM, nearestNode };
