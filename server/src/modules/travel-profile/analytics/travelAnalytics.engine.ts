import { Trip } from '../../trips/trip.model';
import { Activity } from '../../itinerary/activity.model';
import { TravelProfile } from '../travelProfile.model';
import { FeatureExtractor } from './featureExtractor';
import { StatisticsCalculator } from './statisticsCalculator';
import { TravelDNAGenerator } from './travelDNAGenerator';
import { ConfidenceCalculator } from './confidenceCalculator';
import { BudgetClassifier } from '../utils/budgetClassifier';
import { TravelPersonalityEngine } from './travelPersonality.engine';

class ProfileFeatureCounter {
  static count(profileData: any): number {
    let count = 0;
    count += (profileData.preferredTravelStyles?.length || 0);
    count += (profileData.preferredTripTypes?.length || 0);
    count += (profileData.preferredCountries?.length || 0);
    count += (profileData.preferredCities?.length || 0);
    count += (profileData.preferredDestinationTypes?.length || 0);
    if (profileData.activityStatistics) count += profileData.activityStatistics.size || 0;
    if (profileData.seasonStatistics) count += profileData.seasonStatistics.size || 0;
    if (profileData.travelDNA) count += profileData.travelDNA.size || 0;
    count += 8; // Base categorical features mapped directly
    return count;
  }
}

export class TravelAnalyticsEngine {
  async recalculateProfile(userId: string, isColdStart: boolean = false) {
    try {
      // 1. Fetch raw datasets filtering by user
      const trips = await Trip.find({ createdBy: userId, isDeleted: false }).lean();
      
      // If the user deleted their only trip, generate a blank baseline instead of silently failing
      if (trips.length === 0) {
        await TravelProfile.findOneAndUpdate(
          { userId },
          { $set: { completedTrips: 0, featureCount: 0, profileCompleteness: 0, recommendationConfidence: 0 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return;
      }
      
      const tripIds = trips.map(t => t._id);
      const activities = await Activity.find({ tripId: { $in: tripIds } }).lean();

      // 2. Feature Extraction Layer
      const destinations = FeatureExtractor.extractDestinations(trips);
      const styles = FeatureExtractor.extractTravelStyles(trips);
      
      // 3. Mathematical Operations Layer
      const averages = StatisticsCalculator.calculateAverages(trips);
      const activityStats = StatisticsCalculator.calculateActivityStats(activities);
      const seasonStats = StatisticsCalculator.calculateSeasonStats(trips);
      const ratingDist = StatisticsCalculator.calculateRatingDistribution(trips);
      const completionStats = StatisticsCalculator.calculateCompletionRates(trips);
      
      const budgetTypes = BudgetClassifier.classify(averages.averageBudget, averages.averageTripDuration, averages.averageTravelers);

      // 4. ML Normalization (Travel DNA Generator)
      const travelDNA = TravelDNAGenerator.generate(activityStats, destinations.destinationTypes, styles.tripTypes);

      // 5. Build ML Profile Output Node Layer Object
      const profileData: any = {
        completedTrips: completionStats.completedTrips,
        cancelledTrips: completionStats.cancelledTrips,
        completionRate: completionStats.completionRate,
        
        preferredTravelStyles: styles.travelStyles,
        preferredTripTypes: styles.tripTypes,
        preferredCountries: destinations.countries,
        preferredCities: destinations.cities,
        preferredDestinationTypes: destinations.destinationTypes,
        
        activityStatistics: activityStats,
        seasonStatistics: seasonStats,
        ratingDistribution: ratingDist.distribution,
        
        budgetRange: budgetTypes.range,
        budgetPersonality: budgetTypes.personality,
        averageBudget: averages.averageBudget,
        averageTripDuration: averages.averageTripDuration,
        averageTravelers: averages.averageTravelers,
        averageRating: ratingDist.average,
        
        travelDNA: travelDNA,
        
        // ML Metadata tracking
        datasetVersion: '1.0',
        lastAnalyticsRun: new Date()
      };

      // Scoring logic 
      const featureCount = ProfileFeatureCounter.count(profileData);
      const completeness = ConfidenceCalculator.determineCompleteness(profileData);
      const confidence = ConfidenceCalculator.calculate(profileData.completedTrips, activityStats.size > 0, profileData.averageRating);
      
      profileData.featureCount = featureCount;
      profileData.profileCompleteness = completeness;
      profileData.recommendationConfidence = confidence;

      // 6. Non-Blocking DB Output Syncing
      await TravelProfile.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // 7. Extract flat arrays for Python classifiers
      await TravelPersonalityEngine.classifyPersonality(userId, isColdStart);
    } catch (err) {
      console.error('Travel Analytics Engine Execution Failed for UserId:', userId, err);
    }
  }
}

export const travelAnalyticsEngine = new TravelAnalyticsEngine();
