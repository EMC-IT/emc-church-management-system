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
  Heart,
  Gift,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { GivingTypeBadge } from '@/components/ui/finance-badges';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ColumnDef } from '@tanstack/react-table';

// Tithe & Offering data interface
interface TitheOfferingRecord {
  id: string;
  memberName: string;
  type: 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNumber: string;
  notes?: string;
}

// Mock data for tithes & offerings overview
const titheOfferingStats = {
  totalAmount: 125000,
  thisMonth: 18500,
  totalCount: 186,
  growth: 12.5,
  averageAmount: 672.04,
  categoriesCount: 8
};

const quickActions = [
  {
    title: 'Record Tithe/Offering',
    href: '/dashboard/finance/tithes-offerings/add',
    icon: Plus
  },
  {
    title: 'Categories',
    href: '/dashboard/finance/tithes-offerings/categories',
    icon: Tag
  },
  {
    title: 'Reports',
    href: '/dashboard/finance/tithes-offerings/reports',
    icon: BarChart3
  },
  {
    title: 'Export Data',
    href: '/dashboard/finance/tithes-offerings/reports?export=true',
    icon: FileText
  }
];

const recentTithesOfferings = [
  {
    id: '1',
    memberName: 'John Smith',
    type: 'Tithe' as const,
    category: 'Regular Tithe',
    amount: 500,
    date: '2024-01-15',
    paymentMethod: 'Mobile Money',
    receiptNumber: 'TO-2024-001',
    notes: 'Monthly tithe'
  },
  {
    id: '2',
    memberName: 'Mary Johnson',
    type: 'Offering' as const,
    category: 'Sunday Offering',
    amount: 200,
    date: '2024-01-14',
    paymentMethod: 'Cash',
    receiptNumber: 'TO-2024-002'
  },
  {
    id: '3',
    memberName: 'David Wilson',
    type: 'First Fruits' as const,
    category: 'First Fruits',
    amount: 1000,
    date: '2024-01-12',
    paymentMethod: 'Bank Transfer',
    receiptNumber: 'TO-2024-003',
    notes: 'January first fruits'
  },
  {
    id: '4',
    memberName: 'Sarah Brown',
    type: 'Special Offering' as const,
    category: 'Building Fund',
    amount: 750,
    date: '2024-01-10',
    paymentMethod: 'Card',
    receiptNumber: 'TO-2024-004'
  },
  {
    id: '5',
    memberName: 'Michael Davis',
    type: 'Offering' as const,
    category: 'Missions',
    amount: 300,
    date: '2024-01-08',
    paymentMethod: 'Mobile Money',
    receiptNumber: 'TO-2024-005',
    notes: 'Mission support'
  }
];

export default function TithesOfferingsOverviewPage() {
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

  const getTypeBadge = (type: string) => <GivingTypeBadge type={type} />;

  const columns: ColumnDef<TitheOfferingRecord>[] = [
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
      accessorKey: 'memberName',
      header: 'Member',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div>
            <div className="font-medium">{record.memberName}</div>
            <div className="text-sm text-muted-foreground">{record.receiptNumber}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return getTypeBadge(type);
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
        return <div className="font-medium text-brand-success">{formatCurrency(amount)}</div>;
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
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('paymentMethod') as string;
        return <span className="text-sm text-muted-foreground">{method}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tithes & Offerings"
        description="Track and manage church tithes and offerings"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/finance/tithes-offerings/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/finance/tithes-offerings/add">
                <Plus className="mr-2 h-4 w-4" />
                Record Giving
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
          title="Total Received"
          value={formatCurrency(titheOfferingStats.totalAmount)}
          icon={Wallet}
          accent="success"
        />

        <StatCard
          title="This Month"
          value={formatCurrency(titheOfferingStats.thisMonth)}
          icon={Calendar}
          accent="success"
          trend={{
            value: `${Math.abs(titheOfferingStats.growth)}% from last month`,
            direction: titheOfferingStats.growth > 0 ? 'up' : 'down',
          }}
        />

        <StatCard
          title="Average Giving"
          value={formatCurrency(titheOfferingStats.averageAmount)}
          icon={Heart}
          accent="primary"
        />

        <StatCard
          title="Categories"
          value={titheOfferingStats.categoriesCount}
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

      {/* Recent Tithes & Offerings */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tithes & Offerings</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/tithes-offerings">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentTithesOfferings}
              recordLabel="contribution"
              searchKey="memberName"
              searchPlaceholder="Search by member name..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}
