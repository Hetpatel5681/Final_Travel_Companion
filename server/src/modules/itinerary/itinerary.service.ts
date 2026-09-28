import { ItineraryDay, IItineraryDay } from './itineraryDay.model';
import { Activity, IActivity } from './activity.model';
import { Trip } from '../trips/trip.model';
import mongoose from 'mongoose';
import { placeResolutionService } from '../maps/place-resolution.service';

export class ItineraryService {
  // Ensure user owns the trip
  private async verifyTripOwnership(tripId: string, userId: string) {
    const trip = await Trip.findOne({ _id: tripId, createdBy: userId, isDeleted: false });
    if (!trip) throw { status: 403, message: 'Unauthorized or Trip not found' };
    return trip;
  }

  private async calculateTripProgress(tripId: mongoose.Types.ObjectId | string) {
    const days = await ItineraryDay.find({ tripId });
    if (days.length === 0) return;
    
    const sumPercentage = days.reduce((sum, d) => sum + (d.completionPercentage || 0), 0);
    const percentage = Math.round(sumPercentage / days.length);
    
    await Trip.updateOne({ _id: tripId }, { $set: { completionPercentage: percentage } });
  }

  private async calculateDayProgress(dayId: mongoose.Types.ObjectId | string) {
    const day = await ItineraryDay.findById(dayId);
    if (!day) return;
    
    const activities = await Activity.find({ dayId });
    
    let completed = 0;
    let duration = 0;
    let ticketCost = 0;
    let estCost = 0;

    for (const a of activities) {
      if (a.status === 'Completed') completed++;
      if (a.estimatedDuration) duration += a.estimatedDuration;
      if (a.ticketPrice) ticketCost += a.ticketPrice;
      
      if (a.estimatedExpense) {
         estCost += (a.estimatedExpense.ticket || 0) + 
                    (a.estimatedExpense.food || 0) + 
                    (a.estimatedExpense.transport || 0) + 
                    (a.estimatedExpense.shopping || 0) + 
                    (a.estimatedExpense.parking || 0) + 
                    (a.estimatedExpense.miscellaneous || 0);
      }
    }
    
    day.completedActivities = completed;
    day.totalActivities = activities.length;
    day.completionPercentage = activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0;
    day.totalDuration = duration;
    day.totalTicketCost = ticketCost;
    day.totalEstimatedExpenses = estCost;
    
    await day.save();
    await this.calculateTripProgress(day.tripId);
  }

  async clearItineraryForTrip(userId: string, tripId: string) {
    await this.verifyTripOwnership(tripId, userId);
    await Activity.deleteMany({ tripId });
    await ItineraryDay.deleteMany({ tripId });
    
    // Reset trip completion percentage to 0
    await Trip.updateOne({ _id: tripId }, { $set: { completionPercentage: 0 } });
  }

  // Generate / Initialize a blank day
  async createItineraryDay(userId: string, tripId: string, data: Partial<IItineraryDay>) {
    await this.verifyTripOwnership(tripId, userId);
    
    // Auto-calculate dayNumber if not provided
    let dayNumber = data.dayNumber;
    if (!dayNumber) {
      const lastDay = await ItineraryDay.findOne({ tripId }).sort({ dayNumber: -1 });
      dayNumber = lastDay ? lastDay.dayNumber + 1 : 1;
    }

    const day = new ItineraryDay({
      ...data,
      tripId,
      dayNumber
    });
    return await day.save();
  }

  // Fetch all days and nested activities
  async getItineraryForTrip(userId: string, tripId: string) {
    const trip = await this.verifyTripOwnership(tripId, userId);
    
    let days = await ItineraryDay.find({ tripId }).sort({ dayNumber: 1 }).lean();
    
    // Backfill mechanism for backward compatibility and robust state resolution
    if (days.length === 0 && trip.startDate && trip.totalDays) {
      const daysToCreate = [];
      const start = new Date(trip.startDate);
      
      for (let i = 1; i <= trip.totalDays; i++) {
         const currentDate = new Date(start);
         currentDate.setUTCDate(start.getUTCDate() + (i - 1));
         
         daysToCreate.push({
           tripId: trip._id,
           dayNumber: i,
           date: currentDate,
           title: `Day ${i}`,
           status: 'Planning',
           completedActivities: 0,
           totalActivities: 0,
           completionPercentage: 0,
           totalDuration: 0,
           totalTicketCost: 0,
           totalEstimatedExpenses: 0
         });
      }
      
      if (daysToCreate.length > 0) {
        await ItineraryDay.insertMany(daysToCreate);
        days = await ItineraryDay.find({ tripId }).sort({ dayNumber: 1 }).lean();
      }
    }

    const activities = await Activity.find({ tripId }).sort({ dayId: 1, orderIndex: 1 }).lean();

    // Legacy validation of geographic coordinates is completely removed.
    // Coordinates obtained during generation are persisted and trusted entirely.

    // Map activities into their respective days
    const daysWithActivities = days.map(day => ({
      ...day,
      activities: activities.filter(a => a.dayId.toString() === day._id.toString())
    }));

    return daysWithActivities;
  }

