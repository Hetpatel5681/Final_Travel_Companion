import { generateExplanation } from './recommendation.explanation';
import { IDestination } from '../destinations/destination.types';

describe('M7.8 Explanation Helper', () => {
    
    // Stub mock destination
    const mockDest: IDestination = {
        name: 'Test Destination',
        description: 'Test',
        destinationType: ['ADVENTURE'],
        country: 'India',
        state: 'Himachal Pradesh'
    } as any;

    it('Test 1 — Explorer dominant', () => {
        // userVector and destVector with Explorer at index 0
        const userVector = Object.assign(Array(14).fill(0), { 0: 1.0 });
        const destVector = Object.assign(Array(14).fill(0), { 0: 1.0 });

        const result = generateExplanation(userVector as number[], destVector as number[], mockDest);
        expect(result.primaryReason).toBe('Strong Explorer match');
        expect(result.supportingReasons).toContain('Adventure destination');
        expect(result.supportingReasons).toContain('Himachal Pradesh destination');
    });

    it('Test 2 — Nature dominant', () => {
        // Nature is index 4
        const userVector = Object.assign(Array(14).fill(0), { 4: 1.0 });
        const destVector = Object.assign(Array(14).fill(0), { 4: 1.0 });

        const result = generateExplanation(userVector as number[], destVector as number[], mockDest);
        expect(result.primaryReason).toBe('Strong Nature match');
    });

    it('Test 3 — Adventure dominant', () => {
        // Adventure is index 9
        const userVector = Object.assign(Array(14).fill(0), { 9: 1.0 });
        const destVector = Object.assign(Array(14).fill(0), { 9: 1.0 });

        const result = generateExplanation(userVector as number[], destVector as number[], mockDest);
        expect(result.primaryReason).toBe('Strong Adventure match');
    });

    it('Test 4 — Zero vector (No crash)', () => {
        const userVector = Array(14).fill(0);
        const destVector = Array(14).fill(0);

        const result = generateExplanation(userVector, destVector, mockDest);
        expect(result.primaryReason).toBe('Matches your travel preferences');
    });

    it('Test 5 — Tie (Deterministic output)', () => {
        // Tie between Explorer (0) and Nature (4)
        const userVector = Object.assign(Array(14).fill(0), { 0: 1.0, 4: 1.0 });
        const destVector = Object.assign(Array(14).fill(0), { 0: 1.0, 4: 1.0 });

        const result = generateExplanation(userVector as number[], destVector as number[], mockDest);
        // It strictly favors the first match in loop
        expect(result.primaryReason).toBe('Strong Explorer match');
    });

    it('Test 6 — Missing values', () => {
        const userVector: any[] = []; // Empty
        const destVector: any[] = [undefined, NaN]; 

        const result = generateExplanation(userVector, destVector, mockDest);
        expect(result.primaryReason).toBe('Matches your travel preferences');
    });
});
