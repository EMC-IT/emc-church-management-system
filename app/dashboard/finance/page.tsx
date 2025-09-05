'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { financeService } from '@/services';
import { Donation, TitheOffering, Expense, FinancialSummary, Currency } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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
  Activity
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
  const router = useRouter();
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
        const statusColors = {
          'Confirmed': 'bg-green-500',
          'Pending': 'bg-yellow-500',
          'Rejected': 'bg-red-500',
          'Refunded': 'bg-gray-500'
        };
        return (
          <Badge className={statusColors[donation.status]}>
            {donation.status}
          </Badge>
        );
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
        const statusColors = {
          'Paid': 'bg-green-500',
          'Pending': 'bg-yellow-500',
          'Approved': 'bg-blue-500',
          'Rejected': 'bg-red-500',
          'Cancelled': 'bg-gray-500'
        };
        return (
          <Badge className={statusColors[expense.status]}>
            {expense.status}
          </Badge>
        );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Overview</h1>
          <p className="text-muted-foreground">Monitor church finances and track giving</p>
        </div>
        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyDisplay 
                amount={financialSummary?.totalDonations || 0} 
                currency="GHS" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Donations this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tithes & Offerings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <CurrencyDisplay 
                amount={(financialSummary?.totalTithes || 0) + (financialSummary?.totalOfferings || 0)} 
                currency="GHS" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tithes & offerings this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <CurrencyDisplay 
                amount={financialSummary?.totalExpenses || 0} 
                currency="GHS" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Expenses this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              <CurrencyDisplay 
                amount={financialSummary?.netIncome || 0} 
                currency="GHS" 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Net income this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/finance/giving')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Giving</h3>
                <p className="text-sm text-muted-foreground">Manage giving</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/finance/tithes-offerings')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Tithes & Offerings</h3>
                <p className="text-sm text-muted-foreground">Track tithes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/finance/expenses')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Expenses</h3>
                <p className="text-sm text-muted-foreground">Track expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/finance/budgets')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Budgets</h3>
                <p className="text-sm text-muted-foreground">Manage budgets</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <CardDescription>
              Latest giving transactions recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentDonationsColumns}
              data={recentDonations}
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
            <CardDescription>
              Latest expenses recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentExpensesColumns}
              data={recentExpenses}
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
          <CardDescription>
            Giving by category this month
          </CardDescription>
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