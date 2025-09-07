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
  Heart,
  Gift
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
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
    description: 'Add new tithe or offering',
    href: '/dashboard/finance/tithes-offerings/add',
    icon: Plus,
    color: 'bg-brand-primary'
  },
  {
    title: 'Categories',
    description: 'Manage offering categories',
    href: '/dashboard/finance/tithes-offerings/categories',
    icon: Tag,
    color: 'bg-brand-secondary'
  },
  {
    title: 'Reports',
    description: 'View giving reports',
    href: '/dashboard/finance/tithes-offerings/reports',
    icon: BarChart3,
    color: 'bg-brand-accent'
  },
  {
    title: 'Export Data',
    description: 'Export giving data',
    href: '/dashboard/finance/tithes-offerings/reports?export=true',
    icon: FileText,
    color: 'bg-brand-success'
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Tithe':
        return <Badge variant="default" className="bg-brand-primary">Tithe</Badge>;
      case 'Offering':
        return <Badge variant="default" className="bg-brand-secondary">Offering</Badge>;
      case 'First Fruits':
        return <Badge variant="default" className="bg-brand-accent">First Fruits</Badge>;
      case 'Special Offering':
        return <Badge variant="default" className="bg-brand-success">Special</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-3 w-3 text-brand-success" />
    ) : (
      <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
    );
  };

  const columns: ColumnDef<TitheOfferingRecord>[] = [
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
        return <Badge variant="outline">{category}</Badge>;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tithes & Offerings</h1>
          <p className="text-muted-foreground">Track and manage church tithes and offerings</p>
        </div>
        <div className="flex items-center space-x-2">
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
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{formatCurrency(titheOfferingStats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {titheOfferingStats.totalCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{formatCurrency(titheOfferingStats.thisMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(titheOfferingStats.growth)}
              <span className="ml-1">{Math.abs(titheOfferingStats.growth)}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Giving</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(titheOfferingStats.averageAmount)}</div>
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
            <div className="text-2xl font-bold">{titheOfferingStats.categoriesCount}</div>
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

      {/* Recent Tithes & Offerings */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Tithes & Offerings</CardTitle>
                <CardDescription>Latest giving transactions</CardDescription>
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
              searchKey="memberName"
              searchPlaceholder="Search by member name..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}