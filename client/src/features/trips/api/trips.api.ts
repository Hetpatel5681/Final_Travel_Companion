import { apiClient } from '@/api/axios';
import { CreateTripDto, UpdateTripDto, TripFilters, TripsResponse, SingleTripResponse } from '../types/trips.types';

export const createTrip = async (data: CreateTripDto): Promise<SingleTripResponse> => {
  const response = await apiClient.post('/trips', data);
  return response.data;
};

export const getTrips = async (filters?: TripFilters): Promise<TripsResponse> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  const response = await apiClient.get(`/trips?${params.toString()}`);
  return response.data;
};

export const getTripById = async (id: string): Promise<SingleTripResponse> => {
  const response = await apiClient.get(`/trips/${id}`);
  return response.data;
};

export const updateTrip = async (id: string, data: UpdateTripDto): Promise<SingleTripResponse> => {
  const response = await apiClient.put(`/trips/${id}`, data);
  return response.data;
};

export const deleteTrip = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/trips/${id}`);
  return response.data;
};

export const updateTripCoordinates = async (id: string, latitude: number, longitude: number): Promise<SingleTripResponse> => {
  const response = await apiClient.patch(`/trips/${id}/coordinates`, { latitude, longitude });
  return response.data;
};

export const generateItineraryForTrip = async (id: string, data: any): Promise<SingleTripResponse> => {
  const response = await apiClient.post(`/trips/${id}/generate`, data);
  return response.data;
};

export const generateNewItinerary = async (data: any): Promise<SingleTripResponse> => {
  const response = await apiClient.post(`/trips/generate`, data);
  return response.data;
};
