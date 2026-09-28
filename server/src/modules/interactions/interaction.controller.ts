import { Request, Response } from 'express';
import { interactionService } from './interaction.service';

/**
 * Phase 10: Service Logic Controller
 */
export const recordInteractionController = async (req: Request, res: Response) => {
  try {
    // Rely strictly on authentication middleware setting req.user
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { destinationId, interactionType, source } = req.body;

    if (!destinationId || !interactionType) {
      return res.status(400).json({ success: false, message: 'Missing structural bounds (destinationId, interactionType)' });
    }

    const interaction = await interactionService.recordInteraction(
      userId,
      destinationId,
      interactionType,
      source
    );

    return res.status(201).json({
      success: true,
      data: interaction
    });

  } catch (error: any) {
    if (error.message.includes('Canonical ID does not exist') || error.message.includes('Invalid interaction type')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Record Interaction Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Internal Error Recording Interaction' });
  }
};

export const getMyInteractionsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const records = await interactionService.getUserHistory(userId, limit);

    return res.status(200).json({
      success: true,
      data: records
    });

  } catch (error: any) {
    console.error('Get Interactions Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving interactions' });
  }
};
