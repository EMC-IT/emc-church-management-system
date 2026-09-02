import {
  MemberGivingSummary,
  MemberGivingTransaction,
  MemberGivingTrendPoint,
  MemberTaxStatement,
  MemberGivingFilter,
} from '@/lib/types/member';
import {
  mockMemberGivingSummary,
  mockMemberGivingTransactions,
  mockMemberGivingTrend,
  mockMemberTaxStatements,
} from '@/lib/mock/member';
import { GiveNowFormData } from '@/lib/validation/member';

export interface MemberGivingService {
  getGivingSummary(): Promise<MemberGivingSummary>;
  getTransactions(filter?: MemberGivingFilter): Promise<MemberGivingTransaction[]>;
  getGivingTrend(): Promise<MemberGivingTrendPoint[]>;
  getTaxStatements(): Promise<MemberTaxStatement[]>;
  initiateGiving(input: GiveNowFormData): Promise<MemberGivingTransaction>;
}

export class MockMemberGivingService implements MemberGivingService {
  private summary: MemberGivingSummary = { ...mockMemberGivingSummary };
  private transactions: MemberGivingTransaction[] = [...mockMemberGivingTransactions];
  private trend: MemberGivingTrendPoint[] = [...mockMemberGivingTrend];
  private statements: MemberTaxStatement[] = [...mockMemberTaxStatements];

  async getGivingSummary(): Promise<MemberGivingSummary> {
    return Promise.resolve({ ...this.summary });
  }

  async getTransactions(filter?: MemberGivingFilter): Promise<MemberGivingTransaction[]> {
    let filtered = [...this.transactions];

    if (!filter) {
      return Promise.resolve(filtered);
    }

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter((t) => t.category === filter.category);
    }

    if (filter.paymentMethod && filter.paymentMethod !== 'all') {
      filtered = filtered.filter((t) => t.paymentMethod === filter.paymentMethod);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filter.status);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.transactionReference.toLowerCase().includes(q) ||
          (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q))
      );
    }

    if (filter.dateRange && filter.dateRange !== 'all') {
      const now = new Date('2025-05-30'); // Anchor date matching realistic mock
      const daysMap: Record<string, number> = {
        '30d': 30,
        '90d': 90,
        '180d': 180,
        year: 365,
        last_year: 730,
      };

      const days = daysMap[filter.dateRange];
      if (days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((t) => new Date(t.date) >= cutoff);
      }
    }

    return Promise.resolve(filtered);
  }

  async getGivingTrend(): Promise<MemberGivingTrendPoint[]> {
    return Promise.resolve([...this.trend]);
  }

  async getTaxStatements(): Promise<MemberTaxStatement[]> {
    return Promise.resolve([...this.statements]);
  }

  async initiateGiving(input: GiveNowFormData): Promise<MemberGivingTransaction> {
    const today = new Date().toISOString().split('T')[0];
    const newTx: MemberGivingTransaction = {
      id: `tx-${Date.now()}`,
      transactionReference: `TXN••••${Math.floor(1000 + Math.random() * 9000)}`,
      category: input.category,
      amount: input.amount,
      currency: 'GHS',
      paymentMethod: input.paymentMethod,
      date: today,
      status: 'Completed',
      notes: input.note || `${input.category} contribution`,
      receiptNumber: `RCP-${today.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
    };

    this.transactions = [newTx, ...this.transactions];
    this.summary = {
      ...this.summary,
      totalGivenYearToDate: this.summary.totalGivenYearToDate + input.amount,
      totalGiftsCountThisYear: this.summary.totalGiftsCountThisYear + 1,
      lastGift: {
        amount: input.amount,
        category: input.category,
        date: today,
        paymentMethod: input.paymentMethod,
      },
      givingThisYearTotal: this.summary.givingThisYearTotal + input.amount,
      recentTransactions: [newTx, ...this.summary.recentTransactions],
    };

    return Promise.resolve(newTx);
  }
}

export const memberGivingService = new MockMemberGivingService();
