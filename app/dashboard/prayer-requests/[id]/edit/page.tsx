'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Heart className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Prayer Request</h1>
            <p className="text-muted-foreground">Update prayer request details</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                  <CardDescription>Update the details of the prayer request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief title for the prayer request" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short, clear title that summarizes the request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of your prayer request..."
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Share the details of your prayer need (10-1000 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
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
                        <FormItem>
                          <FormLabel>Priority Level *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
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
                  </div>
                </CardContent>
              </Card>

              {/* Requester Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Requester Information</CardTitle>
                  <CardDescription>
                    {isAnonymous 
                      ? 'This request will be submitted anonymously' 
                      : 'Update requester contact information'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Submit Anonymously</FormLabel>
                          <FormDescription>
                            Name will not be shown with this prayer request
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!isAnonymous && (
                    <>
                      <FormField
                        control={form.control}
                        name="requesterName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Requester's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="requesterEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="email@example.com" 
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
                            <FormItem>
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
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isConfidential"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Confidential Request</FormLabel>
                          <FormDescription>
                            Only prayer team leaders will see this request
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowPublicPrayers"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isConfidential}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Allow Public Prayers</FormLabel>
                          <FormDescription>
                            Share in public prayer meetings
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="assignTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Prayer Team</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormDescription>
                          Leave blank for automatic assignment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notifyPrayerTeam"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Notify Prayer Team</FormLabel>
                          <FormDescription>
                            Send notification to assigned prayer team
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Request
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
