'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  BadgeCent,
  TrendingUp,
  Calendar,
  PieChart,
  FileText,
  ArrowRight,
  Building,
  BookOpen,
  Gift,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ColumnDef } from '@tanstack/react-table';

// Income data interface
interface IncomeRecord {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  source: string;
}

// Mock data for income overview
const incomeStats = {
  totalAmount: 125000,
  thisMonth: 18500,
  totalCount: 156,
  growth: 12.5,
  averageAmount: 801.28,
  categoriesCount: 8
};

const quickActions = [
  {
    title: 'Record Income',
    description: 'Add new income entry',
    href: '/dashboard/finance/income/add',
    icon: Plus,
    color: 'bg-brand-primary'
  },
  {
    title: 'Categories',
    description: 'Manage income categories',
    href: '/dashboard/finance/income/categories',
    icon: PieChart,
    color: 'bg-brand-secondary'
  },
  {
    title: 'Reports',
    description: 'View income reports',
    href: '/dashboard/finance/income/reports',
    icon: FileText,
    color: 'bg-brand-accent'
  },
  {
    title: 'Export Data',
    description: 'Export income data',
    href: '/dashboard/finance/income/reports?export=true',
    icon: ArrowRight,
    color: 'bg-brand-success'
  }
];

const recentIncome = [
  {
    id: '1',
    description: 'Hall Rental - Wedding Event',
    amount: 2500,
    category: 'Hall Rental',
    date: '2024-01-15',
    status: 'received',
    source: 'Johnson Family'
  },
  {
    id: '2',
    description: 'Book Sales - Sunday Service',
    amount: 450,
    category: 'Book Sales',
    date: '2024-01-14',
    status: 'received',
    source: 'Bookstore'
  },
  {
    id: '3',
    description: 'Grant - Community Outreach',
    amount: 5000,
    category: 'Grants',
    date: '2024-01-12',
    status: 'pending',
    source: 'City Council'
  },
  {
    id: '4',
    description: 'Fundraising Event - Charity Dinner',
    amount: 3200,
    category: 'Fundraising',
    date: '2024-01-10',
    status: 'received',
    source: 'Event Committee'
  },
  {
    id: '5',
    description: 'Parking Fees - Sunday Service',
    amount: 180,
    category: 'Parking',
    date: '2024-01-08',
    status: 'received',
    source: 'Parking Management'
  }
];

export default function IncomeOverviewPage() {
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
      case 'received':
        return <Badge variant="default" className="bg-brand-success">Received</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<IncomeRecord>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const income = row.original;
        return (
          <div>
            <div className="font-medium">{income.description}</div>
            <div className="text-sm text-muted-foreground">{income.source}</div>
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
        return <div className="font-medium">{formatCurrency(amount)}</div>;
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
        title="Income Overview"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/finance/income/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/finance/income/add">
                <Plus className="mr-2 h-4 w-4" />
                Record Income
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
          title="Total Income"
          value={formatCurrency(incomeStats.totalAmount)}
          icon={BadgeCent}
          accent="primary"
          description={`${incomeStats.totalCount} transactions`}
        />

        <StatCard
          title="This Month"
          value={formatCurrency(incomeStats.thisMonth)}
          icon={Calendar}
          accent="secondary"
          trend={{
            value: `+${incomeStats.growth}% from last month`,
            direction: incomeStats.growth > 0 ? 'up' : 'down',
          }}
        />

        <StatCard
          title="Average Income"
          value={formatCurrency(incomeStats.averageAmount)}
          icon={TrendingUp}
          accent="success"
          description="Per transaction"
        />

        <StatCard
          title="Categories"
          value={incomeStats.categoriesCount}
          icon={PieChart}
          accent="accent"
          description="Active categories"
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
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(action.href)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
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

      {/* Recent Income */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Income</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/income/reports">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentIncome}
              recordLabel="income entry"
              recordLabelPlural="income entries"
              searchKey="description"
              searchPlaceholder="Search income..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}
