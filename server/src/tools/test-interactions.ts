import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import { Interaction } from '../modules/interactions/interaction.model';
import { Destination } from '../modules/destinations/destination.model';
import { recommendationService } from '../modules/recommendations/recommendation.service';
import { interactionService } from '../modules/interactions/interaction.service';

dotenv.config();

function displayTop(title: string, list: any[]) {
    console.log(`\n=== ${title} ===`);
    list.slice(0, 5).forEach((d, i) => {
        console.log(`${i+1}. ${d.name} (${Math.round(d.similarityScore*100)}%) - ${d.destinationType.slice(0, 2).join(',')}`);
    });
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    // Provision User
    const email = `interactiondev_${Date.now()}@example.com`;
    const user = await User.create({
        username: `interactiondev_${Date.now()}`,
        email,
        password: 'password123',
        fullName: 'Interaction Test User'
    });
    
    console.log("User successfully provisioned.");

    try {
        // BASELINE
        const baseline = await recommendationService.getRecommendations(user._id.toString(), 5);
        displayTop('BASELINE', baseline);

        // Find a heavily "Nature" focused destination
        const natureDest = await Destination.findOne({ name: 'Munnar' });
        if (!natureDest) throw new Error("Munnar Destination missing in DB?");
        
        console.log(`\n>>> ACTION: Liking ${natureDest.name} (Nature)`);
        await interactionService.recordInteraction(user._id.toString(), natureDest._id.toString(), 'LIKE');

        // POST-LIKE
        const postLike = await recommendationService.getRecommendations(user._id.toString(), 5);
        displayTop('POST-LIKE TOP 5', postLike);

        // DISLIKE Nature
        console.log(`\n>>> ACTION: Disliking ${natureDest.name} (Nature)`);
        await interactionService.recordInteraction(user._id.toString(), natureDest._id.toString(), 'DISLIKE');

        // POST-DISLIKE
        const postDislike = await recommendationService.getRecommendations(user._id.toString(), 5);
        displayTop('POST-DISLIKE TOP 5', postDislike);

    } catch (e: any) {
        console.error("Test Error:", e.message);
    } finally {
        await User.deleteOne({ _id: user._id });
        await Interaction.deleteMany({ userId: user._id });
        await mongoose.disconnect();
    }
}
run();
