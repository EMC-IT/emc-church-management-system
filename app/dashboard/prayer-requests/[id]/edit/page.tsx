'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Heart,
  Lock,
  AlertCircle,
  CheckCircle2,
  Users,
  Save,
  Loader2
} from 'lucide-react';

// Prayer request form validation schema
const prayerRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority level',
  }),
  status: z.enum(['New', 'In Progress', 'Answered', 'Closed'], {
    required_error: 'Please select a status',
  }),
  isConfidential: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  requesterName: z.string().optional(),
  requesterEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  requesterPhone: z.string().optional(),
  assignTo: z.string().optional(),
  notifyPrayerTeam: z.boolean().default(true),
  allowPublicPrayers: z.boolean().default(true),
});

type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;

const PRAYER_CATEGORIES = [
  { value: 'healing', label: 'Healing & Health' },
  { value: 'family', label: 'Family & Relationships' },
  { value: 'financial', label: 'Financial Needs' },
  { value: 'guidance', label: 'Guidance & Direction' },
  { value: 'salvation', label: 'Salvation & Deliverance' },
  { value: 'protection', label: 'Protection & Safety' },
  { value: 'thanksgiving', label: 'Thanksgiving & Praise' },
  { value: 'mission', label: 'Mission & Outreach' },
  { value: 'personal', label: 'Personal Growth' },
  { value: 'other', label: 'Other' },
];

const PRAYER_TEAMS = [
  { value: 'prayer-warriors', label: 'Prayer Warriors' },
  { value: 'intercessory-team', label: 'Intercessory Team' },
  { value: 'pastoral-team', label: 'Pastoral Team' },
  { value: 'elders', label: 'Church Elders' },
  { value: 'youth-prayer', label: 'Youth Prayer Team' },
  { value: 'womens-ministry', label: "Women's Ministry" },
  { value: 'mens-ministry', label: "Men's Ministry" },
];

// Mock data - replace with API call
const mockPrayerRequest: PrayerRequestFormData = {
  title: 'Healing for Sister Mary',
  description: 'Please pray for Sister Mary who is recovering from surgery. She had a major operation last week and is currently in the hospital. The doctors say the surgery went well, but she needs time to recover.',
  category: 'healing',
  priority: 'High' as const,
  status: 'In Progress' as const,
  isConfidential: false,
  isAnonymous: false,
  requesterName: 'John Smith',
  requesterEmail: 'john.smith@church.com',
  requesterPhone: '+233 24 123 4567',
  assignTo: 'prayer-warriors',
  notifyPrayerTeam: true,
  allowPublicPrayers: true,
};

export default function EditPrayerRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
      status: 'New',
      isConfidential: false,
      isAnonymous: false,
      requesterName: '',
      requesterEmail: '',
      requesterPhone: '',
      assignTo: '',
      notifyPrayerTeam: true,
      allowPublicPrayers: true,
    },
  });

  useEffect(() => {
    // Load prayer request data
    const loadPrayerRequest = async () => {
      try {
        // TODO: Replace with actual API call
        console.log('Loading prayer request:', params.id);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set form values
        form.reset(mockPrayerRequest);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load prayer request',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPrayerRequest();
  }, [params.id]);

  const isAnonymous = form.watch('isAnonymous');
  const isConfidential = form.watch('isConfidential');

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Updating prayer request:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Prayer Request Updated',
        description: 'The prayer request has been updated successfully.',
      });
      
      router.push(`/dashboard/prayer-requests/${params.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update prayer request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href={`/dashboard/prayer-requests/${params.id}`} aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Prayer Request</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Request Details */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Prayer Request Details</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Request Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Healing for Sister Mary"
                          {...field}
                        />
                      </FormControl>
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
                          {PRAYER_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Priority Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Answered">Answered</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
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
                      <FormLabel>Description & Details *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of your prayer request..."
                          rows={4}
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

          {/* Requester Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Requester Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="col-span-12 flex flex-row items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Submit Anonymously</FormLabel>
                        <FormDescription className="text-xs">
                          Name and contact details will not be displayed on prayer boards
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isAnonymous && (
                  <>
                    <FormField
                      control={form.control}
                      name="requesterName"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requesterEmail"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="john.smith@church.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requesterPhone"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel" 
                              placeholder="+233 24 123 4567" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Privacy & Assignment */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Privacy & Team Assignment</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="assignTo"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Assign to Prayer Team</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto-assign">Auto-assign</SelectItem>
                          {PRAYER_TEAMS.map((team) => (
                            <SelectItem key={team.value} value={team.value}>
                              {team.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-12 sm:col-span-6 space-y-3">
                  <FormField
                    control={form.control}
                    name="isConfidential"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium cursor-pointer">Confidential Request</FormLabel>
                          <p className="text-xs text-muted-foreground">Only prayer pastors will see this</p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowPublicPrayers"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium cursor-pointer">Allow Public Prayers</FormLabel>
                          <p className="text-xs text-muted-foreground">Share during congregation intercessions</p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isConfidential}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/dashboard/prayer-requests/${params.id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
