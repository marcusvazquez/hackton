import { Platform } from 'react-native';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeolocationErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unknown';

export class GeolocationError extends Error {
  code: GeolocationErrorCode;

  constructor(code: GeolocationErrorCode, message: string) {
    super(message);
    this.name = 'GeolocationError';
    this.code = code;
  }
}

export function getGeolocationErrorMessage(error: unknown): string {
  if (error instanceof GeolocationError) {
    switch (error.code) {
      case 'unsupported':
        return 'Tu dispositivo o navegador no admite geolocalización.';
      case 'permission_denied':
        return 'Permiso de ubicación denegado. Actívalo en ajustes del navegador o del sistema.';
      case 'position_unavailable':
        return 'No se pudo obtener tu ubicación. Intenta en un lugar con mejor señal GPS.';
      case 'timeout':
        return 'La solicitud de ubicación tardó demasiado. Vuelve a intentarlo.';
      default:
        return 'Ocurrió un error al obtener tu ubicación.';
    }
  }
  if (error instanceof Error) return error.message;
  return 'No se pudo obtener tu ubicación.';
}

function mapWebError(code: number): GeolocationError {
  switch (code) {
    case 1:
      return new GeolocationError(
        'permission_denied',
        'Permiso de ubicación denegado.',
      );
    case 2:
      return new GeolocationError(
        'position_unavailable',
        'Ubicación no disponible.',
      );
    case 3:
      return new GeolocationError('timeout', 'Tiempo de espera agotado.');
    default:
      return new GeolocationError('unknown', 'Error de geolocalización.');
  }
}

function getPositionWeb(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(
        new GeolocationError(
          'unsupported',
          'Geolocalización no disponible en este entorno.',
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => reject(mapWebError(err.code)),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

async function getPositionNative(): Promise<Coordinates> {
  const Location = await import('expo-location');
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new GeolocationError(
      'permission_denied',
      'Permiso de ubicación denegado.',
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

/** Obtiene coordenadas en tiempo real (web: navigator.geolocation; nativo: expo-location). */
export async function getUserCoordinates(): Promise<Coordinates> {
  if (Platform.OS === 'web') {
    return getPositionWeb();
  }
  return getPositionNative();
}
