import { Trip, ITrip } from './trip.model';
import mongoose from 'mongoose';
import { ItineraryDay } from '../itinerary/itineraryDay.model';
import { travelAnalyticsEngine } from '../travel-profile/analytics/travelAnalytics.engine';
import { Expense } from '../expenses/expense.model';

export class TripService {
  async createTrip(userId: string, data: Partial<ITrip>) {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      data.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const trip = new Trip({
      ...data,
      createdBy: userId,
    });
    const savedTrip = await trip.save();



    // Trigger ML Analytics Background calculation
    travelAnalyticsEngine.recalculateProfile(userId).catch(err => console.error('ML Sync Error:', err));

    return savedTrip;
  }

  async getTripsByUser(
    userId: string, 
    filters: { tripStatus?: string; country?: string; tripType?: string },
    options: { page: number; limit: number; sort?: string }
  ) {
    const query: any = { createdBy: userId, isDeleted: false };
    
    if (filters.tripStatus) query.tripStatus = filters.tripStatus;
    if (filters.tripType) query.tripType = filters.tripType;
    if (filters.country) query['destination.country'] = filters.country;

    const skip = (options.page - 1) * options.limit;
    
    const [fetchedTrips, total] = await Promise.all([
      Trip.find(query)
        .sort({ createdAt: -1, ...(options.sort ? { [options.sort]: 1 } : {}) })
        .skip(skip)
        .limit(options.limit)
        .lean(),
      Trip.countDocuments(query)
    ]);

    const trips = await Promise.all(fetchedTrips.map(async (trip) => {
      const expenses = await Expense.aggregate([
        { $match: { tripId: trip._id, userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
      return {
        ...trip,
        totalExpenses,
        remainingBudget: trip.budget - totalExpenses
      };
    }));
    
    return {
      trips,
      pagination: {
        total,
        page: options.page,
        pages: Math.ceil(total / options.limit)
      }
    };
  }

  async getTripById(tripId: string, userId: string) {
    const rawTrip = await Trip.findOne({ _id: tripId, isDeleted: false }).lean();
    
    if (!rawTrip) {
      throw { status: 404, message: 'Trip not found' };
    }
    
    if (rawTrip.createdBy.toString() !== userId) {
      throw { status: 403, message: 'Not authorized to access this trip' };
    }

    const expenses = await Expense.aggregate([
      { $match: { tripId: new mongoose.Types.ObjectId(tripId), userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;
    
    return {
      ...rawTrip,
      totalExpenses,
      remainingBudget: rawTrip.budget - totalExpenses
    };
  }

  async updateTrip(tripId: string, userId: string, updateData: Partial<ITrip>) {
    const trip = await Trip.findOne({ _id: tripId, isDeleted: false });
    
    if (!trip) throw { status: 404, message: 'Trip not found' };
    if (trip.createdBy.toString() !== userId) throw { status: 403, message: 'Not authorized to modify this trip' };

    // Prevent updating protected fields
    delete updateData.createdBy;
    delete updateData.aiStatus;
    delete updateData.aiSummary;
    delete updateData.lastAiGeneratedAt;
    delete updateData.isDeleted;
    delete updateData.isArchived;

    if (updateData.startDate || updateData.endDate) {
      const start = updateData.startDate ? new Date(updateData.startDate) : new Date(trip.startDate);
      const end = updateData.endDate ? new Date(updateData.endDate) : new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      updateData.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Apply updates
    Object.assign(trip, updateData);
    
    // Save
    const savedTrip = await trip.save();
    
    // Trigger ML Analytics Background calculation
    travelAnalyticsEngine.recalculateProfile(userId).catch(err => console.error('ML Sync Error:', err));

    return savedTrip;
  }

  async deleteTrip(tripId: string, userId: string) {
    const trip = await Trip.findOne({ _id: tripId, isDeleted: false });
    
    if (!trip) throw { status: 404, message: 'Trip not found' };
    if (trip.createdBy.toString() !== userId) throw { status: 403, message: 'Not authorized to delete this trip' };

    trip.isDeleted = true;
    const deletedTrip = await trip.save();

    // Trigger ML Analytics Background calculation
    travelAnalyticsEngine.recalculateProfile(userId).catch(err => console.error('ML Sync Error:', err));

    return deletedTrip;
  }

  async updateCoordinates(tripId: string, userId: string, latitude: number, longitude: number) {
    const trip = await Trip.findOne({ _id: tripId, isDeleted: false });
    
    if (!trip) throw { status: 404, message: 'Trip not found' };
    if (trip.createdBy.toString() !== userId) throw { status: 403, message: 'Not authorized to modify this trip' };

    trip.destination.latitude = latitude;
    trip.destination.longitude = longitude;
    
    return await trip.save();
  }
}

export const tripService = new TripService();
