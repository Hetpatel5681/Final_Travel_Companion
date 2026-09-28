import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export interface GeocodeResult {
  lat: string;
  lon: string;
  display_name: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const geocodingApi = {
  async geocodeDestination(name: string, country?: string, address?: string, city?: string): Promise<{ latitude: number; longitude: number } | null> {
    const queries = [
      address,
      city,
      name,
      country && country !== 'Unknown' ? `${name}, ${country}` : undefined
    ].filter(Boolean) as string[];

    for (const q of queries) {
      // Nominatim requires 1 request per second strictly
      await delay(1200);
      try {
        const response = await axios.get<GeocodeResult[]>(NOMINATIM_BASE_URL, {
          params: {
            q,
            format: 'json',
            limit: 1,
          },
        });

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          return {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
          };
        }
      } catch (error) {
        console.warn(`[Geocoding] Nominatim query failed for: ${q}`, error);
      }
    }
    return null;
  },

  async reverseGeocode(lat: number, lon: number): Promise<{ city: string; state: string } | null> {
    await delay(1200);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon, format: 'jsonv2' },
      });
      const addr = response.data?.address;
      if (addr) {
        const city = addr.city || addr.town || addr.village || addr.county;
        const state = addr.state;
        return { city, state };
      }
    } catch (error) {
      console.warn('[Geocoding] Nominatim reverse query failed', error);
    }
    return null;
  }
};
