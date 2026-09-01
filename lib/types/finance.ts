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

export interface BudgetSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  department?: string;
  categoryId?: string;
  periodYear?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

// Legacy / Standard Budget interface for backward compatibility
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

export interface ExpenseSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  vendor?: string;
  status?: ExpenseStatus | string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  approvedBy?: string;
  branch?: string;
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