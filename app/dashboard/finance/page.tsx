'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { GivingCategoryBadge } from '@/components/ui/finance-badges';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/hooks/use-toast';
import { financeService, givingService, expenseService } from '@/services';
import { ExpenseRecord, FinancialSummary, Currency, Giving, GivingCategory, GivingSource, GivingType } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  BadgeCent, 
  Receipt,
  CreditCard,
  Building,
  DollarSign,
  Download,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function FinanceOverviewPage() {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [recentGiving, setRecentGiving] = useState<Giving[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load finance data
  useEffect(() => {
    const loadFinanceData = async () => {
      try {
        setLoading(true);
        
        // Get financial summary for current month
        const startDate = new Date();
        startDate.setDate(1); // First day of current month
        const endDate = new Date();
        
        const summary = await financeService.getFinancialSummary({
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
        setFinancialSummary(summary);

        // Get recent transactions
        const [givingResponse, expensesResponse] = await Promise.all([
          givingService.searchGiving({ page: 1, limit: 5, excludeBreakdowns: true }).catch(() => ({ data: [] })),
          expenseService.getExpenses({ page: 1, limit: 5 }).catch(() => ({ data: [] })),
        ]);

        if (givingResponse.data && givingResponse.data.length > 0) {
          setRecentGiving(givingResponse.data);
        } else {
          // Fallback mock giving for overview display
          setRecentGiving([
            {
              id: '1',
              memberName: 'Kofi Mensah',
              source: GivingSource.INDIVIDUAL,
              type: GivingType.TITHE,
              amount: 500.00,
              currency: 'GHS',
              category: GivingCategory.GENERAL,
              method: 'Cash',
              date: '2024-01-20',
              description: 'Monthly tithe',
              isAnonymous: false,
              receiptNumber: 'GIV-001',
              status: 'completed' as any,
              createdAt: '2024-01-20T10:30:00Z',
              updatedAt: '2024-01-20T10:30:00Z',
            },
            {
              id: '2',
              source: GivingSource.CONGREGATIONAL,
              serviceEvent: 'Sunday Morning Service',
              type: GivingType.OFFERING,
              amount: 1200.00,
              currency: 'GHS',
              category: GivingCategory.GENERAL,
              method: 'Cash',
              date: '2024-01-21',
              description: 'Sunday offering',
              isAnonymous: false,
              receiptNumber: 'GIV-002',
              status: 'completed' as any,
              createdAt: '2024-01-21T11:00:00Z',
              updatedAt: '2024-01-21T11:00:00Z',
            },
          ]);
        }

        setRecentExpenses(expensesResponse.data || []);

      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load finance data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadFinanceData();
  }, [toast]);

  // Recent giving table columns
  const recentGivingColumns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'type',
      header: 'Type / Contributor',
      cell: ({ row }) => {
        const item = row.original;
        const displayName = item.source === GivingSource.CONGREGATIONAL 
          ? (item.serviceEvent || 'Congregational')
          : (item.isAnonymous ? 'Anonymous' : (item.memberName || 'Member'));

        return (
          <div>
            <div className="font-medium capitalize">{item.type.replace('_', ' ')}</div>
            <div className="text-xs text-muted-foreground">{displayName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <CurrencyDisplay 
            amount={item.amount} 
            currency={item.currency as Currency}
            className="font-medium text-brand-success"
          />
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-sm">
            {format(new Date(item.date), 'MMM dd')}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original;
        return <StatusBadge status={item.status} />;
      },
    },
  ];

  // Recent expenses table columns
  const recentExpensesColumns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <div className="font-medium">{expense.title}</div>
            <div className="text-sm text-muted-foreground">{expense.categoryName || expense.vendor}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <CurrencyDisplay 
            amount={expense.amount} 
            currency={expense.currency as Currency}
            className="font-medium text-destructive"
          />
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="text-sm">
            {format(new Date(expense.date), 'MMM dd')}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const expense = row.original;
        return <StatusBadge status={expense.status} />;
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Overview"
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button asChild>
              <Link href="/dashboard/finance/giving">
                <Plus className="mr-2 h-4 w-4" />
                Record Giving
              </Link>
            </Button>
          </>
        }
      />

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Giving"
          value={<CurrencyDisplay amount={financialSummary?.totalDonations || 0} currency="GHS" />}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Total Income"
          value={
            <CurrencyDisplay
              amount={(financialSummary?.totalTithes || 0) + (financialSummary?.totalOfferings || 0) + (financialSummary?.totalDonations || 0)}
              currency="GHS"
            />
          }
          icon={BadgeCent}
          accent="secondary"
        />

        <StatCard
          title="Total Expenses"
          value={<CurrencyDisplay amount={financialSummary?.totalExpenses || 0} currency="GHS" />}
          icon={TrendingDown}
          accent="accent"
        />

        <StatCard
          title="Net Balance"
          value={<CurrencyDisplay amount={financialSummary?.netIncome || 0} currency="GHS" />}
          icon={Activity}
          accent="primary"
        />
      </div>

      {/* Quick Actions (Giving, Income, Expenses, Budgets) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/finance/giving"
          className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
        >
          <Receipt className="h-5 w-5 text-foreground" />
          <span className="flex-1 font-semibold">Giving</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>

        <Link
          href="/dashboard/finance/income"
          className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
        >
          <DollarSign className="h-5 w-5 text-foreground" />
          <span className="flex-1 font-semibold">Income</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>

        <Link
          href="/dashboard/finance/expenses"
          className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
        >
          <CreditCard className="h-5 w-5 text-foreground" />
          <span className="flex-1 font-semibold">Expenses</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>

        <Link
          href="/dashboard/finance/budgets"
          className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
        >
          <Building className="h-5 w-5 text-foreground" />
          <span className="flex-1 font-semibold">Budgets</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
        </Link>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Giving */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <BarChart3 className="mr-2 h-5 w-5" />
              Recent Giving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentGivingColumns}
              data={recentGiving}
              recordLabel="giving"
              loading={false}
              showSearch={false}
              showFilters={false}
              pagination={false}
              className="bg-card"
            />
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/finance/giving">
                  View All Giving
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <PieChart className="mr-2 h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentExpensesColumns}
              data={recentExpenses}
              recordLabel="expense"
              loading={false}
              showSearch={false}
              showFilters={false}
              pagination={false}
              className="bg-card"
            />
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/finance/expenses">
                  View All Expenses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fund Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">Building Fund</p>
              <p className="text-lg font-semibold mt-1">
                <CurrencyDisplay amount={250000} currency="GHS" />
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">General Offering</p>
              <p className="text-lg font-semibold mt-1">
                <CurrencyDisplay amount={150000} currency="GHS" />
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">Music Ministry</p>
              <p className="text-lg font-semibold mt-1">
                <CurrencyDisplay amount={75000} currency="GHS" />
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">Children & Youth Ministry</p>
              <p className="text-lg font-semibold mt-1">
                <CurrencyDisplay amount={50000} currency="GHS" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
