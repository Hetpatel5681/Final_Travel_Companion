import express from 'express';
import { submitOnboarding } from './onboarding.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);
router.post('/', submitOnboarding);
router.patch('/', submitOnboarding);

export default router;
