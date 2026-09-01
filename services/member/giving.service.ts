import {
  MemberGivingSummary,
  MemberGivingTransaction,
  MemberTaxStatement,
} from '@/lib/types/member';
import { mockMemberGiving } from '@/lib/mock/member';

export interface MemberGivingService {
  getGivingSummary(): Promise<MemberGivingSummary>;
  getTransactions(year?: number): Promise<MemberGivingTransaction[]>;
  getTaxStatements(): Promise<MemberTaxStatement[]>;
}

export class MockMemberGivingService implements MemberGivingService {
  async getGivingSummary(): Promise<MemberGivingSummary> {
    return Promise.resolve({ ...mockMemberGiving });
  }

  async getTransactions(): Promise<MemberGivingTransaction[]> {
    return Promise.resolve([...mockMemberGiving.recentTransactions]);
  }

  async getTaxStatements(): Promise<MemberTaxStatement[]> {
    return Promise.resolve([
      {
        id: 'stmt-2025',
        year: 2025,
        totalGiven: 5200,
        currency: 'GHS',
        generatedDate: '2026-01-15',
        downloadUrl: '#',
      },
      {
        id: 'stmt-2024',
        year: 2024,
        totalGiven: 4800,
        currency: 'GHS',
        generatedDate: '2025-01-15',
        downloadUrl: '#',
      },
    ]);
  }
}

export const memberGivingService = new MockMemberGivingService();
