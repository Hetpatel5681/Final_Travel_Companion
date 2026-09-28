import { apiClient } from '@/api/axios';

export interface IExpense {
  _id: string;
  tripId: string;
  userId: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export const expensesApi = {
  createExpense: async (expenseData: Partial<IExpense>) => {
    const response = await apiClient.post('/expenses', expenseData);
    return response.data.data || response.data;
  },

  getTripExpenses: async (tripId: string) => {
    const response = await apiClient.get(`/expenses/trip/${tripId}`);
    return response.data.data || [];
  },

  updateExpense: async (expenseId: string, expenseData: Partial<IExpense>) => {
    const response = await apiClient.put(`/expenses/${expenseId}`, expenseData);
    return response.data.data || response.data;
  },

  deleteExpense: async (expenseId: string) => {
    const response = await apiClient.delete(`/expenses/${expenseId}`);
    return response.data.data || response.data;
  },

  getExpenseSummary: async (tripId: string) => {
    const response = await apiClient.get(`/expenses/summary/${tripId}`);
    return response.data.data || { totalSpent: 0 };
  },

  getCategoryBreakdown: async (tripId: string) => {
    const response = await apiClient.get(`/expenses/categories/${tripId}`);
    return response.data.data || [];
  },

  getDailyExpenseAnalytics: async (tripId: string) => {
    const response = await apiClient.get(`/expenses/daily/${tripId}`);
    return response.data.data || [];
  }
};
