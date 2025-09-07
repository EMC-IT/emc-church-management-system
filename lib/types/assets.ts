// ============================================================================
// ASSETS MODULE TYPES
// ============================================================================

// Currency type (imported from finance for consistency)
export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP';
export type Amount = number; // Always in smallest currency unit (pesewas for GHS)

// Asset Category Types
export enum AssetCategory {
  EQUIPMENT = 'equipment',
  FURNITURE = 'furniture',
  TECHNOLOGY = 'technology',
  VEHICLES = 'vehicles',
  PROPERTY = 'property',
  MUSICAL_INSTRUMENTS = 'musical_instruments',
  AUDIO_VISUAL = 'audio_visual',
  KITCHEN_APPLIANCES = 'kitchen_appliances',
  OFFICE_SUPPLIES = 'office_supplies',
  BOOKS_MEDIA = 'books_media',
  SPORTS_RECREATION = 'sports_recreation',
  SAFETY_SECURITY = 'safety_security',
  OTHER = 'other',
}

// Asset Status Types
export enum AssetStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  DISPOSED = 'disposed',
  LOST = 'lost',
  DAMAGED = 'damaged',
  RESERVED = 'reserved',
}

// Asset Condition Types
export enum AssetCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  NEEDS_REPAIR = 'needs_repair',
}

// Asset Priority Types
export enum AssetPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Maintenance Types
export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection',
  CALIBRATION = 'calibration',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

// Assignment Types
export enum AssignmentType {
  DEPARTMENT = 'department',
  GROUP = 'group',
  PERSON = 'person',
  LOCATION = 'location',
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  TRANSFERRED = 'transferred',
  LOST = 'lost',
}

// Main Asset Interface
export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  condition: AssetCondition;
  priority: AssetPriority;
  
  // Financial Information
  purchasePrice: Amount;
  currentValue: Amount;
  depreciationRate?: number; // Annual depreciation rate as percentage
  currency: Currency;
  
  // Location and Assignment
  location: string;
  assignedTo?: string; // Person ID or name
  assignedDepartment?: string;
  assignedGroup?: string;
  
  // Dates
  purchaseDate: string; // ISO date string
  warrantyExpiry?: string; // ISO date string
  lastMaintenance?: string; // ISO date string
  nextMaintenance?: string; // ISO date string
  
  // Documentation
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  photos?: string[]; // Array of photo URLs
  documents?: string[]; // Array of document URLs
  
  // Additional Information
  notes?: string;
  tags?: string[];
  barcode?: string;
  qrCode?: string;
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Maintenance Interface
export interface AssetMaintenance {
  id: string;
  assetId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: AssetPriority;
  
  title: string;
  description: string;
  
  // Scheduling
  scheduledDate: string; // ISO date string
  completedDate?: string; // ISO date string
  estimatedDuration?: number; // Duration in hours
  actualDuration?: number; // Duration in hours
  
  // Personnel
  assignedTo?: string; // Technician or maintenance person
  performedBy?: string; // Who actually performed the maintenance
  
  // Cost Information
  estimatedCost?: Amount;
  actualCost?: Amount;
  currency: Currency;
  
  // Parts and Materials
  partsUsed?: Array<{
    name: string;
    quantity: number;
    cost: Amount;
    supplier?: string;
  }>;
  
  // Documentation
  photos?: string[];
  documents?: string[];
  notes?: string;
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Assignment Interface
export interface AssetAssignment {
  id: string;
  assetId: string;
  type: AssignmentType;
  status: AssignmentStatus;
  
  // Assignment Details
  assignedTo: string; // ID or name
  assignedToType: 'person' | 'department' | 'group' | 'location';
  assignedBy: string;
  
  // Dates
  assignedDate: string; // ISO date string
  expectedReturnDate?: string; // ISO date string
  actualReturnDate?: string; // ISO date string
  
  // Condition Tracking
  conditionAtAssignment: AssetCondition;
  conditionAtReturn?: AssetCondition;
  
  // Documentation
  assignmentNotes?: string;
  returnNotes?: string;
  photos?: string[];
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Category Management Interface
export interface AssetCategoryData {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex color for UI display
  icon?: string; // Icon name for UI display
  
  // Settings
  requiresSerial: boolean;
  requiresWarranty: boolean;
  defaultDepreciationRate?: number;
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Interfaces
export interface AssetFormData {
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  condition: AssetCondition;
  priority: AssetPriority;
  
  purchasePrice: number;
  currentValue: number;
  depreciationRate?: number;
  currency: Currency;
  
  location: string;
  assignedTo?: string;
  assignedDepartment?: string;
  assignedGroup?: string;
  
  purchaseDate: string;
  warrantyExpiry?: string;
  nextMaintenance?: string;
  
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  
  notes?: string;
  tags?: string[];
  barcode?: string;
  qrCode?: string;
}

export interface AssetMaintenanceFormData {
  assetId: string;
  type: MaintenanceType;
  priority: AssetPriority;
  
  title: string;
  description: string;
  
  scheduledDate: string;
  estimatedDuration?: number;
  assignedTo?: string;
  
