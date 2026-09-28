const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const activitySchema = new mongoose.Schema({}, { strict: false });
const Activity = mongoose.model("Activity", activitySchema, "activities");

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const s = await Activity.findOne({ title: { $regex: /Sajjangarh/i } }).lean();
  const b = await Activity.findOne({ title: { $regex: /Bahubali Hills/i } }).lean();

  if (!s || !b) {
    console.log("Could not find activities");
    process.exit(1);
  }

  console.log("Sajjangarh ID:", s._id);
  console.log("Sajjangarh:", s.location);
  console.log("Bahubali Hills ID:", b._id);
  console.log("Bahubali Hills:", b.location);

  const lat1 = s.location.latitude;
  const lon1 = s.location.longitude;
  const lat2 = b.location.latitude;
  const lon2 = b.location.longitude;

  const haversineDist = getHaversineDistanceKm(lat1, lon1, lat2, lon2);
  console.log(`Haversine Distance: ${haversineDist.toFixed(2)} km`);

  const coordsStr = `${lon1},${lat1};${lon2},${lat2}`;
  const url = `http://router.project-osrm.org/route/v1/driving/${coordsStr}?steps=false&geometries=geojson&overview=full`;
  console.log("OSRM URL:", url);

  try {
    const response = await axios.get(url, { timeout: 6000 });
    const route = response.data.routes[0];
    const leg = route.legs[0];
    console.log("OSRM Distance (raw):", leg.distance, "meters");
    console.log("OSRM Duration (raw):", leg.duration, "seconds");
    console.log("Converted Distance:", (leg.distance / 1000).toFixed(2), "km");
    console.log("Converted Duration:", Math.round(leg.duration / 60), "minutes");
  } catch (err) {
    console.log("OSRM Error:", err.message);
  }
  
  process.exit(0);
}

run();
