export class SeasonDetector {
  static getSeason(date: Date, country?: string): string {
    const month = date.getMonth();
    
    // Very basic Northern Hemisphere rules, could be expanded using coordinates later
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  }
}
