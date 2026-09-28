import { Router } from 'express';
import { recommendationController } from './recommendation.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

// Phase 10: Secure minimal API endpoint
router.get('/destinations', protect, recommendationController.getDestinations);

export default router;
