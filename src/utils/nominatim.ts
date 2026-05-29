import { TIJUANA_CENTER } from '../constants/map';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'RutaLibre/1.0 (hackathon; accessibility app)';

type NominatimAddress = {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  state?: string;
  country?: string;
};

type ReverseResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

async function nominatimFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${NOMINATIM_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo consultar el servicio de direcciones.');
  }

  return response.json() as Promise<T>;
}

function formatAddress(address: NominatimAddress): string {
  const street = address.road ?? address.neighbourhood ?? address.suburb;
  const city = address.city ?? address.town ?? 'Tijuana';
  const state = address.state ?? 'Baja California';

  if (street) {
    return `${street}, ${city}, ${state}`;
  }
  return `${city}, ${state}`;
}

/** Geocodificación inversa con Nominatim (gratuito). */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const data = await nominatimFetch<ReverseResponse>(
      `/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
    );

    if (data.address) {
      return formatAddress(data.address);
    }
    if (data.display_name) {
      const short = data.display_name.split(',').slice(0, 3).join(', ');
      return short || 'Ubicación en Tijuana';
    }
  } catch {
    // fallback below
  }

  return `Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) — Tijuana`;
}

/** Geocodificación directa para destinos y sugerencias. */
export async function forwardGeocode(
  query: string,
): Promise<{ lat: number; lng: number; label: string } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const results = await nominatimFetch<SearchResult[]>(
      `/search?format=json&q=${encodeURIComponent(
        `${trimmed}, Tijuana, Baja California, Mexico`,
      )}&limit=1`,
    );

    if (results.length > 0) {
      const hit = results[0];
      return {
        lat: parseFloat(hit.lat),
        lng: parseFloat(hit.lon),
        label: hit.display_name.split(',').slice(0, 3).join(', '),
      };
    }
  } catch {
    // fallback below
  }

  return null;
}

/** Coordenadas conocidas para sugerencias frecuentes (evita rate-limit). */
export const PLACE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Centro de Tijuana': { lat: 32.5339, lng: -117.0382 },
  'Plaza Río': { lat: 32.5256, lng: -117.0128 },
  'Zona Río': { lat: 32.5302, lng: -117.0225 },
  'Av. Revolución': { lat: 32.5354, lng: -117.0382 },
  Macroplaza: { lat: 32.5312, lng: -117.0195 },
  'CRIT Otay': { lat: 32.5189, lng: -116.9458 },
  'Calle 2da': { lat: 32.533, lng: -117.0395 },
  'Playas de Tijuana': { lat: 32.533, lng: -117.118 },
  'La Mesa': { lat: 32.492, lng: -116.962 },
  'San Ysidro': { lat: 32.548, lng: -117.038 },
  'Plaza 2000': { lat: 32.4522, lng: -116.8258 },
  'La Presa Este': { lat: 32.455, lng: -116.827 },
};

export function resolvePlaceCoordinates(
  placeName: string,
): { lat: number; lng: number } {
  return (
    PLACE_COORDINATES[placeName] ?? {
      lat: TIJUANA_CENTER.lat,
      lng: TIJUANA_CENTER.lng,
    }
  );
}
