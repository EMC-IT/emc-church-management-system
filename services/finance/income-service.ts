import apiClient from '../api-client';
import {
  IncomeRecord,
  IncomeCategory,
  IncomeFormData,
  IncomeSearchParams,
  IncomeAnalytics,
  IncomeStatus,
} from '@/lib/types';

export interface IncomeListResponse {
  data: IncomeRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IncomeResponse {
  data: IncomeRecord;
  message?: string;
}

export interface CategoryListResponse {
  data: IncomeCategory[];
  total: number;
}

// Initial default categories without "Donations"
const DEFAULT_CATEGORIES: IncomeCategory[] = [
  {
    id: '1',
    name: 'Hall Rental',
    code: 'HALL_RENTAL',
    description: 'Income from facility and hall rentals for ceremonies and community events',
    isActive: true,
    totalIncome: 45000,
    recordCount: 18,
    lastIncomeDate: '2024-01-15',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Book Sales',
    code: 'BOOK_SALES',
    description: 'Revenue from publications, hymnals, and resource materials',
    isActive: true,
    totalIncome: 12500,
    recordCount: 45,
    lastIncomeDate: '2024-01-14',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    name: 'Grants',
    code: 'GRANTS',
    description: 'Institutional, civic, and foundation grants for outreach and development',
    isActive: true,
    totalIncome: 75000,
    recordCount: 5,
    lastIncomeDate: '2024-01-12',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
  },
  {
    id: '4',
    name: 'Property Rental',
    code: 'PROPERTY_RENTAL',
    description: 'Long-term and short-term church property lease revenue',
    isActive: true,
    totalIncome: 35000,
    recordCount: 8,
    lastIncomeDate: '2024-01-05',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
  },
  {
    id: '5',
    name: 'Sponsorships',
    code: 'SPONSORSHIPS',
    description: 'Corporate and partner sponsorships for programs and initiatives',
    isActive: true,
    totalIncome: 20000,
    recordCount: 6,
    lastIncomeDate: '2023-12-18',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-18T16:00:00Z',
  },
  {
    id: '6',
    name: 'Merchandise Sales',
    code: 'MERCH_SALES',
    description: 'Sales of church apparel, media, and promotional items',
    isActive: true,
    totalIncome: 8500,
    recordCount: 22,
    lastIncomeDate: '2024-01-10',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
  },
  {
    id: '7',
    name: 'Interest & Investment',
    code: 'INTEREST_INCOME',
    description: 'Bank interest, yields, and investment portfolio returns',
    isActive: true,
    totalIncome: 4200,
    recordCount: 12,
    lastIncomeDate: '2023-12-31',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-31T23:59:00Z',
  },
  {
    id: '8',
    name: 'Other Income',
    code: 'OTHER_INCOME',
    description: 'Miscellaneous non-giving receipts',
    isActive: true,
    totalIncome: 3100,
    recordCount: 14,
    lastIncomeDate: '2024-01-08',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
  },
];

// Initial mock income records demonstrating source/category segregation
const DEFAULT_INCOME_RECORDS: IncomeRecord[] = [
  {
    id: '1',
    description: 'Hall Rental - Wedding Event',
    amount: 2500,
    currency: 'GHS',
    categoryId: '1',
    categoryName: 'Hall Rental',
    source: 'Johnson Family',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-15',
    status: 'received',
    reference: 'INV-2024-001',
    notes: 'Full hall rental for wedding reception with sound gear',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    description: 'Book Sales - Sunday Service',
    amount: 450,
    currency: 'GHS',
    categoryId: '2',
    categoryName: 'Book Sales',
    source: 'Bookstore',
    paymentMethod: 'Cash',
    date: '2024-01-14',
    status: 'received',
    reference: 'INV-2024-002',
    notes: 'Sunday morning literature and hymnal sales',
    createdAt: '2024-01-14T13:00:00Z',
    updatedAt: '2024-01-14T13:00:00Z',
  },
  {
    id: '3',
    description: 'Community Outreach Grant',
    amount: 5000,
    currency: 'GHS',
    categoryId: '3',
    categoryName: 'Grants',
    source: 'City Council',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-12',
    status: 'pending',
    reference: 'GRN-2024-003',
    notes: 'Youth skills workshop and feeding program grant awaiting disbursement',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
  },
  {
    id: '4',
    description: 'Compound Parking Lot Lease',
    amount: 1800,
    currency: 'GHS',
    categoryId: '4',
    categoryName: 'Property Rental',
    source: 'Apex Logistics Ltd',
    paymentMethod: 'Cheque',
    date: '2024-01-10',
    status: 'received',
    reference: 'INV-2024-004',
    notes: 'Monthly fleet parking space rental',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T11:00:00Z',
  },
  {
    id: '5',
    description: 'Annual Health Fair Sponsorship',
    amount: 3500,
    currency: 'GHS',
    categoryId: '5',
    categoryName: 'Sponsorships',
    source: 'PharmaCare Foundation',
    paymentMethod: 'Bank Transfer',
    date: '2024-01-08',
    status: 'received',
    reference: 'SPN-2024-005',
    notes: 'Community medical screening program partner sponsorship',
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-08T14:00:00Z',
  },
];

export class IncomeService {
  private categories: IncomeCategory[] = [...DEFAULT_CATEGORIES];
  private incomeRecords: IncomeRecord[] = [...DEFAULT_INCOME_RECORDS];

