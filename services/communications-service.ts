import apiClient from './api-client';

export interface CommunicationsResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface SMSMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  phoneNumber: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface EmailMessage {
  id: string;
  recipientId: string;
  recipientName: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'reminder';
  targetAudience: 'all' | 'members' | 'leaders' | 'youth' | 'adults';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email';
  subject?: string;
  content: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  memberCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SMSFormData {
  recipientIds: string[];
  message: string;
  templateId?: string;
  scheduledAt?: string;
}

export interface EmailFormData {
  recipientIds: string[];
  subject: string;
  message: string;
  templateId?: string;
  scheduledAt?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'event' | 'reminder';
  targetAudience: 'all' | 'members' | 'leaders' | 'youth' | 'adults';
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  recipientId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CommunicationsService {
  // ===== SMS MESSAGES =====

  // Get all SMS messages with pagination and filters
  async getSMSMessages(params: SearchParams = {}): Promise<CommunicationsResponse<{
    data: SMSMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const response = await apiClient.get('/communications/sms', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch SMS messages',
      };
    }
  }

  // Send SMS message
  async sendSMS(smsData: SMSFormData): Promise<CommunicationsResponse<SMSMessage>> {
    try {
      const response = await apiClient.post('/communications/sms', smsData);
      return {
        success: true,
        data: response.data,
        message: 'SMS sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send SMS',
      };
    }
  }

  // Get SMS message by ID
  async getSMSMessage(id: string): Promise<CommunicationsResponse<SMSMessage>> {
    try {
      const response = await apiClient.get(`/communications/sms/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch SMS message',
      };
    }
  }

  // ===== EMAIL MESSAGES =====

  // Get all email messages with pagination and filters
  async getEmailMessages(params: SearchParams = {}): Promise<CommunicationsResponse<{
    data: EmailMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const response = await apiClient.get('/communications/emails', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch email messages',
      };
    }
  }

  // Send email message
  async sendEmail(emailData: EmailFormData): Promise<CommunicationsResponse<EmailMessage>> {
    try {
      const response = await apiClient.post('/communications/emails', emailData);
      return {
        success: true,
        data: response.data,
        message: 'Email sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send email',
      };
    }
  }

  // Get email message by ID
  async getEmailMessage(id: string): Promise<CommunicationsResponse<EmailMessage>> {
    try {
      const response = await apiClient.get(`/communications/emails/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch email message',
      };
    }
  }

  // ===== ANNOUNCEMENTS =====

  // Get all announcements with pagination and filters
  async getAnnouncements(params: SearchParams = {}): Promise<CommunicationsResponse<{
    data: Announcement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const response = await apiClient.get('/communications/announcements', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch announcements',
      };
    }
  }

  // Get announcement by ID
  async getAnnouncement(id: string): Promise<CommunicationsResponse<Announcement>> {
    try {
      const response = await apiClient.get(`/communications/announcements/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch announcement',
      };
    }
  }

  // Create new announcement
  async createAnnouncement(announcementData: AnnouncementFormData): Promise<CommunicationsResponse<Announcement>> {
    try {
      const response = await apiClient.post('/communications/announcements', announcementData);
      return {
        success: true,
        data: response.data,
        message: 'Announcement created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create announcement',
      };
    }
  }

  // Update announcement
  async updateAnnouncement(id: string, announcementData: Partial<AnnouncementFormData>): Promise<CommunicationsResponse<Announcement>> {
    try {
      const response = await apiClient.put(`/communications/announcements/${id}`, announcementData);
      return {
        success: true,
        data: response.data,
        message: 'Announcement updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update announcement',
      };
    }
  }

  // Delete announcement
  async deleteAnnouncement(id: string): Promise<CommunicationsResponse<void>> {
    try {
      await apiClient.delete(`/communications/announcements/${id}`);
      return {
        success: true,
        message: 'Announcement deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete announcement',
      };
    }
  }

  // Publish announcement
  async publishAnnouncement(id: string): Promise<CommunicationsResponse<Announcement>> {
    try {
      const response = await apiClient.put(`/communications/announcements/${id}/publish`);
      return {
        success: true,
        data: response.data,
        message: 'Announcement published successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to publish announcement',
      };
    }
  }

  // Archive announcement
  async archiveAnnouncement(id: string): Promise<CommunicationsResponse<Announcement>> {
    try {
      const response = await apiClient.put(`/communications/announcements/${id}/archive`);
      return {
        success: true,
        data: response.data,
        message: 'Announcement archived successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to archive announcement',
      };
    }
  }

  // ===== TEMPLATES =====

  // Get all communication templates
  async getTemplates(type?: 'sms' | 'email'): Promise<CommunicationsResponse<CommunicationTemplate[]>> {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.get('/communications/templates', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch templates',
      };
    }
  }

  // Get template by ID
  async getTemplate(id: string): Promise<CommunicationsResponse<CommunicationTemplate>> {
    try {
      const response = await apiClient.get(`/communications/templates/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch template',
      };
    }
  }

