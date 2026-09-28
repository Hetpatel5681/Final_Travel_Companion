require('dotenv').config();
const { getJson } = require('serpapi');

getJson({
  engine: 'google_maps_directions',
  start_addr: '24.5932,73.6394', // Sajjangarh
  end_addr: '24.5854,73.7125', // Bahubali Hills roughly
  api_key: process.env.SERPAPI_API_KEY
}, (res) => {
  if (res.directions && res.directions.length > 0) {
    const route = res.directions[0];
    console.log("Found route!");
    console.log("Distance:", route.distance);
    console.log("Duration:", route.duration);
    // don't log the whole geometry array to keep output clean, just check its bounds/availability
    console.log("Has trip steps/geometry?", !!route.trip);
  } else {
    console.log("No directions found.", res);
  }
});
