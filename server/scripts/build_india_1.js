const fs = require('fs');
const path = require('path');

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

const rawIndia = [
  // Andhra Pradesh (15)
  ['Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 'BEACH', 'nature,relax', 0.85, 3, 'Medium'],
  ['Tirupati', 'Andhra Pradesh', 13.6288, 79.4192, 'PILGRIMAGE', 'history', 0.95, 2, 'Low'],
  ['Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 'CITY', 'food,history', 0.75, 2, 'Medium'],
  ['Amaravati', 'Andhra Pradesh', 16.5115, 80.5186, 'HERITAGE', 'history', 0.65, 2, 'Medium'],
  ['Araku Valley', 'Andhra Pradesh', 18.3273, 82.8775, 'HILL_STATION', 'nature,relax', 0.8, 3, 'Low'],
  ['Kurnool', 'Andhra Pradesh', 15.8281, 78.0373, 'HERITAGE', 'history', 0.6, 2, 'Low'],
  ['Rajahmundry', 'Andhra Pradesh', 17.0005, 81.8040, 'CITY', 'culture,nature', 0.7, 2, 'Medium'],
  ['Nellore', 'Andhra Pradesh', 14.4426, 79.9865, 'CITY', 'food', 0.6, 2, 'Medium'],
  ['Guntur', 'Andhra Pradesh', 16.3067, 80.4365, 'CITY', 'food', 0.65, 2, 'Medium'],
  ['Gandikota', 'Andhra Pradesh', 14.8143, 78.2862, 'NATURE', 'adventure,history', 0.75, 2, 'Low'],
  ['Lepakshi', 'Andhra Pradesh', 13.8052, 77.6041, 'HERITAGE', 'history', 0.7, 1, 'Low'],
  ['Srisailam', 'Andhra Pradesh', 16.0725, 78.8687, 'PILGRIMAGE', 'nature', 0.8, 2, 'Low'],
  ['Maredumilli', 'Andhra Pradesh', 17.6006, 81.7107, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Anantapur', 'Andhra Pradesh', 14.6819, 77.6006, 'HERITAGE', 'history', 0.5, 2, 'Low'],
  ['Papikondalu', 'Andhra Pradesh', 17.4338, 81.5034, 'NATURE', 'relax', 0.65, 2, 'Medium'],

  // Arunachal Pradesh (10)
  ['Tawang', 'Arunachal Pradesh', 27.5860, 91.8594, 'MOUNTAIN', 'history,nature', 0.9, 4, 'Medium'],
  ['Itanagar', 'Arunachal Pradesh', 27.0844, 93.6053, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Ziro', 'Arunachal Pradesh', 27.5385, 93.8340, 'HILL_STATION', 'culture,nature', 0.85, 3, 'Low'],
  ['Bomdila', 'Arunachal Pradesh', 27.2645, 92.4158, 'MOUNTAIN', 'nature', 0.7, 2, 'Low'],
  ['Pasighat', 'Arunachal Pradesh', 28.0619, 95.3259, 'NATURE', 'adventure', 0.6, 2, 'Medium'],
  ['Roing', 'Arunachal Pradesh', 28.1408, 95.8273, 'NATURE', 'adventure', 0.6, 2, 'Low'],
  ['Anini', 'Arunachal Pradesh', 28.7901, 95.9080, 'MOUNTAIN', 'adventure', 0.6, 3, 'Low'],
  ['Tezu', 'Arunachal Pradesh', 27.9150, 96.1661, 'NATURE', 'Pilgrim', 0.5, 2, 'Low'],
  ['Bhalukpong', 'Arunachal Pradesh', 27.0125, 92.6468, 'NATURE', 'adventure', 0.6, 2, 'Low'],
  ['Dirang', 'Arunachal Pradesh', 27.3546, 92.2355, 'MOUNTAIN', 'nature', 0.7, 2, 'Low'],

  // Assam (12)
  ['Guwahati', 'Assam', 26.1445, 91.7362, 'CITY', 'Pilgrim,nature', 0.8, 3, 'Medium'],
  ['Kaziranga', 'Assam', 26.5775, 93.1711, 'WILDLIFE', 'nature', 0.95, 3, 'Medium'],
  ['Majuli', 'Assam', 26.9535, 94.2721, 'ISLAND', 'culture,relax', 0.85, 3, 'Low'],
  ['Jorhat', 'Assam', 26.7509, 94.2037, 'CITY', 'nature,history', 0.7, 2, 'Medium'],
  ['Tezpur', 'Assam', 26.6528, 92.7926, 'HERITAGE', 'history', 0.7, 2, 'Medium'],
  ['Dibrugarh', 'Assam', 27.4728, 94.9120, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Sivasagar', 'Assam', 26.9826, 94.6425, 'HERITAGE', 'history', 0.75, 2, 'Low'],
  ['Silchar', 'Assam', 24.8333, 92.7789, 'CITY', 'culture', 0.65, 2, 'Medium'],
  ['Manas National Park', 'Assam', 26.7570, 91.0182, 'WILDLIFE', 'nature', 0.8, 2, 'Medium'],
  ['Nameri National Park', 'Assam', 26.9202, 92.7844, 'WILDLIFE', 'adventure', 0.75, 2, 'Low'],
  ['Haflong', 'Assam', 25.1783, 93.0184, 'HILL_STATION', 'nature', 0.75, 2, 'Low'],
  ['Digboi', 'Assam', 27.3995, 95.6267, 'HERITAGE', 'history', 0.6, 2, 'Medium'],

  // Bihar (11)
  ['Patna', 'Bihar', 25.5941, 85.1376, 'CITY', 'history', 0.75, 2, 'Medium'],
  ['Bodh Gaya', 'Bihar', 24.6961, 84.9869, 'PILGRIMAGE', 'history', 0.95, 3, 'Low'],
  ['Nalanda', 'Bihar', 25.1345, 85.4450, 'HERITAGE', 'history', 0.9, 2, 'Low'],
  ['Rajgir', 'Bihar', 25.0298, 85.4190, 'HERITAGE', 'history,nature', 0.85, 2, 'Low'],
  ['Vaishali', 'Bihar', 25.9926, 85.1274, 'HERITAGE', 'history', 0.75, 1, 'Low'],
  ['Muzaffarpur', 'Bihar', 26.1209, 85.3647, 'CITY', '', 0.6, 2, 'Low'],
  ['Bhagalpur', 'Bihar', 25.2425, 86.9842, 'CITY', 'nature', 0.6, 2, 'Medium'],
  ['Gaya', 'Bihar', 24.7914, 85.0002, 'PILGRIMAGE', 'history', 0.8, 2, 'Low'],
  ['Sasaram', 'Bihar', 24.9490, 84.0314, 'HERITAGE', 'history', 0.65, 1, 'Low'],
  ['Darbhanga', 'Bihar', 26.1542, 85.8918, 'CITY', 'culture', 0.65, 2, 'Low'],
  ['Munger', 'Bihar', 25.3757, 86.4744, 'HERITAGE', 'nature', 0.6, 2, 'Low'],

  // Chhattisgarh (10)
  ['Raipur', 'Chhattisgarh', 21.2514, 81.6296, 'CITY', '', 0.7, 2, 'Medium'],
  ['Bhilai', 'Chhattisgarh', 21.1938, 81.3509, 'CITY', '', 0.65, 2, 'Medium'],
  ['Bilaspur', 'Chhattisgarh', 22.0797, 82.1391, 'CITY', 'nature', 0.65, 2, 'Medium'],
  ['Jagdalpur', 'Chhattisgarh', 19.0734, 82.0326, 'NATURE', 'Waterfall,history', 0.8, 3, 'Low'],
  ['Bastar', 'Chhattisgarh', 19.1437, 81.9360, 'CULTURAL', 'adventure', 0.75, 3, 'Low'],
  ['Chitrakote Falls', 'Chhattisgarh', 19.2066, 81.7185, 'WATERFALL', 'nature', 0.85, 1, 'Low'],
  ['Kanger Ghati', 'Chhattisgarh', 18.8351, 81.8845, 'NATIONAL_PARK', 'nature,adventure', 0.75, 2, 'Low'],
  ['Sirpur', 'Chhattisgarh', 21.4116, 82.1965, 'HERITAGE', 'history', 0.7, 2, 'Low'],
  ['Mainpat', 'Chhattisgarh', 22.8275, 83.2848, 'HILL_STATION', 'nature,relax', 0.7, 2, 'Low'],
  ['Kawardha', 'Chhattisgarh', 22.0125, 81.2407, 'HERITAGE', 'nature', 0.6, 2, 'Low'],

  // Goa (7)
  ['Panaji', 'Goa', 15.4909, 73.8278, 'CITY', 'heritage,food', 0.85, 3, 'Medium'],
  ['Calangute', 'Goa', 15.5451, 73.7554, 'BEACH', 'party,food', 0.95, 4, 'High'],
  ['Palolem', 'Goa', 15.0100, 74.0232, 'BEACH', 'relax,nature', 0.88, 3, 'Medium'],
  ['Old Goa', 'Goa', 15.5030, 73.9113, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Dudhsagar Falls', 'Goa', 15.3144, 74.3143, 'WATERFALL', 'nature,adventure', 0.85, 1, 'Low'],
  ['Vagator', 'Goa', 15.5975, 73.7381, 'BEACH', 'party', 0.85, 2, 'Medium'],
  ['Morjim', 'Goa', 15.6174, 73.7408, 'BEACH', 'relax', 0.8, 3, 'Medium'],

  // Gujarat (16)
  ['Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'CITY', 'heritage,food', 0.85, 3, 'Medium'],
  ['Surat', 'Gujarat', 21.1702, 72.8311, 'CITY', 'food,shopping', 0.8, 2, 'Medium'],
  ['Vadodara', 'Gujarat', 22.3072, 73.1812, 'CITY', 'heritage', 0.75, 2, 'Medium'],
  ['Rajkot', 'Gujarat', 22.3039, 70.8022, 'CITY', 'food', 0.7, 2, 'Medium'],
  ['Somnath', 'Gujarat', 20.8880, 70.4012, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Dwarka', 'Gujarat', 22.2442, 68.9685, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Gir National Park', 'Gujarat', 21.1243, 70.8242, 'WILDLIFE', 'nature', 0.9, 3, 'Medium'],
  ['Kutch', 'Gujarat', 23.7337, 69.8597, 'DESERT', 'culture,nature', 0.88, 4, 'Medium'],
  ['Statue of Unity', 'Gujarat', 21.8380, 73.7191, 'HERITAGE', '', 0.95, 2, 'High'],
  ['Bhuj', 'Gujarat', 23.2420, 69.6669, 'CITY', 'history', 0.75, 2, 'Low'],
  ['Jamnagar', 'Gujarat', 22.4707, 70.0577, 'CITY', 'history,nature', 0.7, 2, 'Medium'],
  ['Bhavnagar', 'Gujarat', 21.7645, 72.1519, 'CITY', 'history', 0.65, 2, 'Low'],
  ['Champaner', 'Gujarat', 22.4842, 73.5350, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Patan (Rani ki Vav)', 'Gujarat', 23.8381, 72.1017, 'HERITAGE', 'history', 0.85, 1, 'Low'],
  ['Modhera', 'Gujarat', 23.5833, 72.1333, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Saputara', 'Gujarat', 20.5794, 73.7547, 'HILL_STATION', 'nature,relax', 0.75, 2, 'Medium'],

  // Haryana (9)
  ['Gurugram', 'Haryana', 28.4595, 77.0266, 'CITY', 'luxury,party', 0.8, 2, 'High'],
  ['Kurukshetra', 'Haryana', 29.9695, 76.8226, 'PILGRIMAGE', 'history', 0.8, 2, 'Low'],
  ['Faridabad', 'Haryana', 28.4089, 77.3178, 'CITY', 'nature', 0.65, 2, 'Medium'],
  ['Panipat', 'Haryana', 29.3909, 76.9708, 'HERITAGE', 'history', 0.7, 1, 'Low'],
  ['Karnal', 'Haryana', 29.6857, 76.9905, 'CITY', 'history', 0.65, 1, 'Medium'],
  ['Hisar', 'Haryana', 29.1492, 75.7217, 'CITY', 'history', 0.6, 1, 'Low'],
  ['Panchkula', 'Haryana', 30.6942, 76.8606, 'CITY', 'nature,relax', 0.75, 2, 'Medium'],
  ['Rohtak', 'Haryana', 28.8955, 76.5892, 'CITY', '', 0.6, 1, 'Medium'],
  ['Morni Hills', 'Haryana', 30.6950, 77.0864, 'HILL_STATION', 'nature,relax', 0.7, 2, 'Medium'],

  // Himachal Pradesh (16)
  ['Shimla', 'Himachal Pradesh', 31.1048, 77.1734, 'HILL_STATION', 'history,relax', 0.95, 4, 'High'],
  ['Manali', 'Himachal Pradesh', 32.2396, 77.1887, 'HILL_STATION', 'adventure,nature', 0.95, 5, 'High'],
  ['Dharamshala', 'Himachal Pradesh', 32.2190, 76.3234, 'MOUNTAIN', 'Pilgrim,relax', 0.9, 4, 'Medium'],
  ['Dalhousie', 'Himachal Pradesh', 32.5342, 75.9789, 'HILL_STATION', 'history,relax', 0.85, 3, 'Medium'],
  ['Kullu', 'Himachal Pradesh', 31.9579, 77.1095, 'MOUNTAIN', 'nature,adventure', 0.8, 3, 'Medium'],
  ['Kasol', 'Himachal Pradesh', 32.0100, 77.3150, 'MOUNTAIN', 'budget,party,nature', 0.85, 4, 'Low'],
  ['Spiti Valley', 'Himachal Pradesh', 32.2461, 78.0349, 'MOUNTAIN', 'adventure,nature', 0.9, 5, 'Medium'],
  ['Kasauli', 'Himachal Pradesh', 30.9013, 76.9649, 'HILL_STATION', 'relax', 0.8, 2, 'Medium'],
  ['Mcleod Ganj', 'Himachal Pradesh', 32.2426, 76.3213, 'MOUNTAIN', 'culture,Pilgrim', 0.9, 3, 'Medium'],
  ['Palampur', 'Himachal Pradesh', 32.1109, 76.5363, 'HILL_STATION', 'nature,relax', 0.75, 2, 'Medium'],
  ['Khajjiar', 'Himachal Pradesh', 32.5558, 76.0662, 'HILL_STATION', 'nature,relax', 0.85, 2, 'Medium'],
  ['Chamba', 'Himachal Pradesh', 32.5534, 76.1258, 'HERITAGE', 'history,nature', 0.75, 2, 'Low'],
  ['Solan', 'Himachal Pradesh', 30.9084, 77.0999, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Kinnaur', 'Himachal Pradesh', 31.6210, 78.4725, 'MOUNTAIN', 'adventure,nature', 0.8, 4, 'Medium'],
  ['Kaza', 'Himachal Pradesh', 32.2276, 78.0700, 'MOUNTAIN', 'adventure', 0.85, 3, 'Medium'],
  ['Bir Billing', 'Himachal Pradesh', 32.0464, 76.7196, 'ADVENTURE', 'nature', 0.88, 3, 'Medium'],
];

const processed = rawIndia.map((d) => {
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
    travelDNA: generateDNA(d[4], d[5].split(',').map(s=>s.trim().toLowerCase()))
  };
});

fs.writeFileSync(path.join(__dirname, 'data', 'india_batch1.json'), JSON.stringify(processed, null, 2));

console.log("India batch 1 successfully generated.", processed.length);
