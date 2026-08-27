'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Wallet,
  Calendar,
  PieChart,
  FileText,
  ArrowRight,
  Receipt,
  Tag,
  BarChart3,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
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
    href: '/dashboard/finance/expenses/add',
    icon: Plus
  },
  {
    title: 'Categories',
    href: '/dashboard/finance/expenses/categories',
    icon: Tag
  },
  {
    title: 'Reports',
    href: '/dashboard/finance/expenses/reports',
    icon: BarChart3
  },
  {
    title: 'Export Data',
    href: '/dashboard/finance/expenses/reports?export=true',
    icon: FileText
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

  const getStatusBadge = (status: string) => <StatusBadge status={status} />;

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        return <Badge variant="neutral">{category}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium text-destructive">{formatCurrency(amount)}</div>;
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
      <PageHeader
        title="Expenses Overview"
        description="Track and manage church expenses"
        actions={
          <>
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
          </>
        }
      />

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Expenses"
          value={formatCurrency(expenseStats.totalAmount)}
          icon={Wallet}
          accent="accent"
        />

        <StatCard
          title="This Month"
          value={formatCurrency(expenseStats.thisMonth)}
          icon={Calendar}
          accent="accent"
          trend={{
            value: `${expenseStats.growth}% from last month`,
            direction: expenseStats.growth >= 0 ? 'up' : 'down',
          }}
        />

        <StatCard
          title="Average Expense"
          value={formatCurrency(expenseStats.averageAmount)}
          icon={Receipt}
          accent="primary"
        />

        <StatCard
          title="Categories"
          value={expenseStats.categoriesCount}
          icon={PieChart}
          accent="secondary"
        />
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
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
            >
              <IconComponent className="h-5 w-5 text-foreground" />
              <span className="flex-1 font-semibold">{action.title}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
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
              recordLabel="expense"
              searchKey="description"
              searchPlaceholder="Search expenses..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}