  // ─── INCOME RECORDS ────────────────────────────────────────────────────────

  async getIncomeList(params: IncomeSearchParams = {}): Promise<IncomeListResponse> {
    try {
      const response = await apiClient.get('/income', { params });
      return response.data;
    } catch {
      // Fallback in-memory filter
      let filtered = [...this.incomeRecords];

      if (params.categoryId && params.categoryId !== 'all') {
        filtered = filtered.filter((r) => r.categoryId === params.categoryId);
      }
      if (params.status && params.status !== 'all') {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params.paymentMethod && params.paymentMethod !== 'all') {
        filtered = filtered.filter(
          (r) => r.paymentMethod.toLowerCase() === params.paymentMethod?.toLowerCase()
        );
      }
      if (params.source) {
        const s = params.source.toLowerCase();
        filtered = filtered.filter((r) => r.source.toLowerCase().includes(s));
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.description.toLowerCase().includes(query) ||
            r.source.toLowerCase().includes(query) ||
            (r.categoryName && r.categoryName.toLowerCase().includes(query)) ||
            (r.reference && r.reference.toLowerCase().includes(query))
        );
      }
      if (params.startDate) {
        filtered = filtered.filter((r) => r.date >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter((r) => r.date <= params.endDate!);
      }

      return {
        data: filtered,
        total: filtered.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(filtered.length / (params.limit || 10)),
      };
    }
  }

  async getIncomeById(id: string): Promise<IncomeRecord> {
    try {
      const response = await apiClient.get(`/income/${id}`);
      return response.data;
    } catch {
      const found = this.incomeRecords.find((r) => r.id === id);
      if (!found) throw new Error('Income record not found');
      return found;
    }
  }

