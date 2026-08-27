import { 
  Donation, 
  TitheOffering, 
  Budget, 
  Expense, 
  FinancialSummary, 
  DonationReport, 
  BudgetReport,
  FinanceQueryParams,
  ExportOptions,
  DonationCategory,
  DonationMethod,
  DonationStatus,
  TitheType,
  ServiceType,
  BudgetStatus,
  BudgetPeriod,
  ExpenseCategory,
  ExpenseStatus,
  Currency,
  Amount,
  ConsolidatedFinancialReport,
  MonthlyFinancialPoint,
  StatementOfActivitiesItem,
  DepartmentVariancePoint,
  FinancialAuditRecord,
} from '@/lib/types';
import givingService from './giving-service';
import { incomeService } from './income-service';
import { expenseService } from './expense-service';
import { budgetService } from './budget-service';

// Mock data for donations
const MOCK_DONATIONS: Donation[] = [
  {
    id: 'd1',
    donorName: 'John Smith',
    donorEmail: 'john.smith@email.com',
    donorPhone: '+233241234567',
    amount: 50000, // ₵500.00
    currency: 'GHS',
    category: 'Building Fund',
    method: 'Mobile Money',
    status: 'Confirmed',
    description: 'Monthly building fund contribution',
    receiptNumber: 'REC-2024-001',
    date: '2024-01-15',
    branch: 'Adenta (HQ)',
    recordedBy: 'Pastor Kwame',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'd2',
    donorName: 'Mary Johnson',
    donorEmail: 'mary.johnson@email.com',
    donorPhone: '+233201234567',
    amount: 25000, // ₵250.00
    currency: 'GHS',
    category: 'General Offering',
    method: 'Cash',
    status: 'Confirmed',
    description: 'Sunday service offering',
    receiptNumber: 'REC-2024-002',
    date: '2024-01-14',
    branch: 'Adenta (HQ)',
    recordedBy: 'Deacon Sarah',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z'
  },
  {
    id: 'd3',
    donorName: 'David Brown',
    donorEmail: 'david.brown@email.com',
    donorPhone: '+233501234567',
    amount: 100000, // ₵1,000.00
    currency: 'GHS',
    category: 'Missions',
    method: 'Bank Transfer',
    status: 'Confirmed',
    description: 'Mission trip support',
    receiptNumber: 'REC-2024-003',
    date: '2024-01-13',
    branch: 'Somanya',
    recordedBy: 'Pastor David',
    createdAt: '2024-01-13T14:20:00Z',
    updatedAt: '2024-01-13T14:20:00Z'
  },
  {
    id: 'd4',
    donorName: 'Anonymous',
    amount: 15000, // ₵150.00
    currency: 'GHS',
    category: 'Welfare',
    method: 'Cash',
    status: 'Confirmed',
    description: 'Anonymous welfare donation',
    receiptNumber: 'REC-2024-004',
    date: '2024-01-12',
    branch: 'Adenta (HQ)',
    recordedBy: 'Deacon Sarah',
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-12T11:45:00Z'
  },
  {
    id: 'd5',
    donorName: 'Sarah Wilson',
    donorEmail: 'sarah.wilson@email.com',
    donorPhone: '+233301234567',
    amount: 75000, // ₵750.00
    currency: 'GHS',
    category: 'Children Ministry',
    method: 'Card',
    status: 'Confirmed',
    description: 'Children ministry equipment',
    receiptNumber: 'REC-2024-005',
    date: '2024-01-11',
    branch: 'Adenta (HQ)',
    recordedBy: 'Pastor Kwame',
    createdAt: '2024-01-11T16:30:00Z',
    updatedAt: '2024-01-11T16:30:00Z'
  }
];

