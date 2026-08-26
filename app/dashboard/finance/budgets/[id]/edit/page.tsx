'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Wallet, Calendar, DollarSign, Users, FileText, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

// Validation schema
const budgetFormSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  department: z.string().min(1, 'Department is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Budget amount is required'),
  period: z.string().min(1, 'Period is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  owner: z.string().min(1, 'Budget owner is required'),
  description: z.string().optional(),
  priority: z.string().min(1, 'Priority is required'),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

// Mock data
const departments = [
  { value: 'worship', label: 'Worship Ministry' },
  { value: 'youth', label: 'Youth Ministry' },
  { value: 'children', label: 'Children Ministry' },
  { value: 'missions', label: 'Missions' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'administration', label: 'Administration' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'education', label: 'Christian Education' },
];

const categories = [
  { value: 'ministry', label: 'Ministry Operations' },
  { value: 'events', label: 'Events & Programs' },
  { value: 'building', label: 'Building Projects' },
  { value: 'equipment', label: 'Equipment & Technology' },
  { value: 'outreach', label: 'Community Outreach' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'supplies', label: 'Supplies & Materials' },
  { value: 'training', label: 'Training & Development' },
];

const periods = [
  { value: 'q1-2024', label: 'Q1 2024 (Jan - Mar)' },
  { value: 'q2-2024', label: 'Q2 2024 (Apr - Jun)' },
  { value: 'q3-2024', label: 'Q3 2024 (Jul - Sep)' },
  { value: 'q4-2024', label: 'Q4 2024 (Oct - Dec)' },
  { value: 'h1-2024', label: 'H1 2024 (Jan - Jun)' },
  { value: 'h2-2024', label: 'H2 2024 (Jul - Dec)' },
  { value: 'annual-2024', label: 'Annual 2024' },
  { value: 'annual-2025', label: 'Annual 2025' },
];

const budgetOwners = [
  { value: 'pastor-john', label: 'Pastor John Smith' },
  { value: 'worship-director', label: 'Sarah Johnson (Worship Director)' },
  { value: 'youth-pastor', label: 'Michael Brown (Youth Pastor)' },
  { value: 'children-director', label: 'Emily Davis (Children Director)' },
  { value: 'missions-coordinator', label: 'David Wilson (Missions Coordinator)' },
  { value: 'facilities-manager', label: 'Robert Taylor (Facilities Manager)' },
  { value: 'admin-manager', label: 'Lisa Anderson (Admin Manager)' },
];

const priorities = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' },
];

// Mock existing budget data
const mockBudgetData = {
  id: '1',
  name: 'Worship Ministry Q2 2024',
  department: 'worship',
  category: 'ministry',
  amount: '25000',
  period: 'q2-2024',
  startDate: '2024-04-01',
  endDate: '2024-06-30',
  owner: 'worship-director',
  description: 'Budget for worship ministry operations including equipment maintenance, music licensing, and special events.',
  priority: 'high',
};

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: '',
      department: '',
      category: '',
      amount: '',
      period: '',
      startDate: '',
      endDate: '',
      owner: '',
      description: '',
      priority: '',
    },
  });

  useEffect(() => {
    // Simulate loading existing budget data
    const loadBudgetData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pre-fill form with existing data
        form.reset(mockBudgetData);
      } catch (error) {
        toast.error('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, [params.id, form]);

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updated budget data:', data);
      toast.success('Budget updated successfully!');
      router.push(`/dashboard/finance/budgets/${params.id}`);
    } catch (error) {
      toast.error('Failed to update budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/budgets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update departmental allocation, financial period, fiscal cap, and budget owner.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Budget Scope & Allocation</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Ministry designation, fiscal period, target sum, and strategic priority</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Budget Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Worship Ministry Q2 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Department *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Budget Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                          <Input 
                            type="number" 
                            placeholder="15000" 
                            className="pl-8"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Priority *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
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
                  name="period"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Budget Period *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periods.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Start Date *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>End Date *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Budget Owner / Responsible Officer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetOwners.map((owner) => (
                            <SelectItem key={owner.value} value={owner.value}>
                              {owner.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Scope & Justification</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of budget purpose, planned expenditure, and expected ROI..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/finance/budgets')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1.5" />
              {isSubmitting ? 'Updating...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}