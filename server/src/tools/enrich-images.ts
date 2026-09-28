import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

import { Destination } from '../modules/destinations/destination.model';

const isDryRun = process.argv.includes('--dry-run');

const WIKI_USER_AGENT = 'AITravelCompanionBot/1.0 (admin@aitravelcompanion.local)';

const axiosWiki = axios.create({
    headers: {
        'User-Agent': WIKI_USER_AGENT
    }
});

interface CandidateValidationResult {
    accepted: boolean;
    reason?: string;
}

function validateCandidate(title: string, url: string): CandidateValidationResult {
    const t = title.toLowerCase();
    const u = url.toLowerCase().split('?')[0];

    if (u.endsWith('.svg') || u.endsWith('.gif') || u.endsWith('.pdf') || u.endsWith('.tif') || u.endsWith('.webp')) {
        return { accepted: false, reason: 'Invalid file extension (SVG/GIF/PDF/TIF/WEBP)' };
    }
    
    if (t.includes('flag') || t.includes('map') || t.includes('logo') || t.includes('locator') || 
        t.includes('insignia') || t.includes('coat of arms') || t.includes('seal') || t.includes('diagram')) {
        return { accepted: false, reason: 'Fails semantic naming checks (Flag/Map/Logo detected)' };
    }

    if (!u.endsWith('.jpg') && !u.endsWith('.jpeg') && !u.endsWith('.png')) {
        return { accepted: false, reason: 'Not a recognized safe format (JPG/PNG expected)' };
    }

    return { accepted: true };
}

interface GeoSearchResult {
    found: number;
    rejected: number;
    accepted: boolean;
    image?: {
        url: string;
        sourceProvider: 'wikimedia';
        sourceId: string;
        attributionText: string;
        attributionUrl: string;
    };
    error?: string;
}

async function geosearchWikimedia(destName: string, lat: number, lng: number): Promise<GeoSearchResult> {
    try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=5000&gsnamespace=6&format=json`;
        const { data } = await axiosWiki.get(url);
        const geoResults = data?.query?.geosearch;
        
        if (!geoResults || geoResults.length === 0) {
            console.log(`[Wikimedia] ${destName} -> 0 candidates found within 5km.`);
            return { found: 0, rejected: 0, accepted: false };
        }

        let rejectedCount = 0;

        for (const candidate of geoResults) {
            const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&pageids=${candidate.pageid}&prop=imageinfo&iiprop=url|extmetadata|mime&format=json`;
            const { data: infoData } = await axiosWiki.get(imageInfoUrl);
            const pages = infoData?.query?.pages;
            
            if (!pages || !pages[candidate.pageid]?.imageinfo?.length) {
                console.log(`[Wikimedia] Rejected: ${candidate.title} - Reason: No imageinfo returned from API.`);
                rejectedCount++;
                continue;
            }

            const info = pages[candidate.pageid].imageinfo[0];
            const candidateUrl = info.url;
            
            const validation = validateCandidate(candidate.title, candidateUrl);
            
            if (!validation.accepted) {
                console.log(`[Wikimedia] Rejected: ${candidate.title} - Reason: ${validation.reason}`);
                rejectedCount++;
                continue; 
            }

            // Accepted!
            console.log(`[Wikimedia] ACCEPTED: ${candidate.title} (${candidateUrl})`);
            const attributionText = info.extmetadata?.Artist?.value ? 
                String(info.extmetadata.Artist.value).replace(/<[^>]+>/g, '') : 
                'Wikimedia Commons Contributor';

            return {
                found: geoResults.length,
                rejected: rejectedCount,
                accepted: true,
                image: {
                    url: info.url,
                    sourceProvider: 'wikimedia',
                    sourceId: candidate.pageid.toString(),
                    attributionText: `Photo by ${attributionText}`,
                    attributionUrl: info.descriptionurl
                }
            };
        }

        console.log(`[Wikimedia] ${destName} -> All ${geoResults.length} candidates rejected.`);
        return { found: geoResults.length, rejected: rejectedCount, accepted: false };

    } catch (e: any) {
         console.log(`[Wikimedia API Error] ${destName}: ${e.message}`);
         return { found: 0, rejected: 0, accepted: false, error: e.message }; 
    }
}

async function run() {
    console.log(`Starting Image Enrichment Worker... (DRY RUN: ${isDryRun})`);
    if (!process.env.MONGODB_URI) {
        console.error("Missing MONGODB_URI");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    
    // Explicit Database Integrity Count Check
    const totalCount = await Destination.countDocuments({ isActive: true });
    if (totalCount !== 531) {
        console.error(`FATAL: Destination count is ${totalCount}. Expected exactly 531.`);
        process.exit(1);
    }

    const destinations = await Destination.find({ isActive: true });
    
    let withCoordinates = 0;
    
    let totalFound = 0;
    let totalAccepted = 0;
    let totalRejected = 0;
    let fallbackCount = 0;
    let apiErrors = 0;

    for (const dest of destinations) {
        const hasCoords = dest.location?.coordinates?.length === 2;
        if (hasCoords) withCoordinates++;

        console.log(`\n======================================`);
        console.log(`Destination: ${dest.name} (${dest.destinationKey})`);

        if (hasCoords) {
            const lng = dest.location.coordinates[0];
            const lat = dest.location.coordinates[1];
            const result = await geosearchWikimedia(dest.name, lat, lng);
            
            totalFound += result.found;
            totalRejected += result.rejected;
            if (result.error) apiErrors++;

            if (result.accepted && result.image) {
                totalAccepted++;
                console.log(`Action: WOULD UPDATE MongoDB with ${result.image.url}`);
            } else {
                fallbackCount++;
                console.log(`Action: SKIP (Requires geometric fallback)`);
            }
        } else {
            fallbackCount++;
            console.log(`Action: SKIP (No coordinates, requires geometric fallback)`);
        }

        // Throttle slightly to respect Wikimedia APIs seamlessly natively
        await new Promise(r => setTimeout(r, 100));

        if (!isDryRun) {
            console.error("FATAL: M7.5-A explicitly bans live writes natively directly structurally. Crashing execution automatically.");
            process.exit(1);
        }
    }

    console.log(`\n======================================`);
    console.log(`======= ENRICHMENT REPORT =======`);
    console.log(`Destinations processed:         ${destinations.length}`);
    console.log(`Wikimedia candidates found:     ${totalFound}`);
    console.log(`Candidates accepted:            ${totalAccepted}`);
    console.log(`Candidates rejected:            ${totalRejected}`);
    console.log(`Fallback count:                 ${fallbackCount}`);
    console.log(`API errors:                     ${apiErrors}`);
    console.log(`Database writes:                0 (DRY RUN locked)`);
    console.log(`======================================\n`);

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
