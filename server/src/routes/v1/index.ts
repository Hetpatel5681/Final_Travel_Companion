import { Router } from 'express';
import healthRoute from './health.route';
import { authRoutes } from '../../modules/auth';
import { userRoutes } from '../../modules/users';
import { tripRoutes } from '../../modules/trips';
import { itineraryRoutes } from '../../modules/itinerary';
import { expenseRoutes } from '../../modules/expenses';

import travelProfileRoutes from '../../modules/travel-profile/travelProfile.routes';
import feedbackRoutes from '../../modules/feedback/feedback.routes';
import onboardingRoutes from '../../modules/onboarding/onboarding.routes';
import interactionRoutes from '../../modules/interactions/interaction.routes';
import recommendationRoutes from '../../modules/recommendations/recommendation.routes';

const router = Router();

router.use('/recommendations', recommendationRoutes);

router.use('/health', healthRoute);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/trips', tripRoutes);
router.use('/itinerary', itineraryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/travel-profile', travelProfileRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/interactions', interactionRoutes);

export default router;
