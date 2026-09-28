import { Request, Response } from 'express';
import { OnboardingService } from './onboarding.service';

export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const data = req.body;
    
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    
    const onboarding = await OnboardingService.setupProfile(userId, data);
    
    return res.status(200).json({ status: 'success', data: onboarding });
  } catch (error: any) {
    console.error('Submit Onboarding Error:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to submit onboarding' });
  }
};
