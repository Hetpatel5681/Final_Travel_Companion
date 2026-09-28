const fs = require('fs');
const path = require('path');
const rules = require('./build_india_1.js'); // just for types, wait we can just copy the functions

// 14 dimensions exactly
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

const rawIndia2 = [
  // Kerala (16)
  ['Kochi', 'Kerala', 9.9312, 76.2673, 'CITY', 'heritage,nature', 0.9, 3, 'Medium'],
  ['Munnar', 'Kerala', 10.0892, 77.0595, 'HILL_STATION', 'nature,relax', 0.95, 4, 'High'],
  ['Wayanad', 'Kerala', 11.6854, 76.1320, 'NATURE', 'adventure,relax', 0.9, 3, 'Medium'],
  ['Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, 'CITY', 'heritage,Pilgrim', 0.8, 2, 'Medium'],
  ['Kovalam', 'Kerala', 8.4004, 76.9787, 'BEACH', 'relax,luxury', 0.9, 3, 'High'],
  ['Varkala', 'Kerala', 8.7379, 76.7163, 'BEACH', 'party,relax', 0.88, 3, 'Medium'],
  ['Kannur', 'Kerala', 11.8745, 75.3704, 'BEACH', 'history,nature', 0.75, 2, 'Medium'],
  ['Kozhikode', 'Kerala', 11.2588, 75.7804, 'CITY', 'food,history', 0.8, 2, 'Medium'],
  ['Palakkad', 'Kerala', 10.7867, 76.6548, 'NATURE', 'heritage', 0.7, 2, 'Low'],
  ['Idukki', 'Kerala', 9.8500, 76.9720, 'NATURE', 'adventure,relax', 0.8, 3, 'Low'],
  ['Thrissur', 'Kerala', 10.5276, 76.2144, 'CITY', 'culture,Pilgrim', 0.75, 2, 'Medium'],
  ['Kollam', 'Kerala', 8.8932, 76.6141, 'NATURE', 'relax', 0.7, 2, 'Low'],
  ['Bekal', 'Kerala', 12.3966, 75.0336, 'HERITAGE', 'beach,relax', 0.8, 2, 'Medium'],
  ['Poovar', 'Kerala', 8.3182, 77.0655, 'BEACH', 'nature,relax', 0.75, 2, 'Low'],
  ['Thekkady', 'Kerala', 9.6062, 77.1610, 'WILDLIFE', 'nature,adventure', 0.85, 2, 'Medium'],
  ['Gavi', 'Kerala', 9.4357, 77.1652, 'NATURE', 'adventure,relax', 0.7, 2, 'Low'],

  // Rajasthan (15)
  ['Jaipur', 'Rajasthan', 26.9124, 75.7873, 'CITY', 'heritage,food', 0.95, 3, 'High'],
  ['Udaipur', 'Rajasthan', 24.5854, 73.7125, 'CITY', 'luxury,heritage,relax', 0.98, 4, 'Luxury'],
  ['Jodhpur', 'Rajasthan', 26.2389, 73.0243, 'CITY', 'heritage', 0.9, 3, 'High'],
  ['Jaisalmer', 'Rajasthan', 26.9157, 70.9083, 'DESERT', 'heritage,adventure', 0.92, 3, 'Medium'],
  ['Pushkar', 'Rajasthan', 26.4883, 74.5513, 'PILGRIMAGE', 'relax,culture', 0.85, 2, 'Low'],
  ['Bikaner', 'Rajasthan', 28.0229, 73.3119, 'CITY', 'heritage,desert', 0.8, 2, 'Medium'],
  ['Mount Abu', 'Rajasthan', 24.5926, 72.7156, 'HILL_STATION', 'nature,relax', 0.8, 2, 'Medium'],
  ['Ajmer', 'Rajasthan', 26.4499, 74.6399, 'PILGRIMAGE', 'history', 0.8, 2, 'Low'],
  ['Ranthambore', 'Rajasthan', 26.0173, 76.5026, 'WILDLIFE', 'nature', 0.92, 3, 'High'],
  ['Alwar', 'Rajasthan', 27.5530, 76.6346, 'HERITAGE', 'nature', 0.7, 2, 'Medium'],
  ['Bundi', 'Rajasthan', 25.4415, 75.6415, 'HERITAGE', 'relax,culture', 0.75, 2, 'Low'],
  ['Kumbhalgarh', 'Rajasthan', 25.1481, 73.5828, 'HERITAGE', 'history', 0.85, 2, 'Medium'],
  ['Chittorgarh', 'Rajasthan', 24.8829, 74.6230, 'HERITAGE', 'history', 0.8, 2, 'Low'],
  ['Sariska', 'Rajasthan', 27.3235, 76.4338, 'WILDLIFE', 'nature', 0.7, 2, 'Low'],
  ['Shekhawati', 'Rajasthan', 28.0003, 75.3130, 'HERITAGE', 'culture', 0.7, 2, 'Medium'],

  // Tamil Nadu (15)
  ['Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'CITY', 'history,food', 0.9, 3, 'High'],
  ['Madurai', 'Tamil Nadu', 9.9252, 78.1198, 'PILGRIMAGE', 'history', 0.88, 2, 'Medium'],
  ['Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, 'CITY', 'nature', 0.85, 2, 'Medium'],
  ['Ooty', 'Tamil Nadu', 11.4116, 76.6960, 'HILL_STATION', 'nature,relax', 0.95, 3, 'Medium'],
  ['Kodaikanal', 'Tamil Nadu', 10.2381, 77.4892, 'HILL_STATION', 'nature,relax', 0.92, 3, 'Medium'],
  ['Salem', 'Tamil Nadu', 11.6643, 78.1460, 'CITY', 'nature', 0.75, 2, 'Medium'],
  ['Tiruchirappalli', 'Tamil Nadu', 10.7905, 78.7047, 'HERITAGE', 'Pilgrim', 0.8, 2, 'Medium'],
  ['Tirunelveli', 'Tamil Nadu', 8.7139, 77.7567, 'CITY', 'history', 0.7, 2, 'Low'],
  ['Mahabalipuram', 'Tamil Nadu', 12.6208, 80.1945, 'HERITAGE', 'beach,history', 0.9, 2, 'Medium'],
  ['Kanyakumari', 'Tamil Nadu', 8.0883, 77.5385, 'DESTINATION', 'Pilgrim,nature', 0.88, 2, 'Medium'], // Wait DESTINATION isn't mapped, default or PILGRIMAGE?
  ['Thanjavur', 'Tamil Nadu', 10.7870, 79.1378, 'HERITAGE', 'Pilgrim,culture', 0.85, 2, 'Medium'],
  ['Rameswaram', 'Tamil Nadu', 9.2876, 79.3129, 'PILGRIMAGE', 'beach,nature', 0.85, 2, 'Low'],
  ['Vellore', 'Tamil Nadu', 12.9165, 79.1325, 'CITY', 'history', 0.75, 2, 'Medium'],
  ['Yercaud', 'Tamil Nadu', 11.7753, 78.2093, 'HILL_STATION', 'nature', 0.8, 2, 'Low'],
  ['Coonoor', 'Tamil Nadu', 11.3530, 76.7959, 'HILL_STATION', 'nature,relax', 0.8, 2, 'Medium'],

  // Karnataka (14)
  ['Bengaluru', 'Karnataka', 12.9716, 77.5946, 'CITY', 'food,nightlife', 0.95, 3, 'Medium'],
  ['Mysuru', 'Karnataka', 12.2958, 76.6394, 'CITY', 'heritage,relax', 0.9, 2, 'Medium'],
  ['Mangaluru', 'Karnataka', 12.9141, 74.8560, 'CITY', 'beach,food', 0.85, 2, 'Medium'],
  ['Hubballi', 'Karnataka', 15.3647, 75.1240, 'CITY', '', 0.7, 2, 'Low'],
  ['Hampi', 'Karnataka', 15.3350, 76.4600, 'HERITAGE', 'history,adventure', 0.92, 3, 'Low'],
  ['Gokarna', 'Karnataka', 14.5447, 74.3168, 'BEACH', 'Pilgrim,party', 0.85, 3, 'Low'],
  ['Coorg', 'Karnataka', 12.3375, 75.8069, 'HILL_STATION', 'nature,relax', 0.9, 3, 'Medium'],
  ['Chikmagalur', 'Karnataka', 13.3161, 75.7720, 'HILL_STATION', 'nature', 0.85, 3, 'Medium'],
  ['Badami', 'Karnataka', 15.9189, 75.6791, 'HERITAGE', 'history', 0.75, 2, 'Low'],
  ['Bandipur', 'Karnataka', 11.6669, 76.6280, 'WILDLIFE', 'nature', 0.88, 2, 'Medium'],
  ['Nagarhole', 'Karnataka', 12.0163, 76.1601, 'WILDLIFE', 'nature', 0.85, 2, 'Medium'],
  ['Udupi', 'Karnataka', 13.3409, 74.7421, 'PILGRIMAGE', 'beach,food', 0.8, 2, 'Medium'],
  ['Dandeli', 'Karnataka', 15.2415, 74.6186, 'NATURE', 'adventure', 0.75, 2, 'Medium'],
  ['Murdeshwar', 'Karnataka', 14.0934, 74.4849, 'PILGRIMAGE', 'beach', 0.8, 2, 'Medium'],

  // Madhya Pradesh (12)
  ['Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, 'CITY', 'lake,history', 0.85, 2, 'Medium'],
  ['Indore', 'Madhya Pradesh', 22.7196, 75.8577, 'CITY', 'food,history', 0.9, 2, 'Medium'],
  ['Gwalior', 'Madhya Pradesh', 26.2183, 78.1828, 'CITY', 'history,heritage', 0.8, 2, 'Medium'],
  ['Jabalpur', 'Madhya Pradesh', 23.1815, 79.9864, 'CITY', 'nature', 0.75, 2, 'Medium'],
  ['Ujjain', 'Madhya Pradesh', 23.1765, 75.7885, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Khajuraho', 'Madhya Pradesh', 24.8318, 79.9197, 'HERITAGE', 'history,culture', 0.92, 2, 'Medium'],
  ['Kanha', 'Madhya Pradesh', 22.3345, 80.6115, 'WILDLIFE', 'nature', 0.95, 3, 'Medium'],
  ['Bandhavgarh', 'Madhya Pradesh', 23.7225, 81.0253, 'WILDLIFE', 'nature', 0.95, 3, 'Medium'],
  ['Pachmarhi', 'Madhya Pradesh', 22.4674, 78.4346, 'HILL_STATION', 'nature,relax', 0.85, 3, 'Medium'],
  ['Mandu', 'Madhya Pradesh', 22.3370, 75.3970, 'HERITAGE', 'history', 0.75, 2, 'Low'],
  ['Orchha', 'Madhya Pradesh', 25.3524, 78.6415, 'HERITAGE', 'history', 0.8, 2, 'Low'],
  ['Sanchi', 'Madhya Pradesh', 23.4870, 77.7397, 'HERITAGE', 'Pilgrim', 0.85, 1, 'Low'],
  
  // Uttar Pradesh (15)
  ['Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 'CITY', 'food,heritage', 0.9, 2, 'Medium'],
  ['Kanpur', 'Uttar Pradesh', 26.4499, 80.3319, 'CITY', 'history', 0.7, 2, 'Medium'],
  ['Agra', 'Uttar Pradesh', 27.1767, 78.0081, 'CITY', 'heritage,history', 0.98, 2, 'Medium'],
  ['Varanasi', 'Uttar Pradesh', 25.3176, 82.9739, 'PILGRIMAGE', 'history,culture', 0.98, 3, 'Low'],
  ['Allahabad', 'Uttar Pradesh', 25.4358, 81.8463, 'PILGRIMAGE', 'history', 0.85, 2, 'Low'],
  ['Mathura', 'Uttar Pradesh', 27.4924, 77.6737, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Vrindavan', 'Uttar Pradesh', 27.5650, 77.6593, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Ayodhya', 'Uttar Pradesh', 26.7922, 82.1998, 'PILGRIMAGE', 'history', 0.95, 2, 'Medium'],
  ['Sarnath', 'Uttar Pradesh', 25.3811, 83.0210, 'PILGRIMAGE', 'heritage,history', 0.85, 1, 'Low'],
  ['Fatehpur Sikri', 'Uttar Pradesh', 27.0917, 77.6611, 'HERITAGE', 'history', 0.85, 1, 'Low'],
  ['Jhansi', 'Uttar Pradesh', 25.4484, 78.5685, 'CITY', 'heritage,history', 0.7, 2, 'Low'],
  ['Dudhwa', 'Uttar Pradesh', 28.5134, 80.6483, 'WILDLIFE', 'nature', 0.75, 2, 'Medium'],
  ['Meerut', 'Uttar Pradesh', 28.9845, 77.7064, 'CITY', 'history', 0.65, 1, 'Low'],
  ['Gorakhpur', 'Uttar Pradesh', 26.7606, 83.3732, 'CITY', 'Pilgrim', 0.7, 2, 'Low'],
  ['Chitrakoot', 'Uttar Pradesh', 25.2155, 80.8931, 'PILGRIMAGE', 'nature', 0.75, 2, 'Low'],

  // Delhi (1)
  ['New Delhi', 'Delhi', 28.6139, 77.2090, 'CITY', 'history,food,luxury', 0.99, 4, 'High'],

  // Uttarakhand (15)
  ['Dehradun', 'Uttarakhand', 30.3165, 78.0322, 'CITY', 'nature', 0.85, 2, 'Medium'],
  ['Haridwar', 'Uttarakhand', 29.9457, 78.1642, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Rishikesh', 'Uttarakhand', 30.0869, 78.2676, 'PILGRIMAGE', 'adventure,relax', 0.95, 3, 'Low'],
  ['Nainital', 'Uttarakhand', 29.3919, 79.4542, 'HILL_STATION', 'nature,relax,family', 0.95, 3, 'Medium'],
  ['Mussoorie', 'Uttarakhand', 30.4598, 78.0664, 'HILL_STATION', 'nature,relax', 0.92, 3, 'Medium'],
  ['Jim Corbett', 'Uttarakhand', 29.5300, 78.7747, 'WILDLIFE', 'nature,adventure', 0.95, 3, 'High'],
  ['Auli', 'Uttarakhand', 30.5332, 79.5670, 'MOUNTAIN', 'adventure,nature', 0.88, 3, 'Medium'],
  ['Kedarnath', 'Uttarakhand', 30.7346, 79.0669, 'PILGRIMAGE', 'adventure,mountain', 0.9, 3, 'Low'],
  ['Badrinath', 'Uttarakhand', 30.7433, 79.4938, 'PILGRIMAGE', 'mountain', 0.9, 2, 'Low'],
  ['Almora', 'Uttarakhand', 29.5892, 79.6467, 'HILL_STATION', 'culture', 0.8, 2, 'Low'],
  ['Mukteshwar', 'Uttarakhand', 29.4727, 79.6466, 'HILL_STATION', 'nature,relax', 0.8, 2, 'Medium'],
  ['Lansdowne', 'Uttarakhand', 29.8377, 78.6871, 'HILL_STATION', 'relax,nature', 0.85, 2, 'Medium'],
  ['Kausani', 'Uttarakhand', 29.8447, 79.5996, 'HILL_STATION', 'nature,relax', 0.8, 2, 'Medium'],
  ['Valley of Flowers', 'Uttarakhand', 30.7280, 79.6053, 'NATIONAL_PARK', 'nature,adventure', 0.85, 3, 'Medium'],
  ['Chopta', 'Uttarakhand', 30.4850, 79.1764, 'MOUNTAIN', 'nature,adventure', 0.85, 3, 'Low'],

  // West Bengal (14)
  ['Kolkata', 'West Bengal', 22.5726, 88.3639, 'CITY', 'heritage,food,culture', 0.95, 3, 'Medium'],
  ['Darjeeling', 'West Bengal', 27.0360, 88.2627, 'HILL_STATION', 'nature,tea', 0.95, 3, 'Medium'],
  ['Siliguri', 'West Bengal', 26.7271, 88.3953, 'CITY', 'nature', 0.7, 2, 'Medium'],
  ['Digha', 'West Bengal', 21.6266, 87.5255, 'BEACH', 'relax,family', 0.85, 2, 'Low'],
  ['Sundarbans', 'West Bengal', 21.9497, 88.8475, 'WILDLIFE', 'nature,adventure', 0.9, 3, 'Medium'],
  ['Kalimpong', 'West Bengal', 27.0594, 88.4695, 'HILL_STATION', 'nature,relax', 0.8, 3, 'Medium'],
  ['Kurseong', 'West Bengal', 26.8837, 88.2778, 'HILL_STATION', 'nature', 0.75, 2, 'Low'],
  ['Shantiniketan', 'West Bengal', 23.6811, 87.6833, 'HERITAGE', 'culture,history', 0.85, 2, 'Medium'],
  ['Mandarmani', 'West Bengal', 21.6669, 87.6888, 'BEACH', 'relax', 0.8, 2, 'Medium'],
  ['Bishnupur', 'West Bengal', 23.0768, 87.3195, 'HERITAGE', 'history', 0.7, 2, 'Low'],
  ['Murshidabad', 'West Bengal', 24.1818, 88.2694, 'HERITAGE', 'history', 0.75, 2, 'Low'],
  ['Jayanti', 'West Bengal', 26.8373, 89.6056, 'NATURE', 'wildlife', 0.65, 2, 'Low'],
  ['Gorumara', 'West Bengal', 26.7441, 88.8105, 'WILDLIFE', 'nature', 0.7, 2, 'Medium'],
  ['Bakkhali', 'West Bengal', 21.5645, 88.2754, 'BEACH', 'nature', 0.7, 2, 'Low'],
];

const processed = rawIndia2.map((d) => {
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

fs.writeFileSync(path.join(__dirname, 'data', 'india_batch2.json'), JSON.stringify(processed, null, 2));

console.log("India batch 2 successfully generated.", processed.length);
