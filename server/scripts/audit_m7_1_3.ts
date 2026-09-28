import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const destinationSchema = new mongoose.Schema({}, { strict: false });
const Destination = mongoose.model('Destination', destinationSchema, 'destinations');

// Known aliases to check
const aliases = ['Varanasi', 'Banaras', 'Bengaluru', 'Bangalore', 'Mumbai', 'Bombay', 'Kolkata', 'Calcutta', 'Chennai', 'Madras', 'Trivandrum', 'Thiruvananthapuram', 'Pondicherry', 'Puducherry', 'Gurgaon', 'Gurugram', 'Cochin', 'Kochi'];

async function runAudit() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for READ ONLY AUDIT.');

    const allDests = await Destination.find({}).lean();
    console.log(`Total Records: ${allDests.length}`);

    let indianCount = 0;
    let intlCount = 0;
    const stateCounts: Record<string, number> = {};
    const keySet = new Set();
    const coordSet = new Set();
    const nameSet = new Set();

    let duplicateKeys = 0;
    let duplicateCoords = 0;
    let duplicateNames = 0;
    const foundAliases: string[] = [];

    const dnaErrors: string[] = [];
    const geoErrors: string[] = [];
    const metaErrors: string[] = [];
    const provenanceIssues: string[] = [];
    
    let originalM71Count = 0; // The original ones didn't have destinationKey or had a unique pattern
    // The original 49 ones from Phase 1 had "createdAt" before today ideally, or they lacked sourceType 'incredible_india'/'manual_verified'

    const dnaKeys = [
      'Explorer', 'Foodie', 'Luxury', 'Budget', 'Nature', 'Photographer',
      'Backpacker', 'Family', 'Pilgrim', 'Adventure', 'HistoryLover',
      'Nightlife', 'Relaxation', 'Shopping'
    ];

    allDests.forEach((d: any) => {
      // 1 & 2. Counts
      if (d.country === 'India') {
        indianCount++;
        const st = d.state || 'UNKNOWN';
        stateCounts[st] = (stateCounts[st] || 0) + 1;
      } else {
        intlCount++;
      }

      // 3. Identity
      if (d.destinationKey) {
        if (keySet.has(d.destinationKey)) duplicateKeys++;
        keySet.add(d.destinationKey);
      }
      
      if (d.name) {
        const nLow = d.name.toLowerCase().trim();
        if (nameSet.has(nLow)) duplicateNames++;
        nameSet.add(nLow);
        
        aliases.forEach(a => {
          if (nLow === a.toLowerCase()) {
            foundAliases.push(d.name);
          }
        });
      }

      // Geo Coords check duplicate
      if (d.location && d.location.coordinates && d.location.coordinates.length === 2) {
        const [lng, lat] = d.location.coordinates;
        const cKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;
        if (coordSet.has(cKey)) duplicateCoords++;
        coordSet.add(cKey);

        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          geoErrors.push(`${d.name}: Out of bounds [${lng}, ${lat}]`);
        }
      } else {
        geoErrors.push(`${d.name}: Invalid/Missing coordinates`);
      }

      // 4 & 5. TravelDNA
      if (!d.travelDNA) {
        dnaErrors.push(`${d.name}: Missing travelDNA object`);
      } else {
        const keys = Object.keys(d.travelDNA);
        if (keys.length !== 14) dnaErrors.push(`${d.name}: Has ${keys.length} keys instead of 14`);
        let hasOob = false;
        dnaKeys.forEach(k => {
          const val = d.travelDNA[k];
          if (typeof val !== 'number') dnaErrors.push(`${d.name}: ${k} is not a number`);
          else if (val < 0.0 || val > 1.0) hasOob = true;
        });
        if (hasOob) dnaErrors.push(`${d.name}: Out of bounds TravelDNA`);
      }

      // 7. Meta
      if (!d.name || !d.country || !d.region || !d.description) metaErrors.push(`${d.name}: Missing text metadata`);
      if (!d.destinationType || !d.destinationType.length) metaErrors.push(`${d.name}: Missing destinationType`);
      if (typeof d.isActive !== 'boolean') metaErrors.push(`${d.name}: Missing/invalid isActive`);
      if (typeof d.popularityScore !== 'number' || d.popularityScore < 0 || d.popularityScore > 1) metaErrors.push(`${d.name}: Invalid popularityScore`);

      // 8. Original 49
      if (!d.sourceType) {
        originalM71Count++;
      } else if (d.sourceType !== 'incredible_india' && d.sourceType !== 'manual_verified') {
        provenanceIssues.push(`${d.name}: Suspicious source ${d.sourceType}`);
      }
    });

    // Indexes
    const indexes = await Destination.collection.indexes();
    const indexList = indexes.map(i => Object.keys(i.key).join('_'));

    console.log("\n--- AUDIT RESULTS ---");
    console.log(JSON.stringify({
      totals: { total: allDests.length, indian: indianCount, intl: intlCount },
      states: stateCounts,
      duplicates: { keys: duplicateKeys, coords: duplicateCoords, names: duplicateNames, knownAliases: foundAliases },
      errors: { dna: dnaErrors.length, geo: geoErrors.length, meta: metaErrors.length, provenance: provenanceIssues.length },
      originalCount: originalM71Count,
      geoErrorsSample: geoErrors.slice(0,5),
      indexes: indexList
    }, null, 2));

  } catch (error) {
    console.error('Audit Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAudit();
