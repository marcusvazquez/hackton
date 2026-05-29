import { Platform } from 'react-native';

/** Navegadores solo permiten geolocalización en contexto seguro (HTTPS o localhost). */
export function isGeolocationSecureContext(): boolean {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined') return true;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/** Desarrollo local sin TLS (solo mismo PC; sin GPS en LAN). */
export const WEB_LOCAL_DEV_URL = 'http://localhost:8082';

/** HTTPS de desarrollo vía Cloudflare quick tunnel (URL distinta cada vez; ver terminal). */
export const WEB_SECURE_DEV_HINT =
  'npm run web:secure → abre la URL https://….trycloudflare.com que imprime la terminal';

export function getInsecureGeolocationMessage(): string {
  return (
    'Tu enlace no es seguro (HTTP). El GPS y la cámara del navegador están bloqueados. ' +
    `${WEB_SECURE_DEV_HINT}. ` +
    `En este PC sin GPS también puedes usar ${WEB_LOCAL_DEV_URL}. ` +
    'Alternativa: npm run web:tunnel (túnel Expo) y abre el enlace https que muestra Expo.'
  );
}
