"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Building2, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
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
const branchFormSchema = z.object({
  name: z.string().min(3, 'Branch name must be at least 3 characters'),
  type: z.enum(['Headquarters', 'Branch', 'Mission', 'Outreach Center']),
  established: z.string().min(4, 'Year is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  alternativePhone: z.string().optional(),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  pastor: z.string().min(3, 'Pastor name is required'),
  assistantPastor: z.string().optional(),
  secretary: z.string().optional(),
  capacity: z.string().min(1, 'Seating capacity is required'),
  currentMembers: z.string().optional(),
  serviceSchedule: z.string().optional(),
  facilities: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'under-construction']),
});

type BranchFormData = z.infer<typeof branchFormSchema>;

export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      type: 'Branch',
      established: '',
      email: '',
      phone: '',
      alternativePhone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      pastor: '',
      assistantPastor: '',
      secretary: '',
      capacity: '',
      currentMembers: '',
      serviceSchedule: '',
      facilities: '',
      description: '',
      status: 'active',
    },
  });

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBranch: BranchFormData = {
          name: 'North Branch',
          type: 'Branch' as const,
          established: '2010',
          email: 'north@emcchurch.org',
          phone: '+1 (555) 234-5678',
          alternativePhone: '+1 (555) 234-5679',
          street: '456 Hope Street',
          city: 'Springfield',
          state: 'Illinois',
          postalCode: '62702',
          country: 'United States',
          pastor: 'Pastor Michael Anderson',
          assistantPastor: 'Pastor Emily Davis',
          secretary: 'Jennifer Wilson',
          capacity: '250',
          currentMembers: '180',
          serviceSchedule: 'Sunday: 9:00 AM, 11:00 AM\nWednesday: 7:00 PM Bible Study',
          facilities: 'Parking lot for 100 vehicles\nChildren\'s ministry room\nFellowship hall\nSound system\nProjector and screen',
          description: 'Our North Branch serves the northern community with dynamic worship and outreach programs.',
          status: 'active' as const,
        };
        
        form.reset(mockBranch);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load branch data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranch();
  }, [params.id, form, toast]);

  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updated branch data:', data);
      
      toast({
        title: "Branch Updated",
        description: `${data.name} has been updated successfully.`,
      });
      
      router.push('/dashboard/settings/branches');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Branch Deleted",
        description: "The branch has been removed from the system.",
      });
      
      router.push('/dashboard/settings/branches');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const watchStatus = form.watch('status');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings/branches">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
            <p className="text-muted-foreground">Update branch information</p>
          </div>
        </div>
        <Badge variant={watchStatus === 'active' ? 'default' : 'secondary'}>
          {watchStatus}
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Branch identity and classification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="North Campus" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Headquarters">Headquarters</SelectItem>
                              <SelectItem value="Branch">Branch</SelectItem>
                              <SelectItem value="Mission">Mission</SelectItem>
                              <SelectItem value="Outreach Center">Outreach Center</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="established"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Established *</FormLabel>
                          <FormControl>
                            <Input placeholder="2020" {...field} />
                          </FormControl>
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
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="under-construction">Under Construction</SelectItem>
                            </SelectContent>
                          </Select>
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
                            placeholder="Brief description of this branch..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Branch contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="north@church.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alternativePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alternative Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4568" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Physical Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Physical Address</CardTitle>
                  <CardDescription>Branch location details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Faith Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Springfield" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province *</FormLabel>
                          <FormControl>
                            <Input placeholder="Illinois" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal/Zip Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="62701" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Leadership */}
              <Card>
                <CardHeader>
                  <CardTitle>Branch Leadership</CardTitle>
                  <CardDescription>Key leadership positions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pastor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch Pastor *</FormLabel>
                        <FormControl>
                          <Input placeholder="Pastor John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Pastor or leader in charge of this branch
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="assistantPastor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assistant Pastor</FormLabel>
                          <FormControl>
                            <Input placeholder="Pastor Jane Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secretary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Secretary</FormLabel>
                          <FormControl>
                            <Input placeholder="Mary Williams" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Capacity & Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Capacity & Additional Details</CardTitle>
                  <CardDescription>Branch facilities and service information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seating Capacity *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="250" {...field} />
                          </FormControl>
                          <FormDescription>Maximum seating capacity</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentMembers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Members</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="150" {...field} />
                          </FormControl>
                          <FormDescription>Registered members</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="serviceSchedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Schedule</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Sunday: 9:00 AM, 11:00 AM&#10;Wednesday: 7:00 PM"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Regular service times and weekly activities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="facilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facilities & Amenities</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Parking lot, Children's room, Fellowship hall, etc."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List available facilities and amenities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Activity History */}
              <Card>
                <CardHeader>
                  <CardTitle>Branch History</CardTitle>
                  <CardDescription>Key dates and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Established:</span>
                      <span className="font-medium">{form.watch('established')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">January 20, 2024</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">March 15, 2010</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Branch Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Branch Image</CardTitle>
                  <CardDescription>Upload branch photo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 rounded-lg">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt="Branch Image" className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-4xl rounded-lg">
                        <Building2 className="h-16 w-16" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="w-full">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg hover:border-brand-primary transition-colors">
                        <Upload className="mr-2 h-4 w-4" />
                        <span className="text-sm">Upload Image</span>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Branch Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{form.watch('name')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{form.watch('type')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">{form.watch('currentMembers')} / {form.watch('capacity')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{form.watch('status')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupancy:</span>
                    <span className="font-medium">
                      {Math.round((parseInt(form.watch('currentMembers') || '0') / parseInt(form.watch('capacity') || '1')) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Branch
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the branch
                          and remove all associated data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          className="bg-destructive hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              {/* Save Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-primary hover:bg-brand-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
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
                    className="w-full"
                    onClick={() => router.push('/dashboard/settings/branches')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
