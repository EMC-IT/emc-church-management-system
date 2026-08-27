import apiClient from './api-client';
import {
  BudgetRecord,
  BudgetAllocation,
  BudgetCategory,
  BudgetFormData,
  BudgetSearchParams,
  BudgetAnalytics,
  BudgetStatus,
  BudgetListResponse,
  BudgetResponse,
} from '@/lib/types';

// Default budget categories aligned with church operational structure
const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'bcat_ministry',
    name: 'Ministry Operations',
    description: 'Day-to-day departmental ministry programs, materials, and activities',
    color: '#2E8DB0',
    budgetCount: 8,
    totalBudget: 125000,
    status: 'Active',
    createdAt: '2024-01-15T00:00:00Z',
    lastUsed: '2026-01-15',
  },
  {
    id: 'bcat_events',
    name: 'Events & Programs',
    description: 'Conferences, revivals, annual conventions, and seasonal services',
    color: '#28ACD1',
    budgetCount: 6,
    totalBudget: 85000,
    status: 'Active',
    createdAt: '2024-01-15T00:00:00Z',
    lastUsed: '2026-01-14',
  },
  {
    id: 'bcat_facilities',
    name: 'Building & Facilities',
    description: 'Building maintenance, capital projects, utilities, and infrastructure repairs',
    color: '#C49831',
    budgetCount: 4,
    totalBudget: 180000,
    status: 'Active',
    createdAt: '2024-02-01T00:00:00Z',
    lastUsed: '2026-01-10',
  },
  {
    id: 'bcat_missions',
    name: 'Missions & Outreach',
    description: 'Rural mission stations, church planting grants, evangelism, and charity',
    color: '#A5CF5D',
    budgetCount: 5,
    totalBudget: 95000,
    status: 'Active',
    createdAt: '2024-01-20T00:00:00Z',
    lastUsed: '2026-01-08',
  },
  {
    id: 'bcat_equipment',
    name: 'Equipment & Technology',
    description: 'Sound equipment, media live-streaming hardware, and IT infrastructure',
    color: '#8B5CF6',
    budgetCount: 4,
    totalBudget: 65000,
    status: 'Active',
    createdAt: '2024-02-10T00:00:00Z',
    lastUsed: '2026-01-07',
  },
  {
    id: 'bcat_admin',
    name: 'Administration & Office',
    description: 'Office supplies, printing, communications, insurance, and banking services',
    color: '#6B7280',
    budgetCount: 5,
    totalBudget: 42000,
    status: 'Active',
    createdAt: '2024-01-25T00:00:00Z',
    lastUsed: '2026-01-12',
  },
];

// Helper to determine status based on utilization thresholds
export function calculateBudgetStatus(spent: number, amount: number): BudgetStatus {
  if (amount <= 0) return 'Active';
  const rate = (spent / amount) * 100;
  if (rate >= 100) return 'Over Budget';
  if (rate >= 90) return 'Near Limit';
  if (rate >= 75) return 'Watch';
  return 'Active';
}

