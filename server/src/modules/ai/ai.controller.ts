import { Request, Response } from 'express';
import { z } from 'zod';
import { aiService } from './ai.service';
import { aiGenerateRequestSchema } from './ai.schema';

export const generatePreview = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = aiGenerateRequestSchema.parse(req.body);
    
    const start = new Date(validatedData.startDate);
    const end = new Date(validatedData.endDate);
    
    if (start.toString() === 'Invalid Date' || end.toString() === 'Invalid Date' || end < start) {
        res.status(400).json({ success: false, message: 'Invalid requested date range.' });
        return;
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const expectedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Send payload safely to isolated AI component evaluating structured constraints
    const aiResult = await aiService.generateItinerary({ ...validatedData, expectedDays });

    if (!aiResult) {
        res.status(502).json({ success: false, message: 'Unable to generate a valid itinerary.' });
        return;
    }

    // Explicit Date and bounds normalization overriding any AI hallucinations natively
    const normalizedDays = [];
    for (let i = 1; i <= expectedDays; i++) {
        const aiDay = aiResult.days.find((d: any) => d.dayNumber === i) || { dayNumber: i, theme: `Day ${i} Exploring`, activities: [] };
        
        const currentDate = new Date(start);
        currentDate.setUTCDate(start.getUTCDate() + (i - 1));

        normalizedDays.push({
            ...aiDay,
            dayNumber: i,
            date: currentDate.toISOString().split('T')[0]
        });
    }
    
    aiResult.days = normalizedDays;

    res.status(200).json({ success: true, data: aiResult });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, message: 'Validation Error', errors: error.issues });
       return;
    }
    console.error('[AI Controller] Error:', error);
    res.status(500).json({ success: false, message: 'Unable to generate a valid itinerary.' });
  }
};
