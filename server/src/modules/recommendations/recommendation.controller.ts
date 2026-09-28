import { Request, Response } from 'express';
import { recommendationService } from './recommendation.service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import z from 'zod';

export class RecommendationController {
  
  public getDestinations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // 1. Strict user identity from JWT
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // 2. Validate k parameter (integers between 1 and 50 strictly)
      let k = 5;
      if (req.query.k !== undefined) {
        const parsedK = parseInt(req.query.k as string, 10);
        if (isNaN(parsedK) || parsedK < 1 || parsedK > 50 || req.query.k.toString().includes('.')) {
           res.status(400).json({ success: false, message: 'Invalid top-k parameter requested. Must be an integer between 1 and 50.' });
           return;
        }
        k = parsedK;
      }

      // 3. Delegate exclusively to Service for pure deterministic mapping math
      const recommendations = await recommendationService.getRecommendations(userId, k);

      res.status(200).json({
        success: true,
        count: recommendations.length,
        data: recommendations
      });
    } catch (error: any) {
      console.error('[RecommendationController] Error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error calculating recommendations', error: error?.message });
    }
  };
}

export const recommendationController = new RecommendationController();