// Initial realistic budget records with department allocations and spending
const DEFAULT_BUDGETS: BudgetRecord[] = [
  {
    id: '1',
    name: '2026 Worship Ministry Budget',
    description: 'Audio/visual equipment maintenance, music licensing, and worship conferences',
    amount: 15000,
    spent: 12500,
    currency: 'GHS',
    period: 'Jan 1 – Dec 31, 2026',
    periodYear: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    categoryId: 'bcat_ministry',
    categoryName: 'Ministry Operations',
    department: 'Worship Ministry',
    departmentId: 'dept_worship',
    departmentName: 'Worship Ministry',
    owner: 'Sarah Johnson (Music Director)',
    status: 'Watch', // 83%
    priority: 'High',
    allocations: [
      { id: 'a1', department: 'Main Auditorium Audio', allocatedAmount: 8000, spentAmount: 7200, percentage: 53 },
      { id: 'a2', department: 'Music Licensing & Scores', allocatedAmount: 4000, spentAmount: 3500, percentage: 27 },
      { id: 'a3', department: 'Worship Team Training', allocatedAmount: 3000, spentAmount: 1800, percentage: 20 },
    ],
    notes: 'Sound equipment upgrade approved for Q2',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: '2026 Youth Ministry Budget',
    description: 'Youth camps, mentorship programs, evangelism, and study resources',
    amount: 10000,
    spent: 7500,
    currency: 'GHS',
    period: 'Jan 1 – Dec 31, 2026',
    periodYear: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    categoryId: 'bcat_ministry',
    categoryName: 'Ministry Operations',
    department: 'Youth Ministry',
    departmentId: 'dept_youth',
    departmentName: 'Youth Ministry',
    owner: 'Michael Brown (Youth Pastor)',
    status: 'Active', // 75%
    priority: 'Medium',
    allocations: [
      { id: 'a4', department: 'Annual Youth Camp', allocatedAmount: 5000, spentAmount: 4000, percentage: 50 },
      { id: 'a5', department: 'Weekly Youth Fellowships', allocatedAmount: 3000, spentAmount: 2300, percentage: 30 },
      { id: 'a6', department: 'Campus Outreach', allocatedAmount: 2000, spentAmount: 1200, percentage: 20 },
    ],
    notes: 'Camp registration begins in May',
    createdAt: '2026-01-01T08:30:00Z',
    updatedAt: '2026-01-12T11:00:00Z',
  },
  {
    id: '3',
    name: '2026 Missions & Outreach Budget',
    description: 'Rural mission station subsidies, missionary allowances, and community relief',
    amount: 25000,
    spent: 23000,
    currency: 'GHS',
    period: 'Jan 1 – Dec 31, 2026',
    periodYear: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    categoryId: 'bcat_missions',
    categoryName: 'Missions & Outreach',
    department: 'Missions Department',
    departmentId: 'dept_missions',
    departmentName: 'Missions Department',
    owner: 'David Wilson (Missions Coordinator)',
    status: 'Near Limit', // 92%
    priority: 'High',
    allocations: [
      { id: 'a7', department: 'Rural Church Planting', allocatedAmount: 12000, spentAmount: 11500, percentage: 48 },
      { id: 'a8', department: 'Missionary Monthly Support', allocatedAmount: 8000, spentAmount: 7500, percentage: 32 },
      { id: 'a9', department: 'Community Relief & Medical', allocatedAmount: 5000, spentAmount: 4000, percentage: 20 },
    ],
    notes: 'Somanya and Volta mission stations',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-08T09:30:00Z',
  },
  {
    id: '4',
    name: '2026 Facilities & Maintenance Budget',
    description: 'Power (ECG), water utility, roof maintenance, security lights, and sanitation',
    amount: 20000,
    spent: 15000,
    currency: 'GHS',
    period: 'Jan 1 – Dec 31, 2026',
    periodYear: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    categoryId: 'bcat_facilities',
    categoryName: 'Building & Facilities',
    department: 'Facilities Management',
    departmentId: 'dept_facilities',
    departmentName: 'Facilities Management',
    owner: 'Robert Taylor (Facilities Manager)',
    status: 'Active', // 75%
    priority: 'High',
    allocations: [
      { id: 'a10', department: 'Utilities (ECG & Water)', allocatedAmount: 9000, spentAmount: 7000, percentage: 45 },
      { id: 'a11', department: 'Structural Repairs & Painting', allocatedAmount: 6000, spentAmount: 4800, percentage: 30 },
      { id: 'a12', department: 'Compound Cleaning & Sanitation', allocatedAmount: 5000, spentAmount: 3200, percentage: 25 },
    ],
    notes: 'Routine generator and electrical servicing',
    createdAt: '2026-01-01T09:30:00Z',
    updatedAt: '2026-01-14T16:00:00Z',
  },
  {
    id: '5',
    name: '2026 Children Ministry Budget',
    description: 'Sunday school curriculum, craft materials, teacher training, and children rallies',
    amount: 8000,
    spent: 5200,
    currency: 'GHS',
    period: 'Jan 1 – Dec 31, 2026',
    periodYear: 2026,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    categoryId: 'bcat_ministry',
    categoryName: 'Ministry Operations',
    department: 'Children Ministry',
    departmentId: 'dept_children',
    departmentName: 'Children Ministry',
    owner: 'Emily Davis (Children Director)',
    status: 'Active', // 65%
    priority: 'Medium',
    allocations: [
      { id: 'a13', department: 'Sunday School Literature', allocatedAmount: 4000, spentAmount: 2600, percentage: 50 },
      { id: 'a14', department: 'Crafts & Activity Supplies', allocatedAmount: 2500, spentAmount: 1700, percentage: 31 },
      { id: 'a15', department: 'Teacher Appreciation & Training', allocatedAmount: 1500, spentAmount: 900, percentage: 19 },
    ],
    notes: 'Curriculum sourced for terms 1 to 3',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-05T12:00:00Z',
  },
];

