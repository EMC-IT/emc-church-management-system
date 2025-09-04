import apiClient from './api-client';
import { Giving, GivingFormData, GivingSearchParams, GivingAnalytics, GivingType, GivingCategory, GivingStatus } from '@/lib/types';

export interface GivingResponse {
  data: Giving;
  message?: string;
}

export interface GivingListResponse {
  data: Giving[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class GivingService {
  // Get all giving records for a member
  async getMemberGiving(memberId: string, params: GivingSearchParams = {}): Promise<GivingListResponse> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving records');
    }
  }

  // Get giving record by ID
  async getGiving(givingId: string): Promise<Giving> {
    try {
      const response = await apiClient.get(`/giving/${givingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving record');
    }
  }

  // Create new giving record
  async createGiving(memberId: string, givingData: GivingFormData): Promise<GivingResponse> {
    try {
      const response = await apiClient.post(`/members/${memberId}/giving`, givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create giving record');
    }
  }

  // Update giving record
  async updateGiving(givingId: string, givingData: Partial<GivingFormData>): Promise<GivingResponse> {
    try {
      const response = await apiClient.put(`/giving/${givingId}`, givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update giving record');
    }
  }

  // Delete giving record
  async deleteGiving(givingId: string): Promise<void> {
    try {
      await apiClient.delete(`/giving/${givingId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete giving record');
    }
  }

  // Bulk delete giving records
  async bulkDeleteGiving(givingIds: string[]): Promise<void> {
    try {
      await apiClient.post('/giving/bulk-delete', { givingIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete giving records');
    }
  }

  // Get giving analytics for a member
  async getMemberGivingAnalytics(memberId: string, params: GivingSearchParams = {}): Promise<GivingAnalytics> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/analytics`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving analytics');
    }
  }

  // Get giving statistics
  async getGivingStats(memberId?: string): Promise<{
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    byType: Record<GivingType, { amount: number; count: number }>;
    byCategory: Record<GivingCategory, { amount: number; count: number }>;
    byStatus: Record<GivingStatus, { amount: number; count: number }>;
    recentActivity: Giving[];
  }> {
    try {
      const url = memberId ? `/members/${memberId}/giving/stats` : '/giving/stats';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving statistics');
    }
  }

  // Search giving records
  async searchGiving(params: GivingSearchParams = {}): Promise<GivingListResponse> {
    try {
      const response = await apiClient.get('/giving/search', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search giving records');
    }
  }

  // Export giving records
  async exportGiving(memberId: string, params: GivingSearchParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/export`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export giving records');
    }
  }

  // Get giving types
  async getGivingTypes(): Promise<GivingType[]> {
    try {
      const response = await apiClient.get('/giving/types');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving types');
    }
  }

  // Get giving categories
  async getGivingCategories(): Promise<GivingCategory[]> {
    try {
      const response = await apiClient.get('/giving/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving categories');
    }
  }

  // Get giving campaigns
  async getGivingCampaigns(): Promise<string[]> {
    try {
      const response = await apiClient.get('/giving/campaigns');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving campaigns');
    }
  }

  // Generate receipt for giving
  async generateReceipt(givingId: string): Promise<{ receiptUrl: string; receiptNumber: string }> {
    try {
      const response = await apiClient.post(`/giving/${givingId}/receipt`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate receipt');
    }
  }

  // Send receipt via email
  async sendReceipt(givingId: string, email: string): Promise<void> {
    try {
      await apiClient.post(`/giving/${givingId}/receipt/send`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send receipt');
    }
  }

  // Get giving trends
  async getGivingTrends(memberId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    period: string;
    amount: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[]> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/trends`, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving trends');
    }
  }

  // Get giving goals and progress
  async getGivingGoals(memberId: string): Promise<{
    goal: number;
    current: number;
    progress: number;
    remaining: number;
    deadline: string;
  }> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/goals`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving goals');
    }
  }

  // Set giving goal
  async setGivingGoal(memberId: string, goal: number, deadline: string): Promise<void> {
    try {
      await apiClient.post(`/members/${memberId}/giving/goals`, { goal, deadline });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set giving goal');
    }
  }
}

export default new GivingService(); 