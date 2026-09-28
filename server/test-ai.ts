import dotenv from 'dotenv';
dotenv.config();

import { aiService } from './src/modules/ai/ai.service';

async function runTest() {
  const params = {
    destination: "Gulmarg Gondola",
    startDate: "15-08-2026",
    endDate: "22-08-2026",
    expectedDays: 8,
    travelers: 2,
    budget: "20000 USD",
    travelPreferences: "I prefer mountains, scenic locations, local food, adventure activities and a balanced itinerary with reasonable travel time.",
    interests: ["mountains", "food", "adventure"]
  };

  console.log('Running test AI service...');
  const result = await aiService.generateItinerary(params);
  console.log('Test completed. Has Result:', !!result);
}

runTest().catch(console.error);
