import mongoose, { Schema } from 'mongoose';
import { IDestination } from './destination.types';

const dnaFeatureDef = { type: Number, required: true, min: 0, max: 1 };

export const destinationSchema = new Schema<IDestination>(
  {
    destinationKey: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    region: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    image: {
      url: { type: String },
      sourceProvider: { type: String, enum: ['unsplash', 'wikimedia', 'fallback'] },
      sourceId: { type: String },
      attributionText: { type: String },
      attributionUrl: { type: String }
    },
    
    destinationType: [{ type: String, required: true }],
    
    travelDNA: {
      Explorer: dnaFeatureDef,
      Foodie: dnaFeatureDef,
      Luxury: dnaFeatureDef,
      Budget: dnaFeatureDef,
      Nature: dnaFeatureDef,
      Photographer: dnaFeatureDef,
      Backpacker: dnaFeatureDef,
      Family: dnaFeatureDef,
      Pilgrim: dnaFeatureDef,
      Adventure: dnaFeatureDef,
      HistoryLover: dnaFeatureDef,
      Nightlife: dnaFeatureDef,
      Relaxation: dnaFeatureDef,
      Shopping: dnaFeatureDef,
    },
    
    budgetLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Luxury'],
      required: true,
    },
    averageTripDuration: { type: Number, required: true, min: 1 },
    popularityScore: { type: Number, required: true, min: 0, max: 1 },
    isActive: { type: Boolean, default: true },

    sourceType: { type: String, trim: true, default: 'manual_verified' },
    sourceUrl: { type: String, trim: true }
  },
  {
    timestamps: true,
  }
);

// Indexes for scaling ML and constraints
destinationSchema.index({ location: '2dsphere' });
destinationSchema.index({ country: 1 });
destinationSchema.index({ state: 1 });
destinationSchema.index({ region: 1 });
destinationSchema.index({ isActive: 1 });
destinationSchema.index({ 'travelDNA.HistoryLover': -1 });
