'use client';

import React, { useState, useEffect } from 'react';
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
  Users,
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
    href: '/dashboard/finance/income/add',
    icon: Plus
  },
  {
    title: 'Categories',
    href: '/dashboard/finance/income/categories',
    icon: PieChart
  },
  {
    title: 'Reports',
    href: '/dashboard/finance/income/reports',
    icon: FileText
  },
  {
    title: 'Export Data',
    href: '/dashboard/finance/income/reports?export=true',
    icon: ArrowRight
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

  const columns: ColumnDef<IncomeRecord>[] = [
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
        return <Badge variant="neutral">{category}</Badge>;
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
        />

        <StatCard
          title="Categories"
          value={incomeStats.categoriesCount}
          icon={PieChart}
          accent="accent"
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
