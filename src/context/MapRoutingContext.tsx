import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ENV_FILTERS } from '../data/routes';
import { useAccessibility } from './AccessibilityContext';
import { LatLng, useMapLocation } from './MapLocationContext';
import { useExpertPrefs } from '../hooks/useExpertPrefs';
import {
  AccessibleRouteResult,
  calculateAccessibleRoute,
  ExpertPrefs,
} from '../utils/calculateAccessibleRoute';
import { forwardGeocode, PLACE_COORDINATES, resolvePlaceCoordinates } from '../utils/nominatim';
import { TIJUANA_CENTER } from '../constants/map';
import {
  DisabilityProfile,
  DISABILITY_PROFILE_LABELS,
  personTypeToDisabilityProfile,
} from '../types/accessibility';

type MapRoutingContextValue = {
  disabilityProfile: DisabilityProfile;
  setDisabilityProfile: (profile: DisabilityProfile) => void;
  /** @deprecated Usar disabilityProfile */
  mobilityProfile: DisabilityProfile;
  /** @deprecated Usar setDisabilityProfile */
  setMobilityProfile: (profile: DisabilityProfile) => void;
  envFilters: Record<string, boolean>;
  toggleEnvFilter: (id: string) => void;
  setEnvFilter: (id: string, value: boolean) => void;
  expertPrefs: ExpertPrefs;
  destination: LatLng | null;
  destinationLabel: string | null;
  routeResult: AccessibleRouteResult | null;
  isCalculating: boolean;
  calculateRouteTo: (query: string) => Promise<void>;
  calculateRouteToCoords: (coords: LatLng, label?: string) => void;
  clearRoute: () => void;
};

const MapRoutingContext = createContext<MapRoutingContextValue | null>(null);

export function MapRoutingProvider({ children }: { children: React.ReactNode }) {
  const { personType } = useAccessibility();
  const { userLocation } = useMapLocation();
  const { prefs } = useExpertPrefs();

  const [disabilityProfile, setDisabilityProfile] = useState<DisabilityProfile>('silla_ruedas');
  const [envFilters, setEnvFilters] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ENV_FILTERS.map((f) => [f.id, false])),
  );
  const [destination, setDestination] = useState<LatLng | null>(null);
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<AccessibleRouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setDisabilityProfile(personTypeToDisabilityProfile(personType));
  }, [personType]);

  const expertPrefs: ExpertPrefs = useMemo(
    () => ({
      avoid_stairs: prefs.avoid_stairs ?? true,
      min_slope: prefs.min_slope ?? true,
      wide_sidewalk: prefs.wide_sidewalk ?? false,
      crowd_avoid: prefs.crowd_avoid ?? false,
    }),
    [prefs],
  );

  const runCalculation = useCallback(
    (coords: LatLng, label: string, updateDestination = true) => {
      const origin = userLocation ?? { lat: TIJUANA_CENTER.lat, lng: TIJUANA_CENTER.lng };
      const result = calculateAccessibleRoute({
        origin,
        destination: coords,
        mobilityProfile: disabilityProfile,
        expertPrefs,
        envFilters,
      });
      if (updateDestination) {
        setDestination(coords);
        setDestinationLabel(label);
      }
      setRouteResult(result);
    },
    [userLocation, disabilityProfile, expertPrefs, envFilters],
  );

  const calculateRouteToCoords = useCallback(
    (coords: LatLng, label = 'Destino') => {
      setIsCalculating(true);
      try {
        runCalculation(coords, label, true);
      } finally {
        setIsCalculating(false);
      }
    },
    [runCalculation],
  );

  const calculateRouteTo = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setIsCalculating(true);
      try {
        if (trimmed in PLACE_COORDINATES) {
          runCalculation(resolvePlaceCoordinates(trimmed), trimmed, true);
          return;
        }

        const geocoded = await forwardGeocode(trimmed);
        if (geocoded) {
          runCalculation({ lat: geocoded.lat, lng: geocoded.lng }, geocoded.label, true);
        } else {
          runCalculation(resolvePlaceCoordinates(trimmed), trimmed, true);
        }
      } finally {
        setIsCalculating(false);
      }
    },
    [runCalculation],
  );

  const toggleEnvFilter = useCallback((id: string) => {
    setEnvFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setEnvFilter = useCallback((id: string, value: boolean) => {
    setEnvFilters((prev) => ({ ...prev, [id]: value }));
  }, []);

  const clearRoute = useCallback(() => {
    setDestination(null);
    setDestinationLabel(null);
    setRouteResult(null);
  }, []);

  useEffect(() => {
    if (!destination) return;
    runCalculation(destination, destinationLabel ?? 'Destino', false);
  }, [disabilityProfile, expertPrefs, envFilters, userLocation, destination, destinationLabel, runCalculation]);

  const value = useMemo(
    () => ({
      disabilityProfile,
      setDisabilityProfile,
      mobilityProfile: disabilityProfile,
      setMobilityProfile: setDisabilityProfile,
      envFilters,
      toggleEnvFilter,
      setEnvFilter,
      expertPrefs,
      destination,
      destinationLabel,
      routeResult,
      isCalculating,
      calculateRouteTo,
      calculateRouteToCoords,
      clearRoute,
    }),
    [
      disabilityProfile,
      envFilters,
      toggleEnvFilter,
      setEnvFilter,
      expertPrefs,
      destination,
      destinationLabel,
      routeResult,
      isCalculating,
      calculateRouteTo,
      calculateRouteToCoords,
      clearRoute,
    ],
  );

  return (
    <MapRoutingContext.Provider value={value}>{children}</MapRoutingContext.Provider>
  );
}

export function useMapRouting() {
  const ctx = useContext(MapRoutingContext);
  if (!ctx) {
    throw new Error('useMapRouting must be used within MapRoutingProvider');
  }
  return ctx;
}

export { DISABILITY_PROFILE_LABELS };
