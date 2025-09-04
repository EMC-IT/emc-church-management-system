import apiClient from './api-client';
import { Document, DocumentFormData, DocumentSearchParams, DocumentUploadResponse, DocumentCategory } from '@/lib/types';

export interface DocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentResponse {
  data: Document;
  message?: string;
}

class DocumentsService {
  // Get all documents for a member
  async getMemberDocuments(memberId: string, params: DocumentSearchParams = {}): Promise<DocumentsResponse> {
    try {
      const response = await apiClient.get(`/members/${memberId}/documents`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  }

  // Get document by ID
  async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch document');
    }
  }

  // Upload document for a member
  async uploadDocument(memberId: string, documentData: FormData): Promise<DocumentUploadResponse> {
    try {
      const response = await apiClient.post(`/members/${memberId}/documents`, documentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }

  // Update document
  async updateDocument(documentId: string, documentData: Partial<DocumentFormData>): Promise<DocumentResponse> {
    try {
      const response = await apiClient.put(`/documents/${documentId}`, documentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update document');
    }
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiClient.delete(`/documents/${documentId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  }

  // Bulk delete documents
  async bulkDeleteDocuments(documentIds: string[]): Promise<void> {
    try {
      await apiClient.post('/documents/bulk-delete', { documentIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete documents');
    }
  }

  // Download document
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download document');
    }
  }

  // Get document preview URL
  async getDocumentPreviewUrl(documentId: string): Promise<{ previewUrl: string }> {
    try {
      const response = await apiClient.get(`/documents/${documentId}/preview`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get document preview');
    }
  }

  // Search documents across all members
  async searchDocuments(params: DocumentSearchParams = {}): Promise<DocumentsResponse> {
    try {
      const response = await apiClient.get('/documents/search', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search documents');
    }
  }

  // Get document categories
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    try {
      const response = await apiClient.get('/documents/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch document categories');
    }
  }

  // Get document statistics
  async getDocumentStats(memberId?: string): Promise<{
    total: number;
    byCategory: Record<DocumentCategory, number>;
    totalSize: number;
    recentUploads: number;
  }> {
    try {
      const url = memberId ? `/members/${memberId}/documents/stats` : '/documents/stats';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch document statistics');
    }
  }

  // Export documents
  async exportDocuments(memberId: string, params: DocumentSearchParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get(`/members/${memberId}/documents/export`, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export documents');
    }
  }

  // Share document
  async shareDocument(documentId: string, shareData: {
    email?: string;
    permission: 'view' | 'download' | 'edit';
    expiresAt?: string;
  }): Promise<{ shareUrl: string; shareId: string }> {
    try {
      const response = await apiClient.post(`/documents/${documentId}/share`, shareData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to share document');
    }
  }

  // Get shared documents
  async getSharedDocuments(): Promise<Document[]> {
    try {
      const response = await apiClient.get('/documents/shared');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shared documents');
    }
  }

  // Update document tags
  async updateDocumentTags(documentId: string, tags: string[]): Promise<DocumentResponse> {
    try {
      const response = await apiClient.patch(`/documents/${documentId}/tags`, { tags });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update document tags');
    }
  }

  // Get document tags
  async getDocumentTags(): Promise<string[]> {
    try {
      const response = await apiClient.get('/documents/tags');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch document tags');
    }
  }
}

export default new DocumentsService(); 