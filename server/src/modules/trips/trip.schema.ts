import { z } from 'zod';

const tripBodyShape = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  destination: z.object({
    name: z.string().min(2),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(2),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timezone: z.string().optional(),
    placeId: z.string().optional(),
  }),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  numberOfTravelers: z.number().int().min(1).default(1),
  budget: z.number().min(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD']).default('INR'),
  tripType: z.enum(['Solo', 'Family', 'Friends', 'Couple', 'Business', 'Honeymoon', 'Pilgrimage', 'Road Trip', 'Weekend', 'Adventure']),
  travelStyle: z.string().optional(),
  interests: z.array(z.string()).optional(),
  preferences: z.object({
    vegetarianOnly: z.boolean().optional(),
    wheelchairAccessible: z.boolean().optional(),
    petFriendly: z.boolean().optional(),
    avoidTolls: z.boolean().optional(),
    avoidCrowds: z.boolean().optional(),
    childFriendly: z.boolean().optional(),
    ecoFriendly: z.boolean().optional(),
  }).optional(),
  transportationMode: z.string().optional(),
  accommodationPreference: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['Private', 'Shared', 'Public']).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relation: z.string(),
  }).optional(),
  coverImage: z.string().url().optional(),
  notes: z.string().optional()
});

export const createTripSchema = z.object({
  body: tripBodyShape.refine((data: any) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"]
  })
});

export const updateTripSchema = z.object({
  body: tripBodyShape.partial().extend({
    tripStatus: z.enum(['Planning', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
    packingStatus: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
    completionPercentage: z.number().min(0).max(100).optional(),
    isArchived: z.boolean().optional(),
    isDeleted: z.boolean().optional()
  }).refine((data: any) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"]
  })
});

export const updateTripCoordinatesSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
});
