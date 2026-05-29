import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_MAP_ZOOM, FLY_TO_ZOOM, TIJUANA_CENTER } from '../constants/map';
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
  flyTo: (coords: LatLng, zoom?: number) => void;
  locateUser: () => Promise<{ address: string; coords: LatLng }>;
  geocodeAndFly: (query: string) => Promise<void>;
  clearLocationError: () => void;
};

const MapLocationContext = createContext<MapLocationContextValue | null>(null);

export function MapLocationProvider({ children }: { children: React.ReactNode }) {
  const [center, setCenter] = useState<LatLng>({
    lat: TIJUANA_CENTER.lat,
    lng: TIJUANA_CENTER.lng,
  });
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const flyTo = useCallback((coords: LatLng, targetZoom = FLY_TO_ZOOM) => {
    setCenter(coords);
    setZoom(targetZoom);
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
  }, []);

  const locateUser = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { latitude, longitude } = await getUserCoordinates();
      const coords = { lat: latitude, lng: longitude };
      const address = await reverseGeocode(latitude, longitude);
      setUserLocation(coords);
      setUserAddress(address);
      flyTo(coords, FLY_TO_ZOOM);
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
      if (query in PLACE_COORDINATES) {
        flyTo(resolvePlaceCoordinates(query), FLY_TO_ZOOM);
        return;
      }

      const result = await forwardGeocode(query);
      if (result) {
        flyTo({ lat: result.lat, lng: result.lng }, FLY_TO_ZOOM);
      } else {
        flyTo(resolvePlaceCoordinates(query), FLY_TO_ZOOM);
      }
    },
    [flyTo],
  );

  const clearLocationError = useCallback(() => setLocationError(null), []);

  const value = useMemo(
    () => ({
      center,
      zoom,
      userLocation,
      userAddress,
      flyTarget: flyTarget
        ? { ...flyTarget, key: flyKey }
        : null,
      locationLoading,
      locationError,
      flyTo,
      locateUser,
      geocodeAndFly,
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
      flyTo,
      locateUser,
      geocodeAndFly,
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