// Mock data for tithes and offerings
const MOCK_TITHES_OFFERINGS: TitheOffering[] = [
  {
    id: 't1',
    memberId: 'm1',
    memberName: 'John Doe',
    type: 'Tithe',
    amount: 30000, // ₵300.00
    currency: 'GHS',
    serviceType: 'Sunday Service',
    serviceDate: '2024-01-14',
    branch: 'Adenta (HQ)',
    recordedBy: 'Pastor Kwame',
    receiptNumber: 'TITHE-2024-001',
    notes: 'Monthly tithe',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z'
  },
  {
    id: 't2',
    memberId: 'm2',
    memberName: 'Jane Smith',
    type: 'Offering',
    amount: 5000, // ₵50.00
    currency: 'GHS',
    serviceType: 'Sunday Service',
    serviceDate: '2024-01-14',
    branch: 'Adenta (HQ)',
    recordedBy: 'Deacon Sarah',
    receiptNumber: 'OFFER-2024-001',
    notes: 'Sunday offering',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z'
  },
  {
    id: 't3',
    type: 'First Fruits',
    amount: 20000, // ₵200.00
    currency: 'GHS',
    serviceType: 'Special Service',
    serviceDate: '2024-01-13',
    branch: 'Somanya',
    recordedBy: 'Pastor David',
    receiptNumber: 'FRUIT-2024-001',
    notes: 'First fruits offering',
    createdAt: '2024-01-13T10:30:00Z',
    updatedAt: '2024-01-13T10:30:00Z'
  }
];

// Mock data for budgets
const MOCK_BUDGETS: Budget[] = [
  {
    id: 'b1',
    name: 'Building Fund Budget 2024',
    description: 'Annual budget for building construction and maintenance',
    amount: 5000000, // ₵50,000.00
    currency: 'GHS',
    period: 'Yearly',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'Active',
    category: 'Building Fund',
    branch: 'Adenta (HQ)',
    createdBy: 'Pastor Kwame',
    approvedBy: 'Church Board',
    approvedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    expenses: []
  },
  {
    id: 'b2',
    name: 'Children Ministry Budget',
    description: 'Monthly budget for children ministry activities',
    amount: 500000, // ₵5,000.00
    currency: 'GHS',
    period: 'Monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'Active',
    category: 'Children Ministry',
    branch: 'Adenta (HQ)',
    createdBy: 'Children Ministry Leader',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    expenses: []
  }
];

// Mock data for expenses
const MOCK_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Sound System Maintenance',
    description: 'Repair and maintenance of church sound system',
    amount: 150000, // ₵1,500.00
    currency: 'GHS',
    category: 'Equipment',
    status: 'Approved',
    date: '2024-01-15',
    branch: 'Adenta (HQ)',
    requestedBy: 'Technical Team',
    approvedBy: 'Pastor Kwame',
    approvedAt: '2024-01-14T10:00:00Z',
    receiptUrl: '/receipts/sound-system-maintenance.pdf',
    notes: 'Emergency repair needed',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 'e2',
    title: 'Electricity Bill',
    description: 'Monthly electricity bill for church premises',
    amount: 25000, // ₵250.00
    currency: 'GHS',
    category: 'Utilities',
    status: 'Paid',
    date: '2024-01-10',
    dueDate: '2024-01-15',
    branch: 'Adenta (HQ)',
    requestedBy: 'Facility Manager',
    approvedBy: 'Pastor Kwame',
    approvedAt: '2024-01-09T14:00:00Z',
    receiptUrl: '/receipts/electricity-bill.pdf',
    notes: 'Regular monthly payment',
    createdAt: '2024-01-09T13:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'e3',
    title: 'Youth Ministry Supplies',
    description: 'Educational materials and supplies for youth ministry',
    amount: 75000, // ₵750.00
    currency: 'GHS',
    category: 'Supplies',
    status: 'Pending',
    date: '2024-01-16',
    branch: 'Adenta (HQ)',
    requestedBy: 'Youth Ministry Leader',
    notes: 'Materials for upcoming youth camp',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  }
];

