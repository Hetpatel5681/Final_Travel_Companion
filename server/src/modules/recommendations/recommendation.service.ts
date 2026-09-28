import { IDestination } from '../destinations/destination.types';
import { Destination } from '../destinations/destination.model';
import { Interaction } from '../interactions/interaction.model';
import { TravelProfile } from '../travel-profile/travelProfile.model';
import { featureEngineeringService } from './feature-engineering.service';
import { IUserTravelProfile } from '../travel-profile/travelProfile.types';
import { IInteraction } from '../interactions/interaction.types';
import { generateExplanation, ExplanationResult } from './recommendation.explanation';

export interface RecommendationResult {
  destinationId: string;
  name: string;
  country: string;
  state?: string;
  region: string;
  description: string;
  destinationType: string[];
  similarityScore: number;
  explanation?: ExplanationResult;
}

export class RecommendationService {
  /**
   * Phase 3: Core Deterministic Cosine Similarity
   * Returns exact score matching math: dot(u,v) / (||u|| * ||v||)
   * Prevents NaN, Infinity by returning 0 if magnitude is 0.
   */
  public cosineSimilarity(userVector: number[], destinationVector: number[]): number {
    if (userVector.length !== destinationVector.length) {
      throw new Error('Vectors must be of the same length');
    }

    let dotProduct = 0;
    let normUser = 0;
    let normDest = 0;

    for (let i = 0; i < userVector.length; i++) {
      dotProduct += userVector[i] * destinationVector[i];
      normUser += Math.pow(userVector[i], 2);
      normDest += Math.pow(destinationVector[i], 2);
    }

    if (normUser === 0 || normDest === 0) {
      return 0; // Phase 4 Zero-Vector safety
    }

    return dotProduct / (Math.sqrt(normUser) * Math.sqrt(normDest));
  }

  /**
   * Orchestrates fetching user profile, interaction historical aggregation, 
   * retrieving destinations, running scoring, and top-k slicing.
   */
  public async getRecommendations(userId: string, k: number = 5): Promise<RecommendationResult[]> {
    // 1. Fetch User Data
    const userProfile = (await TravelProfile.findOne({ userId: userId }).lean()) as unknown as IUserTravelProfile | undefined;
    
    // 2. Fetch Interactions (Populate destinationId structurally for feature engineering native connections)
    const rawInteractions = await Interaction.find({ userId: userId })
      .populate('destinationId')
      .lean();
    
    const validInteractions = rawInteractions
      .filter((interaction: any) => interaction.destinationId) // ensure populated structurally securely
      .map((interaction: any) => ({
        interaction: interaction as IInteraction,
        destination: interaction.destinationId as IDestination
      }));

    // 3. Engineer exactly as M7.3 (Single Source of Truth)
    // Note: If no userProfile or validInteractions, cold-start logic inside featureEngineeringService
    // provides the base mathematically safe [0...0] or raw preference array.
    const userVector = featureEngineeringService.engineerUserVector(userProfile || undefined, validInteractions);

    // 4. Load Active Destinations
    const activeDestinations = (await Destination.find({ isActive: true }).lean()) as unknown as IDestination[];

    // 5. Calculate Similarities
    const results: RecommendationResult[] = [];
    
    for (const dest of activeDestinations) {
      const destVector = featureEngineeringService.extractDestinationVector(dest);
      const similarity = this.cosineSimilarity(userVector, destVector);
      
      results.push({
        destinationId: dest._id!.toString(),
        name: dest.name,
        country: dest.country,
        state: dest.state,
        region: dest.region,
        description: dest.description,
        destinationType: dest.destinationType,
        similarityScore: similarity
      });
    }

    // 6. Sort & Slice (Score DESC, then Name ASC)
    results.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore; // DESC by score
      }
      return a.name.localeCompare(b.name); // ASC by name for stability/identically scored ties
    });

    const topK = results.slice(0, k);

    // 7. Generate Explanations exactly only for Top-K to save cycles (Phase 7 isolated layer)
    topK.forEach((rec, index) => {
       // Find the original destination securely mapping
       const destDoc = activeDestinations.find(d => d._id!.toString() === rec.destinationId);
       if (destDoc) {
          const destVector = featureEngineeringService.extractDestinationVector(destDoc);
          rec.explanation = generateExplanation(userVector, destVector, destDoc);
       }
    });

    return topK;
  }
}

export const recommendationService = new RecommendationService();
