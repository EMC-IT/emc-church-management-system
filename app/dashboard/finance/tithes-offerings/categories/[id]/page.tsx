'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Tag,
  BarChart3,
  Calendar,
  Activity,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LazySection } from '@/components/ui/lazy-section';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Mock category interface
interface CategoryDetails {
  id: string;
  name: string;
  description?: string;
  type: 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';
  color: string;
  recordCount: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  recentRecords: {
    id: string;
    memberName: string;
    amount: number;
    date: string;
    receiptNumber: string;
  }[];
}

// Mock data
const mockCategory: CategoryDetails = {
  id: '1',
  name: 'Building Fund',
  description: 'Special offerings for church building projects and renovations',
  type: 'Special Offering',
  color: '#C49831',
  recordCount: 18,
  totalAmount: 15000,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  recentRecords: [
    {
      id: '1',
      memberName: 'John Smith',
      amount: 1000,
      date: '2024-01-15',
      receiptNumber: 'TO-2024-001'
    },
    {
      id: '2',
      memberName: 'Mary Johnson',
      amount: 750,
      date: '2024-01-14',
      receiptNumber: 'TO-2024-002'
    },
    {
      id: '3',
      memberName: 'David Wilson',
      amount: 500,
      date: '2024-01-12',
      receiptNumber: 'TO-2024-003'
    }
  ]
};

export default function CategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, openDialog, closeDialog } = useDeleteDialog();

  useEffect(() => {
    // Simulate API call to fetch category
    const timer = setTimeout(() => {
      setCategory(mockCategory);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.id]);

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

  const handleDelete = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Category deleted successfully');
      router.push('/dashboard/finance/tithes-offerings/categories');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Category Not Found</h1>
            <p className="text-muted-foreground">The requested category could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-12 w-12"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Tag className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Category Details</h1>
            <p className="text-muted-foreground">View and manage category information</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/finance/tithes-offerings/categories/${category.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/tithes-offerings/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Information */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                Category Information
              </CardTitle>
              <CardDescription>
                Basic details about this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <span className="font-medium">{category.name}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  {getTypeBadge(category.type)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Color</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-mono">{category.color}</span>
                  </div>
                </div>

                {category.description && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description</span>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <p className="text-sm">{category.description}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {format(new Date(category.createdAt), 'PPP')}
                  </span>
                </div>

                {category.updatedAt && category.updatedAt !== category.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                    <span className="text-sm">
                      {format(new Date(category.updatedAt), 'PPp')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LazySection>

        {/* Statistics */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics
              </CardTitle>
              <CardDescription>
                Usage statistics for this category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-brand-success">
                    {formatCurrency(category.totalAmount)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Amount Received
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{category.recordCount}</div>
                    <p className="text-xs text-muted-foreground">Records</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatCurrency(category.totalAmount / category.recordCount || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Quick Actions</h4>
                  <div className="grid gap-2">
                    <Button variant="outline" size="sm" asChild className="justify-start">
                      <Link href={`/dashboard/finance/tithes-offerings/categories/${category.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Category
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={() => openDialog()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Category
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </div>

      {/* Recent Records */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Records
            </CardTitle>
            <CardDescription>
              Latest giving records in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.recentRecords.length > 0 ? (
                category.recentRecords.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-brand-primary">
                          {record.memberName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{record.memberName}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.receiptNumber} • {format(new Date(record.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-success">
                        {formatCurrency(record.amount)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No records found for this category</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isOpen}
        onOpenChange={closeDialog}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete the "${category.name}" category? This action cannot be undone and will affect all associated records.`}
        itemName={category.name}
      />
    </div>
  );
}