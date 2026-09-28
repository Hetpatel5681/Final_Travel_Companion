import { apiClient } from '../../../api/axios';

export interface Recommendation {
  destinationId: string;
  name: string;
  country: string;
  state?: string;
  region: string;
  description: string;
  destinationType: string[];
  similarityScore: number;
  explanation?: {
    primaryReason: string;
    supportingReasons: string[];
  };
}

interface RecommendationResponse {
  success: boolean;
  count: number;
  data: Recommendation[];
}

export const getRecommendations = async (k: number = 5): Promise<Recommendation[]> => {
  const response = await apiClient.get<RecommendationResponse>(`/recommendations/destinations?k=${k}`);
  return response.data.data;
};