class BudgetService {
  private budgets: BudgetRecord[] = [...DEFAULT_BUDGETS];
  private categories: BudgetCategory[] = [...DEFAULT_BUDGET_CATEGORIES];

  // ─── BUDGET RECORDS ────────────────────────────────────────────────────────

  async getBudgets(params: BudgetSearchParams = {}): Promise<BudgetListResponse> {
    try {
      const response = await apiClient.get('/budgets', { params });
      return response.data;
    } catch {
      let filtered = [...this.budgets];

      const periodYear = params.periodYear ? Number(params.periodYear) : 2026;
      filtered = filtered.filter((b) => b.periodYear === periodYear);

      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((b) => b.status.toLowerCase() === params.status?.toLowerCase());
      }

      if (params.department && params.department !== 'all') {
        filtered = filtered.filter(
          (b) => b.department.toLowerCase().includes(params.department!.toLowerCase()) ||
                 b.departmentName?.toLowerCase().includes(params.department!.toLowerCase())
        );
      }

      if (params.categoryId && params.categoryId !== 'all') {
        filtered = filtered.filter((b) => b.categoryId === params.categoryId);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.department.toLowerCase().includes(q) ||
            (b.categoryName && b.categoryName.toLowerCase().includes(q)) ||
            b.owner.toLowerCase().includes(q) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
      }

      // Update statuses based on dynamic thresholds
      filtered.forEach((b) => {
        if (b.status !== 'Draft' && b.status !== 'Archived' && b.status !== 'Completed') {
          b.status = calculateBudgetStatus(b.spent, b.amount);
        }
      });

      const total = filtered.length;
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;

      return {
        data: filtered.slice(start, start + limit),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  async getBudgetById(id: string): Promise<BudgetRecord> {
    try {
      const response = await apiClient.get(`/budgets/${id}`);
      return response.data;
    } catch {
      const found = this.budgets.find((b) => b.id === id);
      if (!found) throw new Error('Budget not found');
      return {
        ...found,
        status: found.status !== 'Draft' && found.status !== 'Archived' && found.status !== 'Completed'
          ? calculateBudgetStatus(found.spent, found.amount)
          : found.status,
      };
    }
  }

  async createBudget(data: BudgetFormData): Promise<BudgetResponse> {
    try {
      const response = await apiClient.post('/budgets', data);
      return response.data;
    } catch {
      const category = this.categories.find((c) => c.id === data.category);
      const periodYear = data.periodYear || (data.startDate ? new Date(data.startDate).getFullYear() : 2026);

      const newBudget: BudgetRecord = {
        id: String(Date.now()),
        name: data.name,
        description: data.description || '',
        amount: Number(data.amount),
        spent: 0,
        currency: data.currency || 'GHS',
        period: data.period || `${periodYear} Annual Budget`,
        periodYear,
        startDate: data.startDate,
        endDate: data.endDate,
        categoryId: data.category,
        categoryName: category?.name || 'General Ministry',
        department: data.department,
        departmentName: data.department,
        owner: data.owner,
        status: data.status || 'Active',
        priority: (data.priority as any) || 'Medium',
        allocations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.budgets.unshift(newBudget);

      if (category) {
        category.budgetCount = (category.budgetCount || 0) + 1;
        category.totalBudget = (category.totalBudget || 0) + Number(data.amount);
        category.lastUsed = new Date().toISOString().split('T')[0];
      }

      return { data: newBudget, message: 'Budget created successfully' };
    }
  }

  async updateBudget(id: string, data: Partial<BudgetFormData>): Promise<BudgetResponse> {
    try {
      const response = await apiClient.put(`/budgets/${id}`, data);
      return response.data;
    } catch {
      const idx = this.budgets.findIndex((b) => b.id === id);
      if (idx === -1) throw new Error('Budget not found');

      const existing = this.budgets[idx];
      const category = data.category ? this.categories.find((c) => c.id === data.category) : undefined;

      const updated: BudgetRecord = {
        ...existing,
        ...data,
        amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
        categoryName: category?.name || existing.categoryName,
        status: data.status || existing.status,
        updatedAt: new Date().toISOString(),
      };

      this.budgets[idx] = updated;
      return { data: updated, message: 'Budget updated successfully' };
    }
  }

  async deleteBudget(id: string): Promise<void> {
    try {
      await apiClient.delete(`/budgets/${id}`);
    } catch {
      this.budgets = this.budgets.filter((b) => b.id !== id);
    }
  }

  async duplicateBudget(id: string): Promise<BudgetResponse> {
    const existing = await this.getBudgetById(id);
    const duplicated: BudgetFormData = {
      name: `${existing.name} (Copy)`,
      amount: existing.amount,
      currency: existing.currency,
      category: existing.categoryId || 'bcat_ministry',
      department: existing.department,
      period: existing.period,
      periodYear: existing.periodYear,
      startDate: existing.startDate,
      endDate: existing.endDate,
      owner: existing.owner,
      description: existing.description,
      priority: existing.priority || 'Medium',
      status: 'Draft',
    };
    return this.createBudget(duplicated);
  }

  async archiveBudget(id: string): Promise<BudgetResponse> {
    return this.updateBudget(id, { status: 'Archived' });
  }

  // ─── PERIOD-AWARE ANALYTICS & KPIS ─────────────────────────────────────────

  async getAvailableYears(): Promise<number[]> {
    const years = Array.from(new Set(this.budgets.map((b) => b.periodYear || 2026)));
    if (!years.includes(2026)) years.push(2026);
    return years.sort((a, b) => b - a);
  }

  async getBudgetStats(periodYear: number | string = 2026): Promise<BudgetAnalytics> {
    try {
      const response = await apiClient.get('/budgets/stats', { params: { periodYear } });
      return response.data;
    } catch {
      const year = Number(periodYear) || 2026;
      const periodBudgets = this.budgets.filter((b) => b.periodYear === year && b.status !== 'Archived');

      const totalBudget = periodBudgets.reduce((sum, b) => sum + b.amount, 0);
      const totalSpent = periodBudgets.reduce((sum, b) => sum + b.spent, 0);
      const remaining = Math.max(0, totalBudget - totalSpent);
      
      // Safe utilization calculation: handle totalBudget = 0 safely without NaN
      const utilizationRate = totalBudget > 0 
        ? Number(((totalSpent / totalBudget) * 100).toFixed(1))
        : 0;

      const statusCounts: Record<string, number> = {
        Active: 0,
        Watch: 0,
        'Near Limit': 0,
        'Over Budget': 0,
        Completed: 0,
        Draft: 0,
      };

      periodBudgets.forEach((b) => {
        const st = calculateBudgetStatus(b.spent, b.amount);
        statusCounts[st] = (statusCounts[st] || 0) + 1;
      });

      // Monthly Trend generation
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyBudgetBase = totalBudget > 0 ? totalBudget / 12 : 6500;
      
      const trends = months.map((month, idx) => {
        const spentFactors = [0.85, 0.92, 0.88, 0.94, 0.95, 0.98, 0.90, 0.86, 0.89, 0.91, 0.93, 0.96];
        const monthlyBudget = Math.round(monthlyBudgetBase);
        const monthlySpent = Math.round(monthlyBudget * (spentFactors[idx] || 0.9));
        return {
          month,
          budget: monthlyBudget,
          spent: monthlySpent,
          remaining: Math.max(0, monthlyBudget - monthlySpent),
        };
      });

      // Department Overview breakdown
      const deptMap = new Map<string, { budget: number; spent: number }>();
      periodBudgets.forEach((b) => {
        const dept = b.department || 'General';
        const curr = deptMap.get(dept) || { budget: 0, spent: 0 };
        deptMap.set(dept, {
          budget: curr.budget + b.amount,
          spent: curr.spent + b.spent,
        });
      });

      const departmentSpending = Array.from(deptMap.entries()).map(([department, data]) => {
        const utilization = data.budget > 0 ? Number(((data.spent / data.budget) * 100).toFixed(1)) : 0;
        return {
          department,
          budget: data.budget,
          spent: data.spent,
          remaining: Math.max(0, data.budget - data.spent),
          utilization,
        };
      });

      return {
        totalBudget: totalBudget || 78000,
        totalSpent: totalSpent || 68200,
        remaining: (totalBudget ? totalBudget - totalSpent : 9800),
        utilizationRate: utilizationRate || 87.4,
        periodYear: year,
        totalBudgetsCount: periodBudgets.length,
        statusCounts,
        trends,
        departmentSpending,
        recentBudgets: periodBudgets.slice(0, 5),
      };
    }
  }

  // ─── SPENDING & ALLOCATIONS ────────────────────────────────────────────────

  async getSpendingAgainstBudget(budgetId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/budgets/${budgetId}/spending`);
      return response.data;
    } catch {
      const budget = this.budgets.find((b) => b.id === budgetId);
      if (!budget) return [];

      // Realistic transaction log against this budget
      return [
        {
          id: 'sp_1',
          date: '2026-01-14',
          description: `${budget.department} specialized vendor service`,
          amount: Math.round(budget.spent * 0.35),
          category: budget.categoryName || 'Operations',
          vendor: 'Apex Solutions Ltd',
          status: 'paid',
          receiptNumber: 'REC-2026-014',
        },
        {
          id: 'sp_2',
          date: '2026-01-10',
          description: `${budget.name} supplies and consumable procurement`,
          amount: Math.round(budget.spent * 0.25),
          category: budget.categoryName || 'Operations',
          vendor: 'Office Direct Supplies',
          status: 'paid',
          receiptNumber: 'REC-2026-009',
        },
        {
          id: 'sp_3',
          date: '2026-01-05',
          description: 'Departmental program logistics and materials',
          amount: Math.round(budget.spent * 0.20),
          category: budget.categoryName || 'Operations',
          vendor: 'City Logistics Ghana',
          status: 'paid',
          receiptNumber: 'REC-2026-002',
        },
        {
          id: 'sp_4',
          date: '2026-01-02',
          description: 'Initial quarterly allocation disbursement',
          amount: Math.round(budget.spent * 0.20),
          category: budget.categoryName || 'Operations',
          vendor: 'Branch Account Transfer',
          status: 'paid',
          receiptNumber: 'BNK-TRF-091',
        },
      ];
    }
  }

  async getAllocations(budgetId?: string): Promise<BudgetAllocation[]> {
    if (budgetId) {
      const b = this.budgets.find((item) => item.id === budgetId);
      return b?.allocations || [];
    }
    return this.budgets.flatMap((b) =>
      (b.allocations || []).map((a) => ({ ...a, budgetId: b.id }))
    );
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

  async getCategories(): Promise<{ data: BudgetCategory[]; total: number }> {
    try {
      const response = await apiClient.get('/budgets/categories');
      return response.data;
    } catch {
      return { data: this.categories, total: this.categories.length };
    }
  }

  // ─── EXPORT ────────────────────────────────────────────────────────────────

  async exportBudgets(
    params: BudgetSearchParams = {},
    format: 'pdf' | 'excel' | 'csv' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/budgets/export', {
        params: { ...params, format },
        responseType: 'blob',
      });
      return response.data;
    } catch {
      const list = await this.getBudgets({ ...params, limit: 1000 });
      const rows = [
        ['Budget Name', 'Period', 'Category', 'Department', 'Budget Amount (GHS)', 'Spent (GHS)', 'Remaining (GHS)', 'Utilization Rate', 'Status', 'Owner'],
        ...list.data.map((b) => [
          b.name,
          b.period,
          b.categoryName || '',
          b.department,
          String(b.amount),
          String(b.spent),
          String(Math.max(0, b.amount - b.spent)),
          `${b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0}%`,
          b.status,
          b.owner,
        ]),
      ];
      const csvContent = rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  }
}

export const budgetService = new BudgetService();
export default budgetService;
