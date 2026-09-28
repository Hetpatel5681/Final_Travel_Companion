import express from 'express';
import { getTravelProfile } from './travelProfile.controller';
import { protect } from '../../middlewares/auth.middleware'; 

const router = express.Router();

router.use(protect); // Ensure secure boundary

router.get('/me', getTravelProfile);

export default router;
