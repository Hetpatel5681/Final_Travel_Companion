import mongoose, { Document, Schema } from 'mongoose';

export interface IItineraryDay extends Document {
  tripId: mongoose.Types.ObjectId;
  dayNumber: number;
  date: Date;
  title: string;
  summary?: string;
  startTime?: string;
  endTime?: string;
  totalDistance?: number;
  estimatedTravelTime?: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Skipped';
  notes?: string;
  
  // Statistics
  completedActivities: number;
  totalActivities: number;
  completionPercentage: number;
  totalDuration: number;
  totalTicketCost: number;
  totalEstimatedExpenses: number;

  createdAt: Date;
  updatedAt: Date;
}

const itineraryDaySchema = new Schema<IItineraryDay>({
  tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  title: { type: String, default: function() { return `Day ${this.dayNumber}`; } },
  summary: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  totalDistance: { type: Number },
  estimatedTravelTime: { type: Number },
  status: { type: String, enum: ['Planning', 'In Progress', 'Completed', 'Skipped'], default: 'Planning' },
  notes: { type: String },
  completedActivities: { type: Number, default: 0 },
  totalActivities: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  totalTicketCost: { type: Number, default: 0 },
  totalEstimatedExpenses: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const ItineraryDay = mongoose.model<IItineraryDay>('ItineraryDay', itineraryDaySchema);
