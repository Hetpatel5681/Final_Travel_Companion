import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

import { Destination } from '../modules/destinations/destination.model';
const WIKI_USER_AGENT = 'AITravelCompanionBot/1.0 (admin@aitravelcompanion.local)';

const axiosWiki = axios.create({ headers: { 'User-Agent': WIKI_USER_AGENT } });

function validateCandidate(title: string, url: string) {
    const t = title.toLowerCase();
    const u = url.toLowerCase().split('?')[0];

    if (u.endsWith('.svg') || u.endsWith('.gif') || u.endsWith('.pdf') || u.endsWith('.tif') || u.endsWith('.webp')) {
        return { accepted: false, reason: 'Invalid file extension' };
    }
    
    if (t.includes('flag') || t.includes('map') || t.includes('logo') || t.includes('locator') || 
        t.includes('insignia') || t.includes('coat of arms') || t.includes('seal') || t.includes('diagram')) {
        return { accepted: false, reason: 'Fails semantic naming checks' };
    }

    if (!u.endsWith('.jpg') && !u.endsWith('.jpeg') && !u.endsWith('.png')) {
        return { accepted: false, reason: 'Not a recognized safe format (JPG/PNG expected)' };
    }
    return { accepted: true };
}

async function geosearchWikimedia(destName: string, lat: number, lng: number) {
    try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=5000&gsnamespace=6&format=json`;
        const { data } = await axiosWiki.get(url);
        const geoResults = data?.query?.geosearch;
        if (!geoResults || geoResults.length === 0) return null;

        for (const candidate of geoResults) {
            const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&pageids=${candidate.pageid}&prop=imageinfo&iiprop=url|extmetadata|mime&format=json`;
            const { data: infoData } = await axiosWiki.get(imageInfoUrl);
            const pages = infoData?.query?.pages;
            
            if (!pages || !pages[candidate.pageid]?.imageinfo?.length) continue;

            const info = pages[candidate.pageid].imageinfo[0];
            const candidateUrl = info.url;
            const validation = validateCandidate(candidate.title, candidateUrl);
            
            if (!validation.accepted) continue; 

            const attributionText = info.extmetadata?.Artist?.value ? 
                String(info.extmetadata.Artist.value).replace(/<[^>]+>/g, '') : 
                'Wikimedia Commons Contributor';

            return {
                title: candidate.title,
                url: info.url,
                sourceProvider: 'wikimedia',
                sourceId: candidate.pageid.toString(),
                attributionText: `Photo by ${attributionText}`,
                attributionUrl: info.descriptionurl
            };
        }
        return null;
    } catch (e: any) {
        return null; 
    }
}

const sampleNames = [
    "Mumbai", "Tirupati", "Goa", "Munnar", "Hampi", 
    "Varanasi", "Paris", "Kyoto", "Tawang", "Kaziranga", 
    "Chennai", "Shimla", "Udaipur", "Darjeeling", "Rome",
    "Puducherry", "Khajuraho", "Bali", "Bodh Gaya", "Kolkata"
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const destinations = await Destination.find({ name: { $in: sampleNames }, isActive: true });
    
    console.log("================= AUDIT SAMPLE REPORT =================");
    for (const dest of destinations) {
        if (!dest.location?.coordinates || dest.location.coordinates.length < 2) continue;
        const lng = dest.location.coordinates[0];
        const lat = dest.location.coordinates[1];
        
        const res = await geosearchWikimedia(dest.name, lat, lng);
        console.log(`\n### Destination: ${dest.name} (${dest.region} / ${dest.country})`);
        if (res) {
            console.log(`- Wiki Title: ${res.title}`);
            console.log(`- Image URL: ${res.url}`);
            console.log(`- Attribution URL: ${res.attributionUrl}`);
            console.log(`- Attribution Text: ${res.attributionText}`);
            console.log(`- Browser Usable: ${res.url.split('?')[0].match(/\.(jpg|png|jpeg)$/i) ? 'Yes' : 'No'}`);
        } else {
            console.log(`- NO VALID IMAGE FOUND (Fallback required)`);
        }
    }
    await mongoose.disconnect();
}
run();
