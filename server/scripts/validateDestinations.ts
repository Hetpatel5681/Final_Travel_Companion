import fs from 'fs';
import path from 'path';

const datasetPath = path.join(__dirname, 'data', 'master_destinations.json');

function validateDataset() {
  const rawData = fs.readFileSync(datasetPath, 'utf-8');
  const destinations = JSON.parse(rawData);

  console.log(`\n================ DATASET VALIDATION ================`);
  console.log(`Total items parsed: ${destinations.length}`);

  let indiaCount = 0;
  let intlCount = 0;
  let stateCoverage = new Set();
  let errors = 0;
  let duplicates = new Set();

  for (let d of destinations) {
    if (!d.destinationKey || !d.name || !d.country || !d.region || !d.destinationType) {
      console.error(`Missing core identity fields on: ${d.name || 'UNKNOWN'}`);
      errors++;
    }

    if (d.country === 'India') {
      indiaCount++;
      if (d.state) stateCoverage.add(d.state);
    } else {
      intlCount++;
    }

    if (duplicates.has(d.destinationKey)) {
      console.error(`DUPLICATE FOUND: ${d.destinationKey}`);
      errors++;
    } else {
      duplicates.add(d.destinationKey);
    }

    if (!Array.isArray(d.location?.coordinates) || d.location.coordinates.length !== 2) {
      console.error(`Invalid GeoJSON struct on ${d.name}`);
      errors++;
    } else {
      const [lng, lat] = d.location.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        console.error(`Impossible coordinates on ${d.name}: [${lng}, ${lat}]`);
        errors++;
      }
    }

    const dna = d.travelDNA;
    const requiredDims = [
      'Explorer', 'Foodie', 'Luxury', 'Budget', 'Nature', 'Photographer',
      'Backpacker', 'Family', 'Pilgrim', 'Adventure', 'HistoryLover',
      'Nightlife', 'Relaxation', 'Shopping'
    ];
    let missingDims: string[] = [];
    let oobDims: string[] = [];
    
    requiredDims.forEach(dim => {
      if (typeof dna[dim] !== 'number') missingDims.push(dim);
      else if (dna[dim] < 0 || dna[dim] > 1) oobDims.push(dim);
    });

    if (missingDims.length > 0) {
      console.error(`Missing DNA dimensions on ${d.name}: ${missingDims.join(', ')}`);
      errors++;
    }
    if (oobDims.length > 0) {
      console.error(`Out of bounds DNA dimensions on ${d.name}: ${oobDims.join(', ')}`);
      errors++;
    }
  }

  console.log(`\n================ VALIDATION REPORT ================`);
  console.log(`Total Destinations: ${destinations.length}`);
  console.log(`Indian Destinations: ${indiaCount}`);
  console.log(`International Destinations: ${intlCount}`);
  console.log(`States/UTs Represented: ${stateCoverage.size}`);
  console.log(`Duplicate Validation: ${duplicates.size === destinations.length ? 'PASS' : 'FAIL'}`);
  console.log(`Errors encountered: ${errors}`);
  
  if (errors > 0 || destinations.length < 500 || indiaCount < 400 || intlCount < 100) {
    console.error(`\nDATASET DOES NOT MEET REQUIREMENTS!`);
    process.exit(1);
  } else {
    console.log(`\nDATASET FULLY VERIFIED. READY FOR SEEDING!`);
    process.exit(0);
  }
}

validateDataset();
