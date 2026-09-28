import mongoose, { Schema } from 'mongoose';
import { ITripFeedback } from './feedback.types';

export const tripFeedbackSchema = new Schema<ITripFeedback>(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    destinationFeedback: [{
      destinationId: String,
      rating: { type: Number, default: 0 },
      favorite: { type: Boolean, default: false },
      wouldVisitAgain: { type: Boolean, default: false },
      notes: String
    }],
    
    activityFeedback: [{
      activityId: String,
      rating: { type: Number, default: 0 },
      favorite: { type: Boolean, default: false },
      wouldRecommend: { type: Boolean, default: false },
      completed: { type: Boolean, default: false },
      timeSpent: Number,
      cost: Number
    }],
    
    weatherExperience: [{
      expected: String,
      actual: String,
      liked: Boolean
    }],
    
    tripMemories: [{
      url: String,
      caption: String,
      aiTags: [{ type: String }]
    }],
    
    journals: [{
      date: { type: Date, default: Date.now },
      entry: String,
      sentimentScore: { 
        type: String, 
        enum: ['Positive', 'Neutral', 'Negative', 'Unprocessed'], 
        default: 'Unprocessed' 
      }
    }],
    
    recommendationHistory: [{
      recommendationId: String,
      shown: { type: Boolean, default: true },
      clicked: { type: Boolean, default: false },
      bookmarked: { type: Boolean, default: false },
      planned: { type: Boolean, default: false },
      booked: { type: Boolean, default: false },
      completed: { type: Boolean, default: false }
    }],
    
    companionAnalytics: [{
      travelStyle: String,
      satisfactionScore: Number
    }],
    
    confidenceHistory: [{
      date: { type: Date, default: Date.now },
      confidenceScore: Number,
      reason: String,
      contributingFeatures: [{ type: String }]
    }],
    
    mlLabel: { 
      type: String, 
      enum: ['Positive Trip', 'Neutral Trip', 'Negative Trip', 'Unlabeled'],
      default: 'Unlabeled'
    },
    
    datasetVersion: { type: String, default: '1.0' }
  },
  {
    timestamps: true,
  }
);
