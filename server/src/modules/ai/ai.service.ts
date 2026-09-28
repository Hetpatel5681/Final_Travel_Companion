import { GoogleGenAI, Type, Schema } from '@google/genai';
import { aiItineraryResponseSchema } from './ai.schema';

const geminiSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    summary: { type: Type.STRING, description: "A short summary of the overall generated trip." },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING, description: "A short theme for the day, e.g., 'Historical Exploration'" },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "The canonical name of the place, e.g., 'Lake Pichola' or 'City Palace'." },
                description: { type: Type.STRING, description: "A 1-2 sentence compelling description." },
                category: { type: Type.STRING, description: "E.g., 'Attraction', 'Food', 'Transit', 'Accommodation', 'Activity'" }
              },
              required: ["title", "description", "category"]
            }
          }
        },
        required: ["dayNumber", "theme", "activities"]
      }
    }
  },
  required: ["tripTitle", "summary", "days"]
};

export class AiService {
  private gemini: GoogleGenAI | null = null;

  constructor() {
    // Lazy initialized
  }

  isConfigured(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !this.gemini) {
      this.gemini = new GoogleGenAI({ apiKey });
    }
    return this.gemini !== null;
  }

  async generateItinerary(params: any): Promise<any | null> {
    if (!this.isConfigured()) {
        throw new Error('GEMINI_API_KEY is required for live AI generation.');
    }

    const systemInstruction = `You are an AI travel itinerary planner.
Generate realistic travel itineraries based strictly on the user's supplied parameters.
Return ONLY the requested structured JSON.
All monetary amounts must be represented as numeric INR values.
Do not invent coordinates. Do not invent place IDs. Do not invent route distances or travel times.
Prefer recognizable real-world attractions, landmarks, and food experiences relevant to the destination.
Respect the number of travel days (${params.expectedDays} days).
Avoid excessive activities per day.
Keep the schedule realistic and geographically coherent where possible.
Do not repeat the same attraction unless explicitly requested.`;

    const userPrompt = `Destination: ${params.destination}
Dates: ${params.startDate} to ${params.endDate}
Travelers: ${params.travelers || 2}
Budget: ${params.budget || 'moderate'}
Travel Style: ${params.travelStyle || 'balanced'}
Interests: ${(params.interests || []).join(', ')}
Pace: ${params.pace || 'balanced'}
Preferences: ${params.travelPreferences || 'None'}`;

    try {
        console.log('[AiService DIAGNOSTIC] Gemini Request Started. Model: gemini-flash-latest');
        
        const response = await this.gemini!.models.generateContent({
            model: 'gemini-flash-latest',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: geminiSchema,
            }
        });

        const content = response.text;
        
        console.log('[AiService DIAGNOSTIC] Gemini Response Received.');
        console.log(`[AiService DIAGNOSTIC] Response content exists: ${!!content}`);

        if (!content) {
             console.log('[AiService DIAGNOSTIC] Failure Category: Empty Response Content');
             return null;
        }

        let parsedJson;
        try {
            parsedJson = JSON.parse(content);
            console.log('[AiService DIAGNOSTIC] JSON Parsing: SUCCESS');
        } catch (e: any) {
            console.log(`[AiService DIAGNOSTIC] JSON Parsing: FAILED - ${e.message}`);
            return null;
        }

        const zodResult = aiItineraryResponseSchema.safeParse(parsedJson);
        if (!zodResult.success) {
            console.log('[AiService DIAGNOSTIC] Zod Validation: FAILED');
            console.log('[AiService DIAGNOSTIC] Zod Errors:', JSON.stringify(zodResult.error.issues.map(i => ({ path: i.path, message: i.message }))));
            return null;
        }

        console.log('[AiService DIAGNOSTIC] Zod Validation: SUCCESS');
        return zodResult.data;

    } catch (error: any) {
        let category = 'Gemini API Error';
        console.log('[AiService DIAGNOSTIC] Gemini Generation Request Failed');
        console.log(`[AiService DIAGNOSTIC] Failure Category: ${category}`);
        console.log(`[AiService DIAGNOSTIC] Safe Error Message: ${error.message}`);
        
        throw new Error(`Gemini Error: ${error.message.replace(/AIza[A-Za-z0-9-_]+/g, '***')}`);
    }
  }
}

export const aiService = new AiService();
