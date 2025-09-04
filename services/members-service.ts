import apiClient from './api-client';
import { Member, MemberFormData, Department } from '@/lib/types';

export interface MembersResponse {
  data: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MemberResponse {
  data: Member;
  message?: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  gender?: string;
  ageGroup?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class MembersService {
  // Get all members with pagination and filters
  async getMembers(params: SearchParams = {}): Promise<MembersResponse> {
    try {
      const response = await apiClient.get('/members', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch members');
    }
  }

  // Get member by ID
  async getMember(id: string): Promise<Member> {
    try {
      const response = await apiClient.get(`/members/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member');
    }
  }

  // Create new member
  async createMember(memberData: MemberFormData): Promise<MemberResponse> {
    try {
      const response = await apiClient.post('/members', memberData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create member');
    }
  }

  // Update member
  async updateMember(id: string, memberData: Partial<MemberFormData>): Promise<MemberResponse> {
    try {
      const response = await apiClient.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update member');
    }
  }

  // Delete member
  async deleteMember(id: string): Promise<void> {
    try {
      await apiClient.delete(`/members/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete member');
    }
  }

  // Bulk delete members
  async bulkDeleteMembers(ids: string[]): Promise<void> {
    try {
      await apiClient.post('/members/bulk-delete', { ids });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete members');
    }
  }

  // Upload member photo
  async uploadPhoto(id: string, file: File): Promise<{ photoUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClient.post(`/members/${id}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload photo');
    }
  }

  // Get member family
  async getMemberFamily(id: string): Promise<Member[]> {
    try {
      const response = await apiClient.get(`/members/${id}/family`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch family members');
    }
  }

  // Create new family member (creates a new member and adds to family)
  async addFamilyMember(memberId: string, familyMemberData: FormData): Promise<MemberResponse> {
    try {
      const response = await apiClient.post(`/members/${memberId}/family`, familyMemberData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add family member');
    }
  }

  // Add existing member to family (links existing member to family)
  async linkFamilyMember(memberId: string, familyMemberId: string, relationship: string): Promise<void> {
    try {
      await apiClient.post(`/members/${memberId}/family/link`, {
        familyMemberId,
        relationship,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to link family member');
    }
  }

  // Remove family member
  async removeFamilyMember(memberId: string, familyMemberId: string): Promise<void> {
    try {
      await apiClient.delete(`/members/${memberId}/family/${familyMemberId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove family member');
    }
  }

  // Get member activity history
  async getMemberHistory(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/members/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member history');
    }
  }

  // Import members from CSV/Excel
  async importMembers(file: File): Promise<{ success: number; errors: any[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/members/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to import members');
    }
  }

  // Export members to CSV/Excel
  async exportMembers(params: SearchParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/members/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export members');
    }
  }

  // Get member statistics
  async getMemberStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    genderDistribution: { male: number; female: number };
    ageDistribution: { [key: string]: number };
  }> {
    try {
      const response = await apiClient.get('/members/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch member statistics');
    }
  }

  // Search members
  async searchMembers(query: string): Promise<Member[]> {
    try {
      const response = await apiClient.get('/members/search', {
        params: { q: query },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search members');
    }
  }
}

// ===== DEPARTMENTS =====
export async function getDepartments(): Promise<Department[]> {
  // TODO: Replace with real API call
  return [];
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  // TODO: Replace with real API call
  return null;
}

export async function createDepartment(data: Partial<Department>): Promise<Department> {
  // TODO: Replace with real API call
  return {
    id: 'new',
    name: data.name || '',
    description: data.description || '',
    leader: data.leader || '',
    members: data.members || [],
    departmentType: data.departmentType,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
  // TODO: Replace with real API call
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    leader: data.leader || '',
    members: data.members || [],
    departmentType: data.departmentType,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteDepartment(id: string): Promise<void> {
  // TODO: Replace with real API call
  return;
}

export default new MembersService(); 