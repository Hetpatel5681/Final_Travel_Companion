const fs = require('fs');
const path = require('path');

// 14 dimensions exactly
// "Explorer", "Foodie", "Luxury", "Budget", "Nature", "Photographer", "Backpacker", "Family", "Pilgrim", "Adventure", "HistoryLover", "Nightlife", "Relaxation", "Shopping"

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
  'WATERFALL':   { Explorer: 0.6, Foodie: 0.3, Luxury: 0.3, Budget: 0.8, Nature: 0.9, Photographer: 0.9, Backpacker: 0.7, Family: 0.8, Pilgrim: 0.1, Adventure: 0.5, HistoryLover: 0.1, Nightlife: 0.1, Relaxation: 0.8, Shopping: 0.1 },
  'DEFAULT':     { Explorer: 0.5, Foodie: 0.5, Luxury: 0.5, Budget: 0.5, Nature: 0.5, Photographer: 0.5, Backpacker: 0.5, Family: 0.5, Pilgrim: 0.5, Adventure: 0.5, HistoryLover: 0.5, Nightlife: 0.5, Relaxation: 0.5, Shopping: 0.5 }
};

function generateDNA(type, modifiers) {
  let dna = { ...(typeRules[type] || typeRules['DEFAULT']) };
  // Modifiers can shift scores
  if (modifiers.includes('luxury')) { dna.Luxury += 0.3; dna.Budget -= 0.3; }
  if (modifiers.includes('budget')) { dna.Budget += 0.3; dna.Luxury -= 0.3; }
  if (modifiers.includes('party')) { dna.Nightlife += 0.4; }
  if (modifiers.includes('relax')) { dna.Relaxation += 0.3; dna.Adventure -= 0.2;}
  if (modifiers.includes('history')) { dna.HistoryLover += 0.3; }
  if (modifiers.includes('food')) { dna.Foodie += 0.3; }
  
  // clamp
  for (let key in dna) {
    if (dna[key] > 1.0) dna[key] = 1.0;
    if (dna[key] < 0.0) dna[key] = 0.0;
    dna[key] = parseFloat(dna[key].toFixed(2));
  }
  return dna;
}

