import { Onboarding } from './onboarding.schema';
import { travelAnalyticsEngine } from '../travel-profile/analytics/travelAnalytics.engine';

export class OnboardingService {
  static async setupProfile(userId: string, data: any) {
    const onboarding = await Onboarding.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    // Simulate initial personality generation using Travel Intelligence Engine
    await travelAnalyticsEngine.recalculateProfile(userId, true).catch(err => {
      console.error('Initial Cold-Start ML Serialization Error:', err);
    });

    return onboarding;
  }
}
