import { DestinationClassifier } from '../utils/destinationClassifier';

export class FeatureExtractor {
  static extractDestinations(trips: any[]): { 
    countries: string[], 
    cities: string[], 
    destinationTypes: string[] 
  } {
    const countries = new Set<string>();
    const cities = new Set<string>();
    let destTypes: string[] = [];

    trips.forEach(trip => {
      if (trip.destination) {
        if (trip.destination.country) countries.add(trip.destination.country);
        if (trip.destination.city) cities.add(trip.destination.city);
        
        destTypes.push(...DestinationClassifier.getDestinationTypes(trip.destination.city, trip.destination.country));
      }
    });

    return { 
      countries: Array.from(countries), 
      cities: Array.from(cities), 
      destinationTypes: [...new Set(destTypes)] 
    };
  }

  static extractTravelStyles(trips: any[]): { tripTypes: string[], travelStyles: string[] } {
    const tripTypes = new Set<string>();
    const travelStyles = new Set<string>();

    trips.forEach(trip => {
      if (trip.tripType) tripTypes.add(trip.tripType);
      if (trip.travelStyle) travelStyles.add(trip.travelStyle);
    });

    return { 
      tripTypes: Array.from(tripTypes), 
      travelStyles: Array.from(travelStyles) 
    };
  }
}
