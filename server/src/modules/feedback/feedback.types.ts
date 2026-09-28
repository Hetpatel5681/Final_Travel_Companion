import mongoose, { Document } from 'mongoose';

export interface IDestinationFeedback {
  destinationId: string;
  rating: number; // 0-5
  favorite: boolean;
  wouldVisitAgain: boolean;
  notes?: string;
}

export interface IActivityFeedback {
  activityId: string;
  rating: number;
  favorite: boolean;
  wouldRecommend: boolean;
  completed: boolean;
  timeSpent?: number; // In hours/mins
  cost?: number;
}

export interface IWeatherExperience {
  expected: string;
  actual: string;
  liked: boolean;
}

export interface IMemory {
  url: string;
  caption?: string;
  aiTags: string[]; // Beach, Mountain, Temple
}

export interface IJournal {
  date: Date;
  entry: string;
  sentimentScore: 'Positive' | 'Neutral' | 'Negative' | 'Unprocessed'; // Baseline
}

export interface IRecommendationHistory {
  recommendationId: string;
  shown: boolean;
  clicked: boolean;
  bookmarked: boolean;
  planned: boolean;
  booked: boolean;
  completed: boolean;
}

export interface IConfidenceHistory {
  date: Date;
  confidenceScore: number;
  reason: string;
  contributingFeatures: string[];
}

export interface ICompanionAnalytics {
  travelStyle: string; // "Solo", "Family", etc.
  satisfactionScore: number;
}

export interface ITripFeedback extends Document {
  tripId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  destinationFeedback: IDestinationFeedback[];
  activityFeedback: IActivityFeedback[];
  weatherExperience: IWeatherExperience[];
  tripMemories: IMemory[];
  journals: IJournal[];
  recommendationHistory: IRecommendationHistory[];
  companionAnalytics: ICompanionAnalytics[];
  confidenceHistory: IConfidenceHistory[];
  
  mlLabel: 'Positive Trip' | 'Neutral Trip' | 'Negative Trip' | 'Unlabeled';
  
  datasetVersion: string;
  createdAt: Date;
  updatedAt: Date;
}
