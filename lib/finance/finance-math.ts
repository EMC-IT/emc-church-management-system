/**
 * Financial Calculation & Precision Math Utilities
 * Ensures deterministic calculations across income, expenses, giving, and budgets.
 */

export interface FinancialCalculationTotals {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalGiving: number;
  totalTithes: number;
  totalOfferings: number;
}

export interface BudgetUtilizationResult {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  status: 'SAFE' | 'WARNING' | 'EXCEEDED';
}

/**
 * Safely rounds numbers to 2 decimal places to avoid floating point precision issues.
 */
export function roundToTwoDecimals(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Converts minor currency units (e.g. pesewas/cents) to major units (e.g. GHS/USD).
 */
export function fromMinorUnits(minorUnits: number): number {
  return roundToTwoDecimals(minorUnits / 100);
}

/**
 * Converts major currency units to minor units (e.g. 50.00 GHS -> 5000 pesewas).
 */
export function toMinorUnits(majorUnits: number): number {
  return Math.round(majorUnits * 100);
}

/**
 * Deterministically computes budget utilization, variances, and safety status.
 */
export function calculateBudgetUtilization(budgetAmount: number, spentAmount: number): BudgetUtilizationResult {
  const budget = Math.max(0, budgetAmount);
  const spent = Math.max(0, spentAmount);
  const remaining = roundToTwoDecimals(budget - spent);
  const rawPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const utilizationPercentage = Math.min(100, Math.max(0, roundToTwoDecimals(rawPercentage)));
  const isOverBudget = spent > budget;

  let status: 'SAFE' | 'WARNING' | 'EXCEEDED' = 'SAFE';
  if (isOverBudget) {
    status = 'EXCEEDED';
  } else if (rawPercentage >= 80) {
    status = 'WARNING';
  }

  return {
    budgetAmount: budget,
    spentAmount: spent,
    remainingAmount: remaining,
    utilizationPercentage,
    isOverBudget,
    status,
  };
}

/**
 * Calculates net financial summary from income and expense items.
 */
export function calculateFinancialSummary(
  incomeAmounts: number[],
  expenseAmounts: number[]
): { totalIncome: number; totalExpenses: number; netBalance: number } {
  const totalIncome = roundToTwoDecimals(incomeAmounts.reduce((sum, val) => sum + (val || 0), 0));
  const totalExpenses = roundToTwoDecimals(expenseAmounts.reduce((sum, val) => sum + (val || 0), 0));
  const netBalance = roundToTwoDecimals(totalIncome - totalExpenses);

  return {
    totalIncome,
    totalExpenses,
    netBalance,
  };
}
