import { apiClient } from '../../../api/axios';

export interface UserProfileUpdate {
  fullName?: string;
  profilePicture?: string;
}

export const getProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data.data;
};

export const updateProfile = async (data: UserProfileUpdate) => {
  const response = await apiClient.put('/users/profile', data);
  return response.data.data;
};
