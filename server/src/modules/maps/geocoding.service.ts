import axios from 'axios';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GeocodingService {
  private lastRequestTime: number = 0;
  private queue: Promise<void> = Promise.resolve();

  public async geocode(query: string): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      this.queue = this.queue.then(async () => {
        const now = Date.now();
        const timeSinceLastReq = now - this.lastRequestTime;
        if (timeSinceLastReq < 1200) {
          await delay(1200 - timeSinceLastReq);
        }
        
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
              q: query,
              format: 'json',
              limit: 1
            },
            headers: {
              Accept: 'application/json',
              'User-Agent': 'AITravelCompanion/1.0'
            }
          });
          
          this.lastRequestTime = Date.now();
          
          if (response.data && response.data.length > 0) {
            resolve({
              latitude: parseFloat(response.data[0].lat),
              longitude: parseFloat(response.data[0].lon)
            });
            return;
          }
        } catch (error: any) {
           console.error('[GeocodingService] Nominatim geocoding failed', error.message);
        }
        
        // If we reach here, it failed or yielded no results
        resolve(null);
      });
    });
  }
}

export const geocodingService = new GeocodingService();
