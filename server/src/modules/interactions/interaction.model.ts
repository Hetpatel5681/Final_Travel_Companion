import mongoose from 'mongoose';
import { IInteraction } from './interaction.types';
import { interactionSchema } from './interaction.schema';

export const Interaction = mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', interactionSchema);
