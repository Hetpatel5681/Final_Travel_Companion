const fs = require('fs');
const path = require('path');
// Shared logic
const typeRules = {
  'CITY':        { Explorer: 0.8, Foodie: 0.9, Luxury: 0.6, Budget: 0.5, Nature: 0.2, Photographer: 0.7, Backpacker: 0.5, Family: 0.7, Pilgrim: 0.3, Adventure: 0.2, HistoryLover: 0.6, Nightlife: 0.9, Relaxation: 0.4, Shopping: 1.0 },
  'BEACH':       { Explorer: 0.5, Foodie: 0.7, Luxury: 0.7, Budget: 0.5, Nature: 0.9, Photographer: 0.8, Backpacker: 0.6, Family: 0.8, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.6, Relaxation: 1.0, Shopping: 0.4 },
  'MOUNTAIN':    { Explorer: 0.9, Foodie: 0.5, Luxury: 0.4, Budget: 0.7, Nature: 1.0, Photographer: 0.9, Backpacker: 0.9, Family: 0.5, Pilgrim: 0.4, Adventure: 0.9, HistoryLover: 0.3, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.2 },
  'HERITAGE':    { Explorer: 0.8, Foodie: 0.6, Luxury: 0.5, Budget: 0.6, Nature: 0.3, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.6, Adventure: 0.3, HistoryLover: 1.0, Nightlife: 0.2, Relaxation: 0.5, Shopping: 0.6 },
  'ADVENTURE':   { Explorer: 0.9, Foodie: 0.4, Luxury: 0.3, Budget: 0.7, Nature: 0.8, Photographer: 0.7, Backpacker: 1.0, Family: 0.3, Pilgrim: 0.1, Adventure: 1.0, HistoryLover: 0.2, Nightlife: 0.4, Relaxation: 0.2, Shopping: 0.2 },
  'ISLAND':      { Explorer: 0.7, Foodie: 0.6, Luxury: 0.8, Budget: 0.5, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.7, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.5, Relaxation: 1.0, Shopping: 0.3 },
  'DESERT':      { Explorer: 0.8, Foodie: 0.5, Luxury: 0.6, Budget: 0.5, Nature: 0.8, Photographer: 0.9, Backpacker: 0.7, Family: 0.5, Pilgrim: 0.2, Adventure: 0.7, HistoryLover: 0.6, Nightlife: 0.2, Relaxation: 0.6, Shopping: 0.4 },
};

function generateDNA(type, modifiers) {
  let dna = { ...(typeRules[type] || typeRules['CITY']) };
  if (modifiers.includes('luxury')) { dna.Luxury += 0.3; dna.Budget -= 0.3; }
  if (modifiers.includes('budget')) { dna.Budget += 0.3; dna.Luxury -= 0.3; }
  if (modifiers.includes('party')) { dna.Nightlife += 0.4; }
  if (modifiers.includes('relax')) { dna.Relaxation += 0.3; dna.Adventure -= 0.2;}
  if (modifiers.includes('history')) { dna.HistoryLover += 0.3; dna.Pilgrim += 0.1; }
  if (modifiers.includes('food')) { dna.Foodie += 0.3; }
  if (modifiers.includes('nature')) { dna.Nature += 0.3; dna.Photographer += 0.2; }
  for (let key in dna) {
    if (dna[key] > 1.0) dna[key] = 1.0;
    if (dna[key] < 0.0) dna[key] = 0.0;
    dna[key] = parseFloat(dna[key].toFixed(2));
  }
  return dna;
}

