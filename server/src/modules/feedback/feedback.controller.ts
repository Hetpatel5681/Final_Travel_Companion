import { Request, Response } from 'express';
import { FeedbackService } from './feedback.service';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { tripId } = req.params;
    const data = req.body;
    
    if (!tripId) {
      return res.status(400).json({ status: 'error', message: 'Trip ID is required.' });
    }
    
    const feedback = await FeedbackService.submit(userId, tripId, data);
    
    return res.status(200).json({ status: 'success', data: feedback });
  } catch (error: any) {
    console.error('Submit Feedback Error:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to submit trip feedback' });
  }
};
