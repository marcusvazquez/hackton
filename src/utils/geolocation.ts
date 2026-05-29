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
        return 'Permiso de ubicación denegado. Haz clic en el candado de la barra de direcciones y permite "Ubicación" para localhost.';
      case 'position_unavailable':
        return Platform.OS === 'web'
          ? 'No se detectó ubicación. En PC: activa Ubicación en Windows (Configuración → Privacidad → Ubicación) y recarga la página. También puedes escribir tu dirección manualmente.'
          : 'No se pudo obtener tu ubicación. Activa el GPS o escribe tu dirección manualmente.';
      case 'timeout':
        return 'La solicitud tardó demasiado. Comprueba tu conexión e inténtalo de nuevo.';
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

type WebGeoOptions = {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
};

function tryGetPositionWeb(options: WebGeoOptions): Promise<Coordinates> {
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
      options,
    );
  });
}

/**
 * Web: intenta GPS preciso y, si falla, ubicación aproximada (Wi‑Fi/IP).
 * En laptop/PC sin GPS el modo preciso suele devolver error 2.
 */
async function getPositionWeb(): Promise<Coordinates> {
  try {
    return await tryGetPositionWeb({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
    });
  } catch (firstError) {
    if (
      firstError instanceof GeolocationError &&
      firstError.code === 'permission_denied'
    ) {
      throw firstError;
    }

    try {
      return await tryGetPositionWeb({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 300000,
      });
    } catch (secondError) {
      throw secondError instanceof GeolocationError
        ? secondError
        : firstError;
    }
  }
}

async function getPositionNative(): Promise<Coordinates> {
  const Location = await import('expo-location');

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new GeolocationError(
      'position_unavailable',
      'Servicios de ubicación desactivados en el dispositivo.',
    );
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new GeolocationError(
      'permission_denied',
      'Permiso de ubicación denegado.',
    );
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }
}

/** Obtiene coordenadas en tiempo real (web: navigator.geolocation; nativo: expo-location). */
export async function getUserCoordinates(): Promise<Coordinates> {
  if (Platform.OS === 'web') {
    return getPositionWeb();
  }
  return getPositionNative();
}
