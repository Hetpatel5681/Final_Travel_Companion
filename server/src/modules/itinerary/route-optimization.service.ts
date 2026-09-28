import { Activity, IActivity } from './activity.model';
import { ItineraryDay } from './itineraryDay.model';
import { Trip } from '../trips/trip.model';
import mongoose from 'mongoose';
import { routeService } from '../maps/route.service';

/**
 * Calculates distance in kilometers between two geographic coordinates using Haversine formula.
 */
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates length of a route and returns total cumulative distance traversing it in sequence.
 */
function calculateRouteDistance(route: IActivity[]): number {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const p1 = route[i].location!;
    const p2 = route[i + 1].location!;
    distance += getHaversineDistanceKm(p1.latitude!, p1.longitude!, p2.latitude!, p2.longitude!);
  }
  return Number(distance.toFixed(2));
}

class RouteOptimizationService {
  private async verifyTripOwnership(tripId: string, userId: string) {
    const trip = await Trip.findOne({ _id: tripId, createdBy: userId, isDeleted: false });
    if (!trip) throw { status: 403, message: 'Unauthorized or Trip not found' };
    return trip;
  }

  /**
   * Previews route distance improvements using Nearest Neighbor algorithmic optimization.
   * Does NOT alter the database.
   */
  public async previewDayOptimization(userId: string, dayId: string) {
    const day: any = await ItineraryDay.findById(dayId).lean();
    if (!day) throw { status: 404, message: 'Day not found' };
    await this.verifyTripOwnership(day.tripId.toString(), userId);

    const activities = await Activity.find({ dayId }).sort({ orderIndex: 1 }).lean();

    // Separate activities into Coordinate-valid vs Non-valid
    const validActivities: IActivity[] = [];
    const invalidActivities: IActivity[] = [];

    activities.forEach(a => {
      if (typeof a.location?.latitude === 'number' && typeof a.location?.longitude === 'number') {
        validActivities.push(a as any);
      } else {
        invalidActivities.push(a as any);
      }
    });

    if (validActivities.length < 2) {
      throw { status: 400, message: 'Route optimization requires at least two activities with valid locations.' };
    }

    // NEAREST NEIGHBOR ALGORITHM - Generate Candidate 2
    const unvisited = [...validActivities];
    const nnCandidate: IActivity[] = [];
    let current = unvisited.shift()!;
    nnCandidate.push(current);

    while (unvisited.length > 0) {
      let nearestDist = Infinity;
      let nearestIndex = -1;

      for (let i = 0; i < unvisited.length; i++) {
        const candidate = unvisited[i];
        const dist = getHaversineDistanceKm(
          current.location!.latitude!, current.location!.longitude!,
          candidate.location!.latitude!, candidate.location!.longitude!
        );

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = i;
        }
      }
      current = unvisited[nearestIndex];
      nnCandidate.push(current);
      unvisited.splice(nearestIndex, 1);
    }

    // REVERSE NEAREST NEIGHBOR ALGORITHM - Generate Candidate 3
    const unvisitedRev = [...validActivities];
    const revCandidate: IActivity[] = [];
    current = unvisitedRev.pop()!; // Start from end
    revCandidate.push(current);

    while (unvisitedRev.length > 0) {
      let nearestDist = Infinity;
      let nearestIndex = -1;

      for (let i = 0; i < unvisitedRev.length; i++) {
        const candidate = unvisitedRev[i];
        const dist = getHaversineDistanceKm(
          current.location!.latitude!, current.location!.longitude!,
          candidate.location!.latitude!, candidate.location!.longitude!
        );

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIndex = i;
        }
      }
      current = unvisitedRev[nearestIndex];
      revCandidate.push(current);
      unvisitedRev.splice(nearestIndex, 1);
    }

    // Evaluate Candidates uniformly using RouteService (which enforces OSRM road distance where available)
    const [routeA, routeB, routeC] = await Promise.all([
      routeService.getRouteForActivities(validActivities),
      routeService.getRouteForActivities(nnCandidate),
      routeService.getRouteForActivities(revCandidate)
    ]);

    const distA = routeA.data?.totalDistanceKm || 0;
    const distB = routeB.data?.totalDistanceKm || 0;
    const distC = routeC.data?.totalDistanceKm || 0;

    let optimizedSequence = validActivities;
    let minDistance = distA;
    let routingSource = routeA.data?.routingSource || 'haversine';

    // Strictly enforce selection: only change if it strongly reduces total actual distance
    if (distB < minDistance) {
       minDistance = distB;
       optimizedSequence = nnCandidate;
       routingSource = routeB.data?.routingSource || routingSource;
    }
    if (distC < minDistance) {
       minDistance = distC;
       optimizedSequence = revCandidate;
       routingSource = routeC.data?.routingSource || routingSource;
    }

    const originalDistanceKm = distA;
    const optimizedDistanceKm = minDistance;
    let distanceSavedKm = 0;
    let improvementPercentage = 0;

    if (optimizedDistanceKm < originalDistanceKm) {
       distanceSavedKm = Number((originalDistanceKm - optimizedDistanceKm).toFixed(2));
       improvementPercentage = originalDistanceKm > 0 ? Number(((distanceSavedKm / originalDistanceKm) * 100).toFixed(1)) : 0;
    }

    return {
      originalDistanceKm,
      optimizedDistanceKm,
      distanceSavedKm,
      improvementPercentage,
      routingSource,
      originalOrder: validActivities,
      optimizedOrder: optimizedSequence,
      activitiesWithoutCoordinates: invalidActivities
    };
  }

  /**
   * Applies the finalized order derived from optimization. 
   * It takes consecutive Valid ordered IDs, appends explicitly invalid IDs, and rewrites orderIndex spanning the list.
   */
  public async applyDayOptimization(userId: string, dayId: string, optimizedActivityIds: string[]) {
    const day = await ItineraryDay.findById(dayId);
    if (!day) throw { status: 404, message: 'Day not found' };
    await this.verifyTripOwnership(day.tripId.toString(), userId);

    // Fetch all activities sequentially
    const activities = await Activity.find({ dayId }).sort({ orderIndex: 1 }).lean();
    
    // We only process if ID count matches exactly what we expect
    const validActivitiesMap = new Map();
    const invalidActivities: any[] = [];
    
    activities.forEach(a => {
      if (typeof a.location?.latitude === 'number' && typeof a.location?.longitude === 'number') {
        validActivitiesMap.set(a._id.toString(), a);
      } else {
        invalidActivities.push(a);
      }
    });

    if (optimizedActivityIds.length !== validActivitiesMap.size) {
      throw { status: 400, message: 'Length of optimized activity array does not match valid day activities.' };
    }

    // Prepare unified sequence: newly optimized valid ones, seamlessly appended by unaltered invalid ones
    const finalSequence = [];
    for (const id of optimizedActivityIds) {
      finalSequence.push(id);
    }
    for (const inv of invalidActivities) {
      finalSequence.push(inv._id.toString());
    }

    // Apply the Mongoose BulkWrite natively!
    const bulkOps = finalSequence.map((id, index) => ({
      updateOne: {
        filter: { _id: id, dayId: day._id },
        update: { $set: { orderIndex: index } }
      }
    }));

    if (bulkOps.length > 0) {
      await Activity.bulkWrite(bulkOps as any);
    }

    return { success: true };
  }
}

export const routeOptimizationService = new RouteOptimizationService();
