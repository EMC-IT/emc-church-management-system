export type GivingCategory = 'Tithe' | 'Offering' | 'Building Fund' | 'Missions' | 'Welfare' | 'First Fruits' | 'Special Seed';
export type GivingPaymentMethod = 'Mobile Money' | 'Card' | 'Bank Transfer' | 'Cash' | 'Cheque';
export type GivingStatus = 'Completed' | 'Pending' | 'Failed';

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
  receiptUrl?: string;
}

export interface MemberGivingSummary {
  yearToDateTotal: number;
  previousYearTotal: number;
  titheYearToDate: number;
  offeringYearToDate: number;
  specialGivingYearToDate: number;
  currency: string;
  recentTransactions: MemberGivingTransaction[];
}

export interface MemberTaxStatement {
  id: string;
  year: number;
  totalGiven: number;
  currency: string;
  generatedDate: string;
  downloadUrl: string;
}
