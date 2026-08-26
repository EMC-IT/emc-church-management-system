'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Heart,
  Lock,
  AlertCircle,
  CheckCircle2,
  Users,
  Save
} from 'lucide-react';
import Link from 'next/link';

// Prayer request form validation schema
const prayerRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority level',
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

export default function AddPrayerRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'Medium',
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

  const isAnonymous = form.watch('isAnonymous');
  const isConfidential = form.watch('isConfidential');

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log('Submitting prayer request:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Prayer Request Submitted',
        description: 'Your prayer request has been submitted successfully and will be reviewed by the prayer team.',
      });
      
      router.push('/dashboard/prayer-requests');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit prayer request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/prayer-requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Submit Prayer Request</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share intercession requests, spiritual warfare needs, healing petitions, and praise reports.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Request Details */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Request Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Specify request topic, categorization, and pastoral priority</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Request Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Healing prayer for sister, Travelling mercies"
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Priority Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low - General prayer</SelectItem>
                          <SelectItem value="Medium">Medium - Important need</SelectItem>
                          <SelectItem value="High">High - Urgent prayer</SelectItem>
                          <SelectItem value="Urgent">Urgent - Critical situation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignTo"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Assign to Prayer Team</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team (optional)" />
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

                <FormField
                  control={form.control}
                  name="notifyPrayerTeam"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Notify Team</FormLabel>
                        <FormDescription className="text-xs">Send instant alert to assigned intercessors</FormDescription>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of your prayer petition or praise testimony..."
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

          {/* Requester & Privacy Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Requester & Privacy Settings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage visibility, anonymity, and contact details</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="isAnonymous"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Submit Anonymously</FormLabel>
                        <FormDescription className="text-xs">Hide name from congregational list</FormDescription>
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
                  name="isConfidential"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Confidential Request</FormLabel>
                        <FormDescription className="text-xs">Only team leads & pastoral staff</FormDescription>
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
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Allow Public Prayers</FormLabel>
                        <FormDescription className="text-xs">Can be mentioned during service</FormDescription>
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

                {!isAnonymous && (
                  <>
                    <FormField
                      control={form.control}
                      name="requesterName"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
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
                              placeholder="your.email@example.com" 
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
                              placeholder="+233 XX XXX XXXX" 
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/prayer-requests')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  <span>Submit Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
