import { geocodingService } from './geocoding.service';
import { distanceService } from './distance.service';

interface IResolvedPlace {
  address?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface IDestinationContext {
  name: string;
  city?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

const normalizeIdentity = (str: string | undefined): string => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

class PlaceResolutionService {
  /**
   * Resolves a place using Nominatim fallback logic.
   * Priority: Nominatim Address -> Destination + Country -> Return null
   */
  public async resolvePlace(activityTitle: string, dest: IDestinationContext): Promise<IResolvedPlace | null> {
    let cleanTitle = activityTitle;
    cleanTitle = cleanTitle.replace(/^(?:warm|relaxed|enjoyable|beautiful|scenic|morning|afternoon|evening|night|early)\s+/i, '');
    const toMatch = cleanTitle.match(/to\s+([A-Za-z0-9 ]+?)(?:\s+(?:transfer|drive|journey|ride|flight|train|bus))?$/i);
    if (toMatch && toMatch[1]) {
       cleanTitle = toMatch[1].trim();
    } else {
       cleanTitle = cleanTitle.replace(/\s+(transfer|drive|journey|flight|exploration|tour|visit|phase 1|phase 2|phase \d)$/i, '');
    }
    cleanTitle = cleanTitle.trim() || activityTitle;

    // 1. Try ultimate specific: Activity + Destination + Country
    const validCountry = dest.country && dest.country !== 'Unknown' ? dest.country : undefined;
    const destParts = [dest.city || dest.name, validCountry].filter(Boolean);
    const primaryQuery = `${cleanTitle}, ${destParts.join(', ')}`.trim();
    let result = await geocodingService.geocode(primaryQuery);

    // 2. Try just Activity + City (skip country if it was causing issues)
    if (!result && destParts.length > 0) {
      const cityQuery = `${cleanTitle}, ${destParts[0]}`.trim();
      result = await geocodingService.geocode(cityQuery);
    }

    // 3. Fallback: Destination City Center 
    if (!result && destParts.length > 0) {
      const fallbackQuery = destParts.join(', ');
      result = await geocodingService.geocode(fallbackQuery);
    }

    if (result) {
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        address: cleanTitle
      };
    }

    return null;
  }
}

export const placeResolutionService = new PlaceResolutionService();
