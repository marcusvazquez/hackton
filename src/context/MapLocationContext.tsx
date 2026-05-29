import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_MAP_ZOOM, FLY_TO_ZOOM } from '../constants/map';
import {
  DEFAULT_MAP_CENTER,
  resolveTijuanaSearch,
} from '../data/tijuanaRoutesDB';
import { getUserCoordinates, getGeolocationErrorMessage } from '../utils/geolocation';
import {
  forwardGeocode,
  PLACE_COORDINATES,
  resolvePlaceCoordinates,
  reverseGeocode,
} from '../utils/nominatim';

export type LatLng = { lat: number; lng: number };

export type FlyTarget = LatLng & { zoom?: number; key: number };

type MapLocationContextValue = {
  center: LatLng;
  zoom: number;
  userLocation: LatLng | null;
  userAddress: string | null;
  flyTarget: FlyTarget | null;
  locationLoading: boolean;
  locationError: string | null;
  talkbackText: string;
  flyTo: (coords: LatLng, zoom?: number, talkback?: string) => void;
  locateUser: () => Promise<{ address: string; coords: LatLng }>;
  geocodeAndFly: (query: string) => Promise<void>;
  flyToZonaCentroBarrera: () => void;
  clearLocationError: () => void;
};

const MapLocationContext = createContext<MapLocationContextValue | null>(null);

const INITIAL_TALKBACK =
  'Mapa interactivo de ParaTodos cargado. Posicionado en Tijuana, Zona Centro.';

export function MapLocationProvider({ children }: { children: React.ReactNode }) {
  const [center, setCenter] = useState<LatLng>({
    lat: DEFAULT_MAP_CENTER.lat,
    lng: DEFAULT_MAP_CENTER.lng,
  });
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [talkbackText, setTalkbackText] = useState(INITIAL_TALKBACK);

  const flyTo = useCallback(
    (coords: LatLng, targetZoom = FLY_TO_ZOOM, talkback?: string) => {
      setCenter(coords);
      setZoom(targetZoom);
      if (talkback) setTalkbackText(talkback);
      setFlyKey((k) => {
        const next = k + 1;
        setFlyTarget({
          lat: coords.lat,
          lng: coords.lng,
          zoom: targetZoom,
          key: next,
        });
        return next;
      });
    },
    [],
  );

  const locateUser = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { latitude, longitude } = await getUserCoordinates();
      const coords = { lat: latitude, lng: longitude };
      const address = await reverseGeocode(latitude, longitude);
      setUserLocation(coords);
      setUserAddress(address);
      flyTo(
        coords,
        FLY_TO_ZOOM,
        `Ubicación actual detectada: ${address}`,
      );
      return { address, coords };
    } catch (error) {
      const message = getGeolocationErrorMessage(error);
      setLocationError(message);
      throw error;
    } finally {
      setLocationLoading(false);
    }
  }, [flyTo]);

  const geocodeAndFly = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const tijuanaHit = resolveTijuanaSearch(trimmed);
      if (tijuanaHit) {
        flyTo(
          { lat: tijuanaHit.lat, lng: tijuanaHit.lng },
          tijuanaHit.zoom,
          tijuanaHit.talkback,
        );
        return;
      }

      if (trimmed in PLACE_COORDINATES) {
        flyTo(
          resolvePlaceCoordinates(trimmed),
          FLY_TO_ZOOM,
          `Buscando ${trimmed} en Tijuana.`,
        );
        return;
      }

      const result = await forwardGeocode(trimmed);
      if (result) {
        flyTo(
          { lat: result.lat, lng: result.lng },
          FLY_TO_ZOOM,
          `Buscando ${trimmed} en Tijuana. Actualizando coordenadas en el mapa.`,
        );
      } else {
        flyTo(
          resolvePlaceCoordinates(trimmed),
          FLY_TO_ZOOM,
          `Buscando ${trimmed} en Tijuana.`,
        );
      }
    },
    [flyTo],
  );

  const flyToZonaCentroBarrera = useCallback(() => {
    const dest = resolveTijuanaSearch('calle 2da');
    if (dest) {
      flyTo({ lat: dest.lat, lng: dest.lng }, dest.zoom, dest.talkback);
    }
  }, [flyTo]);

  const clearLocationError = useCallback(() => setLocationError(null), []);

  const value = useMemo(
    () => ({
      center,
      zoom,
      userLocation,
      userAddress,
      flyTarget: flyTarget ? { ...flyTarget, key: flyKey } : null,
      locationLoading,
      locationError,
      talkbackText,
      flyTo,
      locateUser,
      geocodeAndFly,
      flyToZonaCentroBarrera,
      clearLocationError,
    }),
    [
      center,
      zoom,
      userLocation,
      userAddress,
      flyTarget,
      flyKey,
      locationLoading,
      locationError,
      talkbackText,
      flyTo,
      locateUser,
      geocodeAndFly,
      flyToZonaCentroBarrera,
      clearLocationError,
    ],
  );

  return (
    <MapLocationContext.Provider value={value}>{children}</MapLocationContext.Provider>
  );
}

export function useMapLocation() {
  const ctx = useContext(MapLocationContext);
  if (!ctx) {
    throw new Error('useMapLocation must be used within MapLocationProvider');
  }
  return ctx;
}
