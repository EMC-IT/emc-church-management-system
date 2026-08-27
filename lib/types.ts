export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface Role {
  name: string;
  permissions: string[];
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  membershipStatus: 'New' | 'Active' | 'Inactive' | 'Transferred' | 'Archived';
  joinDate: string;
  avatar: string | null;
  familyId?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  branch?: string;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  membershipStatus?: 'New' | 'Active' | 'Inactive' | 'Transferred' | 'Archived';
  joinDate?: string;
  familyId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  customFields?: Record<string, any>;
}

export interface Family {
  id: string;
  name: string;
  members: Member[];
  headOfFamily: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ===== ATTENDANCE TYPES =====

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  serviceType: ServiceType;
  serviceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  branch: string;
  departmentId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial'
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  member: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    department?: string;
    group?: string;
  };
  serviceType: ServiceType;
  serviceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  branch: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  serviceType: ServiceType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  expectedAttendees: number;
  actualAttendees: number;
  attendanceRate: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  branch: string;
  departmentId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalSessions: number;
  totalAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  trends: {
    period: string;
    attendance: number;
    rate: number;
  }[];
}

export interface MemberAttendanceProfile {
  memberId: string;
  memberName: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  streak: number;
  lastAttended: string;
  attendanceHistory: AttendanceRecord[];
  monthlyStats: {
    month: string;
    attended: number;
    total: number;
    rate: number;
  }[];
}

export interface AttendanceReport {
  period: {
    start: string;
    end: string;
  };
  totalSessions: number;
  totalAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  byServiceType: Record<ServiceType, AttendanceStats>;
  byDepartment: Record<string, AttendanceStats>;
  byGroup: Record<string, AttendanceStats>;
  topAttenders: {
    memberId: string;
    memberName: string;
    attendanceRate: number;
    sessionsAttended: number;
  }[];
  trends: {
    date: string;
    attendance: number;
    rate: number;
  }[];
}

export interface AttendanceFormData {
  serviceType: ServiceType;
  serviceDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  expectedAttendees?: number;
  departmentId?: string;
  groupId?: string;
  notes?: string;
}

export interface BulkAttendanceData {
  sessionId: string;
  attendances: {
    memberId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    notes?: string;
  }[];
}

export interface AttendanceSearchParams extends SearchParams {
  serviceType?: ServiceType;
  status?: AttendanceStatus;
  departmentId?: string;
  groupId?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
  memberId?: string;
}

// Legacy Donation interface - keeping for backward compatibility
export interface LegacyDonation {
  id: string;
  memberId: string;
  amount: number;
  currency: string;
  donationType: 'Tithe' | 'Offering' | 'Special' | 'Pledge';
  campaign?: string;
  method: 'Cash' | 'Card' | 'Transfer' | 'Online';
  date: string;
  notes?: string;
  createdAt: string;
}

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

// Group interface moved to groups module section below

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

// Legacy Budget interface - keeping for backward compatibility
export interface LegacyBudget {
  id: string;
  name: string;
  department: string;
  amount: number;
  spent: number;
  period: string;
  status: 'Active' | 'Completed' | 'Exceeded';
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

// ===== PERMISSION TYPES =====

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}

