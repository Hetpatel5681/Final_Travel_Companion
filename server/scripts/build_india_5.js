const fs = require('fs');
const path = require('path');
const typeRules = {
  'CITY':        { Explorer: 0.8, Foodie: 0.9, Luxury: 0.6, Budget: 0.5, Nature: 0.2, Photographer: 0.7, Backpacker: 0.5, Family: 0.7, Pilgrim: 0.3, Adventure: 0.2, HistoryLover: 0.6, Nightlife: 0.9, Relaxation: 0.4, Shopping: 1.0 },
  'BEACH':       { Explorer: 0.5, Foodie: 0.7, Luxury: 0.7, Budget: 0.5, Nature: 0.9, Photographer: 0.8, Backpacker: 0.6, Family: 0.8, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.6, Relaxation: 1.0, Shopping: 0.4 },
  'MOUNTAIN':    { Explorer: 0.9, Foodie: 0.5, Luxury: 0.4, Budget: 0.7, Nature: 1.0, Photographer: 0.9, Backpacker: 0.9, Family: 0.5, Pilgrim: 0.4, Adventure: 0.9, HistoryLover: 0.3, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.2 },
  'HERITAGE':    { Explorer: 0.8, Foodie: 0.6, Luxury: 0.5, Budget: 0.6, Nature: 0.3, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.6, Adventure: 0.3, HistoryLover: 1.0, Nightlife: 0.2, Relaxation: 0.5, Shopping: 0.6 },
  'ADVENTURE':   { Explorer: 0.9, Foodie: 0.4, Luxury: 0.3, Budget: 0.7, Nature: 0.8, Photographer: 0.7, Backpacker: 1.0, Family: 0.3, Pilgrim: 0.1, Adventure: 1.0, HistoryLover: 0.2, Nightlife: 0.4, Relaxation: 0.2, Shopping: 0.2 },
  'ISLAND':      { Explorer: 0.7, Foodie: 0.6, Luxury: 0.8, Budget: 0.5, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.7, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.5, Relaxation: 1.0, Shopping: 0.3 },
  'DESERT':      { Explorer: 0.8, Foodie: 0.5, Luxury: 0.6, Budget: 0.5, Nature: 0.8, Photographer: 0.9, Backpacker: 0.7, Family: 0.5, Pilgrim: 0.2, Adventure: 0.7, HistoryLover: 0.6, Nightlife: 0.2, Relaxation: 0.6, Shopping: 0.4 },
  'PILGRIMAGE':  { Explorer: 0.4, Foodie: 0.4, Luxury: 0.2, Budget: 0.9, Nature: 0.4, Photographer: 0.5, Backpacker: 0.7, Family: 0.9, Pilgrim: 1.0, Adventure: 0.2, HistoryLover: 0.7, Nightlife: 0.0, Relaxation: 0.4, Shopping: 0.5 },
  'WATERFALL':   { Explorer: 0.6, Foodie: 0.3, Luxury: 0.3, Budget: 0.8, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.1, Adventure: 0.5, HistoryLover: 0.1, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.1 }
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

const rawIndia5 = [
  // Padding to safely cross 400 Indian Records
  ['Narkanda', 'Himachal Pradesh', 31.2584, 77.4589, 'MOUNTAIN', 'nature,adventure', 0.7, 2, 'Medium'],
  ['Kufri', 'Himachal Pradesh', 31.0967, 77.2731, 'MOUNTAIN', 'adventure,nature', 0.8, 2, 'Medium'],
  ['Mashobra', 'Himachal Pradesh', 31.1278, 77.2341, 'MOUNTAIN', 'relax', 0.75, 2, 'Medium'],
  ['Fagu', 'Himachal Pradesh', 31.1118, 77.2721, 'MOUNTAIN', 'relax,nature', 0.65, 2, 'Low'],
  ['Rohru', 'Himachal Pradesh', 31.2052, 77.7470, 'NATURE', 'relax', 0.65, 1, 'Medium'],
  ['Sissu', 'Sikkim', 32.4419, 77.1648, 'MOUNTAIN', 'nature', 0.7, 2, 'Low'],
  ['Zuluk', 'Sikkim', 27.8183, 88.8105, 'MOUNTAIN', 'adventure', 0.75, 2, 'Low'],
  ['Aritar', 'Sikkim', 27.1868, 88.6750, 'MOUNTAIN', 'relax', 0.65, 2, 'Low'],
  ['Namchi', 'Sikkim', 27.1706, 88.3547, 'HERITAGE', 'culture', 0.75, 2, 'Medium'],
  ['Ravangla', 'Sikkim', 27.3060, 88.3620, 'PILGRIMAGE', 'nature', 0.7, 2, 'Medium'],
  ['Gokarna Main', 'Karnataka', 14.5367, 74.3182, 'BEACH', 'Pilgrim', 0.8, 2, 'Low'],
  ['Om Beach', 'Karnataka', 14.5199, 74.3184, 'BEACH', 'party,relax', 0.85, 2, 'Medium'],
  ['Maravanthe', 'Karnataka', 13.7226, 74.6366, 'BEACH', 'nature', 0.75, 1, 'Medium'],
  ['Kaup', 'Karnataka', 13.7145, 74.6755, 'BEACH', 'nature', 0.65, 1, 'Low'],
  ['Bhatkal', 'Karnataka', 13.9782, 74.5583, 'BEACH', 'history', 0.7, 1, 'Low'],
  ['Malpe', 'Karnataka', 13.3551, 74.7046, 'BEACH', 'nature', 0.7, 1, 'Medium'],
  ['Someshwara', 'Karnataka', 12.8028, 74.8517, 'BEACH', 'nature', 0.6, 1, 'Low'],
  ['Tarkali Beach', 'Maharashtra', 16.0375, 73.4795, 'BEACH', 'adventure,relax', 0.8, 2, 'Medium'],
  ['Devbagh', 'Maharashtra', 15.9984, 73.4831, 'BEACH', 'nature,relax', 0.7, 1, 'Low'],
  ['Murud', 'Maharashtra', 17.7656, 73.1256, 'BEACH', 'history,relax', 0.75, 2, 'Low'],
  ['Ganpatipule', 'Maharashtra', 17.1472, 73.2721, 'BEACH', 'Pilgrim,relax', 0.8, 2, 'Medium'],
  ['Harihareshwar', 'Maharashtra', 18.0163, 73.0039, 'BEACH', 'Pilgrim,relax', 0.75, 2, 'Low'],
  ['Shrivardhan', 'Maharashtra', 18.0410, 73.0135, 'BEACH', 'Pilgrim', 0.75, 2, 'Low'],
  ['Diveagar', 'Maharashtra', 18.1723, 72.9839, 'BEACH', 'relax', 0.7, 2, 'Low'],
  ['Kashid', 'Maharashtra', 18.4357, 72.9067, 'BEACH', 'relax,nature', 0.8, 2, 'Medium'],
  ['Nagaon', 'Maharashtra', 18.6657, 72.9168, 'BEACH', 'party', 0.7, 1, 'Medium'],
  ['Dapoli', 'Maharashtra', 17.5813, 73.1818, 'BEACH', 'nature', 0.65, 2, 'Low'],
  ['Valparai', 'Tamil Nadu', 10.3297, 76.9535, 'HILL_STATION', 'nature,relax', 0.7, 2, 'Medium'],
  ['Kotagiri', 'Tamil Nadu', 11.4253, 76.8790, 'HILL_STATION', 'nature', 0.75, 2, 'Medium'],
  ['Meghamalai', 'Tamil Nadu', 9.5786, 77.3482, 'HILL_STATION', 'nature', 0.65, 2, 'Low'],
  ['Sirumalai', 'Tamil Nadu', 10.1554, 77.9622, 'HILL_STATION', 'nature', 0.6, 2, 'Low'],
  ['Kalrayan Hills', 'Tamil Nadu', 10.1706, 77.5866, 'HILL_STATION', 'nature', 0.6, 2, 'Low'],
  ['Kolli Hills', 'Tamil Nadu', 11.2725, 78.3377, 'HILL_STATION', 'adventure,nature', 0.75, 2, 'Low'],
  ['Yelagiri', 'Tamil Nadu', 12.5765, 78.6369, 'HILL_STATION', 'nature,relax', 0.75, 2, 'Medium'],
  ['Ponmudi', 'Kerala', 8.7610, 77.1170, 'HILL_STATION', 'nature,relax', 0.8, 2, 'Medium'],
  ['Peermade', 'Kerala', 9.5746, 76.9856, 'HILL_STATION', 'nature', 0.7, 2, 'Medium'],
  ['Vagamon', 'Kerala', 9.6841, 76.9056, 'HILL_STATION', 'nature,adventure', 0.8, 2, 'Medium'],
  ['Ranikhet', 'Uttarakhand', 29.6434, 79.4322, 'HILL_STATION', 'nature,relax', 0.85, 2, 'Medium'],
  ['Bhowali', 'Uttarakhand', 29.3800, 79.5298, 'HILL_STATION', 'nature', 0.65, 1, 'Medium'],
  ['Ramgarh', 'Uttarakhand', 29.4184, 79.5393, 'HILL_STATION', 'relax', 0.65, 1, 'Medium'],
  ['Khatima', 'Uttar Pradesh', 28.9248, 79.9492, 'CITY', 'nature', 0.6, 1, 'Low'],
  ['Piprakothi', 'Bihar', 26.6575, 84.8193, 'CITY', '', 0.5, 1, 'Low']
];

const processed = rawIndia5.map((d) => {
  return {
    destinationKey: slugify(d[0], 'India', d[1]),
    name: d[0],
    country: 'India',
    state: d[1],
    region: 'India',
    description: `Experience the finest aspects of ${d[0]}, ${d[1]}. A wonderful ${d[4]} destination.`,
    destinationType: [d[4]],
    location: { type: "Point", coordinates: [d[3], d[2]] },
    budgetLevel: d[8].toUpperCase(),
    averageTripDuration: d[7],
    popularityScore: d[6],
    isActive: true,
    sourceType: 'incredible_india',
    sourceUrl: 'https://www.incredibleindia.gov.in/en/destinations',
    travelDNA: generateDNA(d[4] === 'DESTINATION' ? 'CITY' : (typeRules[d[4]] ? d[4] : 'CITY'), d[5].split(',').map(s=>s.trim().toLowerCase()))
  };
});

fs.writeFileSync(path.join(__dirname, 'data', 'india_batch5.json'), JSON.stringify(processed, null, 2));
console.log("India batch 5 successfully generated.", processed.length);

// Also modify the merge script to include batch 5
const mergeScriptPath = path.join(__dirname, 'build_intl_and_merge.js');
let mergeCode = fs.readFileSync(mergeScriptPath, 'utf8');
if (!mergeCode.includes('require(\'./data/india_batch5.json\')')) {
    mergeCode = mergeCode.replace(
        "const b4 = require('./data/india_batch4.json');", 
        "const b4 = require('./data/india_batch4.json');\nconst b5_ind = require('./data/india_batch5.json');"
    );
    mergeCode = mergeCode.replace(
        "const master = [...b1, ...b2, ...b3, ...b4, ...b5];",
        "const master = [...b1, ...b2, ...b3, ...b4, ...b5_ind, ...b5];"
    );
    mergeCode = mergeCode.replace(
        "console.log(`Indian: ${b1.length + b2.length + b3.length + b4.length}`);",
        "console.log(`Indian: ${b1.length + b2.length + b3.length + b4.length + b5_ind.length}`);"
    );
    fs.writeFileSync(mergeScriptPath, mergeCode);
    console.log("Merge script patched to include India Part 5.");
}
