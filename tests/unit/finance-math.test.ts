import { describe, it, expect } from 'vitest';
import {
  roundToTwoDecimals,
  fromMinorUnits,
  toMinorUnits,
  calculateBudgetUtilization,
  calculateFinancialSummary,
} from '../../lib/finance/finance-math';

describe('Finance Math & High-Integrity Calculations', () => {
  it('roundToTwoDecimals should correctly eliminate floating point inaccuracies', () => {
    expect(roundToTwoDecimals(0.1 + 0.2)).toBe(0.3);
    expect(roundToTwoDecimals(1234.5678)).toBe(1234.57);
  });

  it('fromMinorUnits and toMinorUnits should convert accurately', () => {
    expect(toMinorUnits(50.25)).toBe(5025);
    expect(fromMinorUnits(5025)).toBe(50.25);
  });

  it('calculateBudgetUtilization should accurately categorize budget status', () => {
    // Normal spending
    const normal = calculateBudgetUtilization(10000, 5000);
    expect(normal.utilizationPercentage).toBe(50);
    expect(normal.remainingAmount).toBe(5000);
    expect(normal.isOverBudget).toBe(false);
    expect(normal.status).toBe('SAFE');

    // Warning spending (>= 80%)
    const warning = calculateBudgetUtilization(10000, 8500);
    expect(warning.utilizationPercentage).toBe(85);
    expect(warning.remainingAmount).toBe(1500);
    expect(warning.status).toBe('WARNING');

    // Over budget
    const over = calculateBudgetUtilization(10000, 12000);
    expect(over.remainingAmount).toBe(-2000);
    expect(over.isOverBudget).toBe(true);
    expect(over.status).toBe('EXCEEDED');
  });

  it('calculateFinancialSummary should compute net balance deterministically', () => {
    const income = [1000.5, 2500.25, 300.0];
    const expenses = [450.0, 1200.75];
    const summary = calculateFinancialSummary(income, expenses);

    expect(summary.totalIncome).toBe(3800.75);
    expect(summary.totalExpenses).toBe(1650.75);
    expect(summary.netBalance).toBe(2150.0);
  });
});
