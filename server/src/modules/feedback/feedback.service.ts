import { TripFeedback } from './feedback.model';
import { FeedbackAggregator } from './analytics/feedbackAggregator';

export class FeedbackService {
  static async submit(userId: string, tripId: string, data: any) {
    // Allows massive sub-document arrays merging cleanly via partial structures
    const feedback = await TripFeedback.findOneAndUpdate(
      { tripId, userId },
      { $set: data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    // Asynchronously kick off the extensive Sentiment logic & Dataset Builder cascade
    FeedbackAggregator.aggregateAndGenerateLabels(tripId).catch(err => {
      console.error('Feedback Analytics Cascade Error:', err);
    });

    return feedback;
  }
}
