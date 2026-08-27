import apiClient from '../api-client';
import {
  Giving,
  GivingFormData,
  GivingSearchParams,
  GivingAnalytics,
  GivingType,
  GivingCategory,
  GivingStatus,
  GivingSource,
  Pledge,
  PledgeFormData,
  PledgePayment,
  PledgePaymentFormData,
  FundraisingCampaign,
  FundraisingCampaignFormData,
} from '@/lib/types';

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

export interface PledgeListResponse {
  data: Pledge[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignListResponse {
  data: FundraisingCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GivingService {
  // ─── GIVING RECORDS ───────────────────────────────────────────────────────

  async getMemberGiving(memberId: string, params: GivingSearchParams = {}): Promise<GivingListResponse> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving records');
    }
  }

  async getGiving(givingId: string): Promise<Giving> {
    try {
      const response = await apiClient.get(`/giving/${givingId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving record');
    }
  }

  // Search giving records. Pass excludeBreakdowns: true in all aggregate/stat contexts
  // to prevent congregational identified-contribution sub-records from being double-counted.
  async searchGiving(params: GivingSearchParams = {}): Promise<GivingListResponse> {
    try {
      const response = await apiClient.get('/giving/search', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search giving records');
    }
  }

  // Create an individual giving record (memberId required unless isAnonymous)
  async createIndividualGiving(givingData: GivingFormData): Promise<GivingResponse> {
    try {
      const response = await apiClient.post('/giving/individual', givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create giving record');
    }
  }

  // Create a congregational giving record with optional identified contribution breakdowns.
  // Breakdown records are stored with parentGivingId set — they never count toward totals independently.
  async createCongregatinalGiving(givingData: GivingFormData): Promise<GivingResponse> {
    try {
      const response = await apiClient.post('/giving/congregational', givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create congregational giving record');
    }
  }

  // Legacy: create giving scoped to a member
  async createGiving(memberId: string, givingData: GivingFormData): Promise<GivingResponse> {
    try {
      const response = await apiClient.post(`/members/${memberId}/giving`, givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create giving record');
    }
  }

  async createMemberGiving(memberId: string, givingData: any): Promise<{ success: boolean; data?: Giving; message?: string }> {
    try {
      const response = await apiClient.post(`/members/${memberId}/giving`, givingData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to create giving record' };
    }
  }

  async updateGiving(givingId: string, givingData: Partial<GivingFormData>): Promise<GivingResponse> {
    try {
      const response = await apiClient.put(`/giving/${givingId}`, givingData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update giving record');
    }
  }

  async deleteGiving(givingId: string): Promise<void> {
    try {
      await apiClient.delete(`/giving/${givingId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete giving record');
    }
  }

  async bulkDeleteGiving(givingIds: string[]): Promise<void> {
    try {
      await apiClient.post('/giving/bulk-delete', { givingIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete giving records');
    }
  }

  // Stats always exclude breakdown records (parentGivingId set) to prevent double-counting
  async getGivingStats(memberId?: string): Promise<{
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    activePledgesCount: number;
    byType: Record<GivingType, { amount: number; count: number }>;
    byCategory: Record<GivingCategory, { amount: number; count: number }>;
    bySource: Record<GivingSource, { amount: number; count: number }>;
    byStatus: Record<GivingStatus, { amount: number; count: number }>;
    recentActivity: Giving[];
  }> {
    try {
      const url = memberId ? `/members/${memberId}/giving/stats` : '/giving/stats';
      const response = await apiClient.get(url, { params: { excludeBreakdowns: true } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving statistics');
    }
  }

  async getMemberGivingAnalytics(memberId: string, params: GivingSearchParams = {}): Promise<GivingAnalytics> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/analytics`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving analytics');
    }
  }

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

  async generateReceipt(givingId: string): Promise<{ receiptUrl: string; receiptNumber: string }> {
    try {
      const response = await apiClient.post(`/giving/${givingId}/receipt`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate receipt');
    }
  }

  async sendReceipt(givingId: string, email: string): Promise<void> {
    try {
      await apiClient.post(`/giving/${givingId}/receipt/send`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send receipt');
    }
  }

  async getGivingTypes(): Promise<GivingType[]> {
    try {
      const response = await apiClient.get('/giving/types');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving types');
    }
  }

  async getGivingCategories(): Promise<GivingCategory[]> {
    try {
      const response = await apiClient.get('/giving/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving categories');
    }
  }

  async getGivingTrends(memberId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<{
    period: string;
    amount: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[]> {
    try {
      const response = await apiClient.get(`/members/${memberId}/giving/trends`, { params: { period } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch giving trends');
    }
  }

  // ─── PLEDGES ─────────────────────────────────────────────────────────────
  // Pledges represent commitments to give. Their pledgedAmount is NEVER included
  // in Total Giving. Only PledgePayments (actual received money) count toward giving totals.

  async getPledges(params: { memberId?: string; campaignId?: string; status?: string; page?: number; limit?: number } = {}): Promise<PledgeListResponse> {
    try {
      const response = await apiClient.get('/giving/pledges', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pledges');
    }
  }

  async getPledge(pledgeId: string): Promise<Pledge> {
    try {
      const response = await apiClient.get(`/giving/pledges/${pledgeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pledge');
    }
  }

  async createPledge(pledgeData: PledgeFormData): Promise<{ data: Pledge; message?: string }> {
    try {
      const response = await apiClient.post('/giving/pledges', pledgeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create pledge');
    }
  }

  async updatePledge(pledgeId: string, pledgeData: Partial<PledgeFormData>): Promise<{ data: Pledge; message?: string }> {
    try {
      const response = await apiClient.put(`/giving/pledges/${pledgeId}`, pledgeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update pledge');
    }
  }

  async deletePledge(pledgeId: string): Promise<void> {
    try {
      await apiClient.delete(`/giving/pledges/${pledgeId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete pledge');
    }
  }

  // Record a payment against a pledge. This creates both a PledgePayment record
  // and a Giving record that counts toward actual giving totals.
  async recordPledgePayment(paymentData: PledgePaymentFormData): Promise<{ data: PledgePayment; message?: string }> {
    try {
      const response = await apiClient.post(`/giving/pledges/${paymentData.pledgeId}/payments`, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to record pledge payment');
    }
  }

  // ─── FUNDRAISING CAMPAIGNS ────────────────────────────────────────────────

  async getCampaigns(params: { status?: string; page?: number; limit?: number } = {}): Promise<CampaignListResponse> {
    try {
      const response = await apiClient.get('/giving/campaigns', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  }

  async getCampaign(campaignId: string): Promise<FundraisingCampaign> {
    try {
      const response = await apiClient.get(`/giving/campaigns/${campaignId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign');
    }
  }

  async createCampaign(campaignData: FundraisingCampaignFormData): Promise<{ data: FundraisingCampaign; message?: string }> {
    try {
      const response = await apiClient.post('/giving/campaigns', campaignData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create campaign');
    }
  }

  async updateCampaign(campaignId: string, campaignData: Partial<FundraisingCampaignFormData>): Promise<{ data: FundraisingCampaign; message?: string }> {
    try {
      const response = await apiClient.put(`/giving/campaigns/${campaignId}`, campaignData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update campaign');
    }
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    try {
      await apiClient.delete(`/giving/campaigns/${campaignId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete campaign');
    }
  }
}

export const givingService = new GivingService();
export default givingService;
