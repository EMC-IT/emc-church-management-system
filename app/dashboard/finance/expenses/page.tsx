'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Wallet,
  TrendingUp,
  Calendar,
  PieChart,
  FileText,
  ArrowRight,
  Receipt,
  Tag,
  BarChart3,
  ShoppingCart
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { ColumnDef } from '@tanstack/react-table';

// Expense data interface
interface ExpenseRecord {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  paymentMethod: string;
  vendor: string;
}

// Mock data for expenses overview
const expenseStats = {
  totalAmount: 85000,
  thisMonth: 12500,
  totalCount: 124,
  growth: -8.2,
  averageAmount: 685.48,
  categoriesCount: 11
};

const quickActions = [
  {
    title: 'Record Expense',
    description: 'Add new expense entry',
    href: '/dashboard/finance/expenses/add',
    icon: Plus,
    color: 'bg-brand-primary'
  },
  {
    title: 'Categories',
    description: 'Manage expense categories',
    href: '/dashboard/finance/expenses/categories',
    icon: Tag,
    color: 'bg-brand-secondary'
  },
  {
    title: 'Reports',
    description: 'View expense reports',
    href: '/dashboard/finance/expenses/reports',
    icon: BarChart3,
    color: 'bg-brand-accent'
  },
  {
    title: 'Export Data',
    description: 'Export expense data',
    href: '/dashboard/finance/expenses/reports?export=true',
    icon: FileText,
    color: 'bg-brand-success'
  }
];

const recentExpenses = [
  {
    id: '1',
    description: 'Monthly Salary - Pastor John',
    amount: 4500,
    category: 'Salaries & Benefits',
    date: '2024-01-15',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    vendor: 'Pastor John Smith'
  },
  {
    id: '2',
    description: 'Electricity Bill - January',
    amount: 850,
    category: 'Utilities',
    date: '2024-01-14',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    vendor: 'Electric Company'
  },
  {
    id: '3',
    description: 'Office Supplies - Stationery',
    amount: 320,
    category: 'Office Supplies',
    date: '2024-01-12',
    status: 'pending',
    paymentMethod: 'credit_card',
    vendor: 'Office Depot'
  },
  {
    id: '4',
    description: 'Building Maintenance - Roof Repair',
    amount: 2800,
    category: 'Building Maintenance',
    date: '2024-01-10',
    status: 'paid',
    paymentMethod: 'check',
    vendor: 'ABC Roofing Services'
  },
  {
    id: '5',
    description: 'Mission Trip - Transportation',
    amount: 1200,
    category: 'Missions & Outreach',
    date: '2024-01-08',
    status: 'paid',
    paymentMethod: 'cash',
    vendor: 'Local Transport'
  }
];

export default function ExpensesOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-brand-success">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-3 w-3 text-red-500" />
    ) : (
      <TrendingUp className="h-3 w-3 text-brand-success rotate-180" />
    );
  };

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <div className="font-medium">{expense.description}</div>
            <div className="text-sm text-muted-foreground">{expense.vendor}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return <Badge variant="outline">{category}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium text-red-600">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return getStatusBadge(status);
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses Overview</h1>
          <p className="text-muted-foreground">Track and manage church expenses</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/finance/expenses/reports">
              <FileText className="mr-2 h-4 w-4" />
              View Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/finance/expenses/add">
              <Plus className="mr-2 h-4 w-4" />
              Record Expense
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(expenseStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {expenseStats.totalCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(expenseStats.thisMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(expenseStats.growth)}
              <span className="ml-1">{Math.abs(expenseStats.growth)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expenseStats.averageAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseStats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Quick Actions */}
      <LazySection
        strategy="lazy"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.2}
      >
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(action.href)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <CardDescription className="text-xs">{action.description}</CardDescription>
                </div>
                <div className={`p-2 rounded-md ${action.color}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manage</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </LazySection>

      {/* Recent Expenses */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest expense transactions</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/expenses">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentExpenses}
              searchKey="description"
              searchPlaceholder="Search expenses..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}