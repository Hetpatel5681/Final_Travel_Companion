import { Request, Response } from 'express';
import { TravelProfile } from './travelProfile.model';

export const getTravelProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    let profile = await TravelProfile.findOne({ userId });
    
    if (!profile) {
      // Setup a baseline default profile structure in case no trips exist
      profile = new TravelProfile({ userId });
      await profile.save();
    }
    
    const topHistory = profile.personalityHistory?.[profile.personalityHistory.length - 1];

    res.status(200).json({
      status: 'success',
      data: {
        travelDNA: profile.travelDNA,
        personality: profile.personalityScores,
        personalityVector: profile.personalityVector,
        confidence: topHistory?.confidence || profile.learningProgress?.confidence || 0,
        reasons: topHistory?.reasons || [],
        learningProgress: profile.learningProgress,
        lastUpdated: profile.lastAnalyticsRun,
        modelCompatibility: profile.modelCompatibility,
        featureMetadata: profile.featureMetadata
      }
    });
  } catch (error: any) {
    console.error('Error fetching travel profile:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Failed to fetch travel profile' 
    });
  }
};
