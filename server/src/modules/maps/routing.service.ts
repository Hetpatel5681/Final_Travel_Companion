import axios from 'axios';
import { distanceService } from './distance.service';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RoutingService {
  private lastRequestTime: number = 0;
  private queue: Promise<void> = Promise.resolve();

  public async getRoute(lat1: number, lon1: number, lat2: number, lon2: number): Promise<{ distance: string, duration: string }> {
    return new Promise((resolve) => {
      this.queue = this.queue.then(async () => {
        const now = Date.now();
        const timeSinceLastReq = now - this.lastRequestTime;
        if (timeSinceLastReq < 250) {
          await delay(250 - timeSinceLastReq); // Moderate 4 req/sec limit for OSRM demo
        }

        try {
          const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
          this.lastRequestTime = Date.now();
          
          if (response.data && response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const distKm = (route.distance / 1000).toFixed(1);
            const durMin = Math.round(route.duration / 60);
            resolve({
              distance: `${distKm}`, // Just numbers as strings to avoid breaking frontend logic unexpectedly
              duration: `${durMin}`
            });
            return;
          }
        } catch (error: any) {
           console.error('[RoutingService] OSRM routing failed', error.message);
        }
        
        const distKm = distanceService.calculateHaversineDistance(lat1, lon1, lat2, lon2).toFixed(1);
        resolve({
          distance: `${distKm}`,
          duration: 'Estimated' // This will be handled as fallback
        });
      });
    });
  }
}

export const routingService = new RoutingService();
