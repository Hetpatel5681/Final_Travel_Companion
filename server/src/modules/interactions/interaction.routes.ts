import express from 'express';
import { recordInteractionController, getMyInteractionsController } from './interaction.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

/**
 * PHASE 9: API DESIGN
 * POST /api/v1/interactions 
 * GET  /api/v1/interactions/me
 * 
 * Notice standard use of global `protect` JWT middleware shielding interactions securely.
 */

router.post('/', protect, recordInteractionController);
router.get('/me', protect, getMyInteractionsController);

export default router;
