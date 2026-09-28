export class DestinationClassifier {
  static getDestinationTypes(city?: string, country?: string): string[] {
    const text = (`${city || ''} ${country || ''}`).toLowerCase();
    const categories: string[] = [];

    // Simple mocked ML rule-set
    if (text.match(/goa|maldives|bali|beach|coast|island/)) categories.push('Beach', 'Island');
    if (text.match(/swiss|alps|himalaya|mountain|hill/)) categories.push('Mountain', 'Hill Station');
    if (text.match(/paris|london|new york|tokyo|city/)) categories.push('City');
    if (text.match(/temple|varanasi|mecca|vatican|religious/)) categories.push('Religious');
    if (text.match(/safari|wildlife|kenya|amazon/)) categories.push('Wildlife');
    if (text.match(/rome|athens|egypt|heritage/)) categories.push('Heritage');
    if (text.match(/dubai|monaco|luxury/)) categories.push('Luxury');
    if (text.match(/desert|sahara/)) categories.push('Desert');
    
    if (categories.length === 0) categories.push('City'); // Fallback
    
    return [...new Set(categories)]; // Unique
  }
}
