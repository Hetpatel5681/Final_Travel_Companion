const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");

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
  const log = [];
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log.push("Connected to MongoDB.");

    const s = await Activity.findOne({ title: { $regex: /Sajjangarh/i } }).lean();
    const b = await Activity.findOne({ title: { $regex: /Bahubali Hills/i } }).lean();

    if (!s || !b) {
      log.push("Could not find activities");
    } else {
      log.push("Sajjangarh ID: " + s._id);
      log.push("Sajjangarh: " + JSON.stringify(s.location));
      log.push("Bahubali Hills ID: " + b._id);
      log.push("Bahubali Hills: " + JSON.stringify(b.location));

      const lat1 = s.location.latitude;
      const lon1 = s.location.longitude;
      const lat2 = b.location.latitude;
      const lon2 = b.location.longitude;

      if (!lat1 || !lon1 || !lat2 || !lon2) {
         log.push("MISSING COORDINATES");
      } else {
          const haversineDist = getHaversineDistanceKm(lat1, lon1, lat2, lon2);
          log.push(`Haversine Distance: ${haversineDist.toFixed(2)} km`);

          const coordsStr = `${lon1},${lat1};${lon2},${lat2}`;
          const url = `http://router.project-osrm.org/route/v1/driving/${coordsStr}?steps=false&geometries=geojson&overview=full`;
          log.push("OSRM URL: " + url);

          try {
            const response = await axios.get(url, { timeout: 6000 });
            if (response.data && response.data.routes && response.data.routes.length > 0) {
              const route = response.data.routes[0];
              const leg = route.legs[0];
              if (leg) {
                log.push("OSRM Distance (raw): " + leg.distance + " meters");
                log.push("OSRM Duration (raw): " + leg.duration + " seconds");
                log.push("Converted Distance: " + (leg.distance / 1000).toFixed(2) + " km");
                log.push("Converted Duration: " + Math.round(leg.duration / 60) + " minutes");
              } else {
                log.push("No legs found in OSRM mapping");
              }
            } else {
               log.push("Invalid response data format.");
            }
          } catch (err) {
            log.push("OSRM Error: " + err.message);
          }
      }
    }
  } catch(e) {
    log.push("Error: " + e.message);
  } finally {
    fs.writeFileSync("audit3.log", log.join('\n'));
    process.exit(0);
  }
}

run();
