import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { Interaction } from '../modules/interactions/interaction.model';
import { recommendationService } from '../modules/recommendations/recommendation.service';

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("=== START DIAGNOSTIC ===");
    
    // Find the primary user (not a test interaction account)
    const users = await User.find({ email: { $not: /interactiondev_/ } });
    if (users.length === 0) {
        console.log("No regular users found.");
        process.exit(0);
    }
    
    const user = users[0];
    const profile = await mongoose.model('TravelProfile').findOne({ userId: user._id });
    
    console.log(`\n1. CURRENT USER PROFILE`);
    console.log(`userId: ${user._id}`);
    console.log(`username: ${user.username}`);
    console.log(`travelDNA (populated): ${profile ? Object.keys(profile.travelDNA || {}).length > 0 : false}`);
    console.log(`travelDNA values:`, profile ? profile.travelDNA : 'undefined');
    
    console.log(`\n2. INTERACTION HISTORY`);
    const interactions = await Interaction.find({ userId: user._id }).populate('destinationId', 'name');
    console.log(`Count: ${interactions.length}`);
    interactions.forEach(i => {
        const destName = (i.destinationId as any)?.name || 'Unknown';
        console.log(`- Type: ${i.interactionType}, Dest: ${destName}, Weight: ${i.weight}, Source: ${i.source}`);
    });
    
    console.log(`\n3. RECOMMENDATION API (Top 5)`);
    try {
        const recs = await recommendationService.getRecommendations(user._id.toString(), 5);
        recs.forEach((r, idx) => {
            console.log(`${idx+1}. ${r.name} - Match: Math.round(${r.similarityScore} * 100)% = ${Math.round(r.similarityScore * 100)}%`);
        });
        
        console.log(`\n=== END DIAGNOSTIC ===`);
    } catch (e: any) {
        console.error("Diagnostic error: ", e);
    }
    
    await mongoose.disconnect();
}
run();
