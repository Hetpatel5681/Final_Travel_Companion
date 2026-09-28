import mongoose, { Schema } from 'mongoose';
import { IUserTravelProfile } from './travelProfile.types';

export const travelProfileSchema = new Schema<IUserTravelProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    completedTrips: { type: Number, default: 0 },
    cancelledTrips: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    
    preferredTravelStyles: [{ type: String }],
    preferredTripTypes: [{ type: String }],
    preferredCountries: [{ type: String }],
    preferredCities: [{ type: String }],
    preferredDestinationTypes: [{ type: String }],
    
    activityStatistics: { type: Map, of: Number, default: {} },
    seasonStatistics: { type: Map, of: Number, default: {} },
    ratingDistribution: { type: Map, of: Number, default: {} },
    
    budgetRange: { 
      type: String, 
      enum: ['Low', 'Medium', 'High', 'Luxury', 'Unknown'],
      default: 'Unknown'
    },
    budgetPersonality: { 
      type: String, 
      enum: ['Budget Traveler', 'Comfort Traveler', 'Luxury Traveler', 'Unknown'],
      default: 'Unknown'
    },
    averageBudget: { type: Number, default: 0 },
    averageTripDuration: { type: Number, default: 0 },
    averageTravelers: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    
    travelDNA: { type: Map, of: Number, default: {} },
    recommendationConfidence: { type: Number, default: 0 },
    
    datasetVersion: { type: String, default: '1.0' },
    featureCount: { type: Number, default: 0 },
    profileCompleteness: { type: Number, default: 0 },
    lastAnalyticsRun: { type: Date, default: Date.now },
    
    personalityScores: { type: Map, of: Number, default: {} },
    personalityVector: [{ type: Number }],
    
    featureMetadata: {
      vectorVersion: { type: String, default: '1.0' },
      featureOrder: [{ type: String }]
    },
    
    modelCompatibility: {
      featureVectorVersion: { type: String, default: '1.0' },
      trainingDatasetVersion: { type: String, default: '1.0' },
      travelDNAAlgorithmVersion: { type: String, default: '1.0' }
    },
    
    learningProgress: {
      tripsAnalyzed: { type: Number, default: 0 },
      activitiesAnalyzed: { type: Number, default: 0 },
      feedbackCount: { type: Number, default: 0 },
      journalEntries: { type: Number, default: 0 },
      recommendationsClicked: { type: Number, default: 0 },
      datasetCompleteness: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 }
    },
    
    personalityHistory: [{
      date: { type: Date, default: Date.now },
      trigger: String,
      topPersonality: String,
      confidence: Number,
      reasons: [{ type: String }],
      contributingFeatures: [{ type: String }]
    }],
  },
  {
    timestamps: true,
  }
);
