import json

destinations_base = [
    # ASIA
    ("Kyoto", "Japan", "Asia", "Cultural and historical heart of Japan", 35.0116, 135.7681, ["Cultural", "Historical"], "High", 5, 0.9, 0.7,0.8,0.5,0.4,0.6,0.9,0.5,0.7,0.9,0.2,1.0,0.3,0.8,0.5),
    ("Tokyo", "Japan", "Asia", "Bustling neon-lit metropolis", 35.6762, 139.6503, ["City", "Shopping"], "High", 7, 0.98, 0.8,0.9,0.8,0.3,0.2,0.8,0.6,0.6,0.2,0.4,0.6,0.9,0.3,1.0),
    ("Bali", "Indonesia", "Asia", "Tropical paradise of beaches and temples", -8.4095, 115.1889, ["Beach", "Relaxation"], "Medium", 8, 0.95, 0.7,0.7,0.8,0.6,0.9,0.9,0.8,0.6,0.6,0.7,0.6,0.7,1.0,0.5),
    ("Bangkok", "Thailand", "Asia", "Vibrant street life and ornate shrines", 13.7563, 100.5018, ["City", "Nightlife"], "Low", 5, 0.92, 0.8,1.0,0.6,0.9,0.3,0.7,0.9,0.5,0.7,0.5,0.7,0.9,0.4,0.9),
    ("Chiang Mai", "Thailand", "Asia", "Mountainous city with rich history and temples", 18.7953, 98.9620, ["Mountain", "Cultural"], "Low", 4, 0.82, 0.8,0.8,0.4,0.9,0.8,0.7,0.9,0.6,0.8,0.7,0.8,0.4,0.8,0.5),
    ("Seoul", "South Korea", "Asia", "High-tech city of contrast with ancient palaces", 37.5665, 126.9780, ["City", "Cultural"], "Medium", 6, 0.88, 0.7,0.9,0.6,0.5,0.4,0.7,0.5,0.6,0.3,0.3,0.7,0.9,0.4,0.9),
    ("Hanoi", "Vietnam", "Asia", "Centuries-old architecture and rich culture with Southeast Asian, Chinese and French influences.", 21.0285, 105.8542, ["City", "Cultural"], "Low", 4, 0.85, 0.8,0.9,0.4,0.9,0.4,0.8,0.9,0.5,0.5,0.6,0.9,0.6,0.3,0.5),
    ("Phuket", "Thailand", "Asia", "Rainforests, mountains and some of popular beaches.", 7.8804, 98.3923, ["Beach", "Nightlife"], "Medium", 6, 0.9, 0.6,0.6,0.7,0.6,0.8,0.7,0.8,0.7,0.3,0.8,0.3,0.9,0.9,0.6),
    ("Singapore", "Singapore", "Asia", "Global financial center with tropical flora", 1.3521, 103.8198, ["City", "Luxury"], "High", 4, 0.9, 0.6,0.8,1.0,0.2,0.7,0.7,0.3,0.8,0.2,0.4,0.4,0.7,0.7,0.9),
    ("Hong Kong", "China", "Asia", "Vibrant, densely populated urban center", 22.3193, 114.1694, ["City", "Shopping"], "High", 5, 0.88, 0.7,0.9,0.9,0.3,0.5,0.8,0.4,0.6,0.3,0.5,0.5,0.8,0.4,1.0),
    ("Jaipur", "India", "Asia", "The Pink City, known for fascinating monuments and colorful markets.", 26.9124, 75.7873, ["Cultural", "Historical"], "Low", 3, 0.85, 0.7,0.7,0.6,0.8,0.3,0.9,0.7,0.6,0.7,0.4,0.9,0.2,0.5,0.8),
    ("Goa", "India", "Asia", "Beaches, nightlife, and spice plantations.", 15.2993, 74.1240, ["Beach", "Nightlife"], "Medium", 5, 0.91, 0.6,0.6,0.5,0.7,0.8,0.6,0.8,0.6,0.4,0.7,0.6,0.9,0.8,0.4),
    ("Agra", "India", "Asia", "Home to the iconic Taj Mahal.", 27.1767, 78.0081, ["Historical"], "Low", 2, 0.89, 0.6,0.5,0.4,0.8,0.2,1.0,0.7,0.5,0.6,0.2,1.0,0.1,0.3,0.5),
    ("New Delhi", "India", "Asia", "Bustling capital with deep historical roots.", 28.6139, 77.2090, ["City", "Cultural"], "Low", 4, 0.87, 0.8,0.8,0.6,0.8,0.3,0.7,0.7,0.6,0.7,0.3,1.0,0.6,0.3,0.7),
    ("Maldives", "Maldives", "Asia", "Luxury overwater bungalows and coral reefs.", 3.2028, 73.2207, ["Beach", "Luxury"], "Luxury", 6, 0.96, 0.4,0.5,1.0,0.1,0.9,0.8,0.2,0.8,0.2,0.8,0.1,0.3,1.0,0.2),

    # EUROPE
    ("Paris", "France", "Europe", "City of Light, famous for romance and art.", 48.8566, 2.3522, ["City", "Cultural"], "High", 6, 0.98, 0.8,0.9,0.9,0.3,0.4,0.8,0.4,0.6,0.3,0.3,0.9,0.7,0.6,0.9),
    ("Rome", "Italy", "Europe", "Capital of Italy, famous for history and cuisine.", 41.9028, 12.4964, ["Cultural", "Historical"], "High", 5, 0.96, 0.8,1.0,0.7,0.4,0.3,0.9,0.5,0.7,0.8,0.3,1.0,0.5,0.6,0.7),
    ("London", "UK", "Europe", "Historic and modern capital.", 51.5074, -0.1278, ["City", "Historical"], "High", 6, 0.95, 0.8,0.8,0.8,0.4,0.4,0.7,0.4,0.8,0.3,0.3,0.9,0.8,0.5,0.9),
    ("Barcelona", "Spain", "Europe", "Known for art, architecture and vibrant beach life.", 41.3851, 2.1734, ["City", "Beach"], "Medium", 5, 0.94, 0.7,0.8,0.6,0.5,0.6,0.8,0.6,0.6,0.4,0.4,0.8,0.9,0.7,0.7),
    ("Amsterdam", "Netherlands", "Europe", "Art, canals and museums.", 52.3676, 4.9041, ["City", "Cultural"], "High", 4, 0.90, 0.7,0.6,0.6,0.5,0.5,0.8,0.6,0.5,0.2,0.3,0.7,0.8,0.7,0.6),
    ("Prague", "Czechia", "Europe", "City of a Hundred Spires.", 50.0755, 14.4378, ["Cultural", "Historical"], "Medium", 4, 0.88, 0.7,0.7,0.5,0.6,0.4,0.9,0.7,0.5,0.4,0.3,0.9,0.7,0.6,0.5),
    ("Santorini", "Greece", "Europe", "Iconic blue domes and volcanic beaches.", 36.3932, 25.4615, ["Beach", "Romantic"], "Luxury", 5, 0.93, 0.5,0.7,0.9,0.2,0.8,1.0,0.3,0.6,0.3,0.6,0.6,0.6,0.9,0.5),
    ("Interlaken", "Switzerland", "Europe", "Traditional resort town in the Alps.", 46.6863, 7.8632, ["Mountain", "Adventure"], "High", 5, 0.87, 0.9,0.5,0.7,0.3,1.0,0.9,0.6,0.7,0.2,1.0,0.3,0.3,0.8,0.4),
    ("Reykjavik", "Iceland", "Europe", "Gateway to stunning geysers and waterfalls.", 64.1466, -21.9426, ["Nature", "Adventure"], "High", 5, 0.89, 0.9,0.6,0.7,0.2,1.0,0.9,0.7,0.5,0.2,0.9,0.4,0.5,0.7,0.3),
    ("Berlin", "Germany", "Europe", "Famous for history and legendary nightlife.", 52.5200, 13.4050, ["City", "Nightlife"], "Medium", 5, 0.89, 0.7,0.6,0.5,0.7,0.4,0.7,0.8,0.5,0.3,0.4,0.9,1.0,0.5,0.6),
    ("Venice", "Italy", "Europe", "City of Canals.", 45.4408, 12.3155, ["Romantic", "Historical"], "High", 3, 0.92, 0.6,0.7,0.8,0.3,0.3,1.0,0.4,0.6,0.4,0.2,0.9,0.4,0.6,0.7),
    ("Dubrovnik", "Croatia", "Europe", "Stunning medieval walled city on the sea.", 42.6507, 18.0944, ["Historical", "Beach"], "Medium", 4, 0.88, 0.6,0.7,0.7,0.5,0.7,0.9,0.5,0.6,0.4,0.5,0.9,0.5,0.7,0.5),

    # AMERICAS
    ("New York City", "USA", "North America", "The city that never sleeps.", 40.7128, -74.0060, ["City", "Shopping"], "High", 6, 0.97, 0.8,0.9,0.9,0.3,0.3,0.8,0.5,0.7,0.3,0.3,0.7,1.0,0.2,1.0),
    ("Las Vegas", "USA", "North America", "Desert oasis of casinos and entertainment.", 36.1699, -115.1398, ["Nightlife", "City"], "Medium", 4, 0.90, 0.5,0.8,0.9,0.4,0.4,0.6,0.4,0.4,0.1,0.6,0.2,1.0,0.5,0.7),
    ("San Francisco", "USA", "North America", "Golden Gate, tech, and rolling hills.", 37.7749, -122.4194, ["City", "Cultural"], "High", 5, 0.88, 0.7,0.8,0.8,0.3,0.6,0.8,0.5,0.6,0.2,0.4,0.6,0.6,0.5,0.6),
    ("Cancun", "Mexico", "North America", "Tropical beaches and lively resorts.", 21.1619, -86.8515, ["Beach", "Nightlife"], "Medium", 6, 0.91, 0.6,0.6,0.7,0.5,0.8,0.6,0.5,0.8,0.3,0.6,0.4,0.9,0.9,0.5),
    ("Rio de Janeiro", "Brazil", "South America", "Carnival, beaches, and Christ the Redeemer.", -22.9068, -43.1729, ["Beach", "Cultural"], "Medium", 6, 0.89, 0.8,0.7,0.6,0.6,0.8,0.8,0.6,0.5,0.5,0.7,0.6,0.9,0.6,0.5),
    ("Cusco", "Peru", "South America", "Gateway to Machu Picchu and Incan history.", -13.5226, -71.9673, ["Historical", "Mountain"], "Low", 5, 0.87, 0.9,0.6,0.4,0.8,0.8,0.9,0.9,0.4,0.8,0.9,1.0,0.3,0.4,0.5),
    ("Buenos Aires", "Argentina", "South America", "Tango, steak, and vibrant street life.", -34.6037, -58.3816, ["City", "Nightlife"], "Medium", 5, 0.86, 0.7,0.9,0.6,0.6,0.3,0.7,0.6,0.5,0.3,0.4,0.6,0.9,0.5,0.7),
    ("Banff", "Canada", "North America", "Glacial lakes and majestic Rocky Mountains.", 51.1784, -115.5708, ["Mountain", "Nature"], "High", 5, 0.88, 0.9,0.5,0.7,0.4,1.0,0.9,0.7,0.7,0.2,0.9,0.3,0.3,0.8,0.4),
    ("Hawaii (Maui)", "USA", "North America", "Volcanoes, beaches, and rich Polynesian culture.", 20.7984, -156.3319, ["Beach", "Nature"], "High", 7, 0.93, 0.8,0.7,0.8,0.3,1.0,0.9,0.5,0.8,0.3,0.8,0.4,0.4,1.0,0.5),
    ("Cartagena", "Colombia", "South America", "Colorful colonial charm by the sea.", 10.3910, -75.4794, ["City", "Historical"], "Low", 4, 0.85, 0.7,0.7,0.6,0.8,0.5,0.8,0.7,0.5,0.4,0.4,0.8,0.7,0.6,0.5),

    # AFRICA & MIDDLE EAST
    ("Cape Town", "South Africa", "Africa", "Table Mountain and amazing coastlines.", -33.9249, 18.4241, ["City", "Nature"], "Medium", 6, 0.90, 0.8,0.7,0.6,0.7,0.9,0.9,0.7,0.6,0.3,0.8,0.6,0.6,0.7,0.5),
    ("Marrakech", "Morocco", "Africa", "Bustling souks, palaces, and gardens.", 31.6295, -7.9811, ["Cultural", "Historical"], "Low", 4, 0.88, 0.8,0.8,0.5,0.8,0.4,0.9,0.7,0.5,0.5,0.6,0.8,0.4,0.5,0.9),
    ("Cairo", "Egypt", "Africa", "Pyramids and ancient Pharonic wonders.", 30.0444, 31.2357, ["Historical", "City"], "Low", 5, 0.91, 0.8,0.6,0.5,0.8,0.2,0.9,0.7,0.6,0.6,0.5,1.0,0.3,0.4,0.7),
    ("Dubai", "UAE", "Middle East", "Ultra-modern architecture and luxury shopping.", 25.2048, 55.2708, ["City", "Luxury"], "High", 5, 0.94, 0.5,0.7,1.0,0.2,0.3,0.7,0.2,0.7,0.3,0.6,0.3,0.8,0.7,1.0),
    ("Istanbul", "Turkey", "Middle East", "Where East meets West.", 41.0082, 28.9784, ["Cultural", "Historical"], "Medium", 5, 0.92, 0.8,0.9,0.6,0.7,0.5,0.9,0.7,0.6,0.7,0.4,0.9,0.6,0.5,0.8),
    ("Petra", "Jordan", "Middle East", "The famous Rose City carved into rock.", 30.3285, 35.4444, ["Historical", "Desert"], "Medium", 3, 0.87, 0.8,0.5,0.4,0.7,0.6,0.9,0.8,0.4,0.6,0.7,0.9,0.1,0.4,0.4),
    ("Mount Kilimanjaro", "Tanzania", "Africa", "Highest peak in Africa, epic trekking.", -3.0674, 37.3556, ["Mountain", "Adventure"], "High", 7, 0.85, 0.9,0.3,0.2,0.4,1.0,0.8,0.8,0.1,0.2,1.0,0.2,0.1,0.1,0.1),

    # OCEANIA
    ("Sydney", "Australia", "Oceania", "Iconic opera house and beautiful harbor.", -33.8688, 151.2093, ["City", "Beach"], "High", 6, 0.92, 0.7,0.8,0.8,0.4,0.7,0.8,0.5,0.7,0.3,0.7,0.5,0.7,0.7,0.7),
    ("Auckland", "New Zealand", "Oceania", "City of Sails surrounded by volcanoes.", -36.8485, 174.7633, ["City", "Nature"], "High", 5, 0.87, 0.8,0.7,0.7,0.4,0.8,0.8,0.6,0.6,0.2,0.8,0.4,0.6,0.7,0.6),
    ("Queenstown", "New Zealand", "Oceania", "Adventure capital of the world.", -45.0312, 168.6626, ["Mountain", "Adventure"], "High", 5, 0.89, 0.9,0.6,0.7,0.4,0.9,0.9,0.7,0.5,0.2,1.0,0.3,0.6,0.6,0.5),
    ("Bora Bora", "French Polynesia", "Oceania", "Ultimate luxury romantic getaway.", -16.5004, -151.7415, ["Beach", "Luxury"], "Luxury", 6, 0.94, 0.4,0.6,1.0,0.1,0.9,0.8,0.2,0.6,0.1,0.7,0.2,0.3,1.0,0.2),
    ("Fiji (Nadi)", "Fiji", "Oceania", "Tropical islands known for coral reefs.", -17.8000, 177.4167, ["Beach", "Relaxation"], "Medium", 7, 0.88, 0.6,0.5,0.6,0.6,0.9,0.7,0.5,0.8,0.2,0.6,0.3,0.4,0.9,0.4),
]

features = ["Explorer", "Foodie", "Luxury", "Budget", "Nature", "Photographer", "Backpacker", "Family", "Pilgrim", "Adventure", "HistoryLover", "Nightlife", "Relaxation", "Shopping"]

import os
os.makedirs('server/scripts/data', exist_ok=True)

destinations = []
for d in destinations_base:
    dest = {
        "name": d[0],
        "country": d[1],
        "region": d[2],
        "description": d[3],
        "location": {
            "type": "Point",
            "coordinates": [d[5], d[4]] # [lng, lat]
        },
        "destinationType": d[6],
        "budgetLevel": d[7],
        "averageTripDuration": d[8],
        "popularityScore": d[9],
        "isActive": True,
        "travelDNA": {}
    }
    
    # map explicitly to 14 dimensions
    for i, feature in enumerate(features):
        dest["travelDNA"][feature] = float(f"{d[i+10]:.2f}")
        
    destinations.append(dest)

with open('server/scripts/data/destinations.seed.json', 'w') as f:
    json.dump(destinations, f, indent=2)

print(f"Generated {len(destinations)} destinations.")