// Ensure unique by sluggifying name
function slugify(name, country) {
  return `${country.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

const indianData = [
  // Format: [Name, State, Lat, Lng, Type, TypeModifier, Pop, Duration, Budget]
  ['Mumbai', 'Maharashtra', 19.0760, 72.8777, 'CITY', 'party,food', 0.95, 4, 'High'],
  ['Pune', 'Maharashtra', 18.5204, 73.8567, 'CITY', 'history', 0.8, 3, 'Medium'],
  ['Nagpur', 'Maharashtra', 21.1458, 79.0882, 'CITY', 'food', 0.7, 3, 'Medium'],
  ['Nashik', 'Maharashtra', 19.9975, 73.7898, 'PILGRIMAGE', 'relax', 0.75, 2, 'Medium'],
  ['Aurangabad', 'Maharashtra', 19.8762, 75.3433, 'HERITAGE', 'history', 0.8, 3, 'Low'],
  ['Lonavala', 'Maharashtra', 18.7481, 73.4072, 'HILL_STATION', 'relax,nature', 0.85, 2, 'Medium'],
  ['Mahabaleshwar', 'Maharashtra', 17.9307, 73.6477, 'HILL_STATION', 'nature,relax', 0.82, 3, 'Medium'],
  ['Shirdi', 'Maharashtra', 19.7667, 74.4767, 'PILGRIMAGE', '', 0.9, 2, 'Low'],
  ['Kolhapur', 'Maharashtra', 16.7050, 74.2433, 'PILGRIMAGE', 'food', 0.7, 2, 'Low'],
  ['Ajanta Caves', 'Maharashtra', 20.5519, 75.7033, 'HERITAGE', 'history', 0.85, 1, 'Low'],
  ['Ellora Caves', 'Maharashtra', 20.0258, 75.1780, 'HERITAGE', 'history', 0.85, 1, 'Low'],
  ['Tadoba Andhari', 'Maharashtra', 20.2520, 79.2882, 'WILDLIFE', '', 0.75, 3, 'Medium'],
  ['Panchgani', 'Maharashtra', 17.9221, 73.8051, 'HILL_STATION', 'relax', 0.78, 2, 'Medium'],
  ['Alibaug', 'Maharashtra', 18.6416, 72.8770, 'BEACH', 'relax', 0.8, 2, 'Medium'],
  ['Matheran', 'Maharashtra', 18.9863, 73.2662, 'HILL_STATION', 'nature', 0.75, 2, 'Low'],
  ['Khandala', 'Maharashtra', 18.7550, 73.3762, 'HILL_STATION', 'nature', 0.7, 2, 'Low'],
  
  // Gujarat
  ['Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'CITY', 'heritage,food', 0.85, 3, 'Medium'],
  ['Surat', 'Gujarat', 21.1702, 72.8311, 'CITY', 'food,shopping', 0.78, 2, 'Medium'],
  ['Vadodara', 'Gujarat', 22.3072, 73.1812, 'CITY', 'heritage', 0.75, 2, 'Medium'],
  ['Rajkot', 'Gujarat', 22.3039, 70.8022, 'CITY', 'food', 0.7, 2, 'Low'],
  ['Bhavnagar', 'Gujarat', 21.7645, 72.1519, 'CITY', 'history', 0.65, 2, 'Low'],
  ['Jamnagar', 'Gujarat', 22.4707, 70.0577, 'CITY', 'history,nature', 0.68, 2, 'Low'],
  ['Kutch', 'Gujarat', 23.7337, 69.8597, 'DESERT', 'culture,nature', 0.88, 4, 'Medium'],
  ['Gir National Park', 'Gujarat', 21.1243, 70.8242, 'WILDLIFE', '', 0.9, 3, 'Medium'],
  ['Somnath', 'Gujarat', 20.8880, 70.4012, 'PILGRIMAGE', 'history', 0.92, 2, 'Low'],
  ['Dwarka', 'Gujarat', 22.2442, 68.9685, 'PILGRIMAGE', 'history', 0.9, 2, 'Low'],
  ['Statue of Unity', 'Gujarat', 21.8380, 73.7191, 'HERITAGE', '', 0.95, 2, 'High'],
  ['Champaner', 'Gujarat', 22.4842, 73.5350, 'HERITAGE', 'history', 0.75, 1, 'Low'],
  ['Rani ki Vav (Patan)', 'Gujarat', 23.8381, 72.1017, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Modhera Sun Temple', 'Gujarat', 23.5833, 72.1333, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  ['Saputara', 'Gujarat', 20.5794, 73.7547, 'HILL_STATION', 'nature', 0.75, 2, 'Low'],
  ['Dholavira', 'Gujarat', 23.8828, 70.2117, 'HERITAGE', 'history', 0.8, 2, 'Low'],
  
  // Goa (We will cover Goa efficiently)
  ['North Goa', 'Goa', 15.4975, 73.8278, 'BEACH', 'party,relax', 0.95, 5, 'High'],
  ['South Goa', 'Goa', 15.2750, 73.9556, 'BEACH', 'relax,luxury', 0.92, 5, 'Luxury'],
  ['Panaji', 'Goa', 15.4909, 73.8278, 'CITY', 'heritage,food', 0.85, 3, 'Medium'],
  ['Dudhsagar Falls', 'Goa', 15.3144, 74.3143, 'WATERFALL', 'nature,adventure', 0.8, 1, 'Low'],
  ['Old Goa', 'Goa', 15.5030, 73.9113, 'HERITAGE', 'history', 0.8, 1, 'Low'],
  
  // Dadra and Nagar Haveli and Daman and Diu
  ['Daman', 'Dadra & Nagar Haveli and Daman & Diu', 20.3974, 72.8328, 'BEACH', 'history', 0.75, 2, 'Low'],
  ['Diu', 'Dadra & Nagar Haveli and Daman & Diu', 20.7144, 70.9874, 'BEACH', 'history,relax', 0.78, 3, 'Medium'],
  ['Silvassa', 'Dadra & Nagar Haveli and Daman & Diu', 20.2736, 73.0135, 'NATURE', 'relax', 0.7, 2, 'Low'],

  // ... (Full script written in next call due to sheer length)
];

console.log("Pre-loaded partial list.");
