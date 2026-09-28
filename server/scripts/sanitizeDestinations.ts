import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Destination } from '../src/modules/destinations/destination.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function sanitizeDb() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Running SANITIZATION mode.');

    const initialCount = await Destination.countDocuments();
    console.log(`Initial Total Records: ${initialCount}`);

    // STEP 2: REMOVE ONLY VERIFIED LEGACY RECORDS
    console.log(`\nRemoving legacy AI destinations (missing destinationKey and sourceType)...`);
    const deleteOp = await Destination.deleteMany({ 
      destinationKey: { $exists: false }, 
      sourceType: { $exists: false } 
    });
    console.log(`Successfully removed ${deleteOp.deletedCount} legacy records.`);

    // STEP 3 & 4: FORCE DATABASE INDEX SYNCHRONIZATION
    console.log(`\nSynchronizing database indexes to manifest Mongoose Schema indexes natively...`);
    await Destination.syncIndexes();
    console.log(`Index synchronization complete.`);

    // STEP 5: VERIFY destinationKey UNIQUENESS
    const indexes = await Destination.collection.indexes();
    console.log(`\nCurrent Native Indexes in MongoDB:`);
    let hasUniqueKey = false;
    indexes.forEach(idx => {
      console.log(`- ${idx.name} (unique: ${!!idx.unique})`);
      if (idx.name === 'destinationKey_1' && idx.unique === true) {
        hasUniqueKey = true;
      }
    });

    if (!hasUniqueKey) {
      console.error(`CRITICAL: destinationKey_1 unique index is still MISSING!`);
    } else {
      console.log(`SUCCESS: destinationKey_1 unique index is natively active.`);
    }

    // Check for Duplicates in DB via Aggregation just to be sure
    const duplicates = await Destination.aggregate([
      { $group: { _id: "$destinationKey", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`\nDuplicate destinationKeys detected: ${duplicates.length}`);
    if (duplicates.length > 0) {
      console.error(duplicates);
    }

    // STEP 6: VERIFY DATASET SIZE
    const finalCount = await Destination.countDocuments();
    const indianCount = await Destination.countDocuments({ country: 'India' });
    const intlCount = finalCount - indianCount;

    console.log(`\n================ FINAL REPORT ================`);
    console.log(`Total canonical records: ${finalCount}`);
    console.log(`Indian records: ${indianCount}`);
    console.log(`Intl records: ${intlCount}`);
    
    // Quick travelDNA structural check!
    const sample = await Destination.findOne({});
    if (sample) {
      console.log(`\nSample destination TravelDNA length: ${Object.keys(sample.travelDNA).length}`);
    }

  } catch (error) {
    console.error('Sanitization Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

sanitizeDb();