  // Create new template
  async createTemplate(templateData: Partial<CommunicationTemplate>): Promise<CommunicationsResponse<CommunicationTemplate>> {
    try {
      const response = await apiClient.post('/communications/templates', templateData);
      return {
        success: true,
        data: response.data,
        message: 'Template created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create template',
      };
    }
  }

  // Update template
  async updateTemplate(id: string, templateData: Partial<CommunicationTemplate>): Promise<CommunicationsResponse<CommunicationTemplate>> {
    try {
      const response = await apiClient.put(`/communications/templates/${id}`, templateData);
      return {
        success: true,
        data: response.data,
        message: 'Template updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update template',
      };
    }
  }

  // Delete template
  async deleteTemplate(id: string): Promise<CommunicationsResponse<void>> {
    try {
      await apiClient.delete(`/communications/templates/${id}`);
      return {
        success: true,
        message: 'Template deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete template',
      };
    }
  }

  // ===== CONTACT GROUPS =====

  // Get all contact groups
  async getContactGroups(): Promise<CommunicationsResponse<ContactGroup[]>> {
    try {
      const response = await apiClient.get('/communications/groups');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch contact groups',
      };
    }
  }

  // Get contact group by ID
  async getContactGroup(id: string): Promise<CommunicationsResponse<ContactGroup>> {
    try {
      const response = await apiClient.get(`/communications/groups/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch contact group',
      };
    }
  }

  // Create new contact group
  async createContactGroup(groupData: Partial<ContactGroup>): Promise<CommunicationsResponse<ContactGroup>> {
    try {
      const response = await apiClient.post('/communications/groups', groupData);
      return {
        success: true,
        data: response.data,
        message: 'Contact group created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create contact group',
      };
    }
  }

  // Update contact group
  async updateContactGroup(id: string, groupData: Partial<ContactGroup>): Promise<CommunicationsResponse<ContactGroup>> {
    try {
      const response = await apiClient.put(`/communications/groups/${id}`, groupData);
      return {
        success: true,
        data: response.data,
        message: 'Contact group updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update contact group',
      };
    }
  }

  // Delete contact group
  async deleteContactGroup(id: string): Promise<CommunicationsResponse<void>> {
    try {
      await apiClient.delete(`/communications/groups/${id}`);
      return {
        success: true,
        message: 'Contact group deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete contact group',
      };
    }
  }

  // ===== REPORTS =====

  // Get communication statistics
  async getCommunicationStats(startDate?: string, endDate?: string): Promise<CommunicationsResponse<{
    totalSMS: number;
    sentSMS: number;
    failedSMS: number;
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
    totalAnnouncements: number;
    publishedAnnouncements: number;
    monthlyTrends: Array<{
      month: string;
      sms: number;
      emails: number;
      announcements: number;
    }>;
  }>> {
    try {
      const params = startDate && endDate ? { startDate, endDate } : {};
      const response = await apiClient.get('/communications/stats', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch communication statistics',
      };
    }
  }

  // Export communication history
  async exportCommunicationHistory(params: SearchParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/communications/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export communication history');
    }
  }

  // Get active announcements
  async getActiveAnnouncements(): Promise<CommunicationsResponse<Announcement[]>> {
    try {
      const response = await apiClient.get('/communications/announcements/active');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch active announcements',
      };
    }
  }
}

export default new CommunicationsService(); 