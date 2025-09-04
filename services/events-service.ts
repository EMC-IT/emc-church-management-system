import apiClient from './api-client';
import { Event } from '@/lib/types';

export interface EventsResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  maxAttendees?: number;
  image?: File;
  isRecurring?: boolean;
  recurrencePattern?: string;
  endDate?: string;
}

export interface EventAttendee {
  id: string;
  memberId: string;
  memberName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  registeredAt: string;
  attendedAt?: string;
}

export interface EventRegistration {
  eventId: string;
  memberId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface EventAttendance {
  eventId: string;
  memberId: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  notes?: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  organizer?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class EventsService {
  // ===== EVENTS =====

  // Get all events with pagination and filters
  async getEvents(params: SearchParams = {}): Promise<EventsResponse<{
    data: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const response = await apiClient.get('/events', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch events',
      };
    }
  }

  // Get event by ID
  async getEvent(id: string): Promise<EventsResponse<Event>> {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event',
      };
    }
  }

  // Create new event
  async createEvent(eventData: EventFormData): Promise<EventsResponse<Event>> {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'image') {
          formData.append(key, value.toString());
        }
      });

      // Append image if provided
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      const response = await apiClient.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Event created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create event',
      };
    }
  }

  // Update event
  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<EventsResponse<Event>> {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'image') {
          formData.append(key, value.toString());
        }
      });

      // Append image if provided
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      const response = await apiClient.put(`/events/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Event updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update event',
      };
    }
  }

  // Delete event
  async deleteEvent(id: string): Promise<EventsResponse<void>> {
    try {
      await apiClient.delete(`/events/${id}`);
      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete event',
      };
    }
  }

  // Bulk delete events
  async bulkDeleteEvents(ids: string[]): Promise<EventsResponse<void>> {
    try {
      await apiClient.post('/events/bulk-delete', { ids });
      return {
        success: true,
        message: 'Events deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete events',
      };
    }
  }

  // ===== EVENT REGISTRATION =====

  // Get event attendees
  async getEventAttendees(eventId: string): Promise<EventsResponse<EventAttendee[]>> {
    try {
      const response = await apiClient.get(`/events/${eventId}/attendees`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event attendees',
      };
    }
  }

  // Register for event
  async registerForEvent(registration: EventRegistration): Promise<EventsResponse<EventAttendee>> {
    try {
      const response = await apiClient.post(`/events/${registration.eventId}/register`, {
        memberId: registration.memberId,
        status: registration.status,
        notes: registration.notes,
      });
      return {
        success: true,
        data: response.data,
        message: 'Registration successful',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to register for event',
      };
    }
  }

  // Update registration status
  async updateRegistration(eventId: string, memberId: string, status: string): Promise<EventsResponse<EventAttendee>> {
    try {
      const response = await apiClient.put(`/events/${eventId}/register/${memberId}`, {
        status,
      });
      return {
        success: true,
        data: response.data,
        message: 'Registration updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update registration',
      };
    }
  }

  // Cancel registration
  async cancelRegistration(eventId: string, memberId: string): Promise<EventsResponse<void>> {
    try {
      await apiClient.delete(`/events/${eventId}/register/${memberId}`);
      return {
        success: true,
        message: 'Registration cancelled successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel registration',
      };
    }
  }

  // ===== EVENT ATTENDANCE =====

  // Get event attendance
  async getEventAttendance(eventId: string): Promise<EventsResponse<EventAttendance[]>> {
    try {
      const response = await apiClient.get(`/events/${eventId}/attendance`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event attendance',
      };
    }
  }

  // Mark attendance
  async markAttendance(attendance: EventAttendance): Promise<EventsResponse<EventAttendance>> {
    try {
      const response = await apiClient.post(`/events/${attendance.eventId}/attendance`, {
        memberId: attendance.memberId,
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        notes: attendance.notes,
      });
      return {
        success: true,
        data: response.data,
        message: 'Attendance marked successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark attendance',
      };
    }
  }

  // Bulk mark attendance
  async bulkMarkAttendance(eventId: string, attendances: Omit<EventAttendance, 'eventId'>[]): Promise<EventsResponse<void>> {
    try {
      await apiClient.post(`/events/${eventId}/attendance/bulk`, {
        attendances,
      });
      return {
        success: true,
        message: 'Attendance marked successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark attendance',
      };
    }
  }

  // Update attendance
  async updateAttendance(eventId: string, memberId: string, attendance: Partial<EventAttendance>): Promise<EventsResponse<EventAttendance>> {
    try {
      const response = await apiClient.put(`/events/${eventId}/attendance/${memberId}`, attendance);
      return {
        success: true,
        data: response.data,
        message: 'Attendance updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update attendance',
      };
    }
  }

  // ===== REPORTS =====

  // Get event statistics
  async getEventStats(startDate?: string, endDate?: string): Promise<EventsResponse<{
    totalEvents: number;
    upcomingEvents: number;
    completedEvents: number;
    totalAttendees: number;
    averageAttendance: number;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      attendees: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      events: number;
      attendees: number;
    }>;
  }>> {
    try {
      const params = startDate && endDate ? { startDate, endDate } : {};
      const response = await apiClient.get('/events/stats', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event statistics',
      };
    }
  }

  // Export events to CSV/Excel
  async exportEvents(params: SearchParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/events/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export events');
    }
  }

  // Export event attendance
  async exportEventAttendance(eventId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/events/${eventId}/attendance/export`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export event attendance');
    }
  }

  // Get upcoming events
  async getUpcomingEvents(limit: number = 10): Promise<EventsResponse<Event[]>> {
    try {
      const response = await apiClient.get('/events/upcoming', {
        params: { limit },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch upcoming events',
      };
    }
  }

  // Get events by category
  async getEventsByCategory(category: string, params: SearchParams = {}): Promise<EventsResponse<{
    data: Event[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    try {
      const response = await apiClient.get(`/events/category/${category}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch events by category',
      };
    }
  }
}

export default new EventsService(); 