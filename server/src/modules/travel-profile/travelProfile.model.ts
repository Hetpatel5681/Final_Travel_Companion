import mongoose from 'mongoose';
import { IUserTravelProfile } from './travelProfile.types';
import { travelProfileSchema } from './travelProfile.schema';

export const TravelProfile = mongoose.model<IUserTravelProfile>('UserTravelProfile', travelProfileSchema);
