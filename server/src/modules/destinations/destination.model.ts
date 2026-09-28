import mongoose from 'mongoose';
import { IDestination } from './destination.types';
import { destinationSchema } from './destination.schema';

export const Destination = mongoose.model<IDestination>('Destination', destinationSchema);