  async updateItineraryDay(userId: string, dayId: string, data: Partial<IItineraryDay>) {
    const day = await ItineraryDay.findById(dayId);
    if (!day) throw { status: 404, message: 'Day not found' };
    await this.verifyTripOwnership(day.tripId.toString(), userId);

    Object.assign(day, data);
    return await day.save();
  }

  async createActivity(userId: string, dayId: string, data: Partial<IActivity>) {
    const day = await ItineraryDay.findById(dayId);
    if (!day) throw { status: 404, message: 'Day not found' };
    const trip = await this.verifyTripOwnership(day.tripId.toString(), userId);

    // Coordinate Resolution
    if (!data.location || (!data.location.latitude && !data.location.longitude)) {
      const resolved = await placeResolutionService.resolvePlace(data.title as string, trip.destination);
      if (resolved) {
        data.location = {
          ...(data.location || {}),
          address: resolved.address,
          latitude: resolved.latitude,
          longitude: resolved.longitude
        };
      }
    }

    const activity = new Activity({
      ...data,
      tripId: day.tripId,
      dayId: day._id
    });
    await activity.save();
    await this.calculateDayProgress(day._id);
    return activity;
  }

  async updateActivity(userId: string, activityId: string, data: Partial<IActivity>) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw { status: 404, message: 'Activity not found' };
    const trip = await this.verifyTripOwnership(activity.tripId.toString(), userId);

    // Block updating core keys
    delete (data as any).tripId;

    // Resolve coords if title changes AND explicit locations aren't being set manually
    if (data.title && data.title !== activity.title) {
       // We only resolve if the request isn't already supplying coordinates
       if (!data.location?.latitude && !data.location?.longitude) {
         const resolved = await placeResolutionService.resolvePlace(data.title as string, trip.destination);
         if (resolved) {
           data.location = {
             ...(data.location || {}),
             ...(activity.location || {}),
             address: resolved.address,
             latitude: resolved.latitude,
             longitude: resolved.longitude
           };
         }
       }
    }
    
    Object.assign(activity, data);
    await activity.save();
    
    await this.calculateDayProgress(activity.dayId);
    return activity;
  }

  async toggleActivityStatus(userId: string, activityId: string, status: string) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw { status: 404, message: 'Activity not found' };
    await this.verifyTripOwnership(activity.tripId.toString(), userId);

    activity.status = status as any;
    if (status === 'Completed') {
      activity.completedAt = new Date();
    } else {
      activity.completedAt = undefined;
    }
    await activity.save();
    await this.calculateDayProgress(activity.dayId);
    return activity;
  }

  async deleteActivity(userId: string, activityId: string) {
    const activity = await Activity.findById(activityId);
    if (!activity) throw { status: 404, message: 'Activity not found' };
    await this.verifyTripOwnership(activity.tripId.toString(), userId);
    
    await activity.deleteOne();
    await this.calculateDayProgress(activity.dayId);
    
    return { success: true };
  }

  async reorderActivities(userId: string, dayId: string, activityIds: string[]) {
    const day = await ItineraryDay.findById(dayId);
    if (!day) throw { status: 404, message: 'Day not found' };
    await this.verifyTripOwnership(day.tripId.toString(), userId);

    // Bulk update approach
    const bulkOps = activityIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, dayId: day._id },
        update: { $set: { orderIndex: index } }
      }
    }));

    if (bulkOps.length > 0) {
       await Activity.bulkWrite(bulkOps);
    }
    
    // Return updated activities sorted correctly
    const activities = await Activity.find({ dayId: day._id }).sort({ orderIndex: 1 }).lean();
    return activities;
  }
}

export const itineraryService = new ItineraryService();
