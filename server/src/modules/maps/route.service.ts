import { getJson } from 'serpapi';
import { IActivity } from '../itinerary/activity.model';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RouteService {
  private routeCache: Map<string, any> = new Map();

  public async getRouteForActivities(activities: IActivity[]) {
    // 1. Filter valid coordinate activities strictly
    const valid = activities.filter(a => {
      const lat = a.location?.latitude;
      const lon = a.location?.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number') return false;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
      if (lat < -90 || lat > 90) return false;
      if (lon < -180 || lon > 180) return false;
      return true;
    });
    
    if (valid.length < 2) {
      return { success: true, data: { routingSource: 'none', totalDistanceKm: 0, totalDurationMinutes: 0, segments: [], geometry: [] } };
    }

    // 2. Build Cache key strictly coupling the precise coordinate sequences and routing profile
    const coordsPairs = valid.map(a => `${a.location!.latitude},${a.location!.longitude}`);
    const cacheKey = `serpapi-driving|${coordsPairs.join('|')}`;
    
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey);
    }

    // 3. Attempt SerpApi real-road retrieval
    try {
      const apiKey = process.env.SERPAPI_API_KEY;
      if (!apiKey) throw new Error("SERPAPI_API_KEY is missing");

      // Note: SerpApi directions handles A to B. We chain pairs sequentially for paths.
      const segments = [];
      let totalDistance = 0;
      let totalDuration = 0;

      for (let i = 0; i < valid.length - 1; i++) {
        const startStr = `${valid[i].location!.latitude},${valid[i].location!.longitude}`;
        const endStr = `${valid[i+1].location!.latitude},${valid[i+1].location!.longitude}`;

        const res: any = await new Promise((resolve, reject) => {
           getJson({
             engine: 'google_maps_directions',
             start_addr: startStr,
             end_addr: endStr,
             api_key: apiKey
           }, (result) => {
              if (result.error) reject(result.error);
              else resolve(result);
           });
        });
        
        if (!res.directions || res.directions.length === 0) {
           throw new Error("No directions found between waypoints in SerpApi");
        }

        const leg = res.directions[0];
        // distance is in meters, duration is in seconds
        const distKm = Number((leg.distance / 1000).toFixed(2));
        const durationMin = Math.round(leg.duration / 60);

        segments.push({
          fromActivityId: valid[i]._id.toString(),
          toActivityId: valid[i+1]._id.toString(),
          distanceKm: distKm,
          durationMinutes: durationMin
        });

        totalDistance += distKm;
        totalDuration += durationMin;
      }

      const result = {
        success: true,
        data: {
           routingSource: 'serpapi',
           totalDistanceKm: Number(totalDistance.toFixed(2)),
           totalDurationMinutes: totalDuration,
           segments,
           geometry: [] // Unprovided natively via SerpApi directions
        }
      };

      this.routeCache.set(cacheKey, result);
      return result;

    } catch(err) {
      console.warn("SerpApi routing failure. Falling back to Haversine geographic estimate.", err);
    }

    // 4. Fallback execution unconditionally resolving on errors
    const segments = [];
    let totalDistanceKm = 0;
    for (let i = 0; i < valid.length - 1; i++) {
        const lat1 = valid[i].location!.latitude!;
        const lon1 = valid[i].location!.longitude!;
        const lat2 = valid[i+1].location!.latitude!;
        const lon2 = valid[i+1].location!.longitude!;
        const d = Number(getHaversineDistanceKm(lat1, lon1, lat2, lon2).toFixed(2)); // Kilometers geographic straight-line difference
        segments.push({
           fromActivityId: valid[i]._id.toString(),
           toActivityId: valid[i+1]._id.toString(),
           distanceKm: d,
           durationMinutes: Math.round((d / 40) * 60) // Rough generic vehicle estimate averaging roughly 40 km/h globally.
        });
        totalDistanceKm += d;
    }
    
    return {
      success: true,
      data: {
        routingSource: 'haversine',
        totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
        totalDurationMinutes: Math.round((totalDistanceKm / 40) * 60),
        segments,
        geometry: []
      }
    }
  }
}

export const routeService = new RouteService();
