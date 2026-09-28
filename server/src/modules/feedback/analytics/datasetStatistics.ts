/**
 * Aggregates Dataset Health Metrics (Dataset Statistics)
 */
export class DatasetStatistics {
  static async generateHealthReport(feedbacks: any[]) {
    // Generate class balance map
    let positiveTrips = 0;
    let negativeTrips = 0;
    let neutralTrips = 0;
    let missingValuesCount = 0;
    
    feedbacks.forEach(f => {
       if (f.mlLabel === 'Positive Trip') positiveTrips++;
       else if (f.mlLabel === 'Negative Trip') negativeTrips++;
       else if (f.mlLabel === 'Neutral Trip') neutralTrips++;
       
       if (!f.destinationFeedback || f.destinationFeedback.length === 0) missingValuesCount++;
    });

    const total = feedbacks.length;
    
    return {
       numberOfUsers: new Set(feedbacks.map(f => f.userId.toString())).size,
       totalTrips: total,
       positiveTrips,
       negativeTrips,
       neutralTrips,
       missingValues: missingValuesCount,
       classBalance: total > 0 ? {
         positivePct: Math.round((positiveTrips / total) * 100),
         negativePct: Math.round((negativeTrips / total) * 100),
         neutralPct: Math.round((neutralTrips / total) * 100)
       } : { positivePct: 0, negativePct: 0, neutralPct: 0 }
    };
  }
}
