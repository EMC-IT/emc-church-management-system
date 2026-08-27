'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/hooks/use-toast';
import { financeService } from '@/services';
import { Donation, TitheOffering, Expense, FinancialSummary, Currency } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  BadgeCent, 
  Users, 
  Calendar,
  Receipt,
  CreditCard,
  Building,
  Heart,
  Music,
  Baby,
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
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [recentTithes, setRecentTithes] = useState<TitheOffering[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
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
        const [donationsResponse, tithesResponse, expensesResponse] = await Promise.all([
          financeService.getDonations({ page: 1, limit: 5 }),
          financeService.getTithesOfferings({ page: 1, limit: 5 }),
          financeService.getExpenses({ page: 1, limit: 5 })
        ]);

        setRecentDonations(donationsResponse.data);
        setRecentTithes(tithesResponse.data);
        setRecentExpenses(expensesResponse.data);

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

  // Recent donations table columns
  const recentDonationsColumns: ColumnDef<Donation>[] = [
    {
      accessorKey: 'donorName',
      header: 'Donor',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div>
            <div className="font-medium">{donation.donorName}</div>
            <div className="text-sm text-muted-foreground">{donation.category}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <CurrencyDisplay 
            amount={donation.amount} 
            currency={donation.currency as Currency}
            className="font-medium"
          />
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div className="text-sm">
            {format(new Date(donation.date), 'MMM dd')}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const donation = row.original;
        return <StatusBadge status={donation.status} />;
      },
    },
  ];

  // Recent expenses table columns
  const recentExpensesColumns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <div className="font-medium">{expense.title}</div>
            <div className="text-sm text-muted-foreground">{expense.category}</div>
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
            className="font-medium text-red-600"
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
              <Link href="/dashboard/finance/giving/donations/add">
                <Plus className="mr-2 h-4 w-4" />
                Record Donation
              </Link>
            </Button>
          </>
        }
      />

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={<CurrencyDisplay amount={financialSummary?.totalDonations || 0} currency="GHS" />}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Tithes & Offerings"
          value={
            <CurrencyDisplay
              amount={(financialSummary?.totalTithes || 0) + (financialSummary?.totalOfferings || 0)}
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
          title="Net Income"
          value={<CurrencyDisplay amount={financialSummary?.netIncome || 0} currency="GHS" />}
          icon={Activity}
          accent="primary"
        />
      </div>

      {/* Quick Actions */}
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
          href="/dashboard/finance/tithes-offerings"
          className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
        >
          <Heart className="h-5 w-5 text-foreground" />
          <span className="flex-1 font-semibold">Tithes & Offerings</span>
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
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Recent Giving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentDonationsColumns}
              data={recentDonations}
              recordLabel="donation"
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
            <CardTitle className="flex items-center">
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

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Building Fund</p>
                <p className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={250000} currency="GHS" />
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">General Offering</p>
                <p className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={150000} currency="GHS" />
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Music className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Music Ministry</p>
                <p className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={75000} currency="GHS" />
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <Baby className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium">Children Ministry</p>
                <p className="text-sm text-muted-foreground">
                  <CurrencyDisplay amount={50000} currency="GHS" />
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
