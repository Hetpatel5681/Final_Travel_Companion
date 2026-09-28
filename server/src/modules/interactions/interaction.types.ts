import { Types, Document } from 'mongoose';

// Phase 3: Controlled Enumerations
export type InteractionType = 'SEARCH' | 'VIEW' | 'SAVE' | 'LIKE' | 'DISLIKE' | 'BOOK' | 'SKIP' | 'UNSAVE';

// Phase 4: Deterministic Weights (Signaling intent, not AI driven!)
export const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  SEARCH: 0.05,  // Lowest baseline hint
  VIEW: 0.10,    // Passive evaluation
  SKIP: -0.30,   // Explicit lack of immediate interest despite presentation
  UNSAVE: 0,     // Neutral removal of save
  SAVE: 0.50,    // High intent to return
  LIKE: 0.70,    // Explicit emotional signaling
  DISLIKE: -0.70,// Explicit disengagement
  BOOK: 1.00     // Ultimate baseline success parameter
};

export interface IInteraction extends Document {
  userId: Types.ObjectId;
  destinationId: Types.ObjectId;
  interactionType: InteractionType;
  weight: number;
  source: string; // E.g., 'destination_card', 'trip_planner'
  timestamp: Date; // Core requirement for recency weighting natively
}
