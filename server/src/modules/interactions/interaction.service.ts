import { Types } from 'mongoose';
import { Interaction } from './interaction.model';
import { InteractionType, INTERACTION_WEIGHTS } from './interaction.types';
import { Destination } from '../destinations/destination.model';

export class InteractionService {
  /**
   * Phase 10: Process user interactions safely
   * Authenticates conceptually via the Controller passing the `userId`.
   */
  async recordInteraction(
    userId: string | Types.ObjectId,
    destinationId: string | Types.ObjectId,
    interactionType: InteractionType,
    source: string = 'web_client'
  ) {
    // 1. Validate canonical destination exists natively!
    const dest = await Destination.findById(destinationId);
    if (!dest) {
      throw new Error('Destination Validation Failed: Canonical ID does not exist.');
    }

    // 2. Map weight deterministically server-side!
    const weight = INTERACTION_WEIGHTS[interactionType];
    if (weight === undefined) {
      throw new Error(`Invalid interaction type provided: ${interactionType}`);
    }

    // 3. Store Append-only History
    const newInteraction = new Interaction({
      userId: new Types.ObjectId(userId),
      destinationId: new Types.ObjectId(destinationId),
      interactionType,
      weight, // Assigned unconditionally by Backend
      source,
      timestamp: new Date()
    });

    await newInteraction.save();
    return newInteraction;
  }

  /**
   * Safe fetch for current user profile interactions.
   */
  async getUserHistory(userId: string | Types.ObjectId, limit: number = 50) {
    return await Interaction.find({ userId: new Types.ObjectId(userId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('destinationId');
  }
}

export const interactionService = new InteractionService();
