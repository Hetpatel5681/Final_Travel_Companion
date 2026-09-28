import { Schema } from 'mongoose';
import { IInteraction } from './interaction.types';

export const interactionSchema = new Schema<IInteraction>(
  {
    // Phase 5: Strictly bind to authentic user!
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true // Key for querying individual history explicitly
    },
    // Phase 6: Canonical destination
    destinationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Destination', 
      required: true 
    },
    // Phase 3: Enums
    interactionType: { 
      type: String, 
      enum: ['SEARCH', 'VIEW', 'SAVE', 'LIKE', 'DISLIKE', 'BOOK', 'SKIP', 'UNSAVE'],
      required: true
    },
    // Phase 4: Validated internally!
    weight: { 
      type: Number, 
      required: true,
      min: -1.0,
      max: 1.0
    },
    source: {
      type: String,
      default: 'web_client'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: false, // We explicitly handle timestamp 
  }
);

// PHASE 7: DATABASE INDEXING

// 1. Core combination for filtering a user's known list (e.g. tracking already-shown destinations)
interactionSchema.index({ userId: 1, destinationId: 1 });

// 2. Fetch specific state overrides per destination (e.g. user 'x' liked 'y')
interactionSchema.index({ userId: 1, destinationId: 1, interactionType: 1 });

// 3. For ML Batch Extraction pipeline (Most recent user vectors first)
interactionSchema.index({ userId: 1, timestamp: -1 });

// 4. Aggregation analytics index mapping Popularity by Destination natively
interactionSchema.index({ destinationId: 1, interactionType: 1 });

// NOTE Phase 8: Duplicate Interaction Policy.
// We are explicitly NOT creating a global unique compound index on userId + destinationId. 
// We are architecting an APPEND-ONLY event history. Multiple VIEW/SEARCH events are natively recorded across time.
