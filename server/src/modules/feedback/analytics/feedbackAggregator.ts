import { SentimentProcessor } from './sentimentProcessor';
import { TripFeedback } from '../feedback.model';
import { travelAnalyticsEngine } from '../../travel-profile/analytics/travelAnalytics.engine';

export class FeedbackAggregator {
  static async aggregateAndGenerateLabels(tripId: string) {
     const doc = await TripFeedback.findOne({ tripId });
     if (!doc) return;

     let posCount = 0;
     let negCount = 0;

     // Evolve Journals utilizing NLP Sentiment Processor
     if (doc.journals && doc.journals.length > 0) {
        for (let j of doc.journals) {
           if (j.sentimentScore === 'Unprocessed' && j.entry) {
              const res = await SentimentProcessor.analyzeJournal(j.entry);
              j.sentimentScore = res;
           }
           if (j.sentimentScore === 'Positive') posCount++;
           if (j.sentimentScore === 'Negative') negCount++;
        }
     }

     // Evaluate destination baseline feedback for heuristics
     doc.destinationFeedback?.forEach(d => {
        if (d.rating >= 4 || d.favorite) posCount++;
        if (d.rating <= 2) negCount++;
     });

     // Apply Global ML Master Label Constraints
     if (posCount > negCount * 2) {
       doc.mlLabel = 'Positive Trip';
     } else if (negCount > posCount * 2) {
       doc.mlLabel = 'Negative Trip'; 
     } else {
       doc.mlLabel = 'Neutral Trip';
     }

     await doc.save();
     
     // 🚀 Final link mapping into the standalone Travel Analytics Engine Pipeline
     await travelAnalyticsEngine.recalculateProfile(doc.userId.toString()).catch(err => {
       console.error('Failed to dispatch Analytics engine cascade update:', err);
     });
  }
}
