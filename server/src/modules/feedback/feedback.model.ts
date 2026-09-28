import mongoose from 'mongoose';
import { ITripFeedback } from './feedback.types';
import { tripFeedbackSchema } from './feedback.schema';

export const TripFeedback = mongoose.model<ITripFeedback>('TripFeedback', tripFeedbackSchema);
