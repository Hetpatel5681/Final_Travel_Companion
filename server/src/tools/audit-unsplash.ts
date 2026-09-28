import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

import { Destination } from '../modules/destinations/destination.model';

const isDryRun = process.argv.includes('--dry-run');

function constructSemanticQuery(dest: any): string {
    const types = dest.destinationType.slice(0, 2).map((t: string) => t.toLowerCase().replace('_', ' ')).join(' ');
    let query = `${dest.name} ${dest.country} ${types} travel`;
    return query;
}

async function searchUnsplash(query: string) {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
        return { error: 'UNSPLASH_ACCESS_KEY missing from environment variables.' };
    }
    
    try {
        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1&orientation=landscape`;
        const { data } = await axios.get(url);
        
        if (!data.results || data.results.length === 0) return null;
        
        const photo = data.results[0];
        return {
            title: photo.description || photo.alt_description || 'Unsplash Image',
            url: photo.urls.regular,
            sourceProvider: 'unsplash',
            sourceId: photo.id,
            attributionText: `Photo by ${photo.user.name}`,
            attributionUrl: `${photo.user.links.html}?utm_source=AITravelCompanion&utm_medium=referral`
        };
    } catch (e: any) {
        return { error: e.message };
    }
}

const sampleNames = [
    "Mumbai", "Tirupati", "Goa", "Munnar", "Hampi", 
    "Varanasi", "Paris", "Kyoto", "Tawang", "Kaziranga", 
    "Chennai", "Shimla", "Udaipur", "Darjeeling", "Rome",
    "Puducherry", "Khajuraho", "Bali", "Bodh Gaya", "Kolkata"
];

async function run() {
    console.log(`Starting Unsplash Semantic Audit... (DRY RUN: boolean locked)`);
    
    if (!process.env.MONGODB_URI) {
        console.error("Missing MONGODB_URI");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const destinations = await Destination.find({ name: { $in: sampleNames }, isActive: true });
    
    console.log("================= UNSPLASH AUDIT SAMPLE REPORT =================");
    let totalFound = 0;
    
    for (const dest of destinations) {
        const query = constructSemanticQuery(dest);
        console.log(`\n### Destination: ${dest.name} (${dest.region} / ${dest.country})`);
        console.log(`- Semantic Query: "${query}"`);
        
        if (!process.env.UNSPLASH_ACCESS_KEY) {
            console.log(`- Action: BLOCKED (Missing UNSPLASH_ACCESS_KEY in .env)`);
            continue;
        }

        const res = await searchUnsplash(query);
        if (res && !('error' in res)) {
            totalFound++;
            console.log(`- Accepted Image: ${res.title}`);
            console.log(`- Image URL: ${res.url}`);
            console.log(`- Attribution URL: ${res.attributionUrl}`);
            console.log(`- Attribution Text: ${res.attributionText}`);
        } else if (res && 'error' in res) {
            console.log(`- API Error: ${res.error}`);
        } else {
            console.log(`- NO VALID IMAGE FOUND (Fallback required)`);
        }
        
        // Respect 50req/hr Demo limits conditionally dynamically
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`\n======================================================`);
    console.log(`Total sample items processed: ${destinations.length}`);
    console.log(`Total successful Unsplash links: ${totalFound}`);
    console.log(`Database writes: 0 (Strict read-only natively)`);
    console.log(`======================================================\n`);
    
    await mongoose.disconnect();
}
run();
