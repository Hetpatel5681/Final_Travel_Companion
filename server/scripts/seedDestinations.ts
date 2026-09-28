import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Destination } from '../src/modules/destinations/destination.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDataPath = path.join(__dirname, 'data', 'master_destinations.json');

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Starting IDEMPOTENT Seeding process.');

    const rawData = fs.readFileSync(seedDataPath, 'utf-8');
    const destinationsToSeed = JSON.parse(rawData);

    console.log(`Loaded ${destinationsToSeed.length} records. Applying upserts...`);
    
    // BulkWrite for speed and idempotency
    const bulkOps = destinationsToSeed.map((dest: any) => ({
      updateOne: {
        filter: { destinationKey: dest.destinationKey },
        update: { $set: dest },
        upsert: true
      }
    }));

    const result = await Destination.bulkWrite(bulkOps);
    
    console.log(`Bulk Operation Complete!`);
    console.log(`- Matched: ${result.matchedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Inserted/Upserted: ${result.upsertedCount}`);
    
    const finalCount = await Destination.countDocuments();
    console.log(`Total Destinations in Database: ${finalCount}`);

  } catch (error) {
    console.error('Error seeding destinations:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

seed();
