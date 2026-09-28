import { UserInteraction } from './features/destination/api/interaction.api';

// Reusing the exact logic from our components to test chronological iteration
function getSavedState(interactions: any[]) {
    const savedIds = new Set<string>();
    
    // Simulate our fix: reverse before iterating
    [...interactions].reverse().forEach(int => {
        const id = int.destinationId;
        if (int.interactionType === 'SAVE') savedIds.add(id);
        if (int.interactionType === 'UNSAVE') savedIds.delete(id);
    });

    return savedIds.has('dest_1');
}

// Same chronological approach used in SavedTrips.tsx
function getSavedTripsLogicState(interactions: any[]) {
    const savedDestMap = new Map<string, any>();
    
    [...interactions].reverse().forEach(record => {
      const destId = record.destinationId;
      if (record.interactionType === 'SAVE') {
        savedDestMap.set(destId, { destinationId: destId });
      } else if (record.interactionType === 'UNSAVE') {
        savedDestMap.delete(destId);
      }
    });

    return savedDestMap.has('dest_1');
}

function runTests() {
    console.log("--- Recommendation Save/Unsave Fix Logic Tests ---");

    // Test Case 1: Save → Refresh → Saved
    // Backend returns newest first, so [SAVE]
    const tc1 = [{ interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 1 (Save):", getSavedState(tc1) ? "PASS" : "FAIL");

    // Test Case 2: Unsave → Refresh → Unsaved
    // Backend returns [UNSAVE, SAVE] (newest first)
    const tc2 = [{ interactionType: 'UNSAVE', destinationId: 'dest_1' }, { interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 2 (Save -> Unsave):", getSavedState(tc2) === false ? "PASS" : "FAIL");

    // Test Case 3: Save → Open Details → Return to Dashboard → Refresh
    // Backend returns [VIEW, SAVE]
    const tc3 = [{ interactionType: 'VIEW', destinationId: 'dest_1' }, { interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 3 (Save -> View):", getSavedState(tc3) ? "PASS" : "FAIL", " | SavedTrips logic:", getSavedTripsLogicState(tc3) ? "PASS" : "FAIL" );

    // Test Case 4: Save → View destination → Like destination → Refresh
    // Backend returns [LIKE, VIEW, SAVE]
    const tc4 = [{ interactionType: 'LIKE', destinationId: 'dest_1' }, { interactionType: 'VIEW', destinationId: 'dest_1' }, { interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 4 (Save -> View -> Like):", getSavedState(tc4) ? "PASS" : "FAIL", " | SavedTrips logic:", getSavedTripsLogicState(tc4) ? "PASS" : "FAIL" );

    // Test Case 5: Save → Unsave → Save → Refresh
    // Backend returns [SAVE, UNSAVE, SAVE]
    const tc5 = [{ interactionType: 'SAVE', destinationId: 'dest_1' }, { interactionType: 'UNSAVE', destinationId: 'dest_1' }, { interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 5 (Save -> Unsave -> Save):", getSavedState(tc5) ? "PASS" : "FAIL");

    // Test Case 6: Save → Unsave → Refresh
    // Backend returns [UNSAVE, SAVE] -> This is essentially the same as TC2
    const tc6 = [{ interactionType: 'UNSAVE', destinationId: 'dest_1' }, { interactionType: 'SAVE', destinationId: 'dest_1' }];
    console.log("Test Case 6 (Save -> Unsave -> Refresh):", getSavedState(tc6) === false ? "PASS" : "FAIL");
}

runTests();
