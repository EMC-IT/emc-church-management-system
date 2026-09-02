import { describe, it, expect } from 'vitest';
import { memberGivingService } from '@/services/member';
import { giveNowSchema } from '@/lib/validation/member';

describe('Member Giving Service', () => {
  it('returns valid giving summary with totals and breakdown', async () => {
    const summary = await memberGivingService.getGivingSummary();

    expect(summary).toBeDefined();
    expect(summary.totalGivenYearToDate).toBeGreaterThan(0);
    expect(summary.totalGiftsCountThisYear).toBeGreaterThan(0);
    expect(summary.lastGift).toBeDefined();
    expect(summary.categoryBreakdown.length).toBeGreaterThan(0);

    const totalPct = summary.categoryBreakdown.reduce((acc, c) => acc + c.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(95);
    expect(totalPct).toBeLessThanOrEqual(105);
  });

  it('filters transactions by category, method, status, and search query', async () => {
    const all = await memberGivingService.getTransactions();
    expect(all.length).toBeGreaterThan(0);

    const tithes = await memberGivingService.getTransactions({ category: 'Tithe' });
    expect(tithes.every((t) => t.category === 'Tithe')).toBe(true);

    const momo = await memberGivingService.getTransactions({ paymentMethod: 'Mobile Money' });
    expect(momo.every((t) => t.paymentMethod === 'Mobile Money')).toBe(true);

    const completed = await memberGivingService.getTransactions({ status: 'Completed' });
    expect(completed.every((t) => t.status === 'Completed')).toBe(true);

    const searchResults = await memberGivingService.getTransactions({ search: 'Building' });
    expect(searchResults.every((t) => t.category === 'Building Fund' || t.notes?.includes('Building'))).toBe(true);
  });

  it('returns tax statements and monthly trend points', async () => {
    const trend = await memberGivingService.getGivingTrend();
    expect(Array.isArray(trend)).toBe(true);
    expect(trend.length).toBeGreaterThan(0);
    expect(trend[0]).toHaveProperty('month');
    expect(trend[0]).toHaveProperty('amount');

    const statements = await memberGivingService.getTaxStatements();
    expect(Array.isArray(statements)).toBe(true);
    expect(statements.length).toBeGreaterThan(0);
    expect(statements[0]).toHaveProperty('year');
    expect(statements[0]).toHaveProperty('totalGiven');
  });

  it('validates giving schema and rejects invalid inputs', () => {
    const valid = giveNowSchema.safeParse({
      amount: 150,
      category: 'Offering',
      paymentMethod: 'Mobile Money',
    });
    expect(valid.success).toBe(true);

    const invalidZero = giveNowSchema.safeParse({
      amount: 0,
      category: 'Offering',
      paymentMethod: 'Mobile Money',
    });
    expect(invalidZero.success).toBe(false);

    const invalidNegative = giveNowSchema.safeParse({
      amount: -50,
      category: 'Tithe',
      paymentMethod: 'Card',
    });
    expect(invalidNegative.success).toBe(false);
  });

  it('successfully simulates giving initiation', async () => {
    const newTx = await memberGivingService.initiateGiving({
      amount: 300,
      category: 'Thanksgiving',
      paymentMethod: 'Mobile Money',
      note: 'Family thanksgiving dedication',
    });

    expect(newTx).toBeDefined();
    expect(newTx.amount).toBe(300);
    expect(newTx.category).toBe('Thanksgiving');
    expect(newTx.status).toBe('Completed');
    expect(newTx.transactionReference).toContain('TXN••••');
  });
});
