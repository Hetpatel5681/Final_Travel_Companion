import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Destination } from './destination.model';

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const dests = await Destination.find({ isActive: true }).limit(2).lean();
        console.log(JSON.stringify(dests, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
