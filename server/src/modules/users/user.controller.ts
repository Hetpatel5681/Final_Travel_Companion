import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import * as userService from './user.service';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.getProfile(req.user?.id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.updateProfile(req.user?.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    await userService.changePassword(req.user?.id, req.body);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await userService.deleteAccount(req.user?.id);
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
