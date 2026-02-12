'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Edit,
  Trash2,
  Save,
  X,
  Receipt,
  Wallet,
  Tag,
  Calendar,
  User,
  FileText,
  CreditCard,
  Loader2,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Expense form validation schema
const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  vendor: z.string().min(1, 'Vendor/Payee is required').max(100, 'Vendor name must be less than 100 characters'),
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
  approvedBy: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// Mock expense categories
const expenseCategories = [
  { id: '1', name: 'Salaries & Benefits' },
  { id: '2', name: 'Missions & Outreach' },
  { id: '3', name: 'Building Maintenance' },
  { id: '4', name: 'Utilities' },
  { id: '5', name: 'Office Supplies' },
  { id: '6', name: 'Technology & Equipment' },
  { id: '7', name: 'Insurance' },
  { id: '8', name: 'Transportation' },
  { id: '9', name: 'Events & Programs' },
  { id: '10', name: 'Marketing & Communications' },
  { id: '11', name: 'Professional Services' },
  { id: '12', name: 'Miscellaneous' },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'check', name: 'Check' },
  { id: 'credit-card', name: 'Credit Card' },
  { id: 'debit-card', name: 'Debit Card' },
  { id: 'bank-transfer', name: 'Bank Transfer' },
  { id: 'online-payment', name: 'Online Payment' },
];

// Mock expense data
const mockExpense = {
  id: '1',
  title: 'Office Supplies Purchase',
  amount: 245.50,
  category: '5',
  paymentMethod: 'credit-card',
  date: new Date('2024-01-15'),
  vendor: 'Office Depot',
  description: 'Monthly office supplies including paper, pens, and printer cartridges for administrative office.',
  receiptNumber: 'REC-2024-001',
  approvedBy: 'Finance Committee',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export default function ExpenseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [expense, setExpense] = useState(mockExpense);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      date: expense.date,
      vendor: expense.vendor,
      description: expense.description || '',
      receiptNumber: expense.receiptNumber || '',
      approvedBy: expense.approvedBy || '',
    },
  });

  useEffect(() => {
    // Simulate loading expense data
    const loadExpense = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real app, fetch expense by params.id
        setExpense(mockExpense);

        // Reset form with loaded data
        form.reset({
          title: mockExpense.title,
          amount: mockExpense.amount.toString(),
          category: mockExpense.category,
          paymentMethod: mockExpense.paymentMethod,
          date: mockExpense.date,
          vendor: mockExpense.vendor,
          description: mockExpense.description || '',
          receiptNumber: mockExpense.receiptNumber || '',
          approvedBy: mockExpense.approvedBy || '',
        });
      } catch (error) {
        console.error('Error loading expense:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [params.id, form]);

  const onSave = async (data: ExpenseFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedExpense = {
        ...expense,
        ...data,
        amount: Number(data.amount),
        updatedAt: new Date(),
      };

      setExpense(updatedExpense);
      setIsEditing(false);
      toast.success('Expense updated successfully!');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Expense deleted successfully!');
      router.push('/dashboard/finance/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return expenseCategories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const getPaymentMethodName = (methodId: string) => {
    return paymentMethods.find(method => method.id === methodId)?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-12 w-12 rounded-lg">
            <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-8 w-64">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
            <LazyLoader className="h-4 w-48">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-lg">
          <div className="h-96 w-full rounded-lg bg-gray-200 animate-pulse" />
        </LazyLoader>
      </div>
    );
  }



  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/finance/expenses')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <Receipt className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{expense.title}</h1>
            <p className="text-gray-600">Expense Details & Management</p>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this expense record? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Expense'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Expense Details */}
      <LazySection>
        {isEditing ? (
          // Edit Mode
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Expense
              </CardTitle>
              <CardDescription>
                Update the expense details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Office supplies purchase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expense category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expenseCategories.map((category) => (
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

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  {method.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expense Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vendor/Payee *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Office Depot, John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="receiptNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Receipt Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., REC-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approvedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Approved By</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Pastor John, Finance Committee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional details about this expense..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 sm:flex-none"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      disabled={isSaving}
                      className="flex-1 sm:flex-none"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          // View Mode
          <div className="grid gap-6">
            {/* Main Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Expense Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Wallet className="h-4 w-4" />
                      Amount
                    </div>
                    <div className="text-2xl font-bold text-brand-primary">
                      ₵{expense.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Tag className="h-4 w-4" />
                      Category
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {getCategoryName(expense.category)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CreditCard className="h-4 w-4" />
                      Payment Method
                    </div>
                    <div className="font-medium">{getPaymentMethodName(expense.paymentMethod)}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                    <div className="font-medium">{format(expense.date, 'PPP')}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      Vendor/Payee
                    </div>
                    <div className="font-medium">{expense.vendor}</div>
                  </div>

                  {expense.receiptNumber && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Receipt className="h-4 w-4" />
                        Receipt Number
                      </div>
                      <div className="font-medium">{expense.receiptNumber}</div>
                    </div>
                  )}
                </div>

                {expense.approvedBy && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        Approved By
                      </div>
                      <div className="font-medium">{expense.approvedBy}</div>
                    </div>
                  </>
                )}

                {expense.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="h-4 w-4" />
                        Description
                      </div>
                      <div className="text-gray-700 leading-relaxed">{expense.description}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Record Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <div className="font-medium">{format(expense.createdAt, 'PPP p')}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium">{format(expense.updatedAt, 'PPP p')}</div>
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