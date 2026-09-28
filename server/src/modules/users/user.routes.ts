import { Router } from 'express';
import { getProfile, updateProfile, changePassword, deleteAccount } from './user.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);

export default router;
