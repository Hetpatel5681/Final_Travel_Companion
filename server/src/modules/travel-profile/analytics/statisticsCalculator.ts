import { SeasonDetector } from '../utils/seasonDetector';

export class StatisticsCalculator {
  static calculateAverages(trips: any[]) {
    let budgetTotal = 0;
    let durationTotal = 0;
    let travelersTotal = 0;
    
    trips.forEach(t => {
      budgetTotal += t.budget || 0;
      durationTotal += t.totalDays || 0;
      travelersTotal += t.numberOfTravelers || 0;
    });

    const v = trips.length;
    return {
      averageBudget: v ? Math.round(budgetTotal / v) : 0,
      averageTripDuration: v ? Math.round(durationTotal / v) : 0,
      averageTravelers: v ? Math.round(travelersTotal / v) : 0,
    };
  }

  static calculateRatingDistribution(trips: any[]): { distribution: Map<string, number>, average: number } {
    const distribution = new Map<string, number>();
    // Trips don't natively have ratings yet per schema, so initialize zero baseline context to prevent ML breakdown.
    ['1', '2', '3', '4', '5'].forEach(r => distribution.set(r, 0));
    return { distribution, average: 0 };
  }

  static calculateActivityStats(activities: any[]): Map<string, number> {
    const map = new Map<string, number>();
    activities.forEach(a => {
      if (a.category) {
        map.set(a.category, (map.get(a.category) || 0) + 1);
      }
    });
    return map;
  }

  static calculateSeasonStats(trips: any[]): Map<string, number> {
    const map = new Map<string, number>();
    trips.forEach(t => {
      if (t.startDate) {
        const season = SeasonDetector.getSeason(new Date(t.startDate), t.destination?.country);
        map.set(season, (map.get(season) || 0) + 1);
      }
    });
    return map;
  }

  static calculateCompletionRates(trips: any[]) {
    const total = trips.length;
    const completed = trips.filter(t => t.tripStatus === 'Completed').length;
    const cancelled = trips.filter(t => t.tripStatus === 'Cancelled').length;
    return {
      completedTrips: completed,
      cancelledTrips: cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}
