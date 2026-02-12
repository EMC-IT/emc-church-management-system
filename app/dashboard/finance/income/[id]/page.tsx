'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Calendar,
  BadgeCent,
  FileText,
  User,
  Tag,
  MoreHorizontal,
  Eye,
  Copy
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';

// Form validation schema
const incomeFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  categoryId: z.string().min(1, 'Category is required'),
  source: z.string().min(1, 'Source is required').max(100, 'Source name too long'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(['received', 'pending', 'cancelled'])
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

// Mock income categories
const incomeCategories = [
  { id: '1', name: 'Hall Rental', description: 'Facility rental income' },
  { id: '2', name: 'Book Sales', description: 'Religious books and materials' },
  { id: '3', name: 'Grants', description: 'Government and foundation grants' },
  { id: '4', name: 'Fundraising', description: 'Fundraising events and campaigns' },
  { id: '5', name: 'Parking', description: 'Parking fees and permits' },
  { id: '6', name: 'Donations', description: 'General donations and offerings' },
  { id: '7', name: 'Investment', description: 'Investment returns and dividends' },
  { id: '8', name: 'Other', description: 'Other miscellaneous income' }
];

// Income data interface
interface IncomeData {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  source: string;
  date: string;
  status: 'received' | 'pending' | 'cancelled';
  notes: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

// Mock income data
const mockIncomeData: IncomeData = {
  id: '1',
  description: 'Hall Rental - Wedding Event',
  amount: 2500,
  categoryId: '1',
  categoryName: 'Hall Rental',
  source: 'Johnson Family',
  date: '2024-01-15',
  status: 'received',
  notes: 'Wedding ceremony and reception. Includes tables, chairs, and sound system.',
  reference: 'INV-2024-001',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export default function IncomeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [incomeData, setIncomeData] = useState<IncomeData>(mockIncomeData);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      source: '',
      date: '',
      notes: '',
      reference: '',
      status: 'received'
    }
  });

  useEffect(() => {
    // Simulate loading income data
    const timer = setTimeout(() => {
      setIncomeData(mockIncomeData);
      form.reset({
        description: mockIncomeData.description,
        amount: mockIncomeData.amount.toString(),
        categoryId: mockIncomeData.categoryId,
        source: mockIncomeData.source,
        date: mockIncomeData.date,
        notes: mockIncomeData.notes || '',
        reference: mockIncomeData.reference || '',
        status: mockIncomeData.status
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.id, form]);

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

  const onSubmit = async (data: IncomeFormValues) => {
    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Updated income data:', {
        ...data,
        amount: parseFloat(data.amount)
      });

      // Update local state
      setIncomeData(prev => ({
        ...prev,
        ...data,
        amount: parseFloat(data.amount),
        categoryName: incomeCategories.find(cat => cat.id === data.categoryId)?.name || prev.categoryName,
        updatedAt: new Date().toISOString()
      }));

      setIsEditing(false);
      toast.success('Income updated successfully!');
    } catch (error) {
      toast.error('Failed to update income. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Income deleted successfully!');
      router.push('/dashboard/finance/income');
    } catch (error) {
      toast.error('Failed to delete income. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(incomeData.id);
    toast.success('Income ID copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/finance/income">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Income
              </Link>
            </Button>
            <div>
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
            </div>
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/finance/income">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Income
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Edit Income' : 'Income Details'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update income information' : `Income ID: ${incomeData.id}`}
            </p>
          </div>
        </div>

        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Income
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Income
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the income record
                      and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="form"
        skeletonCount={6}
        threshold={0.1}
      >
        {isEditing ? (
          // Edit Form
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                Edit Income
              </CardTitle>
              <CardDescription>
                Update the income information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Description
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Hall Rental - Wedding Event"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amount */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <BadgeCent className="mr-2 h-4 w-4" />
                            Amount
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Tag className="mr-2 h-4 w-4" />
                            Category
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {incomeCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Source */}
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            Source
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Johnson Family"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="received">Received</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reference */}
                    <FormField
                      control={form.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., INV-2024-001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes or comments..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          // View Mode
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="mr-2 h-5 w-5" />
                    Income Information
                  </span>
                  {getStatusBadge(incomeData.status)}
                </CardTitle>
                <CardDescription>
                  Detailed information about this income record
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{incomeData.description}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="text-2xl font-bold text-brand-primary">
                      {formatCurrency(incomeData.amount)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">
                      <Badge variant="outline">{incomeData.categoryName}</Badge>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                    <p className="text-sm">{incomeData.source}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-sm">{new Date(incomeData.date).toLocaleDateString()}</p>
                  </div>

                  {incomeData.reference && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Reference</label>
                      <p className="text-sm font-mono">{incomeData.reference}</p>
                    </div>
                  )}
                </div>

                {incomeData.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-sm">{incomeData.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(incomeData.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(incomeData.updatedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </LazySection>
    </div>
  );
}