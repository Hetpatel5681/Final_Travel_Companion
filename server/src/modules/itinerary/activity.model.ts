import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  tripId: mongoose.Types.ObjectId;
  dayId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'Sightseeing' | 'Restaurant' | 'Hotel' | 'Shopping' | 'Adventure' | 'Transport' | 'Flight' | 'Train' | 'Bus' | 'Cafe' | 'Temple' | 'Museum' | 'Beach' | 'Custom';
  startTime?: string | Date;
  endTime?: string | Date;
  estimatedDuration?: number;
  orderIndex: number;
  priority: 'Must-Do' | 'Optional' | 'Backup';
  notes?: string;

  // Location & Timing
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
  };
  recommendedArrivalTime?: string | Date;
  expectedCrowdLevel?: 'Low' | 'Medium' | 'High' | 'Extreme';
  weatherSuitability?: 'All-Weather' | 'Indoor' | 'Outdoor-Sunny' | 'Outdoor-Clear';
  weatherStatus?: string;
  openingHours?: string[];
  bestTimeToVisit?: string;

  // Transportation (to this activity)
  transportMode?: 'Walk' | 'Car' | 'Transit' | 'Train' | 'Flight' | 'Bike';
  estimatedTravelTime?: number;
  estimatedTravelCost?: number;
  distance?: number;
  routePolyline?: string;

  // Booking & Media
  bookingRequired: boolean;
  bookingUrl?: string;
  reservationNumber?: string;
  thumbnail?: string;
  gallery?: string[];

  // Misc
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Coffee' | 'Dessert';

  // AI & Opt
  aiTips?: string;
  aiGenerated: boolean;
  isLocked: boolean;
  mapRouteId?: string;
  googleMapsUrl?: string;

  // Budget
  ticketPrice?: number;
  currency?: string;
  estimatedExpense?: {
    ticket?: number;
    food?: number;
    transport?: number;
    shopping?: number;
    parking?: number;
    miscellaneous?: number;
  };

  // Tracking
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Skipped';
  completedAt?: Date;
  visitedDuration?: number;

  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  dayId: { type: Schema.Types.ObjectId, ref: 'ItineraryDay', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Sightseeing', 'Restaurant', 'Hotel', 'Shopping', 'Adventure', 'Transport', 'Flight', 'Train', 'Bus', 'Cafe', 'Temple', 'Museum', 'Beach', 'Custom'],
    required: true 
  },
  startTime: { type: Schema.Types.Mixed },
  endTime: { type: Schema.Types.Mixed },
  estimatedDuration: { type: Number },
  orderIndex: { type: Number, required: true },
  priority: { type: String, enum: ['Must-Do', 'Optional', 'Backup'], default: 'Must-Do' },
  notes: { type: String },

  location: {
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    placeId: { type: String }
  },
  recommendedArrivalTime: { type: Schema.Types.Mixed },
  expectedCrowdLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Extreme'] },
  weatherSuitability: { type: String, enum: ['All-Weather', 'Indoor', 'Outdoor-Sunny', 'Outdoor-Clear'] },
  weatherStatus: { type: String },
  openingHours: [{ type: String }],
  bestTimeToVisit: { type: String },

  transportMode: { type: String, enum: ['Walk', 'Car', 'Transit', 'Train', 'Flight', 'Bike'] },
  estimatedTravelTime: { type: Number },
  estimatedTravelCost: { type: Number },
  distance: { type: Number },
  routePolyline: { type: String },

  bookingRequired: { type: Boolean, default: false },
  bookingUrl: { type: String },
  reservationNumber: { type: String },
  thumbnail: { type: String },
  gallery: [{ type: String }],

  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Coffee', 'Dessert'] },

  aiTips: { type: String },
  aiGenerated: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  mapRouteId: { type: String },
  googleMapsUrl: { type: String },

  ticketPrice: { type: Number },
  currency: { type: String },
  estimatedExpense: {
    ticket: { type: Number },
    food: { type: Number },
    transport: { type: Number },
    shopping: { type: Number },
    parking: { type: Number },
    miscellaneous: { type: Number }
  },

  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled', 'Skipped'], default: 'Pending' },
  completedAt: { type: Date },
  visitedDuration: { type: Number }
}, {
  timestamps: true
});

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
