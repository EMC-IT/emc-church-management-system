'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { DepartmentFormData, DepartmentCategory } from '@/lib/types/departments';
import { departmentsService } from '@/services/departments-service';
import { toast } from 'sonner';

const departmentFormSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  leader: z.string().min(2, 'Leader name must be at least 2 characters'),
  departmentType: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  budget: z.number().min(0, 'Budget must be a positive number').optional(),
  location: z.string().optional(),
  hasMeetingSchedule: z.boolean().default(false),
  meetingDay: z.string().optional(),
  meetingStartTime: z.string().optional(),
  meetingEndTime: z.string().optional(),
  meetingFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
}).refine((data) => {
  if (data.hasMeetingSchedule) {
    return data.meetingDay && data.meetingStartTime && data.meetingEndTime && data.meetingFrequency;
  }
  return true;
}, {
  message: 'All meeting schedule fields are required when schedule is enabled',
  path: ['meetingDay']
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const DEPARTMENT_TYPES = [
  'Ministry',
  'Administrative',
  'Technical',
  'Service',
  'Outreach',
  'Educational',
  'Support'
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const MEETING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export default function AddDepartmentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<DepartmentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      leader: '',
      departmentType: '',
      categoryId: '',
      status: 'Active',
      budget: 0,
      location: '',
      hasMeetingSchedule: false,
      meetingDay: '',
      meetingStartTime: '',
      meetingEndTime: '',
      meetingFrequency: 'weekly'
    },
  });

  const hasMeetingSchedule = form.watch('hasMeetingSchedule');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await departmentsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      setLoading(true);
      
      const departmentData: DepartmentFormData = {
        name: values.name,
        description: values.description,
        leader: values.leader,
        departmentType: values.departmentType,
        categoryId: values.categoryId,
        status: values.status,
        budget: values.budget,
        location: values.location,
        meetingSchedule: values.hasMeetingSchedule ? {
          dayOfWeek: values.meetingDay!,
          startTime: values.meetingStartTime!,
          endTime: values.meetingEndTime!,
          frequency: values.meetingFrequency!
        } : undefined
      };
      
      const response = await departmentsService.createDepartment(departmentData);
      
      if (response.success) {
        toast.success('Department created successfully');
        router.push('/dashboard/departments');
      } else {
        toast.error(response.message || 'Failed to create department');
      }
    } catch {
      toast.error('Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/departments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Add Department
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create a ministry, administrative, or operational church department.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">General Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Media & Tech Ministry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leader"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Leader Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
                  name="departmentType"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="location"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Location / Room</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Media Booth, Room 204" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Purpose, responsibilities, and scope..."
                          className="min-h-[90px]"
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

          {/* Meeting Schedule */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Meeting Schedule</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable regular meeting times for department members</p>
                </div>
                <FormField
                  control={form.control}
                  name="hasMeetingSchedule"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {hasMeetingSchedule && (
                <div className="grid grid-cols-12 gap-5 pt-2 border-t border-border">
                  <FormField
                    control={form.control}
                    name="meetingDay"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <FormLabel>Day *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
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
                    name="meetingFrequency"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <FormLabel>Frequency *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MEETING_FREQUENCIES.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
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
                    name="meetingStartTime"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="meetingEndTime"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6 lg:col-span-3">
                        <FormLabel>End Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/departments')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Create Department
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}