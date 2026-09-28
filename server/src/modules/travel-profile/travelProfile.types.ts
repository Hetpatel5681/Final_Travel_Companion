import mongoose from 'mongoose';

export interface TravelDNA {
  Explorer: number;
  Foodie: number;
  Luxury: number;
  Budget: number;
  Nature: number;
  Photographer: number;
  Backpacker: number;
  Family: number;
  Pilgrim: number;
  Adventure: number;
  HistoryLover: number;
  Nightlife: number;
  Relaxation: number;
  Shopping: number;
}

export interface IUserTravelProfile extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  
  completedTrips: number;
  cancelledTrips: number;
  completionRate: number;
  
  preferredTravelStyles: string[];
  preferredTripTypes: string[];
  preferredCountries: string[];
  preferredCities: string[];
  preferredDestinationTypes: string[];
  
  activityStatistics: Map<string, number>;
  seasonStatistics: Map<string, number>;
  ratingDistribution: Map<string, number>;
  
  budgetRange: 'Low' | 'Medium' | 'High' | 'Luxury' | 'Unknown';
  budgetPersonality: 'Budget Traveler' | 'Comfort Traveler' | 'Luxury Traveler' | 'Unknown';
  averageBudget: number;
  averageTripDuration: number;
  averageTravelers: number;
  averageRating: number;
  
  travelDNA: Map<string, number>;
  recommendationConfidence: number;
  
  datasetVersion: string;
  featureCount: number;
  profileCompleteness: number;
  lastAnalyticsRun: Date;
  
  personalityScores: Record<string, number>;
  personalityVector: number[];
  
  featureMetadata: {
    vectorVersion: string;
    featureOrder: string[];
  };
  
  modelCompatibility: {
    featureVectorVersion: string;
    trainingDatasetVersion: string;
    travelDNAAlgorithmVersion: string;
  };
  
  learningProgress: {
    tripsAnalyzed: number;
    activitiesAnalyzed: number;
    feedbackCount: number;
    journalEntries: number;
    recommendationsClicked: number;
    datasetCompleteness: number;
    confidence: number;
  };
  
  personalityHistory: Array<{
    date: Date;
    trigger: string;
    topPersonality: string;
    confidence: number;
    reasons: string[];
    contributingFeatures: string[];
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
