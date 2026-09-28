import { z } from 'zod';

export const createDaySchema = z.object({
  body: z.object({
    dayNumber: z.number().int().min(1).optional(), // Usually assigned by backend automatically
    date: z.string().datetime().or(z.date()).optional(), // Optional on creation if backend infers it
    title: z.string().min(2).optional(),
    summary: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    totalDistance: z.number().optional(),
    estimatedTravelTime: z.number().optional(),
    status: z.enum(['Planning', 'In Progress', 'Completed', 'Skipped']).optional(),
    notes: z.string().optional()
  })
});

export const updateDaySchema = z.object({
  body: createDaySchema.shape.body.partial()
});

const activityLocationSchema = z.object({
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  placeId: z.string().optional()
});

const activityEstimatedExpenseSchema = z.object({
  ticket: z.number().min(0).optional(),
  food: z.number().min(0).optional(),
  transport: z.number().min(0).optional(),
  shopping: z.number().min(0).optional(),
  parking: z.number().min(0).optional(),
  miscellaneous: z.number().min(0).optional(),
});

export const activityBodyShape = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  category: z.enum(['Sightseeing', 'Restaurant', 'Hotel', 'Shopping', 'Adventure', 'Transport', 'Flight', 'Train', 'Bus', 'Cafe', 'Temple', 'Museum', 'Beach', 'Custom']),
  startTime: z.string().datetime().or(z.date()).or(z.string()).optional(), // Can be precise ISO or simple time
  endTime: z.string().datetime().or(z.date()).or(z.string()).optional(),
  estimatedDuration: z.number().min(0).optional(),
  orderIndex: z.number().int().min(0),
  priority: z.enum(['Must-Do', 'Optional', 'Backup']).default('Must-Do'),
  notes: z.string().optional(),

  location: activityLocationSchema.optional(),
  recommendedArrivalTime: z.string().datetime().or(z.date()).or(z.string()).optional(),
  expectedCrowdLevel: z.enum(['Low', 'Medium', 'High', 'Extreme']).optional(),
  weatherSuitability: z.enum(['All-Weather', 'Indoor', 'Outdoor-Sunny', 'Outdoor-Clear']).optional(),
  weatherStatus: z.string().optional(),
  openingHours: z.array(z.string()).optional(),
  bestTimeToVisit: z.string().optional(),

  transportMode: z.enum(['Walk', 'Car', 'Transit', 'Train', 'Flight', 'Bike']).optional(),
  estimatedTravelTime: z.number().min(0).optional(),
  estimatedTravelCost: z.number().min(0).optional(),
  distance: z.number().min(0).optional(),
  routePolyline: z.string().optional(),
  googleMapsUrl: z.string().url().or(z.literal('')).optional(),

  bookingRequired: z.boolean().default(false).optional(),
  bookingUrl: z.string().url().or(z.literal('')).optional(),
  reservationNumber: z.string().optional(),
  thumbnail: z.string().url().or(z.literal('')).optional(),
  gallery: z.array(z.string().url()).optional(),

  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Coffee', 'Dessert']).optional(),

  ticketPrice: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  estimatedExpense: activityEstimatedExpenseSchema.optional()
});

export const createActivitySchema = z.object({
  body: activityBodyShape
});

export const updateActivitySchema = z.object({
  body: activityBodyShape.partial().extend({
    status: z.enum(['Pending', 'Completed', 'Cancelled', 'Skipped']).optional(),
    visitedDuration: z.number().min(0).optional(),
    isLocked: z.boolean().optional()
  })
});

export const reorderActivitiesSchema = z.object({
  body: z.object({
    activityIds: z.array(z.string())
  })
});