// ===== SETTINGS TYPES =====

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UserSettings {
  userId: string;
  settings: AppSettings;
  updatedAt: string;
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

export type Gender = 'Male' | 'Female' | 'Other';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Online' | 'Check';

export type DonationType = 'Tithe' | 'Offering' | 'Special' | 'Pledge';

export type EventStatus = 'active' | 'cancelled' | 'completed';

// AttendanceStatus enum is defined above at line 103

// ===== ENUM TYPES =====

export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  LEADER = 'leader',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum ModulePermission {
  MEMBERS = 'members',
  FINANCE = 'finance',
  EVENTS = 'events',
  ATTENDANCE = 'attendance',
  COMMUNICATIONS = 'communications',
  GROUPS = 'groups',
  SUNDAY_SCHOOL = 'sunday_school',
  PRAYER_REQUESTS = 'prayer_requests',
  REPORTS = 'reports',
  SETTINGS = 'settings',
}

export enum ActionPermission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

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

// ===== GIVING TYPES =====

export enum GivingSource {
  INDIVIDUAL = 'individual',
  CONGREGATIONAL = 'congregational',
}

export interface Giving {
  id: string;
  memberId?: string; // Optional: not required for congregational or anonymous giving
  memberName?: string; // Display name, avoids requiring a member lookup
  source?: GivingSource;
  type: GivingType;
  amount: number;
  currency: string;
  category: GivingCategory;
  campaign?: string; // Legacy campaign name/id alias
  campaignId?: string; // Associated fundraising campaign
  serviceEvent?: string; // For congregational giving: e.g. "Sunday Morning Service"
  parentGivingId?: string; // Set when this is an identified-contribution breakdown of a congregational record. EXCLUDED from all aggregate totals.
  method: PaymentMethod;
  date: string;
  description?: string;
  isAnonymous: boolean;
  receiptNumber?: string;
  status: GivingStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export enum GivingType {
  TITHE = 'tithe',
  OFFERING = 'offering',
  DONATION = 'donation',
  FIRST_FRUITS = 'first_fruits',
  SPECIAL_SEED = 'special_seed',
  THANKSGIVING = 'thanksgiving',
  FUNDRAISING = 'fundraising',
  PLEDGE = 'pledge',
  SPECIAL = 'special',
  MISSIONARY = 'missionary',
  BUILDING = 'building',
  WELFARE = 'welfare',
  OTHER = 'other',
}

export enum GivingCategory {
  GENERAL = 'general',
  BUILDING_FUND = 'building_fund',
  MISSIONARY = 'missionary',
  YOUTH = 'youth',
  CHILDREN = 'children',
  MUSIC = 'music',
  OUTREACH = 'outreach',
  WELFARE = 'welfare',
  CHARITY = 'charity',
  EDUCATION = 'education',
  MEDICAL = 'medical',
  DISASTER_RELIEF = 'disaster_relief',
  OTHER = 'other',
}

export enum GivingStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

// An identified individual contribution within a congregational giving record.
// These are attribution records only — they do NOT independently count toward any financial total.
export interface IdentifiedContribution {
  id: string;
  memberId?: string;
  memberName?: string;
  amount: number;
  isAnonymous: boolean;
  notes?: string;
}

export interface GivingFormData {
  source?: GivingSource;
  memberId?: string;
  memberName?: string;
  type: GivingType;
  amount: number;
  currency: string;
  category: GivingCategory;
  campaign?: string;
  campaignId?: string;
  serviceEvent?: string;
  method: PaymentMethod;
  date: string;
  description?: string;
  isAnonymous: boolean;
  receiptNumber?: string;
  // Only populated for congregational giving records
  identifiedContributions?: IdentifiedContribution[];
}

// ===== PLEDGE TYPES =====

export enum PledgeStatus {
  ACTIVE = 'active',
  PARTIALLY_PAID = 'partially_paid',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

// A pledge is a commitment to give. It is NOT actual giving until payment is received.
// Pledge amounts must NEVER be included in Total Giving totals.
export interface Pledge {
  id: string;
  memberId: string;
  memberName?: string;
  campaignId?: string; // Optional: links to a fundraising campaign
  campaignName?: string;
  pledgedAmount: number;
  paidAmount: number;
  outstandingAmount: number; // = pledgedAmount - paidAmount
  currency: string;
  pledgeDate: string;
  completionDate?: string; // Expected fulfillment date
  status: PledgeStatus;
  notes?: string;
  payments: PledgePayment[];
  createdAt: string;
  updatedAt: string;
}

// A pledge payment is actual money received against a pledge.
// Each payment creates a corresponding Giving record that DOES count toward Total Giving.
export interface PledgePayment {
  id: string;
  pledgeId: string;
  givingId?: string; // The associated Giving record created when payment was made
  amount: number;
  currency: string;
  date: string;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface PledgeFormData {
  memberId: string;
  campaignId?: string;
  pledgedAmount: number;
  currency: string;
  pledgeDate: string;
  completionDate?: string;
  notes?: string;
}

export interface PledgePaymentFormData {
  pledgeId: string;
  amount: number;
  currency: string;
  date: string;
  method: PaymentMethod;
  notes?: string;
}

// ===== FUNDRAISING CAMPAIGN TYPES =====

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface FundraisingCampaign {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  pledgedAmount: number; // Total pledged (commitments, NOT actual money)
  receivedAmount: number; // Actual money received against pledges + direct contributions
  outstandingAmount: number; // = pledgedAmount - receivedAmount
  currency: string;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  fund: GivingCategory;
  createdAt: string;
  updatedAt: string;
}

export interface FundraisingCampaignFormData {
  name: string;
  description?: string;
  targetAmount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  fund: GivingCategory;
}

// ===== ANALYTICS & SEARCH =====

export interface GivingAnalytics {
  totalAmount: number; // Actual giving received only. Never includes pledged amounts.
  totalCount: number;
  averageAmount: number;
  activePledgesCount: number; // Count of unfulfilled pledges
  byType: Record<GivingType, { amount: number; count: number }>;
  byCategory: Record<GivingCategory, { amount: number; count: number }>;
  bySource: Record<GivingSource, { amount: number; count: number }>;
  byMonth: Array<{ month: string; amount: number; count: number }>;
  byYear: Array<{ year: string; amount: number; count: number }>;
  recentGiving: Giving[];
  topCategories: Array<{ category: GivingCategory; amount: number; percentage: number }>;
  givingTrend: Array<{ period: string; amount: number; change: number }>;
}

export interface GivingSearchParams extends SearchParams {
  source?: GivingSource;
  type?: GivingType;
  category?: GivingCategory;
  status?: GivingStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  campaignId?: string;
  memberId?: string;
  // When true, excludes records where parentGivingId is set (identified contributions
  // that are sub-records of a congregational giving total). Use this in all stat/total queries.
  excludeBreakdowns?: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leader: string;
  members: string[];
  departmentType?: string; // e.g., Administrative, Functional
  status?: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FINANCE MODULE TYPES
// ============================================================================

// Currency and Amount Types
export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP';
export type Amount = number; // Always in smallest currency unit (pesewas for GHS)

// Donation Types
export type DonationCategory = 
  | 'General Offering'
  | 'Building Fund'
  | 'Missions'
  | 'Children Ministry'
  | 'Youth Ministry'
  | 'Music Ministry'
  | 'Media Ministry'
  | 'Welfare'
  | 'Special Project'
  | 'Other';

export type DonationMethod = 
  | 'Cash'
  | 'Mobile Money'
  | 'Bank Transfer'
  | 'Check'
  | 'Card'
  | 'Online';

export type DonationStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Refunded';

export interface Donation {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: Amount;
  currency: Currency;
  category: DonationCategory;
  method: DonationMethod;
  status: DonationStatus;
  description?: string;
  receiptNumber: string;
  date: string; // ISO date string
  branch: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  customFields?: Record<string, any>;
}

// Tithes & Offerings Types
export type TitheType = 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';
export type ServiceType = 'Sunday Service' | 'Bible Study' | 'Prayer Meeting' | 'Youth Service' | 'Midweek Service' | 'Special Service' | 'Other';

export interface TitheOffering {
  id: string;
  memberId?: string; // Optional for anonymous offerings
  memberName?: string;
  type: TitheType;
  amount: Amount;
  currency: Currency;
  serviceType: ServiceType;
  serviceDate: string;
  branch: string;
  recordedBy: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Budget Types
export type BudgetStatus = 
  | 'Active' 
  | 'Watch' 
  | 'Near Limit' 
  | 'Over Budget' 
  | 'Completed' 
  | 'Draft' 
  | 'Archived'
  | 'active'
  | 'completed'
  | 'exceeded'
  | 'draft';

export type BudgetPeriod = 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom' | string;

export interface BudgetAllocation {
  id: string;
  budgetId?: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  percentage?: number;
  notes?: string;
  updatedAt?: string;
}

export interface BudgetRecord {
  id: string;
  name: string;
  description?: string;
  amount: number;
  spent: number;
  currency: string;
  period: string;
  periodYear: number;
  startDate: string;
  endDate: string;
  categoryId?: string;
  categoryName?: string;
  departmentId?: string;
  departmentName?: string;
  department: string;
  owner: string;
  status: BudgetStatus;
  priority?: 'High' | 'Medium' | 'Low' | 'high' | 'medium' | 'low';
  allocations?: BudgetAllocation[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  budgetCount?: number;
  totalBudget?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastUsed?: string;
}

export interface BudgetFormData {
  name: string;
  department: string;
  category: string;
  amount: number;
  currency?: string;
  period: string;
  periodYear?: number;
  startDate: string;
  endDate: string;
  owner: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low';
  status?: BudgetStatus;
}

export interface BudgetSearchParams extends SearchParams {
  department?: string;
  categoryId?: string;
  periodYear?: number | string;
  status?: string;
}

export interface BudgetTrendPoint {
  month: string;
  budget: number;
  spent: number;
  remaining: number;
}

export interface DepartmentBudgetStat {
  department: string;
  budget: number;
  spent: number;
  remaining: number;
  utilization: number;
}

export interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  utilizationRate: number;
  periodYear: number;
  totalBudgetsCount: number;
  statusCounts: Record<string, number>;
  trends: BudgetTrendPoint[];
  departmentSpending: DepartmentBudgetStat[];
  recentBudgets: BudgetRecord[];
}

export interface BudgetListResponse {
  data: BudgetRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BudgetResponse {
  data: BudgetRecord;
  message?: string;
}

// Standard Budget interface for backward compatibility
export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: Amount | number;
  currency: Currency | string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  category?: DonationCategory | string;
  department?: string;
  branch?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  expenses?: BudgetExpense[];
  spent?: number;
  owner?: string;
}

export interface BudgetExpense {
  id: string;
  budgetId: string;
  description: string;
  amount: Amount | number;
  currency: Currency | string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export type ExpenseStatus = 
  | 'paid'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'Paid'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface ExpenseCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  group?: 'People' | 'Facilities & Utilities' | 'Operations' | 'Ministry' | 'Equipment' | 'Other' | string;
  isActive: boolean;
  totalExpenses?: number;
  recordCount?: number;
  lastExpenseDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  vendor: string;
  paymentMethod: string;
  date: string;
  status: ExpenseStatus;
  receiptNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  attachments?: ExpenseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  amount: number;
  currency?: string;
  categoryId: string;
  vendor: string;
  paymentMethod: string;
  date: string;
  status?: ExpenseStatus;
  receiptNumber?: string;
  approvedBy?: string;
  description?: string;
  notes?: string;
}

export interface ExpenseSearchParams extends SearchParams {
  categoryId?: string;
  vendor?: string;
  status?: ExpenseStatus | string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  approvedBy?: string;
}

export interface ExpenseAnalytics {
  totalPaid: number;
  totalPending: number;
  thisMonthPaid: number;
  lastMonthPaid?: number;
  averageAmount: number;
  growth: number;
  totalCount: number;
  byCategory: Record<string, { amount: number; count: number; color?: string }>;
  byPaymentMethod: Record<string, { amount: number; count: number }>;
  byVendor: Record<string, { amount: number; count: number }>;
  recentExpenses: ExpenseRecord[];
}

export interface ExpenseListResponse {
  data: ExpenseRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExpenseResponse {
  data: ExpenseRecord;
  message?: string;
}

export interface ExpenseCategoryListResponse {
  data: ExpenseCategory[];
  total: number;
}

// Legacy Expense interface for backward compatibility
export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: Amount;
  currency: Currency;
  category: string;
  status: ExpenseStatus;
  date: string;
  dueDate?: string;
  branch: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INCOME MODULE TYPES
// ============================================================================

export type IncomeStatus = 'received' | 'pending' | 'cancelled';

export interface IncomeCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  totalIncome?: number;
  recordCount?: number;
  lastIncomeDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRecord {
  id: string;
  description: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName?: string;
  source: string;
  paymentMethod: string;
  date: string;
  status: IncomeStatus;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeFormData {
  description: string;
  amount: number;
  currency: string;
  categoryId: string;
  source: string;
  paymentMethod: string;
  date: string;
  status: IncomeStatus;
  reference?: string;
  notes?: string;
}

export interface IncomeSearchParams extends SearchParams {
  categoryId?: string;
  source?: string;
  status?: IncomeStatus | string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface IncomeAnalytics {
  totalReceived: number;
  totalPending: number;
  thisMonthReceived: number;
  averageAmount: number;
  growth: number;
  totalCount: number;
  byCategory: Record<string, { amount: number; count: number }>;
  byPaymentMethod: Record<string, { amount: number; count: number }>;
  bySource: Record<string, { amount: number; count: number }>;
  recentIncome: IncomeRecord[];
}

// Financial Report Types
export interface FinancialSummary {
  totalDonations: Amount;
  totalTithes: Amount;
  totalOfferings: Amount;
  totalExpenses: Amount;
  totalBudget: Amount;
  netIncome: Amount;
  currency: Currency;
  period: {
    start: string;
    end: string;
  };
}

export interface DonationReport {
  period: {
    start: string;
    end: string;
  };
  totalAmount: Amount;
  currency: Currency;
  donations: Donation[];
  byCategory: Record<DonationCategory, Amount>;
  byMethod: Record<DonationMethod, Amount>;
  byBranch: Record<string, Amount>;
  byMonth: Record<string, Amount>;
}

export interface BudgetReport {
  budget: Budget;
  totalAllocated: Amount;
  totalSpent: Amount;
  totalRemaining: Amount;
  expenses: BudgetExpense[];
  utilizationPercentage: number;
}

// Receipt Types
export interface Receipt {
  id: string;
  receiptNumber: string;
  type: 'Donation' | 'Tithe' | 'Offering' | 'Expense';
  amount: Amount;
  currency: Currency;
  date: string;
  description: string;
  donorName?: string;
  memberName?: string;
  branch: string;
  generatedBy: string;
  generatedAt: string;
  pdfUrl?: string;
}

// Filter and Query Types
export interface FinanceFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: DonationCategory | ExpenseCategory;
  status?: DonationStatus | ExpenseStatus;
  branch?: string;
  method?: DonationMethod;
  amountRange?: {
    min: Amount;
    max: Amount;
  };
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FinanceQueryParams extends FinanceFilters, PaginationParams {}

// Export Types
export type ExportFormat = 'csv' | 'pdf' | 'excel';
export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  includeReceipts?: boolean;
  groupBy?: 'category' | 'method' | 'branch' | 'month';
}

// ============================================================================
// GROUPS MODULE TYPES
// ============================================================================

// Group Types
export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  leader: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  members: number;
  maxMembers: number;
  meetingSchedule: string;
  location: string;
  engagement: number;
  status: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  category: string;
  leader: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  maxMembers: number;
  meetingSchedule: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Archived';
}

// Group Member Types
export interface GroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  role: string;
  joinedAt: string;
  status: 'Active' | 'Inactive';
}

export interface GroupMemberFormData {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  role: string;
}

// Group Role Types
export interface GroupRole {
  id: string;
  groupId: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
}

export interface GroupRoleFormData {
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

// Group Event Types
export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  registeredAttendees: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

export interface GroupEventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
}

// Group Category Types
export interface GroupCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

// Group Attendance Types
export interface GroupAttendance {
  id: string;
  groupId: string;
  eventId?: string;
  memberId: string;
  memberName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface GroupAttendanceFormData {
  groupId: string;
  eventId?: string;
  date: string;
  attendances: {
    memberId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    notes?: string;
  }[];
}

// Group Statistics Types
export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  averageEngagement: number;
  categoryStats: {
    category: string;
    count: number;
    members: number;
  }[];
  engagementTrend: {
    month: string;
    engagement: number;
  }[];
}

// Group Search and Filter Types
export interface GroupSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  leader?: string;
  sortBy?: 'name' | 'members' | 'engagement' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ─── CONSOLIDATED FINANCIAL REPORTING ──────────────────────────────────────────

export interface StatementOfActivitiesItem {
  id?: string;
  category: string;
  type: 'giving' | 'income' | 'expense';
  amount: number;
  percentage: number;
  priorPeriodAmount?: number;
}

export interface MonthlyFinancialPoint {
  month: string;
  giving: number;
  income: number;
  totalInflows: number;
  expenses: number;
  netSurplus: number;
}

export interface DepartmentVariancePoint {
  department: string;
  budget: number;
  spent: number;
  variance: number;
  utilization: number;
  status: string;
}

export interface ConsolidatedFinancialReport {
  fiscalYear: number;
  totalGiving: number;
  totalIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  netSurplus: number;
  totalBudget: number;
  budgetUtilizationRate: number;
  monthlyTrends: MonthlyFinancialPoint[];
  statementRevenues: StatementOfActivitiesItem[];
  statementExpenses: StatementOfActivitiesItem[];
  departmentVariances: DepartmentVariancePoint[];
  givingCategoryDistribution: { category: string; amount: number; percentage: number; color?: string }[];
  incomeCategoryDistribution: { category: string; amount: number; percentage: number; color?: string }[];
  expenseCategoryDistribution: { category: string; amount: number; percentage: number; color?: string }[];
  paymentMethodDistribution: { method: string; amount: number; percentage: number }[];
}

export interface FinancialAuditRecord {
  id: string;
  date: string;
  domain: 'Giving' | 'Income' | 'Expense';
  category: string;
  description: string;
  payeeOrDonor: string;
  paymentMethod: string;
  amount: number;
  flow: 'inflow' | 'outflow';
  status: string;
  reference?: string;
}