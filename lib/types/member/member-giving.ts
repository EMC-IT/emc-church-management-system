export type GivingCategory =
  | 'Tithe'
  | 'Offering'
  | 'Building Fund'
  | 'Missions'
  | 'Welfare'
  | 'Thanksgiving'
  | 'Special Seed'
  | 'Other';

export type GivingPaymentMethod =
  | 'Mobile Money'
  | 'Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Cheque';

export type GivingStatus =
  | 'Completed'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export interface MemberGivingTransaction {
  id: string;
  transactionReference: string;
  category: GivingCategory;
  amount: number;
  currency: string;
  paymentMethod: GivingPaymentMethod;
  date: string;
  status: GivingStatus;
  notes?: string;
  receiptNumber?: string;
}

export interface MemberGivingCategoryBreakdown {
  category: GivingCategory;
  amount: number;
  percentage: number;
}

export interface MemberGivingSummary {
  totalGivenYearToDate: number;
  yearToDateTotal?: number;
  previousYearTotal?: number;
  titheYearToDate?: number;
  offeringYearToDate?: number;
  specialGivingYearToDate?: number;
  totalGiftsCountThisYear: number;
  lastGift?: {
    amount: number;
    category: GivingCategory;
    date: string;
    paymentMethod: GivingPaymentMethod;
  } | null;
  givingThisYearTotal: number;
  currency: string;
  categoryBreakdown: MemberGivingCategoryBreakdown[];
  recentTransactions: MemberGivingTransaction[];
}

export interface MemberGivingTrendPoint {
  month: string;
  amount: number;
  tithe: number;
  offering: number;
  other: number;
}

export interface MemberTaxStatement {
  id: string;
  title: string;
  year: number;
  totalGiven: number;
  currency: string;
  generatedDate: string;
  downloadUrl?: string;
}

export interface MemberGivingFilter {
  dateRange?: '30d' | '90d' | '180d' | 'year' | 'last_year' | 'all';
  category?: GivingCategory | 'all';
  paymentMethod?: GivingPaymentMethod | 'all';
  status?: GivingStatus | 'all';
  search?: string;
}
