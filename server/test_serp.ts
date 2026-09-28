import { config } from 'dotenv';
config();
import { placeResolutionService } from './src/modules/maps/place-resolution.service';
import { getJson } from 'serpapi';

async function run() {
  console.log("===================================");
  console.log("TESTING PLACE RESOLUTION");
  console.log("===================================");
  const destArgs = { name: "Udaipur", state: "Rajasthan", country: "India" };
  
  // Do a direct SerpApi fetch to see the raw google_maps payload for Bahubali Hills
  const searchQuery = "Bahubali Hills, Udaipur, Rajasthan, India";
  const apiKey = process.env.SERPAPI_API_KEY;
  if(!apiKey) { console.log('NO API KEY'); return; }
  
  await new Promise((resolve) => getJson({
      engine: 'google_maps',
      q: searchQuery,
      api_key: apiKey,
      type: 'search'
  }, (res: any) => {
      console.log("RAW SERPAPI SEARCH RESULT (Trimmed):");
      if (res.place_results) console.log("place_results:", JSON.stringify(res.place_results, null, 2));
      if (res.local_results) console.log("local_results.length:", res.local_results.length);
      resolve(true);
  }));

  console.log("\nSERVICE OUTPUT:");
  const placeResult = await placeResolutionService.resolvePlace("Bahubali Hills", destArgs);
  console.log("Resolved Place:", placeResult);
  
  if (!placeResult) return;
  
  console.log("\n===================================");
  console.log("TESTING ROUTE RESOLUTION");
  console.log("===================================");
  
  const JagdishCoords = { latitude: 24.5798, longitude: 73.6828 }; 
  
  try {
      await new Promise((resolve) => getJson({
          engine: 'google_maps_directions',
          start_addr: `${placeResult.latitude},${placeResult.longitude}`,
          end_addr: `${JagdishCoords.latitude},${JagdishCoords.longitude}`,
          api_key: apiKey
      }, (res: any) => {
          console.log("RAW SERPAPI ROUTE RESULT:");
          // To keep output manageable, just log direction keys or distance/duration
          if (res.directions && res.directions.length > 0) {
              console.log(`Directions array length: ${res.directions.length}`);
              console.log(`Directions[0] summary:`, JSON.stringify(res.directions[0], null, 2));
          } else if (res.error) {
              console.log(`SERPAPI ERROR:`, res.error);
          } else {
              console.log("Missing directions field:", Object.keys(res));
          }
          resolve(true);
      }));
  } catch (err) {
      console.error(err);
  }
}

run();
