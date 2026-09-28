import { IDestination } from '../destinations/destination.types';
import { CANONICAL_DIMENSIONS } from './feature-engineering.service';

export interface ExplanationResult {
  primaryReason: string;
  supportingReasons: string[];
}

/**
 * Extracts a mathematically safe, read-only explanation without modifying any existing recommendation scoring logic.
 */
export function generateExplanation(
  userVector: number[], 
  destinationVector: number[],
  destination: IDestination
): ExplanationResult {
   let maxIndex = -1;
   let maxValue = -1;
   
   // 1. Identify the strongest contributing dimension
   for (let i = 0; i < 14; i++) {
      const uVal = typeof userVector[i] === 'number' && !isNaN(userVector[i]) ? userVector[i] : 0;
      const dVal = typeof destinationVector[i] === 'number' && !isNaN(destinationVector[i]) ? destinationVector[i] : 0;
      const product = uVal * dVal;
      
      if (product > maxValue && product > 0) {
         maxValue = product;
         maxIndex = i;
      }
   }
   
   let primaryReason = "Matches your travel preferences";
   
   // 2. Classify strictly based on spatial product ranges mapping to [0, 1] bounds.
   if (maxIndex !== -1 && maxIndex < CANONICAL_DIMENSIONS.length && maxValue > 0) {
      const dimName = CANONICAL_DIMENSIONS[maxIndex];
      // Product >= 0.64 (implies ~0.8 x 0.8) -> Strong
      if (maxValue >= 0.64) {
         primaryReason = `Strong ${dimName} match`;
      } 
      // Product >= 0.36 (implies ~0.6 x 0.6) -> Moderate
      else if (maxValue >= 0.36) {
         primaryReason = `Moderate ${dimName} match`;
      } 
      // Product > 0 -> Generic alignment
      else {
         primaryReason = `${dimName} preference alignment`;
      }
   }
   
   // 3. Assemble metadata dynamically
   const supportingReasons: string[] = [];
   
   if (destination.destinationType && Array.isArray(destination.destinationType) && destination.destinationType.length > 0) {
      const firstType = destination.destinationType[0]; 
      if (firstType) {
         // Transform "HILL_STATION" to "Hill station" properly mapped
         const typeStr = firstType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
         supportingReasons.push(`${typeStr} destination`);
      }
   }
   
   if (destination.state) {
      supportingReasons.push(`${destination.state} destination`);
   } else if (destination.country) {
      supportingReasons.push(`${destination.country} destination`);
   }
   
   return {
     primaryReason,
     supportingReasons: supportingReasons.slice(0, 2)
   };
}
