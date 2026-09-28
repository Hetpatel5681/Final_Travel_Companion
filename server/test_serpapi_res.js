require('dotenv').config();
const { getJson } = require('serpapi');

getJson({
  engine: "google_maps",
  q: "Sajjangarh, Udaipur, Rajasthan, India",
  type: "search",
  api_key: process.env.SERPAPI_API_KEY
}, (res) => {
   if (res.place_results) {
      console.log("TITLE:", res.place_results.title);
      console.log("GPS:", res.place_results.gps_coordinates);
      console.log("TYPE:", res.place_results.type);
      console.log("ADDRESS:", res.place_results.address);
   } else if (res.local_results) {
      console.log(res.local_results.map(l => l.title));
   } else {
      console.log("NO PLACE_RESULTS OR LOCAL_RESULTS");
   }
});
