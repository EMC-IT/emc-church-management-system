'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, BadgeCent } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingCategory } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  category: z.nativeEnum(GivingCategory, {
    required_error: 'Please select a category type.',
  }),
  isActive: z.boolean().default(true),
  targetAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Category options with descriptions
const categoryOptions = [
  {
    value: GivingCategory.GENERAL,
    label: 'General Fund',
    description: 'General church operations and ministry'
  },
  {
    value: GivingCategory.BUILDING_FUND,
    label: 'Building Fund',
    description: 'Church building construction and maintenance'
  },
  {
    value: GivingCategory.MISSIONARY,
    label: 'Missionary Support',
    description: 'Support for missionaries and evangelism'
  },
  {
    value: GivingCategory.YOUTH,
    label: 'Youth Ministry',
    description: 'Youth programs and activities'
  },
  {
    value: GivingCategory.CHILDREN,
    label: 'Children Ministry',
    description: 'Children programs and Sunday school'
  },
  {
    value: GivingCategory.MUSIC,
    label: 'Music Ministry',
    description: 'Instruments, sound equipment, and choir'
  },
  {
    value: GivingCategory.OUTREACH,
    label: 'Outreach Programs',
    description: 'Community outreach and evangelism'
  },
  {
    value: GivingCategory.CHARITY,
    label: 'Charity & Welfare',
    description: 'Charitable activities and welfare programs'
  },
  {
    value: GivingCategory.EDUCATION,
    label: 'Education',
    description: 'Educational programs and scholarships'
  },
  {
    value: GivingCategory.MEDICAL,
    label: 'Medical Support',
    description: 'Medical assistance and health programs'
  },
  {
    value: GivingCategory.DISASTER_RELIEF,
    label: 'Disaster Relief',
    description: 'Emergency and disaster relief efforts'
  },
  {
    value: GivingCategory.OTHER,
    label: 'Other',
    description: 'Other special purposes'
  }
];

export default function AddCategoryPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      notes: '',
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      
      // For now, simulate API call. Replace with actual API call:
      // await givingService.createCategory(data);
      
      console.log('Creating category:', data);
      
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      
      router.push('/dashboard/finance/giving/categories');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/finance/giving/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Giving Category</h1>
          <p className="text-muted-foreground">Create a new category for organizing giving</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BadgeCent className="h-5 w-5" />
                <span>Category Information</span>
              </CardTitle>
              <CardDescription>
                Provide details for the new giving category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Building Fund" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this category
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-muted-foreground">{option.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the type that best fits this category
                          </FormDescription>
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
                            placeholder="Describe the purpose and use of this category..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain what this category is used for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Set a target amount for this category (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information or guidelines..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Any additional information about this category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Category</FormLabel>
                          <FormDescription>
                            Enable this category for new giving transactions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? 'Creating...' : 'Create Category'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard/finance/giving/categories">
                        Cancel
                      </Link>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Naming Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use clear, descriptive names</li>
                  <li>• Keep names concise but meaningful</li>
                  <li>• Avoid abbreviations when possible</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Category Types</h4>
                <p className="text-sm text-muted-foreground">
                  Choose the category type that best matches your intended use. This helps with reporting and organization.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Target Amounts</h4>
                <p className="text-sm text-muted-foreground">
                  Setting target amounts helps track progress and goals for specific categories.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Categories:</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Categories:</span>
                  <span className="font-medium">6</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Most Used:</span>
                  <span className="font-medium">General Fund</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}