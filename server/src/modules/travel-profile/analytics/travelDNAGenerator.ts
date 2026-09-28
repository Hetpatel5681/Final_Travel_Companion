export class TravelDNAGenerator {
  static generate(
    activityStats: Map<string, number>, 
    destTypes: string[], 
    tripTypes: string[]
  ): Map<string, number> {
    const rawScores = new Map<string, number>();
    const typesStr = destTypes.join(' ').toLowerCase() + ' ' + tripTypes.join(' ').toLowerCase();

    // Base scoring logic weighting by categories explicitly
    let totalScore = 0;

    const addScore = (trait: string, amount: number) => {
      if (amount <= 0) return;
      rawScores.set(trait, (rawScores.get(trait) || 0) + amount);
      totalScore += amount;
    };

    // Parse Historical Activities Activity Stats
    activityStats.forEach((count, category) => {
      const cat = category.toLowerCase();
      if (cat.includes('museum') || cat.includes('heritage')) addScore('History Lover', count * 3);
      if (cat.includes('restaurant') || cat.includes('cafe')) addScore('Foodie', count * 2);
      if (cat.includes('adventure')) addScore('Adventure', count * 4);
      if (cat.includes('shopping')) addScore('Shopping', count * 3);
      if (cat.includes('sightseeing')) addScore('Explorer', count * 2);
      if (cat.includes('beach')) addScore('Relaxation', count * 3);
      if (cat.includes('nature') || cat.includes('wildlife')) addScore('Nature', count * 4);
      if (cat.includes('temple') || cat.includes('church')) addScore('Pilgrim', count * 3);
    });

    // Parse String Text Vectors (Destinations/Types)
    if (typesStr.includes('luxury')) addScore('Luxury', 10);
    if (typesStr.includes('budget') || typesStr.includes('backpacker')) addScore('Backpacker', 10);
    if (typesStr.includes('family')) addScore('Family', 10);
    if (typesStr.includes('nature') || typesStr.includes('mountain') || typesStr.includes('safari')) addScore('Nature', 8);

    // Normalize into out-of-100 Percentages
    const normalized = new Map<string, number>();
    if (totalScore === 0) {
      // Default placeholder initialization
      normalized.set('Explorer', 25);
      normalized.set('Relaxation', 75);
      return normalized;
    }

    rawScores.forEach((score, key) => {
      normalized.set(key, Math.round((score / totalScore) * 100));
    });

    return normalized;
  }
}
