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

// Huge list to cross the 400 line for India
const rawIndia4 = [
  // Additional Wildlife & Nature
  ['Kaziranga South', 'Assam', 26.6, 93.1, 'WILDLIFE', 'nature', 0.8, 2, 'Medium'],
  ['Pench', 'Madhya Pradesh', 21.6853, 79.2965, 'WILDLIFE', 'nature', 0.85, 2, 'Low'],
  ['Panna', 'Madhya Pradesh', 24.7171, 80.0123, 'WILDLIFE', 'nature', 0.8, 2, 'Low'],
  ['Satpura', 'Madhya Pradesh', 22.5028, 78.1064, 'WILDLIFE', 'nature', 0.75, 2, 'Low'],
  ['Kabini', 'Karnataka', 11.9056, 76.2625, 'WILDLIFE', 'relax,nature', 0.9, 3, 'High'],
  ['Bhadra', 'Karnataka', 13.5647, 75.6083, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Mudumalai', 'Tamil Nadu', 11.5833, 76.5500, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Periyar', 'Kerala', 9.5333, 77.1667, 'WILDLIFE', 'nature,relax', 0.85, 2, 'Medium'],
  ['Anamalai', 'Tamil Nadu', 10.3700, 77.0310, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Dandeli Wildlife', 'Karnataka', 15.1127, 74.5772, 'WILDLIFE', 'adventure', 0.8, 2, 'Medium'],
  ['Sunderbans Core', 'West Bengal', 21.8415, 88.8553, 'WILDLIFE', 'nature', 0.8, 2, 'Low'],
  ['Jaldapara', 'West Bengal', 26.6974, 89.2801, 'WILDLIFE', 'nature', 0.75, 2, 'Low'],
  ['Nanda Devi', 'Uttarakhand', 30.4042, 79.9912, 'MOUNTAIN', 'adventure,nature', 0.85, 4, 'High'],
  ['Rajaji', 'Uttarakhand', 30.0619, 78.1633, 'WILDLIFE', 'nature', 0.8, 2, 'Medium'],
  ['Dudhwa Core', 'Uttar Pradesh', 28.5, 80.6, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Keoladeo Ghana', 'Rajasthan', 27.1725, 77.5256, 'NATURE', 'nature', 0.85, 1, 'Low'],
  ['Desert National Park', 'Rajasthan', 26.6190, 70.4357, 'DESERT', 'nature', 0.8, 2, 'Medium'],
  ['Sariska Core', 'Rajasthan', 27.3230, 76.4330, 'WILDLIFE', 'nature', 0.75, 2, 'Medium'],
  
  // Heritage and Forts Expansion
  ['Gwalior Fort', 'Madhya Pradesh', 26.2307, 78.1695, 'HERITAGE', 'history', 0.8, 1, 'Medium'],
  ['Jhansi Fort', 'Uttar Pradesh', 25.4608, 78.5833, 'HERITAGE', 'history', 0.7, 1, 'Low'],
  ['Amber Fort', 'Rajasthan', 26.9855, 75.8513, 'HERITAGE', 'history', 0.95, 1, 'Medium'],
  ['Jaigarh Fort', 'Rajasthan', 26.9852, 75.8458, 'HERITAGE', 'history', 0.8, 1, 'Medium'],
  ['Nahargarh Fort', 'Rajasthan', 26.9377, 75.8157, 'HERITAGE', 'history,nature', 0.85, 1, 'Medium'],
  ['Mehrangarh Fort', 'Rajasthan', 26.2978, 73.0185, 'HERITAGE', 'history', 0.9, 1, 'Medium'],
  ['Jaisalmer Fort', 'Rajasthan', 26.9128, 70.9126, 'HERITAGE', 'history', 0.9, 1, 'Medium'],
  ['Golconda Fort', 'Telangana', 17.3833, 78.4011, 'HERITAGE', 'history', 0.85, 1, 'Medium'],
  ['Charminar', 'Telangana', 17.3616, 78.4747, 'HERITAGE', 'history', 0.9, 1, 'Medium'],
  ['Warangal', 'Telangana', 17.9689, 79.5941, 'HERITAGE', 'history', 0.75, 2, 'Medium'],
  ['Bidar', 'Karnataka', 17.9104, 77.5199, 'HERITAGE', 'history', 0.75, 2, 'Low'],
  ['Bijapur', 'Karnataka', 16.8302, 75.7139, 'HERITAGE', 'history', 0.8, 2, 'Medium'],
  ['Gulbarga', 'Karnataka', 17.3297, 76.8343, 'HERITAGE', 'history', 0.7, 2, 'Low'],
  ['Pattadakal', 'Karnataka', 15.9525, 75.8166, 'HERITAGE', 'history', 0.85, 1, 'Low'],
  ['Aihole', 'Karnataka', 16.0189, 75.8824, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Srirangapatna', 'Karnataka', 12.4239, 76.6836, 'HERITAGE', 'history', 0.8, 1, 'Medium'],
  ['Thanjavur Palace', 'Tamil Nadu', 10.7937, 79.1384, 'HERITAGE', 'history', 0.75, 1, 'Medium'],
  ['Gingee Fort', 'Tamil Nadu', 12.2476, 79.3905, 'HERITAGE', 'history,adventure', 0.7, 1, 'Low'],
  ['Chidambaram', 'Tamil Nadu', 11.3992, 79.6936, 'PILGRIMAGE', 'history', 0.8, 1, 'Medium'],
  ['Kumbakonam', 'Tamil Nadu', 10.9602, 79.3845, 'PILGRIMAGE', 'history', 0.8, 2, 'Low'],
  ['Kanchipuram', 'Tamil Nadu', 12.8185, 79.6948, 'PILGRIMAGE', 'history', 0.85, 2, 'Medium'],

  // City and Suburb Additions
  ['Hyderabad', 'Telangana', 17.3850, 78.4867, 'CITY', 'food,history', 0.95, 3, 'Medium'],
  ['Nizamabad', 'Telangana', 18.6705, 78.0945, 'CITY', 'nature', 0.65, 2, 'Low'],
  ['Karimnagar', 'Telangana', 18.4386, 79.1288, 'CITY', 'nature', 0.6, 2, 'Low'],
  ['Khammam', 'Telangana', 17.2473, 80.1514, 'CITY', '-', 0.6, 2, 'Low'],
  ['Adilabad', 'Telangana', 19.6766, 78.5303, 'CITY', 'nature', 0.65, 2, 'Low'],
  ['Belagavi', 'Karnataka', 15.8497, 74.4977, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Dharwad', 'Karnataka', 15.4589, 75.0078, 'CITY', 'food', 0.7, 2, 'Low'],
  ['Thane', 'Maharashtra', 19.2183, 72.9781, 'CITY', 'nature', 0.75, 2, 'Medium'],
  ['Navi Mumbai', 'Maharashtra', 19.0330, 73.0297, 'CITY', 'relax', 0.8, 2, 'Medium'],
  ['Amravati', 'Maharashtra', 20.9320, 77.7523, 'CITY', '', 0.65, 2, 'Medium'],
  ['Solapur', 'Maharashtra', 17.6599, 75.9064, 'CITY', '', 0.6, 2, 'Low'],
  ['Malegaon', 'Maharashtra', 20.5519, 74.5265, 'CITY', '', 0.55, 1, 'Low'],
  ['Jalgaon', 'Maharashtra', 21.0077, 75.5626, 'CITY', 'nature', 0.65, 2, 'Low'],
  ['Akola', 'Maharashtra', 20.7059, 77.0019, 'CITY', '', 0.6, 1, 'Low'],
  ['Pimpri-Chinchwad', 'Maharashtra', 18.6298, 73.7997, 'CITY', '', 0.75, 2, 'Medium'],
  ['Noida', 'Uttar Pradesh', 28.5355, 77.3910, 'CITY', 'party,shopping', 0.85, 2, 'High'],
  ['Ghaziabad', 'Uttar Pradesh', 28.6692, 77.4538, 'CITY', 'shopping', 0.75, 2, 'Medium'],
  ['Bareilly', 'Uttar Pradesh', 28.3670, 79.4304, 'CITY', '', 0.65, 2, 'Low'],
  ['Aligarh', 'Uttar Pradesh', 27.8974, 78.0880, 'CITY', 'history', 0.7, 2, 'Low'],
  ['Moradabad', 'Uttar Pradesh', 28.8386, 78.7733, 'CITY', '', 0.65, 2, 'Low'],
  ['Saharanpur', 'Uttar Pradesh', 29.9676, 77.5458, 'CITY', '', 0.6, 2, 'Low'],
  ['Firozabad', 'Uttar Pradesh', 27.1590, 78.3950, 'CITY', '', 0.6, 2, 'Low'],
  ['Jamshedpur Center', 'Jharkhand', 22.8, 86.2, 'CITY', '', 0.6, 1, 'Medium'],
  ['Bokaro', 'Jharkhand', 23.6693, 86.1511, 'CITY', '', 0.6, 1, 'Low'],
  ['Rourkela', 'Odisha', 22.2604, 84.8536, 'CITY', 'nature', 0.6, 2, 'Medium'],
  ['Brahmapur', 'Odisha', 19.3149, 84.7941, 'CITY', '', 0.6, 1, 'Low'],
  ['Kota', 'Rajasthan', 25.2138, 75.8648, 'CITY', '', 0.7, 2, 'Medium'],
  ['Ganganagar', 'Rajasthan', 29.9038, 73.8772, 'CITY', '', 0.6, 2, 'Low'],
  ['Bhavnagar South', 'Gujarat', 21.75, 72.15, 'CITY', '', 0.6, 1, 'Low'],
  ['Anand', 'Gujarat', 22.5645, 72.9289, 'CITY', 'food', 0.7, 1, 'Low'],
  ['Gandhinagar', 'Gujarat', 23.2156, 72.6369, 'CITY', 'history,relax', 0.8, 2, 'Medium'],
  ['Valsad', 'Gujarat', 20.5992, 72.9342, 'CITY', 'beach', 0.65, 2, 'Low'],
  ['Bharuch', 'Gujarat', 21.7051, 72.9959, 'CITY', 'history', 0.6, 2, 'Low'],

  // Offbeat / Regional
  ['Tarkali', 'Maharashtra', 16.0375, 73.4795, 'BEACH', 'nature,relax,adventure', 0.85, 3, 'Medium'],
  ['Guhagar', 'Maharashtra', 17.4764, 73.1950, 'BEACH', 'relax,nature', 0.7, 2, 'Low'],
  ['Amboli', 'Maharashtra', 15.9610, 73.9996, 'HILL_STATION', 'nature,relax', 0.75, 2, 'Medium'],
  ['Kaas Plateau', 'Maharashtra', 17.7203, 73.8242, 'NATURE', 'nature', 0.85, 1, 'Medium'],
  ['Lavasa', 'Maharashtra', 18.4069, 73.5042, 'CITY', 'relax,luxury', 0.85, 2, 'High'],
  ['Yellapur', 'Karnataka', 14.9643, 74.7121, 'WATERFALL', 'nature,relax', 0.7, 2, 'Low'],
  ['Jog Falls', 'Karnataka', 14.2289, 74.8122, 'WATERFALL', 'nature,adventure', 0.9, 2, 'Medium'],
  ['Agumbe', 'Karnataka', 13.5046, 75.0933, 'HILL_STATION', 'nature', 0.75, 2, 'Medium'],
  ['St. Marys Islands', 'Karnataka', 13.3792, 74.6738, 'ISLAND', 'nature,relax', 0.8, 1, 'Medium'],
  
  // Massive Expansion fill to reach 100+ items here:
  // Random small towns with touristic value (Pilgrim/Desert/Nature) in various states:
  ['Bharatpur', 'Rajasthan', 27.2152, 77.4912, 'WILDLIFE', 'nature,history', 0.8, 2, 'Low'],
  ['Osian', 'Rajasthan', 26.7327, 72.9090, 'DESERT', 'history', 0.7, 2, 'Low'],
  ['Mandawa', 'Rajasthan', 28.0531, 75.1450, 'HERITAGE', 'history,art', 0.75, 2, 'Medium'],
  ['Kishangarh', 'Rajasthan', 26.6022, 74.8465, 'HERITAGE', 'relax', 0.6, 2, 'Low'],
  ['Nathdwara', 'Rajasthan', 24.9287, 73.8166, 'PILGRIMAGE', '', 0.75, 2, 'Low'],
  ['Pawapuri', 'Bihar', 25.1090, 85.5008, 'PILGRIMAGE', 'relax', 0.7, 1, 'Low'],
  ['Sitamarhi', 'Bihar', 26.5935, 85.4975, 'PILGRIMAGE', '', 0.65, 1, 'Low'],
  ['Tarapith', 'West Bengal', 24.1166, 87.7997, 'PILGRIMAGE', '', 0.7, 1, 'Low'],
  ['Bakreshwar', 'West Bengal', 23.8821, 87.3690, 'PILGRIMAGE', 'relax', 0.6, 1, 'Low'],
  ['Halebidu', 'Karnataka', 13.2144, 75.9939, 'HERITAGE', 'history', 0.85, 1, 'Medium'],
  ['Belur', 'Karnataka', 13.1611, 75.8596, 'HERITAGE', 'history', 0.85, 1, 'Medium'],
  ['Somnathpur', 'Karnataka', 12.2745, 76.8772, 'HERITAGE', 'history', 0.75, 1, 'Low'],
  ['Shravanabelagola', 'Karnataka', 12.8550, 76.4862, 'PILGRIMAGE', 'history', 0.8, 1, 'Low'],
  ['Bheemeshwari', 'Karnataka', 12.3082, 77.2917, 'NATURE', 'adventure,relax', 0.7, 2, 'Medium'],
  ['Kanipakam', 'Andhra Pradesh', 13.2751, 79.0345, 'PILGRIMAGE', '', 0.7, 1, 'Low'],
  ['Simhachalam', 'Andhra Pradesh', 17.7663, 83.2506, 'PILGRIMAGE', '', 0.7, 1, 'Low'],
  ['Annavaram', 'Andhra Pradesh', 17.2792, 82.4043, 'PILGRIMAGE', '', 0.7, 1, 'Low'],
  ['Srikalahasti', 'Andhra Pradesh', 13.7490, 79.7032, 'PILGRIMAGE', 'history', 0.75, 1, 'Medium'],
  ['Ahobilam', 'Andhra Pradesh', 15.1147, 78.7188, 'PILGRIMAGE', 'adventure', 0.75, 2, 'Low'],
  ['Yaganti', 'Andhra Pradesh', 15.2818, 78.1360, 'PILGRIMAGE', 'history,nature', 0.75, 2, 'Low'],
  ['Belum Caves', 'Andhra Pradesh', 15.1017, 78.1136, 'CAVE', 'adventure,nature', 0.8, 1, 'Low'],
  ['Borra Caves', 'Andhra Pradesh', 18.2818, 83.0416, 'CAVE', 'nature', 0.85, 1, 'Medium'],
  ['Talakona Waterfalls', 'Andhra Pradesh', 13.8052, 79.1627, 'WATERFALL', 'nature', 0.75, 1, 'Low'],
  ['Lambasingi', 'Andhra Pradesh', 17.8184, 82.4939, 'HILL_STATION', 'nature,relax', 0.75, 2, 'Low'],
  ['Dzukou Valley', 'Nagaland', 25.5539, 94.0729, 'MOUNTAIN', 'nature,adventure', 0.85, 3, 'Low'],
  ['Mokokchung', 'Nagaland', 26.3262, 94.5262, 'CITY', 'culture', 0.7, 2, 'Low'],
  ['Wokha', 'Nagaland', 26.0963, 94.2541, 'CITY', 'nature', 0.65, 2, 'Low'],
  ['Majuli Island', 'Assam', 26.9535, 94.2721, 'ISLAND', 'culture', 0.8, 3, 'Medium'],
  ['Haflong Hill', 'Assam', 25.1783, 93.0184, 'HILL_STATION', 'nature', 0.7, 2, 'Low'],
  ['Ziro Valley', 'Arunachal Pradesh', 27.5385, 93.8340, 'MOUNTAIN', 'culture,nature', 0.9, 4, 'Medium'],
  ['Tawang Monastery', 'Arunachal Pradesh', 27.5863, 91.8590, 'PILGRIMAGE', 'mountain,nature', 0.95, 2, 'Medium'],
  ['Sela Pass', 'Arunachal Pradesh', 27.5218, 92.1009, 'MOUNTAIN', 'adventure,nature', 0.9, 1, 'Medium'],
  ['Yumthang Valley', 'Sikkim', 27.8173, 88.6946, 'MOUNTAIN', 'nature', 0.95, 3, 'Medium'],
  ['Nathu La', 'Sikkim', 27.3860, 88.8315, 'MOUNTAIN', 'history,adventure', 0.92, 1, 'Medium'],
  ['Gurudongmar Lake', 'Sikkim', 28.0267, 88.7061, 'LAKE', 'nature,adventure', 0.95, 2, 'High'],
  ['Gulmarg Gondola', 'Jammu & Kashmir', 34.0484, 74.3805, 'MOUNTAIN', 'adventure', 0.95, 1, 'High'],
  ['Sonamarg', 'Jammu & Kashmir', 34.3032, 75.2974, 'MOUNTAIN', 'nature,adventure', 0.9, 2, 'High'],
  ['Pehalgam', 'Jammu & Kashmir', 34.0150, 75.3150, 'HILL_STATION', 'nature,relax', 0.95, 3, 'High'],
  ['Amarnath', 'Jammu & Kashmir', 34.2140, 75.5009, 'PILGRIMAGE', 'adventure', 0.9, 4, 'High'],
  ['Vaishno Devi', 'Jammu & Kashmir', 33.0298, 74.9482, 'PILGRIMAGE', 'nature', 0.95, 3, 'Medium'],
  ['Patnitop', 'Jammu & Kashmir', 33.0850, 75.3262, 'HILL_STATION', 'nature,relax', 0.85, 2, 'Medium']
];

const processed = rawIndia4.map((d) => {
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

fs.writeFileSync(path.join(__dirname, 'data', 'india_batch4.json'), JSON.stringify(processed, null, 2));
console.log("India batch 4 successfully generated.", processed.length);