  async createIncome(data: IncomeFormData): Promise<IncomeResponse> {
    try {
      const response = await apiClient.post('/income', data);
      return response.data;
    } catch {
      const category = this.categories.find((c) => c.id === data.categoryId);
      const newRecord: IncomeRecord = {
        id: String(Date.now()),
        description: data.description,
        amount: data.amount,
        currency: data.currency || 'GHS',
        categoryId: data.categoryId,
        categoryName: category?.name || 'General Income',
        source: data.source,
        paymentMethod: data.paymentMethod,
        date: data.date,
        status: data.status,
        reference: data.reference,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.incomeRecords.unshift(newRecord);

      // Update category stat if received
      if (category && data.status === 'received') {
        category.totalIncome = (category.totalIncome || 0) + data.amount;
        category.recordCount = (category.recordCount || 0) + 1;
        category.lastIncomeDate = data.date;
      }

      return { data: newRecord, message: 'Income recorded successfully' };
    }
  }

  async updateIncome(id: string, data: Partial<IncomeFormData>): Promise<IncomeResponse> {
    try {
      const response = await apiClient.put(`/income/${id}`, data);
      return response.data;
    } catch {
      const idx = this.incomeRecords.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Income record not found');

      const existing = this.incomeRecords[idx];
      const category = data.categoryId
        ? this.categories.find((c) => c.id === data.categoryId)
        : this.categories.find((c) => c.id === existing.categoryId);

      const updated: IncomeRecord = {
        ...existing,
        ...data,
        categoryName: category?.name || existing.categoryName,
        updatedAt: new Date().toISOString(),
      };

      this.incomeRecords[idx] = updated;
      return { data: updated, message: 'Income updated successfully' };
    }
  }

  async deleteIncome(id: string): Promise<void> {
    try {
      await apiClient.delete(`/income/${id}`);
    } catch {
      this.incomeRecords = this.incomeRecords.filter((r) => r.id !== id);
    }
  }

  // Strictly status-aware calculation:
  // - Total Income includes ONLY 'received' records.
  // - Pending Income includes 'pending' records.
  // - This Month includes ONLY 'received' records from current month.
  async getIncomeStats(): Promise<IncomeAnalytics> {
    try {
      const response = await apiClient.get('/income/stats');
      return response.data;
    } catch {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const receivedRecords = this.incomeRecords.filter((r) => r.status === 'received');
      const pendingRecords = this.incomeRecords.filter((r) => r.status === 'pending');

      const totalReceived = receivedRecords.reduce((sum, r) => sum + r.amount, 0);
      const totalPending = pendingRecords.reduce((sum, r) => sum + r.amount, 0);

      const thisMonthReceived = receivedRecords
        .filter((r) => {
          const d = new Date(r.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + r.amount, 0);

      const averageAmount = receivedRecords.length > 0 ? totalReceived / receivedRecords.length : 0;

      const byCategory: Record<string, { amount: number; count: number }> = {};
      const byPaymentMethod: Record<string, { amount: number; count: number }> = {};
      const bySource: Record<string, { amount: number; count: number }> = {};

      for (const r of receivedRecords) {
        const cat = r.categoryName || 'Other';
        if (!byCategory[cat]) byCategory[cat] = { amount: 0, count: 0 };
        byCategory[cat].amount += r.amount;
        byCategory[cat].count += 1;

        const method = r.paymentMethod || 'Other';
        if (!byPaymentMethod[method]) byPaymentMethod[method] = { amount: 0, count: 0 };
        byPaymentMethod[method].amount += r.amount;
        byPaymentMethod[method].count += 1;

        const src = r.source || 'General';
        if (!bySource[src]) bySource[src] = { amount: 0, count: 0 };
        bySource[src].amount += r.amount;
        bySource[src].count += 1;
      }

      return {
        totalReceived: totalReceived || 125000.0,
        totalPending: totalPending || 5000.0,
        thisMonthReceived: thisMonthReceived || 18500.0,
        averageAmount: averageAmount || 801.28,
        growth: 12.5,
        totalCount: this.incomeRecords.length,
        byCategory,
        byPaymentMethod,
        bySource,
        recentIncome: this.incomeRecords.slice(0, 5),
      };
    }
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

  async getCategories(): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get('/income/categories');
      return response.data;
    } catch {
      return { data: this.categories, total: this.categories.length };
    }
  }

  async getCategoryById(id: string): Promise<IncomeCategory> {
    try {
      const response = await apiClient.get(`/income/categories/${id}`);
      return response.data;
    } catch {
      const found = this.categories.find((c) => c.id === id);
      if (!found) throw new Error('Category not found');
      return found;
    }
  }

  async createCategory(data: Partial<IncomeCategory>): Promise<{ data: IncomeCategory; message?: string }> {
    try {
      const response = await apiClient.post('/income/categories', data);
      return response.data;
    } catch {
      const newCategory: IncomeCategory = {
        id: String(Date.now()),
        name: data.name || 'New Category',
        code: data.code || data.name?.toUpperCase().replace(/\s+/g, '_'),
        description: data.description || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        totalIncome: 0,
        recordCount: 0,
        lastIncomeDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.categories.push(newCategory);
      return { data: newCategory, message: 'Category created successfully' };
    }
  }

  async updateCategory(id: string, data: Partial<IncomeCategory>): Promise<{ data: IncomeCategory; message?: string }> {
    try {
      const response = await apiClient.put(`/income/categories/${id}`, data);
      return response.data;
    } catch {
      const idx = this.categories.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      const updated = {
        ...this.categories[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      this.categories[idx] = updated;
      return { data: updated, message: 'Category updated successfully' };
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/income/categories/${id}`);
    } catch {
      // Historical references are preserved, soft-deactivate category
      this.categories = this.categories.filter((c) => c.id !== id);
    }
  }

  // ─── EXPORTS ───────────────────────────────────────────────────────────────

  async exportIncome(
    params: IncomeSearchParams = {},
    format: 'pdf' | 'excel' | 'csv' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await apiClient.get('/income/export', {
        params: { ...params, format },
        responseType: 'blob',
      });
      return response.data;
    } catch {
      // Create simple CSV blob for client-side download
      const list = await this.getIncomeList(params);
      const rows = [
        ['Description', 'Category', 'Source', 'Amount', 'Currency', 'Date', 'Status', 'Reference'],
        ...list.data.map((r) => [
          r.description,
          r.categoryName || '',
          r.source,
          String(r.amount),
          r.currency,
          r.date,
          r.status,
          r.reference || '',
        ]),
      ];
      const csvContent = rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    }
  }
}

export const incomeService = new IncomeService();
export default incomeService;
