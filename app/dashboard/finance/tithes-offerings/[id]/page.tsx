'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Receipt,
  Heart,
  Calendar,
  User,
  Wallet,
  Tag,
  CreditCard,
  FileText,
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

// Mock tithe/offering record interface
interface TitheOfferingRecord {
  id: string;
  memberName: string;
  memberId?: string;
  type: 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptNumber: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  updatedAt?: string;
}

// Mock data - in real app, this would come from API
const mockRecord: TitheOfferingRecord = {
  id: '1',
  memberName: 'John Smith',
  memberId: 'MEM-2024-001',
  type: 'Tithe',
  category: 'Regular Tithe',
  amount: 500,
  date: '2024-01-15',
  paymentMethod: 'Mobile Money',
  receiptNumber: 'TO-2024-001',
  notes: 'Monthly tithe payment',
  recordedBy: 'Admin User',
  recordedAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export default function TitheOfferingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [record, setRecord] = useState<TitheOfferingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, openDialog, closeDialog } = useDeleteDialog();

  useEffect(() => {
    // Simulate API call to fetch record
    const timer = setTimeout(() => {
      setRecord(mockRecord);
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
      
      toast.success('Record deleted successfully');
      router.push('/dashboard/finance/tithes-offerings');
    } catch (error) {
      toast.error('Failed to delete record');
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

  if (!record) {
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
            <h1 className="text-2xl font-bold tracking-tight">Record Not Found</h1>
            <p className="text-muted-foreground">The requested record could not be found</p>
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
            <Heart className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Giving Record Details</h1>
            <p className="text-muted-foreground">View and manage tithe/offering record</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/finance/tithes-offerings/${record.id}/edit`}>
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
                <Link href={`/dashboard/finance/tithes-offerings/${record.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Record
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Information */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Record Information
              </CardTitle>
              <CardDescription>
                Basic details about this giving record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Member</span>
                  <div className="text-right">
                    <div className="font-medium">{record.memberName}</div>
                    {record.memberId && (
                      <div className="text-sm text-muted-foreground">{record.memberId}</div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                  <div className="text-2xl font-bold text-brand-success">
                    {formatCurrency(record.amount)}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  {getTypeBadge(record.type)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Category</span>
                  <Badge variant="outline">{record.category}</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(record.date), 'PPP')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{record.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Receipt Number</span>
                  <span className="font-mono text-sm">{record.receiptNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>

        {/* Additional Information */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
              <CardDescription>
                Notes and record metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {record.notes && (
                  <>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Notes</span>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Recorded By</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{record.recordedBy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Recorded At</span>
                  <span className="text-sm">
                    {format(new Date(record.recordedAt), 'PPp')}
                  </span>
                </div>

                {record.updatedAt && record.updatedAt !== record.recordedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                    <span className="text-sm">
                      {format(new Date(record.updatedAt), 'PPp')}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="grid gap-2">
                  <Button variant="outline" size="sm" asChild className="justify-start">
                    <Link href={`/dashboard/finance/tithes-offerings/${record.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Record
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={() => openDialog()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Record
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isOpen}
        onOpenChange={closeDialog}
        onConfirm={handleDelete}
        title="Delete Giving Record"
        description={`Are you sure you want to delete this ${record.type.toLowerCase()} record for ${record.memberName}? This action cannot be undone.`}
        itemName={`${record.type} - ${record.memberName}`}
      />
    </div>
  );
}