import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  title: string;
  destination: {
    name: string;
    city?: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    placeId?: string;
  };
  startDate: Date;
  endDate: Date;
  totalDays: number;
  numberOfTravelers: number;
  budget: number;
  currency: string;
  tripType: string;
  travelStyle?: string;
  interests?: string[];
  preferences?: {
    vegetarianOnly?: boolean;
    wheelchairAccessible?: boolean;
    petFriendly?: boolean;
    avoidTolls?: boolean;
    avoidCrowds?: boolean;
    childFriendly?: boolean;
    ecoFriendly?: boolean;
  };
  transportationMode?: string;
  accommodationPreference?: string;
  tags?: string[];
  visibility: 'Private' | 'Shared' | 'Public';
  tripStatus: 'Planning' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  completionPercentage: number;
  packingStatus: 'Not Started' | 'In Progress' | 'Completed';
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  coverImage?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  collaborators?: mongoose.Types.ObjectId[];
  aiStatus: 'NotGenerated' | 'Generating' | 'Completed' | 'Failed';
  aiSummary?: string;
  lastAiGeneratedAt?: Date;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    title: { type: String, required: true },
    destination: {
      name: { type: String, required: true },
      city: String,
      state: String,
      country: { type: String, required: true },
      latitude: Number,
      longitude: Number,
      timezone: String,
      placeId: String,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    numberOfTravelers: { type: Number, required: true, default: 1 },
    budget: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    tripType: { 
      type: String, 
      required: true,
      enum: ['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Honeymoon', 'Pilgrimage', 'Road Trip', 'Weekend', 'Adventure']
    },
    travelStyle: { type: String },
    interests: [{ type: String }],
    preferences: {
      vegetarianOnly: { type: Boolean, default: false },
      wheelchairAccessible: { type: Boolean, default: false },
      petFriendly: { type: Boolean, default: false },
      avoidTolls: { type: Boolean, default: false },
      avoidCrowds: { type: Boolean, default: false },
      childFriendly: { type: Boolean, default: false },
      ecoFriendly: { type: Boolean, default: false },
    },
    transportationMode: { type: String },
    accommodationPreference: { type: String },
    tags: [{ type: String }],
    visibility: { 
      type: String, 
      enum: ['Private', 'Shared', 'Public'], 
      default: 'Private' 
    },
    tripStatus: { 
      type: String, 
      enum: ['Planning', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'], 
      default: 'Planning' 
    },
    completionPercentage: { type: Number, default: 0 },
    packingStatus: { 
      type: String, 
      enum: ['Not Started', 'In Progress', 'Completed'], 
      default: 'Not Started' 
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    coverImage: { type: String },
    notes: { type: String },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    aiStatus: { 
      type: String, 
      enum: ['NotGenerated', 'Generating', 'Completed', 'Failed'], 
      default: 'NotGenerated' 
    },
    aiSummary: { type: String },
    lastAiGeneratedAt: { type: Date },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totalDays if modified
tripSchema.pre('save', function (next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start day
  }
  next();
});

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
