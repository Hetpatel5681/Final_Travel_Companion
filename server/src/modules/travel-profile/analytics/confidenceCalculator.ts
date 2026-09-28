export class ConfidenceCalculator {
  static calculate(completedTrips: number, hasValidActivities: boolean, avgRating: number): number {
    let confidence = 0;
    
    // Core scaling factor
    if (completedTrips >= 25) confidence += 85;
    else if (completedTrips >= 10) confidence += 60;
    else if (completedTrips >= 5) confidence += 40;
    else if (completedTrips >= 1) confidence += 15;
    
    // Add weights for rich data
    if (hasValidActivities) confidence += 10;
    if (avgRating > 0) confidence += 5;

    // Cap at 99%
    return Math.min(confidence, 99);
  }

  static determineCompleteness(profile: any): number {
    let fields = 0;
    let filled = 0;
    Object.keys(profile).forEach(key => {
      fields++;
      if (profile[key] && profile[key]?.toString().length > 0) filled++;
    });
    return Math.round((filled / fields) * 100);
  }
}
