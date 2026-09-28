import express from 'express';
import { submitFeedback } from './feedback.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

// Submission block merges partial analytics subdocuments natively mapping Ground Truth
router.post('/:tripId', submitFeedback);
router.patch('/:tripId', submitFeedback);

export default router;
