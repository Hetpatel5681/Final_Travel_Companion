import { apiClient } from '../../../api/axios';
import { IItineraryDay, CreateDayRequest, UpdateDayRequest, CreateActivityRequest, UpdateActivityRequest, IActivity, ReorderRequest } from '../types/itinerary.types';

export const itineraryApi = {
  // Days
  getItinerary: async (tripId: string): Promise<IItineraryDay[]> => {
    const response = await apiClient.get(`/itinerary/trips/${tripId}`);
    return response.data.data;
  },

  createDay: async (tripId: string, data: CreateDayRequest): Promise<IItineraryDay> => {
    const response = await apiClient.post(`/itinerary/trips/${tripId}/days`, data);
    return response.data.data;
  },

  updateDay: async (dayId: string, data: UpdateDayRequest): Promise<IItineraryDay> => {
    const response = await apiClient.put(`/itinerary/days/${dayId}`, data);
    return response.data.data;
  },

  reorderActivities: async (dayId: string, request: ReorderRequest): Promise<void> => {
    await apiClient.patch(`/itinerary/days/${dayId}/reorder`, request);
  },

  previewDayOptimization: async (dayId: string): Promise<any> => {
    const response = await apiClient.post(`/itinerary/days/${dayId}/optimize/preview`);
    return response.data.data;
  },

  getDayRouteSegments: async (dayId: string, activityIds: string[]): Promise<any> => {
    const response = await apiClient.post(`/itinerary/days/${dayId}/route`, { activityIds });
    return response.data;
  },

  applyDayOptimization: async (dayId: string, optimizedActivityIds: string[]): Promise<void> => {
    await apiClient.post(`/itinerary/days/${dayId}/optimize/apply`, { optimizedActivityIds });
  },

  // Activities
  createActivity: async (dayId: string, data: CreateActivityRequest): Promise<IActivity> => {
    const response = await apiClient.post(`/itinerary/days/${dayId}/activities`, data);
    return response.data.data;
  },

  updateActivity: async (activityId: string, data: UpdateActivityRequest): Promise<IActivity> => {
    const response = await apiClient.put(`/itinerary/activities/${activityId}`, data);
    return response.data.data;
  },

  toggleActivityStatus: async (activityId: string, status: string): Promise<IActivity> => {
    const response = await apiClient.patch(`/itinerary/activities/${activityId}/status`, { status });
    return response.data.data;
  },

  deleteActivity: async (activityId: string): Promise<void> => {
    await apiClient.delete(`/itinerary/activities/${activityId}`);
  }
};