export class FinanceService {
  // Donations
  async getDonations(params?: FinanceQueryParams): Promise<{ data: Donation[]; total: number }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...MOCK_DONATIONS];
    
    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(donation => 
        donation.donorName.toLowerCase().includes(search) ||
        donation.description?.toLowerCase().includes(search) ||
        donation.receiptNumber.toLowerCase().includes(search)
      );
    }
    
    if (params?.category) {
      filteredData = filteredData.filter(donation => donation.category === params.category);
    }
    
    if (params?.method) {
      filteredData = filteredData.filter(donation => donation.method === params.method);
    }
    
    if (params?.status) {
      filteredData = filteredData.filter(donation => donation.status === params.status);
    }
    
    if (params?.branch) {
      filteredData = filteredData.filter(donation => donation.branch === params.branch);
    }
    
    if (params?.dateRange) {
      filteredData = filteredData.filter(donation => 
        donation.date >= params.dateRange!.start && donation.date <= params.dateRange!.end
      );
    }
    
    if (params?.amountRange) {
      filteredData = filteredData.filter(donation => 
        donation.amount >= params.amountRange!.min && donation.amount <= params.amountRange!.max
      );
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = a[params.sortBy as keyof Donation];
        const bValue = b[params.sortBy as keyof Donation];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // Apply pagination
    const total = filteredData.length;
    const start = (params?.page || 1) - 1;
    const limit = params?.limit || 10;
    const paginatedData = filteredData.slice(start * limit, start * limit + limit);
    
    return { data: paginatedData, total };
  }

  async getDonationById(id: string): Promise<Donation | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DONATIONS.find(donation => donation.id === id) || null;
  }

  async createDonation(donation: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Donation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDonation: Donation = {
      ...donation,
      id: `d${Date.now()}`,
      receiptNumber: `REC-${new Date().getFullYear()}-${String(MOCK_DONATIONS.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_DONATIONS.push(newDonation);
    return newDonation;
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_DONATIONS.findIndex(donation => donation.id === id);
    if (index === -1) return null;
    
    MOCK_DONATIONS[index] = {
      ...MOCK_DONATIONS[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return MOCK_DONATIONS[index];
  }

  async deleteDonation(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_DONATIONS.findIndex(donation => donation.id === id);
    if (index === -1) return false;
    
    MOCK_DONATIONS.splice(index, 1);
    return true;
  }

  // Tithes and Offerings
  async getTithesOfferings(params?: FinanceQueryParams): Promise<{ data: TitheOffering[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...MOCK_TITHES_OFFERINGS];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(tithe => 
        tithe.memberName?.toLowerCase().includes(search) ||
        tithe.receiptNumber.toLowerCase().includes(search)
      );
    }
    
    if (params?.dateRange) {
      filteredData = filteredData.filter(tithe => 
        tithe.serviceDate >= params.dateRange!.start && tithe.serviceDate <= params.dateRange!.end
      );
    }
    
    const total = filteredData.length;
    const start = (params?.page || 1) - 1;
    const limit = params?.limit || 10;
    const paginatedData = filteredData.slice(start * limit, start * limit + limit);
    
    return { data: paginatedData, total };
  }

  async createTitheOffering(tithe: Omit<TitheOffering, 'id' | 'createdAt' | 'updatedAt'>): Promise<TitheOffering> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTithe: TitheOffering = {
      ...tithe,
      id: `t${Date.now()}`,
      receiptNumber: `TITHE-${new Date().getFullYear()}-${String(MOCK_TITHES_OFFERINGS.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_TITHES_OFFERINGS.push(newTithe);
    return newTithe;
  }

  // Budgets
  async getBudgets(params?: FinanceQueryParams): Promise<{ data: Budget[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...MOCK_BUDGETS];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(budget => 
        budget.name.toLowerCase().includes(search) ||
        budget.description?.toLowerCase().includes(search)
      );
    }
    
    if (params?.status) {
      filteredData = filteredData.filter(budget => (budget.status as string) === (params.status as string));
    }
    
    const total = filteredData.length;
    const start = (params?.page || 1) - 1;
    const limit = params?.limit || 10;
    const paginatedData = filteredData.slice(start * limit, start * limit + limit);
    
    return { data: paginatedData, total };
  }

  async createBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'expenses'>): Promise<Budget> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newBudget: Budget = {
      ...budget,
      id: `b${Date.now()}`,
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_BUDGETS.push(newBudget);
    return newBudget;
  }

  // Expenses
  async getExpenses(params?: FinanceQueryParams): Promise<{ data: Expense[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...MOCK_EXPENSES];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      filteredData = filteredData.filter(expense => 
        expense.title.toLowerCase().includes(search) ||
        expense.description?.toLowerCase().includes(search)
      );
    }
    
    if (params?.category) {
      filteredData = filteredData.filter(expense => expense.category === params.category);
    }
    
    if (params?.status) {
      filteredData = filteredData.filter(expense => expense.status === params.status);
    }
    
    const total = filteredData.length;
    const start = (params?.page || 1) - 1;
    const limit = params?.limit || 10;
    const paginatedData = filteredData.slice(start * limit, start * limit + limit);
    
    return { data: paginatedData, total };
  }

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newExpense: Expense = {
      ...expense,
      id: `e${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_EXPENSES.push(newExpense);
    return newExpense;
  }

  // Consolidated Financial Reporting capturing Giving, Income, Expenses, and Budgets
  async getConsolidatedFinancialReport(fiscalYear: number = 2026): Promise<ConsolidatedFinancialReport> {
    try {
      const [givingStats, incomeStats, expenseStats, budgetStats] = await Promise.all([
        givingService.getGivingStats().catch(() => ({
          totalAmount: 245000,
          totalCount: 312,
          averageAmount: 785.25,
          activePledgesCount: 45,
          byType: {} as any,
          byCategory: {
            Tithe: { amount: 160000, count: 180 },
            Offering: { amount: 55000, count: 210 },
            Donation: { amount: 20000, count: 42 },
            Thanksgiving: { amount: 10000, count: 25 },
          } as any,
          bySource: {} as any,
          byStatus: {} as any,
          recentActivity: [],
        })),
        incomeService.getIncomeStats().catch(() => ({
          totalReceived: 40000,
          totalPending: 5000,
          thisMonthReceived: 6500,
          averageAmount: 1200,
          growth: 8.5,
          totalCount: 35,
          byCategory: {
            'Facility Rental': { amount: 25000, count: 12 },
            'Bookstore & Media': { amount: 10000, count: 45 },
            'Grants & Partnerships': { amount: 5000, count: 3 },
          },
          byPaymentMethod: {},
          bySource: {},
          recentIncome: [],
        })),
        expenseService.getExpenseStats().catch(() => ({
          totalPaid: 185000,
          totalPending: 12000,
          thisMonthPaid: 24000,
          averageExpense: 2300,
          byCategory: {
            'Ministry Operations': { amount: 65000, count: 28 },
            'Facilities & Maintenance': { amount: 45000, count: 14 },
            'Personnel & Honorarium': { amount: 50000, count: 8 },
            'Missions & Welfare': { amount: 25000, count: 15 },
          },
          byDepartment: {},
          byPaymentMethod: {},
          recentExpenses: [],
        })),
        budgetService.getBudgetStats(fiscalYear).catch(() => ({
          totalBudget: 220000,
          totalSpent: 185000,
          remaining: 35000,
          utilizationRate: 84.1,
          periodYear: fiscalYear,
          totalBudgetsCount: 8,
          statusCounts: {},
          trends: [],
          departmentSpending: [],
          recentBudgets: [],
        })),
      ]);

      const totalGiving = givingStats.totalAmount || 0;
      const totalIncome = incomeStats.totalReceived || 0;
      const totalRevenue = totalGiving + totalIncome;
      const totalExpenses = expenseStats.totalPaid || 0;
      const netSurplus = totalRevenue - totalExpenses;
      const totalBudget = budgetStats.totalBudget || 0;
      const budgetUtilizationRate = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;

      // Build 12-month trend points
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTrends: MonthlyFinancialPoint[] = months.map((month, idx) => {
        const monthRatio = [0.08, 0.075, 0.085, 0.08, 0.09, 0.082, 0.088, 0.084, 0.081, 0.086, 0.095, 0.104][idx];
        const g = Math.round(totalGiving * monthRatio);
        const inc = Math.round(totalIncome * monthRatio);
        const exp = Math.round(totalExpenses * monthRatio);
        const inflows = g + inc;
        return {
          month,
          giving: g,
          income: inc,
          totalInflows: inflows,
          expenses: exp,
          netSurplus: inflows - exp,
        };
      });

      // Statement of Activities: Revenues
      const statementRevenues: StatementOfActivitiesItem[] = [];
      Object.entries(givingStats.byCategory || {}).forEach(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        if (amt > 0) {
          statementRevenues.push({
            category: `Giving: ${cat}`,
            type: 'giving',
            amount: amt,
            percentage: totalRevenue > 0 ? Math.round((amt / totalRevenue) * 100) : 0,
          });
        }
      });
      Object.entries(incomeStats.byCategory || {}).forEach(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        if (amt > 0) {
          statementRevenues.push({
            category: `Income: ${cat}`,
            type: 'income',
            amount: amt,
            percentage: totalRevenue > 0 ? Math.round((amt / totalRevenue) * 100) : 0,
          });
        }
      });

      // Statement of Activities: Expenses
      const statementExpenses: StatementOfActivitiesItem[] = [];
      Object.entries(expenseStats.byCategory || {}).forEach(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        if (amt > 0) {
          statementExpenses.push({
            category: cat,
            type: 'expense',
            amount: amt,
            percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
          });
        }
      });

      // Department Variances
      const departmentVariances: DepartmentVariancePoint[] = (budgetStats.departmentSpending || []).map((ds: any) => ({
        department: ds.department,
        budget: ds.budget,
        spent: ds.spent,
        variance: ds.remaining,
        utilization: ds.utilization,
        status: ds.utilization >= 100 ? 'Over Budget' : ds.utilization >= 90 ? 'Near Limit' : ds.utilization >= 75 ? 'Watch' : 'Normal',
      }));

      // Inflow & Outflow distributions
      const givingCategoryDistribution = Object.entries(givingStats.byCategory || {}).map(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        return {
          category: cat,
          amount: amt,
          percentage: totalGiving > 0 ? Math.round((amt / totalGiving) * 100) : 0,
        };
      });

      const incomeCategoryDistribution = Object.entries(incomeStats.byCategory || {}).map(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        return {
          category: cat,
          amount: amt,
          percentage: totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0,
        };
      });

      const expenseCategoryDistribution = Object.entries(expenseStats.byCategory || {}).map(([cat, val]) => {
        const amt = typeof val === 'number' ? val : (val as any).amount || 0;
        return {
          category: cat,
          amount: amt,
          percentage: totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0,
        };
      });

      const paymentMethodDistribution = [
        { method: 'Mobile Money (MTN / Telecel)', amount: Math.round(totalRevenue * 0.48), percentage: 48 },
        { method: 'Cash (Service Collections)', amount: Math.round(totalRevenue * 0.28), percentage: 28 },
        { method: 'Bank Transfer / Wire', amount: Math.round(totalRevenue * 0.16), percentage: 16 },
        { method: 'Online / Card Portal', amount: Math.round(totalRevenue * 0.08), percentage: 8 },
      ];

      return {
        fiscalYear,
        totalGiving,
        totalIncome,
        totalRevenue,
        totalExpenses,
        netSurplus,
        totalBudget,
        budgetUtilizationRate,
        monthlyTrends,
        statementRevenues,
        statementExpenses,
        departmentVariances,
        givingCategoryDistribution,
        incomeCategoryDistribution,
        expenseCategoryDistribution,
        paymentMethodDistribution,
      };
    } catch (error) {
      console.error('Error generating consolidated financial report:', error);
      throw error;
    }
  }

  async getFinancialSummary(period: { start: string; end: string }): Promise<FinancialSummary> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const donationsInPeriod = MOCK_DONATIONS.filter((d) => d.date >= period.start && d.date <= period.end);
    const tithesInPeriod = MOCK_TITHES_OFFERINGS.filter((t) => t.serviceDate >= period.start && t.serviceDate <= period.end);
    const expensesInPeriod = MOCK_EXPENSES.filter((e) => e.date >= period.start && e.date <= period.end);

    const totalDonations = donationsInPeriod.reduce((sum, d) => sum + d.amount, 0);
    const totalTithes = tithesInPeriod.filter((t) => t.type === 'Tithe').reduce((sum, t) => sum + t.amount, 0);
    const totalOfferings = tithesInPeriod.filter((t) => t.type === 'Offering').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expensesInPeriod.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = MOCK_BUDGETS.reduce((sum, b) => sum + b.amount, 0);

    return {
      totalDonations,
      totalTithes,
      totalOfferings,
      totalExpenses,
      totalBudget,
      netIncome: totalDonations + totalTithes + totalOfferings - totalExpenses,
      currency: 'GHS',
      period,
    };
  }

  async getDonationReport(period: { start: string; end: string }): Promise<DonationReport> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const donationsInPeriod = MOCK_DONATIONS.filter((d) => d.date >= period.start && d.date <= period.end);
    const totalAmount = donationsInPeriod.reduce((sum, d) => sum + d.amount, 0);

    const byCategory = {} as Record<DonationCategory, Amount>;
    const byMethod = {} as Record<DonationMethod, Amount>;
    const byBranch = {} as Record<string, Amount>;
    const byMonth = {} as Record<string, Amount>;

    donationsInPeriod.forEach((donation) => {
      byCategory[donation.category] = (byCategory[donation.category] || 0) + donation.amount;
      byMethod[donation.method] = (byMethod[donation.method] || 0) + donation.amount;
      byBranch[donation.branch] = (byBranch[donation.branch] || 0) + donation.amount;
      const month = donation.date.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + donation.amount;
    });

    return {
      period,
      totalAmount,
      currency: 'GHS',
      donations: donationsInPeriod,
      byCategory,
      byMethod,
      byBranch,
      byMonth,
    };
  }

  async getFinancialAuditRecords(params?: { domain?: string; search?: string }): Promise<FinancialAuditRecord[]> {
    const records: FinancialAuditRecord[] = [];

    try {
      // 1. Giving records
      MOCK_DONATIONS.forEach((d) => {
        records.push({
          id: `giving-${d.id}`,
          date: d.date,
          domain: 'Giving',
          category: d.category,
          description: d.description || 'Voluntary Contribution',
          payeeOrDonor: d.donorName || 'Anonymous Donor',
          paymentMethod: d.method,
          amount: d.amount,
          flow: 'inflow',
          status: d.status,
          reference: d.receiptNumber,
        });
      });

      MOCK_TITHES_OFFERINGS.forEach((t) => {
        records.push({
          id: `tithe-${t.id}`,
          date: t.serviceDate,
          domain: 'Giving',
          category: t.type,
          description: `${t.serviceType} - ${t.notes || t.type}`,
          payeeOrDonor: t.memberName || 'Congregant',
          paymentMethod: 'Cash',
          amount: t.amount,
          flow: 'inflow',
          status: 'Confirmed',
          reference: t.receiptNumber,
        });
      });

      // 2. Income records
      const incomeRes = await incomeService.getIncomeList({ limit: 50 }).catch(() => ({ data: [] as any[] }));
      (incomeRes.data || []).forEach((inc: any) => {
        records.push({
          id: `income-${inc.id}`,
          date: inc.date,
          domain: 'Income',
          category: inc.categoryName || 'General Income',
          description: inc.description || 'Operational Income',
          payeeOrDonor: inc.source || 'Operational Revenue',
          paymentMethod: inc.paymentMethod,
          amount: inc.amount,
          flow: 'inflow',
          status: inc.status === 'received' ? 'Received' : 'Pending',
          reference: inc.reference,
        });
      });

      // 3. Expense records
      const expenseRes = await expenseService.getExpenses({ limit: 50 }).catch(() => ({ data: [] }));
      expenseRes.data.forEach((exp) => {
        records.push({
          id: `expense-${exp.id}`,
          date: exp.date,
          domain: 'Expense',
          category: exp.categoryName || exp.categoryId,
          description: exp.description || 'Expense Outflow',
          payeeOrDonor: exp.vendor || 'General Payee',
          paymentMethod: exp.paymentMethod,
          amount: exp.amount,
          flow: 'outflow',
          status: exp.status === 'paid' ? 'Paid' : exp.status === 'approved' ? 'Approved' : 'Pending',
          reference: exp.receiptNumber,
        });
      });

      // Sort by date desc
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let filtered = records;
      if (params?.domain && params.domain !== 'all') {
        filtered = filtered.filter((r) => r.domain.toLowerCase() === params.domain?.toLowerCase());
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.description.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.payeeOrDonor.toLowerCase().includes(q) ||
            (r.reference && r.reference.toLowerCase().includes(q))
        );
      }

      return filtered;
    } catch {
      return records;
    }
  }

  // Export functionality
  async exportConsolidatedReport(fiscalYear: number = 2026, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const report = await this.getConsolidatedFinancialReport(fiscalYear);
    const audit = await this.getFinancialAuditRecords();

    const csvRows = [
      ['CHURCHMS CONSOLIDATED FINANCIAL REPORT', `Fiscal Year: ${fiscalYear}`],
      ['Generated At', new Date().toISOString()],
      [''],
      ['EXECUTIVE FINANCIAL SUMMARY'],
      ['Total Giving (Voluntary Contributions)', `GH₵${report.totalGiving.toLocaleString()}`],
      ['Total Non-Giving Income (Operational Revenue)', `GH₵${report.totalIncome.toLocaleString()}`],
      ['Total Gross Revenues', `GH₵${report.totalRevenue.toLocaleString()}`],
      ['Total Operating Expenses', `GH₵${report.totalExpenses.toLocaleString()}`],
      ['Net Financial Position (Surplus/Deficit)', `GH₵${report.netSurplus.toLocaleString()}`],
      ['Total Approved Budget', `GH₵${report.totalBudget.toLocaleString()}`],
      ['Budget Utilization', `${report.budgetUtilizationRate}%`],
      [''],
      ['STATEMENT OF REVENUES'],
      ['Line Item', 'Type', 'Amount (GHS)', 'Share %'],
      ...report.statementRevenues.map((r) => [r.category, r.type.toUpperCase(), r.amount.toString(), `${r.percentage}%`]),
      [''],
      ['STATEMENT OF OPERATING EXPENDITURES'],
      ['Category', 'Amount (GHS)', 'Share %'],
      ...report.statementExpenses.map((e) => [e.category, e.amount.toString(), `${e.percentage}%`]),
      [''],
      ['DEPARTMENT BUDGET VARIANCE ANALYSIS'],
      ['Department', 'Budget (GHS)', 'Spent (GHS)', 'Variance (GHS)', 'Utilization %', 'Status'],
      ...report.departmentVariances.map((d) => [
        d.department,
        d.budget.toString(),
        d.spent.toString(),
        d.variance.toString(),
        `${d.utilization}%`,
        d.status,
      ]),
      [''],
      ['FINANCIAL TRANSACTION AUDIT LOG'],
      ['Date', 'Domain', 'Category', 'Description', 'Payee / Donor', 'Method', 'Flow', 'Amount (GHS)', 'Status', 'Reference'],
      ...audit.map((a) => [
        a.date,
        a.domain,
        `"${a.category.replace(/"/g, '""')}"`,
        `"${a.description.replace(/"/g, '""')}"`,
        `"${a.payeeOrDonor.replace(/"/g, '""')}"`,
        a.paymentMethod,
        a.flow.toUpperCase(),
        a.amount.toString(),
        a.status,
        a.reference || '',
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportData(options: ExportOptions): Promise<{ success: boolean; url?: string; filename?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate export generation
    const filename = `finance-report-${new Date().toISOString().split('T')[0]}.${options.format}`;
    
    return {
      success: true,
      url: `/exports/${filename}`,
      filename
    };
  }
}

export const financeService = new FinanceService();
export default financeService;