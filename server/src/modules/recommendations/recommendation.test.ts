import { recommendationService } from './recommendation.service';
import { featureEngineeringService } from './feature-engineering.service';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

describe('M7.4 Cosine Similarity Engine - Pure Mathematical Integrity', () => {

  describe('Phase 3: Core Cosine Similarity Engine', () => {

    it('Test 1 - IDENTICAL VECTORS: User and destination match exactly', () => {
      const u = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const sim = recommendationService.cosineSimilarity(u, d);
      expect(sim).toBe(1.0);
    });

    it('Test 2 - ORTHOGONAL VECTORS: No overlap', () => {
      const u = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d = [0,1,0,0,0,0,0,0,0,0,0,0,0,0];
      const sim = recommendationService.cosineSimilarity(u, d);
      expect(sim).toBe(0.0);
    });

    it('Test 3 - PARTIAL SIMILARITY: Mathematical verification', () => {
      const u = [1,1,0,0,0,0,0,0,0,0,0,0,0,0];   // norm = sqrt(2)
      const d = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];   // norm = 1
      const sim = recommendationService.cosineSimilarity(u, d);
      // dot = 1. sim = 1 / sqrt(2) ~= 0.7071
      expect(sim).toBeCloseTo(0.70710678, 5);
    });

    it('Test 4 - ZERO USER VECTOR: Return exactly 0, prevents NaN', () => {
      const u = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const sim = recommendationService.cosineSimilarity(u, d);
      expect(sim).toBe(0.0);
      expect(Number.isNaN(sim)).toBeFalsy();
    });

    it('Test 5 - ZERO DESTINATION VECTOR: Return exactly 0, prevents NaN', () => {
      const u = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const sim = recommendationService.cosineSimilarity(u, d);
      expect(sim).toBe(0.0);
      expect(Number.isNaN(sim)).toBeFalsy();
    });

    it('Test 6 - DETERMINISTIC EXECUTION: Returns identical output', () => {
      const u = [0.1, 0.5, 0.2, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0, 0.9];
      const d = [0.9, 0.1, 0.2, 0.4, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0];
      const sim1 = recommendationService.cosineSimilarity(u, d);
      const sim2 = recommendationService.cosineSimilarity(u, d);
      const sim3 = recommendationService.cosineSimilarity(u, d);
      expect(sim1).toEqual(sim2);
      expect(sim2).toEqual(sim3);
    });

    it('Test 6.5 - SAME DIRECTION DIFFERENT MAGNITUDE: Preserves exactly equivalent similarity constraints', () => {
      const u = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d1 = [1,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const d2 = [0.5,0,0,0,0,0,0,0,0,0,0,0,0,0];
      const sim1 = recommendationService.cosineSimilarity(u, d1);
      const sim2 = recommendationService.cosineSimilarity(u, d2);
      expect(sim1).toEqual(sim2);
      expect(sim1).toBe(1.0);
    });

  });

  describe('Phase 4: Sorting & Top-K behavior (Mocks)', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Test 7 & 8 & 9 - CORRECT SORTING & TIE-BREAKING & TOP-K LIMIT', async () => {
      // Mock feature engineering to just return a stable array for the test
      jest.spyOn(featureEngineeringService, 'engineerUserVector').mockReturnValue([1,0,0,0,0,0,0,0,0,0,0,0,0,0]);
      
      const mockedDestinations = [
        { _id: new mongoose.Types.ObjectId(), name: 'B Town', travelDNA: { Explorer: 0.5, Nature: 0.5 }, isActive: true },
        { _id: new mongoose.Types.ObjectId(), name: 'A City', travelDNA: { Explorer: 0.5, Nature: 0.5 }, isActive: true }, // Tie with B Town
        { _id: new mongoose.Types.ObjectId(), name: 'Z Village', travelDNA: { Explorer: 1.0, Nature: 0.0 }, isActive: true }, // Winner
        { _id: new mongoose.Types.ObjectId(), name: 'C Town', travelDNA: { Explorer: 0.1, Nature: 0.9 }, isActive: true } // Loser
      ];
      
      const { Destination } = require('../destinations/destination.model');
      jest.spyOn(Destination, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockedDestinations)
      } as any);

      // Extract Destination Vector mock
      jest.spyOn(featureEngineeringService, 'extractDestinationVector').mockImplementation((dest: any) => {
        return [dest.travelDNA.Explorer || 0, 0, 0, 0, dest.travelDNA.Nature || 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      });

      const { TravelProfile } = require('../travel-profile/travelProfile.model');
      jest.spyOn(TravelProfile, 'findOne').mockReturnValue({ lean: jest.fn().mockResolvedValue({}) } as any);
      
      const { Interaction } = require('../interactions/interaction.model');
      jest.spyOn(Interaction, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      } as any);

      const recommendations = await recommendationService.getRecommendations('mockUser', 3);
      
      // Top K = 3
      expect(recommendations.length).toBe(3);

      // Test 7: Sorting
      expect(recommendations[0].name).toBe('Z Village'); // 1.0 explorer (cos sim = 1)
      
      // Test 8: Tie-breaking (A City comes before B Town alphabetically, tied at 0.5)
      expect(recommendations[1].name).toBe('A City');
      expect(recommendations[2].name).toBe('B Town');

      // Test 12 implicitly tested here (Cold-start works, fallback to engineerUserVector)
    });
  });

  describe('Phase 10 & 13: API & Security Rejections', () => {

    const generateValidToken = () => jwt.sign({ id: new mongoose.Types.ObjectId().toHexString() }, process.env.JWT_SECRET || 'secret');

    it('Test 17 - MISSING AUTHENTICATION reject', async () => {
      const response = await request(app).get('/api/v1/recommendations/destinations');
      expect(response.status).toBe(401);
    });

    // We will bypass DB logic just to see if the Controller correctly blocks params
    it('Test 13 - k = 0 reject', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/destinations?k=0')
        .set('Authorization', `Bearer ${generateValidToken()}`);
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid top-k parameter requested');
    });

    it('Test 14 - negative k reject', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/destinations?k=-5')
        .set('Authorization', `Bearer ${generateValidToken()}`);
      expect(response.status).toBe(400);
    });

    it('Test 15 - decimal k reject', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/destinations?k=5.5')
        .set('Authorization', `Bearer ${generateValidToken()}`);
      expect(response.status).toBe(400);
    });

    it('Test 16 - k > 50 reject', async () => {
      const response = await request(app)
        .get('/api/v1/recommendations/destinations?k=51')
        .set('Authorization', `Bearer ${generateValidToken()}`);
      expect(response.status).toBe(400);
    });
  });

});
