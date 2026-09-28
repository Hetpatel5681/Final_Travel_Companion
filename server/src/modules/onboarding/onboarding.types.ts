import mongoose, { Document } from 'mongoose';

export interface IOnboarding extends Document {
  userId: mongoose.Types.ObjectId;
  preferredBudget: 'Low' | 'Medium' | 'High' | 'Luxury';
  travelStyle: 'Relaxation' | 'Adventure' | 'Cultural' | 'Party';
  favoriteActivities: string[];
  destTypes: string[];
  companions: 'Solo' | 'Couple' | 'Family' | 'Friends';
  preferredCountries: string[];
  preferredSeasons: string[];
  createdAt: Date;
  updatedAt: Date;
}
