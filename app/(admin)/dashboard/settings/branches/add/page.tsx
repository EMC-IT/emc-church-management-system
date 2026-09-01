"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
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
  
  // Contact Information
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  alternativePhone: z.string().optional(),
  
  // Address
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  
  // Leadership
  pastor: z.string().min(3, 'Pastor name is required'),
  assistantPastor: z.string().optional(),
  secretary: z.string().optional(),
  
  // Capacity
  capacity: z.string().min(1, 'Seating capacity is required'),
  currentMembers: z.string().optional(),
  
  // Additional Details
  serviceSchedule: z.string().optional(),
  facilities: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'under-construction']),
});

type BranchFormData = z.infer<typeof branchFormSchema>;

export default function AddBranchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: '',
      type: 'Branch',
      established: new Date().getFullYear().toString(),
      email: '',
      phone: '',
      alternativePhone: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
      pastor: '',
      assistantPastor: '',
      secretary: '',
      capacity: '',
      currentMembers: '0',
      serviceSchedule: '',
      facilities: '',
      description: '',
      status: 'active',
    },
  });

  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Branch data:', data);
      
      toast({
        title: "Branch Created",
        description: `${data.name} has been added successfully.`,
      });
      
      router.push('/dashboard/settings/branches');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create branch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings/branches">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Add New Branch</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Branch Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="North Campus / Grace Assembly" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
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
                    <FormItem className="col-span-12 sm:col-span-3">
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Branch description and community scope..."
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

          {/* Contact Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Contact Details</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="branch@church.org" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+233 24 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternativePhone"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Alternative Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+233 20 765 4321" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Physical Address */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Physical Address & Location</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Faith Street, Off Main Highway" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Accra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>State / Region *</FormLabel>
                      <FormControl>
                        <Input placeholder="Greater Accra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Postal Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="GA-123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ghana" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Leadership & Operational Status */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Leadership & Capacity</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="pastor"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Branch Pastor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pastor John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assistantPastor"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
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
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Branch Secretary</FormLabel>
                      <FormControl>
                        <Input placeholder="Mary Williams" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Seating Capacity *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentMembers"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Current Members</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
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
            </div>
          </Card>

          {/* Schedule & Facilities */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Service Schedule & Facilities</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="serviceSchedule"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Service Schedule</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Sunday: 9:00 AM, 11:00 AM&#10;Wednesday: 7:00 PM"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facilities"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Facilities & Amenities</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Parking lot, Children's room, Fellowship hall, Audio recording booth..."
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
              onClick={() => router.push('/dashboard/settings/branches')}
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
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating Branch...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Create Branch
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
