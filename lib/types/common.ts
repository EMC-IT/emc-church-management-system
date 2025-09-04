// ============================================================================
// COMMON/SHARED TYPES
// ============================================================================

import React from 'react';

// ===== COMMON API TYPES =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== FORM TYPES =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
}

// ===== UI TYPES =====

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
  isCurrentPage?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: MenuItem[];
  permission?: string;
  badge?: string | number;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  searchable?: boolean;
  filters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'text';
    options?: Array<{ value: string; label: string }>;
  }>;
}

// ===== CHART TYPES =====

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'doughnut';
  data: ChartDataPoint[];
  height?: number;
  width?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastConfig {
  position?: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration?: number;
  maxToasts?: number;
}

// ===== EXPORT TYPES =====

export interface ExportConfig {
  format: 'csv' | 'pdf' | 'excel';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  columns?: string[];
}

export interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// ===== UTILITY TYPES =====

export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type EventStatus = 'active' | 'cancelled' | 'completed';

// ===== DOCUMENT TYPES =====

export interface Document {
  id: string;
  memberId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export enum DocumentCategory {
  IDENTIFICATION = 'identification',
  BAPTISM = 'baptism',
  CONFIRMATION = 'confirmation',
  MARRIAGE = 'marriage',
  MEDICAL = 'medical',
  LEGAL = 'legal',
  FINANCIAL = 'financial',
  EDUCATION = 'education',
  EMPLOYMENT = 'employment',
  OTHER = 'other',
}

export interface DocumentFormData {
  title: string;
  description?: string;
  category: DocumentCategory;
  file: File;
  isPublic: boolean;
  tags?: string[];
}

export interface DocumentUploadResponse {
  success: boolean;
  document: Document;
  message?: string;
}

export interface DocumentSearchParams extends SearchParams {
  category?: DocumentCategory;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  isPublic?: boolean;
  tags?: string[];
}

// ===== LEGACY TYPES =====

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  attendees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SundaySchoolClass {
  id: string;
  name: string;
  ageGroup: string;
  teacher: string;
  schedule: string;
  room: string;
  students: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequest {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'New' | 'In Progress' | 'Answered' | 'Closed';
  isConfidential: boolean;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}