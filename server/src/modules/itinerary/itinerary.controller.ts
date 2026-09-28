import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { itineraryService } from './itinerary.service';
import { routeOptimizationService } from './route-optimization.service';
import { createDaySchema, updateDaySchema, createActivitySchema, updateActivitySchema, reorderActivitiesSchema } from './itinerary.schema';
import { routeService } from '../maps/route.service';
import { ItineraryDay } from './itineraryDay.model';
import { Trip } from '../trips/trip.model';
import { Activity } from './activity.model';

export const createItineraryDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const validatedData = createDaySchema.parse(req);
    const day = await itineraryService.createItineraryDay(req.user._id.toString(), req.params.tripId, validatedData.body as any);
    res.status(201).json({ success: true, message: 'Itinerary day created', data: day });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Validation Error' });
  }
};

export const getItineraryForTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const data = await itineraryService.getItineraryForTrip(req.user._id.toString(), req.params.tripId);
    res.status(200).json({ success: true, message: 'Itinerary retrieved', data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateItineraryDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const validatedData = updateDaySchema.parse(req);
    const day = await itineraryService.updateItineraryDay(req.user._id.toString(), req.params.dayId, validatedData.body as any);
    res.status(200).json({ success: true, message: 'Day updated', data: day });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const validatedData = createActivitySchema.parse(req);
    const activity = await itineraryService.createActivity(req.user._id.toString(), req.params.dayId, validatedData.body);
    res.status(201).json({ success: true, message: 'Activity created', data: activity });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message || 'Validation Error' });
  }
};

export const updateActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const validatedData = updateActivitySchema.parse(req);
    const activity = await itineraryService.updateActivity(req.user._id.toString(), req.params.activityId, validatedData.body);
    res.status(200).json({ success: true, message: 'Activity updated', data: activity });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const toggleActivityStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const { status } = req.body;
    if (!['Pending', 'Completed', 'Cancelled', 'Skipped'].includes(status)) {
       res.status(400).json({ success: false, message: 'Invalid status' }); return;
    }

    const activity = await itineraryService.toggleActivityStatus(req.user._id.toString(), req.params.activityId, status);
    res.status(200).json({ success: true, message: 'Activity status updated', data: activity });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    await itineraryService.deleteActivity(req.user._id.toString(), req.params.activityId);
    res.status(200).json({ success: true, message: 'Activity deleted', data: {} });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const reorderActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const validatedData = reorderActivitiesSchema.parse(req);
    const sortedActivities = await itineraryService.reorderActivities(req.user._id.toString(), req.params.dayId, validatedData.body.activityIds);
    res.status(200).json({ success: true, message: 'Activities reordered', data: sortedActivities });
  } catch (error: any) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
};

export const previewOptimization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const data = await routeOptimizationService.previewDayOptimization(req.user._id.toString(), req.params.dayId);
    res.status(200).json({ success: true, message: 'Optimization preview', data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const applyOptimization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const { optimizedActivityIds } = req.body;
    if (!Array.isArray(optimizedActivityIds)) {
       res.status(400).json({ success: false, message: 'optimizedActivityIds must be an array' }); return;
    }

    const data = await routeOptimizationService.applyDayOptimization(req.user._id.toString(), req.params.dayId, optimizedActivityIds);
    res.status(200).json({ success: true, message: 'Route optimized strictly', data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getDayRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
    
    const { activityIds } = req.body;
    if (!Array.isArray(activityIds)) { res.status(400).json({ success: false, message: 'activityIds must be an array' }); return; }

    const dayId = req.params.dayId;
    const day: any = await ItineraryDay.findById(dayId).lean();
    if (!day) { res.status(404).json({ success: false, message: 'Day not found' }); return; }

    const trip = await Trip.findOne({ _id: day.tripId, createdBy: req.user._id, isDeleted: false }).lean();
    if (!trip) { res.status(403).json({ success: false, message: 'Unauthorized or Trip not found' }); return; }

    const dbActivities = await Activity.find({ dayId, _id: { $in: activityIds } }).lean();
    
    // Ordered sequences must flawlessly map the requested array identically sequentially
    const orderedActivities = [];
    const validLookup = new Map(dbActivities.map(a => [a._id.toString(), a]));
    for (const id of activityIds) {
      const a = validLookup.get(id);
      if (a) {
        orderedActivities.push(a);
      }
    }

    const routeData = await routeService.getRouteForActivities(orderedActivities as any[]);
    res.status(200).json(routeData);

  } catch(error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

