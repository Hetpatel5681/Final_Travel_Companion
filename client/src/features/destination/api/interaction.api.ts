import { apiClient } from '../../../api/axios';

export type InteractionType = 'SEARCH' | 'VIEW' | 'SAVE' | 'LIKE' | 'DISLIKE' | 'BOOK' | 'SKIP' | 'UNSAVE';

export const recordInteraction = async (
  destinationId: string,
  interactionType: InteractionType,
  source: string = 'destination_card'
) => {
  const response = await apiClient.post('/interactions', {
    destinationId,
    interactionType,
    source
  });
  return response.data;
};

export interface UserInteraction {
  destinationId: string | { _id: string, [key: string]: any };
  interactionType: InteractionType;
  timestamp?: string;
  source?: string;
}

export const getUserInteractions = async (): Promise<UserInteraction[]> => {
  const response = await apiClient.get('/interactions/me');
  return response.data.data;
};
