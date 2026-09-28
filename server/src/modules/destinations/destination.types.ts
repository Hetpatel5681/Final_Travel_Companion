import { Document } from 'mongoose';
import { TravelDNA } from '../travel-profile/travelProfile.types';

export interface IDestination extends Document {
  destinationKey: string; // Canonical slug for upsert, e.g. "india-rajasthan-jaipur"
  name: string;
  country: string;
  state?: string; // Especially important for Indian broad coverage
  region: string;
  description: string;
  
  // Geospatial strict support 
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  image?: {
    url: string;
    sourceProvider: 'unsplash' | 'wikimedia' | 'fallback';
    sourceId?: string;
    attributionText?: string;
    attributionUrl?: string;
  };

  destinationType: string[];
  
  // Core ML Vector Features (All values rigidly normalized 0.0 to 1.0)
  travelDNA: TravelDNA;
  
  // Metadata for filtering & cold-start algorithms
  budgetLevel: 'Low' | 'Medium' | 'High' | 'Luxury';
  averageTripDuration: number;
  popularityScore: number;
  isActive: boolean;
  
  // Provenance metadata
  sourceType?: string; // 'incredible_india', 'nidhi', 'unesco', etc.
  sourceUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}
