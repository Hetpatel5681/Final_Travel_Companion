import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const destinationSchema = new mongoose.Schema({}, { strict: false });
const Destination = mongoose.model('Destination', destinationSchema, 'destinations');

async function dryRun() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Running IDENTIFICATION mode.');

    const allDests = await Destination.find({}).lean();
    console.log(`Total Records: ${allDests.length}`);

    // Look for legacy records. M7.1 items didn't have destinationKey or sourceType
    // Some might have it if Mongoose implicitly populated or it failed.
    // Let's find exactly the ones lacking `sourceType` (added in M7.1.2) or `destinationKey`.
    
    const legacyRecords = allDests.filter((d: any) => !d.sourceType && !d.destinationKey);
    
    console.log(`\n================ LEGACY RECORD REPORT ================`);
    console.log(`Legacy Record Count: ${legacyRecords.length}`);
    
    legacyRecords.forEach((d: any, idx: number) => {
      console.log(`\n[${idx + 1}] ID: ${d._id}`);
      console.log(`Name: ${d.name}`);
      console.log(`Coordinates: [${d.location?.coordinates?.join(', ')}]`);
      console.log(`Reason: Missing sourceType and destinationKey fields, indicating early M7.1 seeding.`);
    });

  } catch (error) {
    console.error('Audit Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

dryRun();