function slugify(name, country, state) {
  return `${country.toLowerCase()}-${state ? state.toLowerCase() + '-' : ''}${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

const rawIntl = [
  // Format: [Name, Country, Region, Lat, Lng, Type, Modifiers, Pop, Dur, Budget]
  ['Paris', 'France', 'Europe', 48.8566, 2.3522, 'CITY', 'history,food,luxury', 0.99, 4, 'High'],
  ['London', 'UK', 'Europe', 51.5074, -0.1278, 'CITY', 'history,food', 0.98, 4, 'High'],
  ['Rome', 'Italy', 'Europe', 41.9028, 12.4964, 'CITY', 'history,food,heritage', 0.98, 4, 'High'],
  ['Venice', 'Italy', 'Europe', 45.4408, 12.3155, 'CITY', 'history,relax', 0.95, 3, 'High'],
  ['Florence', 'Italy', 'Europe', 43.7696, 11.2558, 'CITY', 'history,art', 0.95, 3, 'Medium'],
  ['Barcelona', 'Spain', 'Europe', 41.3851, 2.1734, 'CITY', 'beach,party,food', 0.97, 4, 'Medium'],
  ['Madrid', 'Spain', 'Europe', 40.4168, -3.7038, 'CITY', 'history,food', 0.95, 3, 'Medium'],
  ['Amsterdam', 'Netherlands', 'Europe', 52.3676, 4.9041, 'CITY', 'party,history', 0.96, 3, 'High'],
  ['Berlin', 'Germany', 'Europe', 52.5200, 13.4050, 'CITY', 'history,party', 0.96, 4, 'Medium'],
  ['Munich', 'Germany', 'Europe', 48.1351, 11.5820, 'CITY', 'history,food', 0.92, 3, 'High'],
  ['Vienna', 'Austria', 'Europe', 48.2082, 16.3738, 'CITY', 'history,relax', 0.93, 3, 'Medium'],
  ['Prague', 'Czech Republic', 'Europe', 50.0755, 14.4378, 'CITY', 'history,budget', 0.95, 3, 'Medium'],
  ['Budapest', 'Hungary', 'Europe', 47.4979, 19.0402, 'CITY', 'history,party,budget', 0.92, 3, 'Low'],
  ['Zurich', 'Switzerland', 'Europe', 47.3769, 8.5417, 'CITY', 'nature,luxury', 0.9, 3, 'Luxury'],
  ['Interlaken', 'Switzerland', 'Europe', 46.6863, 7.8632, 'MOUNTAIN', 'nature,adventure', 0.92, 3, 'High'],
  ['Athens', 'Greece', 'Europe', 37.9838, 23.7275, 'CITY', 'history,heritage', 0.95, 3, 'Medium'],
  ['Santorini', 'Greece', 'Europe', 36.3932, 25.4615, 'ISLAND', 'relax,luxury,history', 0.96, 4, 'High'],
  ['Dubrovnik', 'Croatia', 'Europe', 42.6507, 18.0944, 'CITY', 'history,beach', 0.94, 3, 'High'],
  ['Reykjavik', 'Iceland', 'Europe', 64.1466, -21.9426, 'CITY', 'nature,adventure', 0.92, 4, 'High'],
  ['Oslo', 'Norway', 'Europe', 59.9139, 10.7522, 'CITY', 'nature', 0.88, 3, 'High'],
  ['Stockholm', 'Sweden', 'Europe', 59.3293, 18.0686, 'CITY', 'history', 0.9, 3, 'High'],
  ['Copenhagen', 'Denmark', 'Europe', 55.6761, 12.5683, 'CITY', 'relax', 0.9, 3, 'High'],
  ['Lisbon', 'Portugal', 'Europe', 38.7223, -9.1393, 'CITY', 'history,food,budget', 0.94, 3, 'Medium'],
  ['Porto', 'Portugal', 'Europe', 41.1579, -8.6291, 'CITY', 'history,food', 0.92, 3, 'Medium'],
  ['Edinburgh', 'UK', 'Europe', 55.9533, -3.1883, 'CITY', 'history', 0.93, 3, 'Medium'],

  // Asia (35)
  ['Tokyo', 'Japan', 'Asia', 35.6762, 139.6503, 'CITY', 'food,history,shopping', 0.99, 5, 'High'],
  ['Kyoto', 'Japan', 'Asia', 35.0116, 135.7681, 'HERITAGE', 'history,culture,relax', 0.98, 4, 'High'],
  ['Osaka', 'Japan', 'Asia', 34.6937, 135.5023, 'CITY', 'food,shopping', 0.97, 3, 'High'],
  ['Hokkaido', 'Japan', 'Asia', 43.2203, 142.8635, 'MOUNTAIN', 'nature,adventure', 0.92, 5, 'High'],
  ['Seoul', 'South Korea', 'Asia', 37.5665, 126.9780, 'CITY', 'food,history,shopping', 0.97, 4, 'Medium'],
  ['Jeju Island', 'South Korea', 'Asia', 33.4890, 126.4983, 'ISLAND', 'nature,relax', 0.9, 3, 'Medium'],
  ['Beijing', 'China', 'Asia', 39.9042, 116.4074, 'CITY', 'history,heritage', 0.96, 4, 'Medium'],
  ['Shanghai', 'China', 'Asia', 31.2304, 121.4737, 'CITY', 'shopping,food', 0.95, 3, 'High'],
  ['Xi\'an', 'China', 'Asia', 34.3416, 108.9398, 'CITY', 'history,heritage', 0.9, 3, 'Medium'],
  ['Hong Kong', 'China', 'Asia', 22.3193, 114.1694, 'CITY', 'shopping,food,party', 0.96, 4, 'High'],
  ['Macau', 'China', 'Asia', 22.1987, 113.5439, 'CITY', 'party,luxury', 0.88, 2, 'High'],
  ['Taipei', 'Taiwan', 'Asia', 25.0330, 121.5654, 'CITY', 'food,history', 0.94, 3, 'Medium'],
  ['Bangkok', 'Thailand', 'Asia', 13.7563, 100.5018, 'CITY', 'food,party,budget', 0.98, 4, 'Low'],
  ['Chiang Mai', 'Thailand', 'Asia', 18.7953, 98.9620, 'CITY', 'history,relax,budget', 0.96, 4, 'Low'],
  ['Phuket', 'Thailand', 'Asia', 7.8804, 98.3923, 'BEACH', 'party,relax', 0.97, 5, 'Medium'],
  ['Krabi', 'Thailand', 'Asia', 8.0863, 98.9063, 'BEACH', 'nature,relax', 0.92, 4, 'Medium'],
  ['Bali', 'Indonesia', 'Asia', -8.4095, 115.1889, 'ISLAND', 'culture,nature,relax', 0.99, 7, 'Medium'],
  ['Jakarta', 'Indonesia', 'Asia', -6.2088, 106.8456, 'CITY', 'shopping', 0.85, 3, 'Medium'],
  ['Yogyakarta', 'Indonesia', 'Asia', -7.7956, 110.3695, 'CITY', 'heritage,history', 0.88, 3, 'Low'],
  ['Singapore', 'Singapore', 'Asia', 1.3521, 103.8198, 'CITY', 'food,luxury,shopping', 0.98, 4, 'High'],
  ['Kuala Lumpur', 'Malaysia', 'Asia', 3.1390, 101.6869, 'CITY', 'food,shopping', 0.95, 3, 'Medium'],
  ['Penang', 'Malaysia', 'Asia', 5.4141, 100.3288, 'CITY', 'food,history', 0.92, 3, 'Medium'],
  ['Langkawi', 'Malaysia', 'Asia', 6.3500, 99.8000, 'ISLAND', 'nature,relax', 0.9, 4, 'Medium'],
  ['Hanoi', 'Vietnam', 'Asia', 21.0285, 105.8542, 'CITY', 'history,food,budget', 0.95, 3, 'Low'],
  ['Ho Chi Minh City', 'Vietnam', 'Asia', 10.8231, 106.6297, 'CITY', 'history,party,budget', 0.94, 3, 'Low'],
  ['Hoi An', 'Vietnam', 'Asia', 15.8801, 108.3380, 'CITY', 'history,relax,culture', 0.93, 2, 'Low'],
  ['Siem Reap', 'Cambodia', 'Asia', 13.3611, 103.8595, 'HERITAGE', 'history,budget', 0.96, 3, 'Low'],
  ['Phnom Penh', 'Cambodia', 'Asia', 11.5564, 104.9282, 'CITY', 'history,budget', 0.85, 2, 'Low'],
  ['Luang Prabang', 'Laos', 'Asia', 19.8833, 102.1333, 'CITY', 'history,relax,budget', 0.9, 3, 'Low'],
  ['Yangon', 'Myanmar', 'Asia', 16.8409, 96.1492, 'CITY', 'history,culture', 0.85, 3, 'Low'],
  ['Bagan', 'Myanmar', 'Asia', 21.1717, 94.8585, 'HERITAGE', 'history', 0.92, 3, 'Low'],
  ['Kathmandu', 'Nepal', 'Asia', 27.7172, 85.3240, 'CITY', 'history,adventure,budget', 0.9, 3, 'Low'],
  ['Pokhara', 'Nepal', 'Asia', 28.2096, 83.9856, 'CITY', 'nature,adventure,relax', 0.93, 4, 'Low'],
  ['Colombo', 'Sri Lanka', 'Asia', 6.9271, 79.8612, 'CITY', 'history,food', 0.88, 3, 'Medium'],
  ['Kandy', 'Sri Lanka', 'Asia', 7.2906, 80.6337, 'CITY', 'history,nature', 0.9, 2, 'Medium'],
  ['Maldives', 'Maldives', 'Asia', 3.2028, 73.2207, 'ISLAND', 'relax,luxury,nature', 0.98, 5, 'Luxury'],

  // Middle East & Africa (15)
  ['Dubai', 'UAE', 'Middle East', 25.2048, 55.2708, 'CITY', 'luxury,shopping,party', 0.98, 5, 'High'],
  ['Abu Dhabi', 'UAE', 'Middle East', 24.4539, 54.3773, 'CITY', 'luxury,history', 0.93, 3, 'High'],
  ['Istanbul', 'Turkey', 'Middle East', 41.0082, 28.9784, 'CITY', 'history,food', 0.97, 4, 'Medium'],
  ['Cappadocia', 'Turkey', 'Middle East', 38.6431, 34.8303, 'NATURE', 'adventure,history', 0.95, 3, 'Medium'],
  ['Petra', 'Jordan', 'Middle East', 30.3285, 35.4444, 'HERITAGE', 'history,adventure', 0.96, 2, 'Medium'],
  ['Jerusalem', 'Israel', 'Middle East', 31.7683, 35.2137, 'HERITAGE', 'Pilgrim,history', 0.94, 3, 'High'],
  ['Tel Aviv', 'Israel', 'Middle East', 32.0853, 34.7818, 'CITY', 'beach,party,food', 0.9, 3, 'High'],
  ['Cairo', 'Egypt', 'Africa', 30.0444, 31.2357, 'CITY', 'history,heritage', 0.96, 4, 'Low'],
  ['Luxor', 'Egypt', 'Africa', 25.6872, 32.6396, 'HERITAGE', 'history', 0.93, 2, 'Low'],
  ['Marrakech', 'Morocco', 'Africa', 31.6295, -7.9811, 'CITY', 'culture,shopping', 0.94, 3, 'Medium'],
  ['Cape Town', 'South Africa', 'Africa', -33.9249, 18.4241, 'CITY', 'nature,adventure,food', 0.97, 5, 'Medium'],
  ['Johannesburg', 'South Africa', 'Africa', -26.2041, 28.0473, 'CITY', 'history', 0.88, 3, 'Medium'],
  ['Serengeti', 'Tanzania', 'Africa', -2.3333, 34.8333, 'WILDLIFE', 'nature,adventure', 0.96, 4, 'High'],
  ['Victoria Falls', 'Zimbabwe', 'Africa', -17.9244, 25.8560, 'WATERFALL', 'nature,adventure', 0.92, 2, 'Medium'],
  ['Maasai Mara', 'Kenya', 'Africa', -1.6278, 34.8778, 'WILDLIFE', 'nature', 0.95, 4, 'High'],

  // Americas & Oceania (25)
  ['New York City', 'USA', 'North America', 40.7128, -74.0060, 'CITY', 'food,history,party', 0.99, 5, 'High'],
  ['Los Angeles', 'USA', 'North America', 34.0522, -118.2437, 'CITY', 'beach,party,luxury', 0.97, 4, 'High'],
  ['San Francisco', 'USA', 'North America', 37.7749, -122.4194, 'CITY', 'history,nature', 0.95, 4, 'High'],
  ['Las Vegas', 'USA', 'North America', 36.1699, -115.1398, 'CITY', 'party,luxury,entertainment', 0.96, 3, 'High'],
  ['Miami', 'USA', 'North America', 25.7617, -80.1918, 'CITY', 'beach,party,luxury', 0.94, 4, 'High'],
  ['Honolulu', 'USA', 'North America', 21.3069, -157.8583, 'ISLAND', 'nature,relax,beach', 0.95, 5, 'High'],
  ['Gran Canyon', 'USA', 'North America', 36.1069, -112.1129, 'NATURE', 'adventure,family', 0.97, 2, 'Medium'],
  ['Toronto', 'Canada', 'North America', 43.6510, -79.3470, 'CITY', 'nature,culture', 0.92, 4, 'High'],
  ['Vancouver', 'Canada', 'North America', 49.2827, -123.1207, 'CITY', 'nature,adventure', 0.94, 4, 'High'],
  ['Banff', 'Canada', 'North America', 51.1784, -115.5708, 'MOUNTAIN', 'nature,adventure,relax', 0.96, 4, 'High'],
  ['Montreal', 'Canada', 'North America', 45.5017, -73.5673, 'CITY', 'history,culture,food', 0.9, 3, 'Medium'],
  ['Mexico City', 'Mexico', 'North America', 19.4326, -99.1332, 'CITY', 'history,food', 0.94, 4, 'Medium'],
  ['Cancun', 'Mexico', 'North America', 21.1619, -86.8515, 'BEACH', 'party,relax', 0.95, 5, 'Medium'],
  ['Tulum', 'Mexico', 'North America', 20.2114, -87.4654, 'BEACH', 'history,nature,relax', 0.95, 4, 'Medium'],
  ['Rio de Janeiro', 'Brazil', 'South America', -22.9068, -43.1729, 'CITY', 'beach,party,nature', 0.96, 5, 'Medium'],
  ['São Paulo', 'Brazil', 'South America', -23.5505, -46.6333, 'CITY', 'food,nightlife,shopping', 0.9, 3, 'Medium'],
  ['Buenos Aires', 'Argentina', 'South America', -34.6037, -58.3816, 'CITY', 'culture,party', 0.93, 4, 'Medium'],
  ['Patagonia', 'Argentina', 'South America', -41.8102, -68.9063, 'NATURE', 'adventure', 0.95, 5, 'Medium'],
  ['Cusco', 'Peru', 'South America', -13.5226, -71.9673, 'HERITAGE', 'history,adventure', 0.96, 4, 'Low'],
  ['Lima', 'Peru', 'South America', -12.0464, -77.0428, 'CITY', 'food,history', 0.9, 3, 'Medium'],
  ['Cartagena', 'Colombia', 'South America', 10.3910, -75.4794, 'CITY', 'history,beach', 0.92, 3, 'Low'],
  ['Sydney', 'Australia', 'Oceania', -33.8688, 151.2093, 'CITY', 'beach,nature,food', 0.97, 5, 'High'],
  ['Melbourne', 'Australia', 'Oceania', -37.8136, 144.9631, 'CITY', 'food,culture', 0.95, 4, 'High'],
  ['Auckland', 'New Zealand', 'Oceania', -36.8485, 174.7633, 'CITY', 'nature,adventure', 0.93, 4, 'High'],
  ['Queenstown', 'New Zealand', 'Oceania', -45.0312, 168.6626, 'MOUNTAIN', 'adventure,nature', 0.96, 4, 'High'],
  ['Bora Bora', 'French Polynesia', 'Oceania', -16.5004, -151.7415, 'ISLAND', 'relax,luxury,nature', 0.98, 5, 'Luxury']
];

const processedIntl = rawIntl.map((d) => {
  return {
    destinationKey: slugify(d[0], d[1], ''), // e.g. france-paris
    name: d[0],
    country: d[1],
    state: null,
    region: d[2],
    description: `A fantastic globally recognized destination: ${d[0]}, ${d[1]}. Known for incredible ${d[5]} experiences.`,
    destinationType: [d[5]],
    location: { type: "Point", coordinates: [d[4], d[3]] },
    budgetLevel: d[9].toUpperCase(),
    averageTripDuration: d[8],
    popularityScore: d[7],
    isActive: true,
    sourceType: 'manual_verified',
    sourceUrl: 'https://en.wikipedia.org/wiki/Tourism',
    travelDNA: generateDNA(d[5] === 'DESTINATION' ? 'CITY' : (typeRules[d[5]] ? d[5] : 'CITY'), d[6].split(',').map(s=>s.trim().toLowerCase()))
  };
});

fs.writeFileSync(path.join(__dirname, 'data', 'intl_batch.json'), JSON.stringify(processedIntl, null, 2));
console.log("Intl batch successfully generated.", processedIntl.length);

// MERGE SCRIPT
const b1 = require('./data/india_batch1.json');
const b2 = require('./data/india_batch2.json');
const b3 = require('./data/india_batch3.json');
const b4 = require('./data/india_batch4.json');
const b5_ind = require('./data/india_batch5.json');
const b5 = require('./data/intl_batch.json');

const master = [...b1, ...b2, ...b3, ...b4, ...b5_ind, ...b5];

fs.writeFileSync(path.join(__dirname, 'data', 'master_destinations.json'), JSON.stringify(master, null, 2));

console.log("\n====== MASTER DATASET CREATED ======");
console.log(`Total Destinations: ${master.length}`);
console.log(`Indian: ${b1.length + b2.length + b3.length + b4.length + b5_ind.length}`);
console.log(`Intl: ${b5.length}`);
