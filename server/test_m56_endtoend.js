require('dotenv').config();
const { placeResolutionService } = require('./dist/modules/maps/place-resolution.service');
const { routeService } = require('./dist/modules/maps/route.service');

const dest = {
  name: 'Udaipur',
  city: 'Udaipur',
  state: 'Rajasthan',
  country: 'India',
  latitude: 24.5854,
  longitude: 73.7125
};

async function run() {
  console.log("--- PLACE RESOLUTION VALIDATION ---");
  const pSajjangarh = await placeResolutionService.resolvePlace('Sajjangarh / Monsoon Palace', dest);
  console.log("Sajjangarh:", pSajjangarh);
  const pBahubali = await placeResolutionService.resolvePlace('Bahubali Hills', dest);
  console.log("Bahubali:", pBahubali);
  const pPichola = await placeResolutionService.resolvePlace('Lake Pichola', dest);
  console.log("Lake Pichola:", pPichola);
  const pCityPalace = await placeResolutionService.resolvePlace('City Palace', dest);
  console.log("City Palace:", pCityPalace);

  console.log("\n--- ROUTE VERIFICATION & CACHE (A->B) ---");
  const actBahu = { _id: "bahu2", location: { latitude: pBahubali.latitude, longitude: pBahubali.longitude } };
  const actPich = { _id: "pich3", location: { latitude: pPichola.latitude, longitude: pPichola.longitude } };
  const actCity = { _id: "city4", location: { latitude: pCityPalace.latitude, longitude: pCityPalace.longitude } };

  console.log("Fetching Route A->B:");
  const routeAB = await routeService.getRouteForActivities([actCity, actBahu]);
  console.log(routeAB?.data?.routingSource, routeAB?.data?.totalDistanceKm, routeAB?.data?.totalDurationMinutes);

  console.log("Fetching Route B->A (Reverse Check):");
  const routeBA = await routeService.getRouteForActivities([actBahu, actCity]);
  console.log(routeBA?.data?.routingSource, routeBA?.data?.totalDistanceKm, routeBA?.data?.totalDurationMinutes);
  
  console.log("Fetching Route A->B AGAIN (Cache check):");
  const t1 = Date.now();
  const routeABCached = await routeService.getRouteForActivities([actCity, actBahu]);
  const t2 = Date.now();
  console.log("Time (ms):", t2-t1, "Should be < 5ms if cached.");
}

run().catch(console.error);
