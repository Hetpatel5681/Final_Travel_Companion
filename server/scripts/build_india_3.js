const fs = require('fs');
const path = require('path');
// Same helper logic as the previous builds
const typeRules = {
  'CITY':        { Explorer: 0.8, Foodie: 0.9, Luxury: 0.6, Budget: 0.5, Nature: 0.2, Photographer: 0.7, Backpacker: 0.5, Family: 0.7, Pilgrim: 0.3, Adventure: 0.2, HistoryLover: 0.6, Nightlife: 0.9, Relaxation: 0.4, Shopping: 1.0 },
  'BEACH':       { Explorer: 0.5, Foodie: 0.7, Luxury: 0.7, Budget: 0.5, Nature: 0.9, Photographer: 0.8, Backpacker: 0.6, Family: 0.8, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.6, Relaxation: 1.0, Shopping: 0.4 },
  'MOUNTAIN':    { Explorer: 0.9, Foodie: 0.5, Luxury: 0.4, Budget: 0.7, Nature: 1.0, Photographer: 0.9, Backpacker: 0.9, Family: 0.5, Pilgrim: 0.4, Adventure: 0.9, HistoryLover: 0.3, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.2 },
  'HILL_STATION':{ Explorer: 0.6, Foodie: 0.6, Luxury: 0.5, Budget: 0.7, Nature: 0.9, Photographer: 0.8, Backpacker: 0.6, Family: 0.9, Pilgrim: 0.2, Adventure: 0.5, HistoryLover: 0.4, Nightlife: 0.2, Relaxation: 0.9, Shopping: 0.4 },
  'WILDLIFE':    { Explorer: 0.8, Foodie: 0.3, Luxury: 0.4, Budget: 0.6, Nature: 1.0, Photographer: 0.9, Backpacker: 0.5, Family: 0.7, Pilgrim: 0.1, Adventure: 0.8, HistoryLover: 0.1, Nightlife: 0.1, Relaxation: 0.5, Shopping: 0.1 },
  'PILGRIMAGE':  { Explorer: 0.4, Foodie: 0.4, Luxury: 0.2, Budget: 0.9, Nature: 0.4, Photographer: 0.5, Backpacker: 0.7, Family: 0.9, Pilgrim: 1.0, Adventure: 0.2, HistoryLover: 0.7, Nightlife: 0.0, Relaxation: 0.4, Shopping: 0.5 },
  'HERITAGE':    { Explorer: 0.8, Foodie: 0.6, Luxury: 0.5, Budget: 0.6, Nature: 0.3, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.6, Adventure: 0.3, HistoryLover: 1.0, Nightlife: 0.2, Relaxation: 0.5, Shopping: 0.6 },
  'ADVENTURE':   { Explorer: 0.9, Foodie: 0.4, Luxury: 0.3, Budget: 0.7, Nature: 0.8, Photographer: 0.7, Backpacker: 1.0, Family: 0.3, Pilgrim: 0.1, Adventure: 1.0, HistoryLover: 0.2, Nightlife: 0.4, Relaxation: 0.2, Shopping: 0.2 },
  'DESERT':      { Explorer: 0.8, Foodie: 0.5, Luxury: 0.6, Budget: 0.5, Nature: 0.8, Photographer: 0.9, Backpacker: 0.7, Family: 0.5, Pilgrim: 0.2, Adventure: 0.7, HistoryLover: 0.6, Nightlife: 0.2, Relaxation: 0.6, Shopping: 0.4 },
  'LAKE':        { Explorer: 0.6, Foodie: 0.5, Luxury: 0.6, Budget: 0.6, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.3, Adventure: 0.4, HistoryLover: 0.3, Nightlife: 0.1, Relaxation: 0.9, Shopping: 0.2 },
  'WATERFALL':   { Explorer: 0.6, Foodie: 0.3, Luxury: 0.3, Budget: 0.8, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.1, Adventure: 0.5, HistoryLover: 0.1, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.1 },
  'ISLAND':      { Explorer: 0.7, Foodie: 0.6, Luxury: 0.8, Budget: 0.5, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.7, Pilgrim: 0.1, Adventure: 0.6, HistoryLover: 0.2, Nightlife: 0.5, Relaxation: 1.0, Shopping: 0.3 }
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

const rawIndia3 = [
  // Bihar, Jharkhand, Odisha (19)
  ['Bhubaneswar', 'Odisha', 20.2961, 85.8245, 'HERITAGE', 'culture,history', 0.85, 2, 'Low'],
  ['Puri', 'Odisha', 19.8135, 85.8312, 'PILGRIMAGE', 'beach', 0.95, 2, 'Low'],
  ['Konark', 'Odisha', 19.8876, 86.0945, 'HERITAGE', 'history', 0.95, 1, 'Low'],
  ['Cuttack', 'Odisha', 20.4625, 85.8828, 'CITY', 'history', 0.7, 2, 'Low'],
  ['Chilika Lake', 'Odisha', 19.8450, 85.4788, 'NATURE', 'relax', 0.85, 2, 'Low'],
  ['Gopalpur', 'Odisha', 19.2638, 84.9080, 'BEACH', 'relax', 0.75, 2, 'Low'],
  ['Simlipal', 'Odisha', 21.8496, 86.2970, 'WILDLIFE', 'nature', 0.8, 3, 'Medium'],
  ['Ranchi', 'Jharkhand', 23.3441, 85.3096, 'CITY', 'nature', 0.75, 2, 'Medium'],
  ['Jamshedpur', 'Jharkhand', 22.8046, 86.2029, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Dhanbad', 'Jharkhand', 23.7915, 86.4304, 'CITY', '', 0.6, 2, 'Low'],
  ['Deoghar', 'Jharkhand', 24.4841, 86.6961, 'PILGRIMAGE', '', 0.8, 2, 'Low'],
  ['Hazaribagh', 'Jharkhand', 23.9925, 85.3637, 'NATURE', 'relax', 0.75, 2, 'Low'],
  ['Netarhat', 'Jharkhand', 23.4735, 84.2691, 'HILL_STATION', 'nature', 0.8, 2, 'Low'],
  ['Betla National Park', 'Jharkhand', 23.8824, 84.1923, 'WILDLIFE', 'nature', 0.75, 2, 'Low'],

  // Punjab & Chandigarh (7)
  ['Amritsar', 'Punjab', 31.6340, 74.8723, 'PILGRIMAGE', 'history,food', 0.98, 2, 'Medium'],
  ['Ludhiana', 'Punjab', 30.9010, 75.8573, 'CITY', 'food', 0.75, 2, 'Medium'],
  ['Jalandhar', 'Punjab', 31.3260, 75.5762, 'CITY', 'culture', 0.7, 2, 'Medium'],
  ['Patiala', 'Punjab', 30.3398, 76.3869, 'HERITAGE', 'history', 0.75, 2, 'Medium'],
  ['Bathinda', 'Punjab', 30.2110, 74.9455, 'CITY', 'history', 0.65, 2, 'Low'],
  ['Pathankot', 'Punjab', 32.2642, 75.6499, 'CITY', 'nature', 0.65, 1, 'Medium'],
  ['Chandigarh', 'Chandigarh', 30.7333, 76.7794, 'CITY', 'relax,shopping', 0.85, 2, 'High'],

  // Sikkim, Tripura, Nagaland, Mizoram, Manipur, Meghalaya (16)
  ['Gangtok', 'Sikkim', 27.3314, 88.6138, 'HILL_STATION', 'nature,relax', 0.9, 3, 'Medium'],
  ['Pelling', 'Sikkim', 27.3155, 88.2392, 'MOUNTAIN', 'nature', 0.85, 2, 'Medium'],
  ['Lachung', 'Sikkim', 27.6891, 88.7431, 'MOUNTAIN', 'nature,adventure', 0.88, 3, 'Low'],
  ['Shillong', 'Meghalaya', 25.5788, 91.8933, 'HILL_STATION', 'nature,music', 0.9, 3, 'Medium'],
  ['Cherrapunji', 'Meghalaya', 25.2702, 91.7323, 'WATERFALL', 'nature,adventure', 0.9, 2, 'Medium'],
  ['Mawlynnong', 'Meghalaya', 25.2023, 91.9165, 'NATURE', 'culture', 0.85, 2, 'Low'],
  ['Kohima', 'Nagaland', 25.6701, 94.1077, 'MOUNTAIN', 'history,culture', 0.8, 3, 'Medium'],
  ['Dimapur', 'Nagaland', 25.9069, 93.7275, 'CITY', 'culture', 0.7, 2, 'Medium'],
  ['Imphal', 'Manipur', 24.8170, 93.9368, 'CITY', 'history,nature', 0.75, 3, 'Low'],
  ['Loktak Lake', 'Manipur', 24.5446, 93.8164, 'LAKE', 'nature,relax', 0.85, 2, 'Low'],
  ['Aizawl', 'Mizoram', 23.7271, 92.7176, 'HILL_STATION', 'nature,culture', 0.75, 3, 'Low'],
  ['Champhai', 'Mizoram', 23.4735, 93.3283, 'NATURE', 'relax', 0.7, 2, 'Low'],
  ['Agartala', 'Tripura', 23.8315, 91.2868, 'CITY', 'heritage,history', 0.75, 2, 'Low'],
  ['Unakoti', 'Tripura', 24.3168, 92.0007, 'HERITAGE', 'Pilgrim', 0.8, 1, 'Low'],
  
  // Islands & Ladakh (6)
  ['Leh', 'Ladakh', 34.1526, 77.5771, 'MOUNTAIN', 'adventure,culture', 0.95, 5, 'High'],
  ['Nubra Valley', 'Ladakh', 34.6930, 77.5113, 'DESERT', 'adventure', 0.9, 3, 'Medium'],
  ['Pangong Tso', 'Ladakh', 33.7595, 78.6674, 'LAKE', 'nature,adventure', 0.95, 2, 'Medium'],
  ['Port Blair', 'Andaman and Nicobar Islands', 11.6234, 92.7265, 'CITY', 'network,history', 0.8, 2, 'Medium'],
  ['Havelock Island', 'Andaman and Nicobar Islands', 11.9761, 92.9876, 'ISLAND', 'beach,relax', 0.95, 4, 'High'],
  ['Lakshadweep Islands', 'Lakshadweep', 10.5667, 72.6417, 'ISLAND', 'nature,relax', 0.9, 4, 'High'],
  
  // Puducherry (1)
  ['Puducherry', 'Puducherry', 11.9416, 79.8083, 'BEACH', 'culture,history,relax', 0.9, 3, 'Medium']
];

const processed = rawIndia3.map((d) => {
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

fs.writeFileSync(path.join(__dirname, 'data', 'india_batch3.json'), JSON.stringify(processed, null, 2));
console.log("India batch 3 successfully generated.", processed.length);
