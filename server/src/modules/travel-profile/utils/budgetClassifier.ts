export class BudgetClassifier {
  static classify(totalBudget: number, totalDays: number, totalTravelers: number): { range: string, personality: string } {
    if (!totalBudget || !totalDays || !totalTravelers) {
       return { range: 'Unknown', personality: 'Unknown' };
    }
    
    // Per person per day logic (assuming INR standard currency for the rules)
    const perPersonPerDay = totalBudget / (totalTravelers * totalDays);
    
    if (perPersonPerDay < 2000) {
      return { range: 'Low', personality: 'Budget Traveler' };
    } else if (perPersonPerDay < 7000) {
      return { range: 'Medium', personality: 'Comfort Traveler' };
    } else if (perPersonPerDay < 20000) {
      return { range: 'High', personality: 'Luxury Traveler' };
    } else {
      return { range: 'Luxury', personality: 'Luxury Traveler' };
    }
  }
}
