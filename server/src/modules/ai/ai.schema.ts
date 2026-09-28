import { z } from 'zod';

export const aiGenerateRequestSchema = z.object({
  destination: z.string().min(2).max(100),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid startDate" }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid endDate" }),
  travelers: z.number().int().positive().max(20).optional(),
  budget: z.string().max(50).optional(),
  travelStyle: z.string().max(50).optional(),
  interests: z.array(z.string().max(50)).max(15).optional(),
  pace: z.string().max(50).optional(),
  travelPreferences: z.string().max(500).optional()
});

export const aiActivitySchema = z.object({
  title: z.string().describe("The canonical name of the place, e.g., 'Lake Pichola' or 'City Palace'."),
  description: z.string().describe("A 1-2 sentence compelling description."),
  category: z.string().describe("E.g., 'Attraction', 'Food', 'Transit', 'Accommodation', 'Activity'")
});

export const aiDaySchema = z.object({
  dayNumber: z.number().int(),
  theme: z.string().describe("A short theme for the day, e.g., 'Historical Exploration'"),
  activities: z.array(aiActivitySchema)
});

export const aiItineraryResponseSchema = z.object({
  tripTitle: z.string(),
  summary: z.string().describe("A short summary of the overall generated trip."),
  days: z.array(aiDaySchema)
});
