export interface TripDestination {
  name: string;
  city?: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  placeId?: string;
}

export interface TripPreferences {
  vegetarianOnly?: boolean;
  wheelchairAccessible?: boolean;
  petFriendly?: boolean;
  avoidTolls?: boolean;
  avoidCrowds?: boolean;
  childFriendly?: boolean;
  ecoFriendly?: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Trip {
  _id: string;
  title: string;
  destination: TripDestination;
  startDate: string;
  endDate: string;
  totalDays: number;
  numberOfTravelers: number;
  budget: number;
  currency: string;
  tripType: 'Solo' | 'Family' | 'Friends' | 'Couple' | 'Business' | 'Honeymoon' | 'Pilgrimage' | 'Road Trip' | 'Weekend' | 'Adventure';
  travelStyle?: string;
  interests?: string[];
  preferences?: TripPreferences;
  transportationMode?: string;
  accommodationPreference?: string;
  tags?: string[];
  visibility: 'Private' | 'Shared' | 'Public';
  tripStatus: 'Planning' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  completionPercentage: number;
  packingStatus: 'Not Started' | 'In Progress' | 'Completed';
  emergencyContact?: EmergencyContact;
  coverImage?: string;
  notes?: string;
  createdBy: string;
  collaborators?: string[];
  aiStatus: 'NotGenerated' | 'Generating' | 'Completed' | 'Failed';
  aiSummary?: string;
  lastAiGeneratedAt?: string;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripDto {
  title: string;
  destination: TripDestination;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: number;
  currency: string;
  tripType: string;
  travelStyle?: string;
  interests?: string[];
  preferences?: TripPreferences;
  transportationMode?: string;
  accommodationPreference?: string;
  tags?: string[];
  visibility?: string;
  emergencyContact?: EmergencyContact;
  coverImage?: string;
  notes?: string;
}

export interface UpdateTripDto extends Partial<CreateTripDto> {
  tripStatus?: string;
  packingStatus?: string;
  completionPercentage?: number;
  isArchived?: boolean;
}

export interface TripFilters {
  tripStatus?: string;
  country?: string;
  tripType?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TripsResponse {
  success: boolean;
  message: string;
  data: {
    trips: Trip[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    }
  };
}

export interface SingleTripResponse {
  success: boolean;
  message: string;
  data: Trip;
}
