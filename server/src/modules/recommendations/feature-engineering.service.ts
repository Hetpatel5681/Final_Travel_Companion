import { IUserTravelProfile as ITravelProfile } from '../travel-profile/travelProfile.types';
import { InteractionType, INTERACTION_WEIGHTS, IInteraction } from '../interactions/interaction.types';
import { IDestination } from '../destinations/destination.types';

// Phase 1: Canonical 14 Dimensions (Strict Ordering exactly as requested)
export const CANONICAL_DIMENSIONS = [
  'Explorer',
  'Foodie',
  'Luxury',
  'Budget',
  'Nature',
  'Photographer',
  'Backpacker',
  'Family',
  'Pilgrim',
  'Adventure',
  'HistoryLover',
  'Nightlife',
  'Relaxation',
  'Shopping'
] as const;

export type TravelDNADimension = typeof CANONICAL_DIMENSIONS[number];

export class FeatureEngineeringService {
  /**
   * Phase 5: Deterministic Destination Vector Generator
   * Maps 14 exact keys in fixed strict sequence dynamically into an Array.
   */
  public extractDestinationVector(dest: IDestination): number[] {
    if (!dest.travelDNA) {
      return Array(14).fill(0);
    }
    return CANONICAL_DIMENSIONS.map(dim => {
      const val = (dest.travelDNA as any)[dim];
      return typeof val === 'number' ? Math.max(0, Math.min(1, val)) : 0;
    });
  }

  /**
   * Generates flattened baseline array for users fallback/cold start natively.
   */
  public extractUserBaselineVector(profile?: ITravelProfile): number[] {
    if (!profile || !profile.travelDNA) {
      // Complete absolute cold start without any preferences
      return Array(14).fill(0.0);
    }
    return CANONICAL_DIMENSIONS.map(dim => {
      const val = (profile.travelDNA as any)[dim];
      return typeof val === 'number' ? Math.max(0, Math.min(1, val)) : 0;
    });
  }

  /**
   * Phase 4: Deterministic Mathematical Normalization
   * Normalizes an unbounded aggregated vector rigidly into [0.0, 1.0] space.
   * Method:
   * 1. Floors boundaries at 0 so no dimension physically becomes completely negative.
   * 2. Finds the maximum element logic scale.
   * 3. Divides all elements by max uniformly to stabilize peak features dynamically (Min-Max bounding if max > 1, else direct clip).
   */
  public normalizeVector(vector: number[]): number[] {
    // Stage 1: Floor negatives to exactly 0 (We cannot have mathematical 'anti-Foodie' mathematically in Cosine distance mapped correctly without axis clipping)
    let floored = vector.map(v => Math.max(0.0, v));
    
    // Stage 2: Cap the highest values. If peak > 1.0, scale everything proportionally to preserve ratio (Scale Down)
    // If maximum is < 1.0, we just clamp or return as is so we do not artificially inflate baseline low-data signals.
    const maxVal = Math.max(...floored);
    if (maxVal > 1.0) {
      floored = floored.map(v => v / maxVal);
    }

    // Final explicitly bounded confirmation layer
    return floored.map(v => Math.min(1.0, Math.max(0.0, Number(v.toFixed(4)))));
  }

  /**
   * Phase 2 & 3 & 6: User Feature Engineering Core Compiler
   * Retrieves baseline TravelDNA + Applies deterministic signals from Interacted Location DNA.
   */
  public engineerUserVector(
    userProfile: ITravelProfile | undefined,
    interactionHistory: { interaction: IInteraction, destination: IDestination }[]
  ): number[] {
    // 1. Fetch baseline (Phase 6: Cold start gracefully maps here natively if interactions length === 0)
    const baseVector = this.extractUserBaselineVector(userProfile);

    // If completely empty history, simply return cleanly
    if (!interactionHistory || interactionHistory.length === 0) {
      return baseVector; // Remains strictly mapped to [0,1]
    }

    // 2. Clone baseline for active manipulation (Aggregator)
    let aggregatedVector = [...baseVector];

    // 3. Loop deterministic math
    interactionHistory.forEach(({ interaction, destination }) => {
      const destVector = this.extractDestinationVector(destination);
      const weight = INTERACTION_WEIGHTS[interaction.interactionType] || 0;

      // Mathematical Application logic:
      // If a user views a Mountain (Nature: 0.9, Photography: 0.8), 
      // with Weight (View = 0.10)... 
      // The aggregated Nature metric goes up by +0.09 linearly.
      for (let i = 0; i < 14; i++) {
        aggregatedVector[i] += (destVector[i] * weight);
      }
    });

    // 4. Return Normalized explicitly
    return this.normalizeVector(aggregatedVector);
  }
}

export const featureEngineeringService = new FeatureEngineeringService();