  estimatedCost?: number;
  currency: Currency;
  
  partsUsed?: Array<{
    name: string;
    quantity: number;
    cost: number;
    supplier?: string;
  }>;
  
  notes?: string;
}

export interface AssetAssignmentFormData {
  assetId: string;
  type: AssignmentType;
  
  assignedTo: string;
  assignedToType: 'person' | 'department' | 'group' | 'location';
  
  assignedDate: string;
  expectedReturnDate?: string;
  
  conditionAtAssignment: AssetCondition;
  assignmentNotes?: string;
}

// Search and Filter Interfaces
export interface AssetSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Filters
  category?: AssetCategory;
  status?: AssetStatus;
  condition?: AssetCondition;
  priority?: AssetPriority;
  location?: string;
  assignedDepartment?: string;
  assignedGroup?: string;
  
  // Date Filters
  purchaseDateFrom?: string;
  purchaseDateTo?: string;
  warrantyExpiryFrom?: string;
  warrantyExpiryTo?: string;
  
  // Value Filters
  minValue?: number;
  maxValue?: number;
  
  // Other Filters
  manufacturer?: string;
  tags?: string[];
  needsMaintenance?: boolean;
  warrantyExpiring?: boolean; // Within next 30 days
}

export interface AssetMaintenanceSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  assetId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: AssetPriority;
  assignedTo?: string;
  
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  completedDateFrom?: string;
  completedDateTo?: string;
  
  overdue?: boolean;
  upcoming?: boolean; // Within next 7 days
}

// Analytics and Reporting Interfaces
export interface AssetAnalytics {
  totalAssets: number;
  totalValue: Amount;
  averageValue: Amount;
  currency: Currency;
  
  // By Category
  byCategory: Record<AssetCategory, {
    count: number;
    value: Amount;
    percentage: number;
  }>;
  
  // By Status
  byStatus: Record<AssetStatus, {
    count: number;
    percentage: number;
  }>;
  
  // By Condition
  byCondition: Record<AssetCondition, {
    count: number;
    percentage: number;
  }>;
  
  // By Location
  byLocation: Record<string, {
    count: number;
    value: Amount;
  }>;
  
  // Trends
  acquisitionTrend: Array<{
    period: string;
    count: number;
    value: Amount;
  }>;
  
  depreciationTrend: Array<{
    period: string;
    totalValue: Amount;
    depreciatedValue: Amount;
  }>;
  
  // Maintenance
  maintenanceStats: {
    totalMaintenanceRecords: number;
    averageMaintenanceCost: Amount;
    upcomingMaintenance: number;
    overdueMaintenance: number;
  };
  
  // Alerts
  alerts: {
    warrantyExpiring: number; // Within 30 days
    needsMaintenance: number;
    damagedAssets: number;
    lostAssets: number;
  };
}

export interface AssetReport {
  id: string;
  title: string;
  type: 'inventory' | 'depreciation' | 'maintenance' | 'assignment' | 'custom';
  
  // Report Parameters
  dateRange: {
    start: string;
    end: string;
  };
  
  filters: AssetSearchParams;
  
  // Report Data
  assets: Asset[];
  summary: {
    totalAssets: number;
    totalValue: Amount;
    currency: Currency;
  };
  
  // Metadata
  generatedBy: string;
  generatedAt: string;
  pdfUrl?: string;
  excelUrl?: string;
}

export interface AssetDepreciation {
  assetId: string;
  purchasePrice: Amount;
  currentValue: Amount;
  depreciationRate: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'custom';
  
  // Calculated Values
  totalDepreciation: Amount;
  annualDepreciation: Amount;
  monthlyDepreciation: Amount;
  
  // Projections
  projectedValue: Array<{
    year: number;
    value: Amount;
    depreciation: Amount;
  }>;
  
  currency: Currency;
  calculatedAt: string;
}

// Export Types for easier importing
export type AssetCategoryType = AssetCategory;
export type AssetStatusType = AssetStatus;
export type AssetConditionType = AssetCondition;
export type AssetPriorityType = AssetPriority;
export type MaintenanceTypeType = MaintenanceType;
export type MaintenanceStatusType = MaintenanceStatus;
export type AssignmentTypeType = AssignmentType;
export type AssignmentStatusType = AssignmentStatus;

// Utility Types
export interface AssetListResponse {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssetMaintenanceListResponse {
  maintenanceRecords: AssetMaintenance[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssetAssignmentListResponse {
  assignments: AssetAssignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface AssetError {
  code: string;
  message: string;
  field?: string;
}

export interface AssetValidationError {
  field: string;
  message: string;
  code: string;
}

// API Response Types
export interface AssetApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AssetError;
  message?: string;
}

export interface AssetBulkResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    index: number;
    error: AssetError;
  }>;
}

// Export Format Types
export type AssetExportFormat = 'csv' | 'excel' | 'pdf';

export interface AssetExportOptions {
  format: AssetExportFormat;
  includePhotos?: boolean;
  includeDocuments?: boolean;
  includeMaintenanceHistory?: boolean;
  includeAssignmentHistory?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: AssetSearchParams;
}