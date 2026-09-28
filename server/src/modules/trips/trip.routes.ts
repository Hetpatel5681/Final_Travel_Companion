import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { createTrip, getTrips, getTripById, updateTrip, deleteTrip, updateTripCoordinates, generateAITrip, generateAITripForExisting } from './trip.controller';

const router = Router();

router.use(protect); // All routes in this router require authentication

router.route('/generate')
  .post(generateAITrip);

router.route('/:id/generate')
  .post(generateAITripForExisting);

router.route('/')
  .post(createTrip)
  .get(getTrips);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.route('/:id/coordinates')
  .patch(updateTripCoordinates);

export default router;
