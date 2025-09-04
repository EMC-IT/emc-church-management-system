// ============================================================================
// FINANCE MODULE TYPES
// ============================================================================

// Currency and Amount Types
export type Currency = 'GHS' | 'USD' | 'EUR' | 'GBP';
export type Amount = number; // Always in smallest currency unit (pesewas for GHS)

// Payment Method Types
export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Online' | 'Check';
export type DonationMethod = 
  | 'Cash'
  | 'Mobile Money'
  | 'Bank Transfer'
  | 'Check'
  | 'Card'
  | 'Online';

// Donation Types
export type DonationType = 'Tithe' | 'Offering' | 'Special' | 'Pledge';
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

// Tithes & Offerings Types
export type TitheType = 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';

export interface TitheOffering {
  id: string;
  memberId?: string; // Optional for anonymous offerings
  memberName?: string;
  type: TitheType;
  amount: Amount;
  currency: Currency;
  serviceType: string;
  serviceDate: string;
  branch: string;
  recordedBy: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Budget Types
export type BudgetStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';
export type BudgetPeriod = 'Monthly' | 'Quarterly' | 'Yearly' | 'Custom';

export interface Budget {
  id: string;
  name: string;
  description?: string;
  amount: Amount;
  currency: Currency;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  status: BudgetStatus;
  category: DonationCategory;
  branch: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  expenses: BudgetExpense[];
}

export interface BudgetExpense {
  id: string;
  budgetId: string;
  description: string;
  amount: Amount;
  currency: Currency;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
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

// Expense Types
export type ExpenseCategory = 
  | 'Utilities'
  | 'Maintenance'
  | 'Equipment'
  | 'Supplies'
  | 'Transportation'
  | 'Events'
  | 'Staff'
  | 'Marketing'
  | 'Technology'
  | 'Other';

export type ExpenseStatus = 
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Cancelled';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: Amount;
  currency: Currency;
  category: ExpenseCategory;
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

// Giving Types
export interface Giving {
  id: string;
  memberId: string;
  type: GivingType;
  amount: number;
  currency: string;
  category: GivingCategory;
  campaign?: string;
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
  FUNDRAISING = 'fundraising',
  PLEDGE = 'pledge',
  SPECIAL = 'special',
  MISSIONARY = 'missionary',
  BUILDING = 'building',
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

export interface GivingFormData {
  type: GivingType;
  amount: number;
  currency: string;
  category: GivingCategory;
  campaign?: string;
  method: PaymentMethod;
  date: string;
  description?: string;
  isAnonymous: boolean;
  receiptNumber?: string;
}

export interface GivingAnalytics {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  byType: Record<GivingType, { amount: number; count: number }>;
  byCategory: Record<GivingCategory, { amount: number; count: number }>;
  byMonth: Array<{ month: string; amount: number; count: number }>;
  byYear: Array<{ year: string; amount: number; count: number }>;
  recentGiving: Giving[];
  topCategories: Array<{ category: GivingCategory; amount: number; percentage: number }>;
  givingTrend: Array<{ period: string; amount: number; change: number }>;
}

export interface GivingSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  type?: GivingType;
  givingCategory?: GivingCategory;
  givingStatus?: GivingStatus;
  method?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  campaign?: string;
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

export interface FinanceQueryParams extends FinanceFilters {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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