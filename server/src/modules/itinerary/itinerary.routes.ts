import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import * as gc from './itinerary.controller';

const router = Router();

router.use(protect);

// Generates a day for a trip
router.post('/trips/:tripId/days', gc.createItineraryDay);
// Fetches the entire itinerary for a trip
router.get('/trips/:tripId', gc.getItineraryForTrip);

// Modifies a specific day
router.put('/days/:dayId', gc.updateItineraryDay);
// Adds an activity into a day
router.post('/days/:dayId/activities', gc.createActivity);
// Reorder within a day
router.patch('/days/:dayId/reorder', gc.reorderActivities);

// AI Optimization
router.post('/days/:dayId/optimize/preview', gc.previewOptimization);
router.post('/days/:dayId/optimize/apply', gc.applyOptimization);

// Actual Road Route Data fetching 
router.post('/days/:dayId/route', gc.getDayRoute);

// Direct activity management
router.put('/activities/:activityId', gc.updateActivity);
router.patch('/activities/:activityId/status', gc.toggleActivityStatus);
router.delete('/activities/:activityId', gc.deleteActivity);

export { router as itineraryRoutes };
