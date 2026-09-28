export interface Location {
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface EstimatedExpense {
  ticket?: number;
  food?: number;
  transport?: number;
  shopping?: number;
  parking?: number;
  miscellaneous?: number;
}

export interface IActivity {
  _id: string;
  tripId: string;
  dayId: string;
  title: string;
  description?: string;
  category: 'Sightseeing' | 'Restaurant' | 'Hotel' | 'Shopping' | 'Adventure' | 'Transport' | 'Flight' | 'Train' | 'Bus' | 'Cafe' | 'Temple' | 'Museum' | 'Beach' | 'Custom';
  startTime?: string | Date;
  endTime?: string | Date;
  estimatedDuration?: number;
  orderIndex: number;
  priority: 'Must-Do' | 'Optional' | 'Backup';
  notes?: string;

  location?: Location;
  recommendedArrivalTime?: string | Date;
  expectedCrowdLevel?: 'Low' | 'Medium' | 'High' | 'Extreme';
  weatherSuitability?: 'All-Weather' | 'Indoor' | 'Outdoor-Sunny' | 'Outdoor-Clear';
  weatherStatus?: string;
  openingHours?: string[];
  bestTimeToVisit?: string;

  transportMode?: 'Walk' | 'Car' | 'Transit' | 'Train' | 'Flight' | 'Bike';
  estimatedTravelTime?: number;
  estimatedTravelCost?: number;
  distance?: number;
  routePolyline?: string;

  bookingRequired: boolean;
  bookingUrl?: string;
  reservationNumber?: string;
  thumbnail?: string;
  gallery?: string[];

  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Coffee' | 'Dessert';

  aiTips?: string;
  aiGenerated: boolean;
  isLocked: boolean;
  mapRouteId?: string;
  googleMapsUrl?: string;

  ticketPrice?: number;
  currency?: string;
  estimatedExpense?: EstimatedExpense;

  status: 'Pending' | 'Completed' | 'Cancelled' | 'Skipped';
  completedAt?: Date;
  visitedDuration?: number;

  createdAt: string;
  updatedAt: string;
}

export interface IItineraryDay {
  _id: string;
  tripId: string;
  dayNumber: number;
  date: string; // ISO String from backend
  title: string;
  summary?: string;
  startTime?: string;
  endTime?: string;
  totalDistance?: number;
  estimatedTravelTime?: number;
  status: 'Planning' | 'In Progress' | 'Completed' | 'Skipped';
  notes?: string;
  completedActivities: number;
  totalActivities: number;
  completionPercentage: number;
  totalDuration: number;
  totalTicketCost: number;
  totalEstimatedExpenses: number;
  activities: IActivity[]; // injected by backend populate query
  createdAt: string;
  updatedAt: string;
}

export type CreateDayRequest = Partial<IItineraryDay>;
export type UpdateDayRequest = Partial<IItineraryDay>;

export type CreateActivityRequest = Omit<IActivity, '_id' | 'tripId' | 'dayId' | 'createdAt' | 'updatedAt'>;
export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export interface ReorderRequest {
  activityIds: string[];
}
