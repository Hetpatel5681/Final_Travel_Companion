import { config } from 'dotenv';
config();
import { getJson } from 'serpapi';

const apiKey = process.env.SERPAPI_API_KEY;
getJson({
    engine: 'google_maps_directions',
    start_addr: '24.5914,73.6527',
    end_addr: '24.5798,73.6828',
    api_key: apiKey
}, (res: any) => {
    if (res.directions && res.directions.length > 0) {
        const route = { ...res.directions[0] };
        delete route.details; // Remove long details
        console.log("ROUTE TOP LEVEL PAYLOAD:", JSON.stringify(route, null, 2));
    }
});
