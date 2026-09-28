import mongoose, { Schema } from 'mongoose';
import { IOnboarding } from './onboarding.types';

export const onboardingSchema = new Schema<IOnboarding>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferredBudget: { type: String, enum: ['Low', 'Medium', 'High', 'Luxury'], required: true },
    travelStyle: { type: String, enum: ['Relaxation', 'Adventure', 'Cultural', 'Party'], required: true },
    favoriteActivities: [{ type: String }],
    destTypes: [{ type: String }],
    companions: { type: String, enum: ['Solo', 'Couple', 'Family', 'Friends'], required: true },
    preferredCountries: [{ type: String }],
    preferredSeasons: [{ type: String }]
  },
  { timestamps: true }
);

export const Onboarding = mongoose.model<IOnboarding>('Onboarding', onboardingSchema);
