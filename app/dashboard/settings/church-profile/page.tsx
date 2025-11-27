"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Upload, Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Form validation schema
const churchProfileSchema = z.object({
  name: z.string().min(3, 'Church name must be at least 3 characters'),
  motto: z.string().optional(),
  vision: z.string().min(20, 'Vision statement must be at least 20 characters'),
  mission: z.string().min(20, 'Mission statement must be at least 20 characters'),
  coreValues: z.string().min(20, 'Core values must be at least 20 characters'),
  history: z.string().optional(),
  founded: z.string().optional(),
  denomination: z.string().optional(),
  
  // Contact Information
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  alternativePhone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  
  // Physical Address
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  
  // Social Media
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  
  // Leadership
  seniorPastor: z.string().min(3, 'Senior pastor name is required'),
  assistantPastor: z.string().optional(),
  secretary: z.string().optional(),
  treasurer: z.string().optional(),
  
  // Additional Info
  capacity: z.string().optional(),
  membershipSize: z.string().optional(),
  serviceSchedule: z.string().optional(),
});

type ChurchProfileFormData = z.infer<typeof churchProfileSchema>;

export default function ChurchProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const form = useForm<ChurchProfileFormData>({
    resolver: zodResolver(churchProfileSchema),
    defaultValues: {
      name: 'EMC Church',
      motto: 'Empowering Lives, Transforming Communities',
      vision: 'To be a beacon of hope and spiritual transformation, reaching every heart with the love of Christ and building a community of faithful believers.',
      mission: 'Our mission is to spread the Gospel, nurture spiritual growth, serve our community with compassion, and equip believers to live purposeful lives.',
      coreValues: 'Faith, Love, Service, Excellence, Integrity, Community, Discipleship',
      history: 'Founded in 1995, our church has grown from a small congregation of 50 members to a thriving community of believers.',
      founded: '1995',
      denomination: 'Non-denominational',
      email: 'info@emcchurch.org',
      phone: '+1 (555) 123-4567',
      alternativePhone: '+1 (555) 123-4568',
      website: 'https://emcchurch.org',
      street: '123 Faith Avenue',
      city: 'Springfield',
      state: 'Illinois',
      postalCode: '62701',
      country: 'United States',
      facebook: 'https://facebook.com/emcchurch',
      twitter: 'https://twitter.com/emcchurch',
      instagram: 'https://instagram.com/emcchurch',
      youtube: 'https://youtube.com/@emcchurch',
      seniorPastor: 'Rev. Dr. John Smith',
      assistantPastor: 'Pastor Mary Johnson',
      secretary: 'Sarah Williams',
      treasurer: 'Michael Brown',
      capacity: '500',
      membershipSize: '350',
      serviceSchedule: 'Sunday: 8:00 AM, 10:00 AM, 6:00 PM\nWednesday: 7:00 PM Bible Study',
    },
  });

  const onSubmit = async (data: ChurchProfileFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Church profile data:', data);
      
      toast({
        title: "Church Profile Updated",
        description: "Church information has been saved successfully.",
      });
      
      router.push('/dashboard/settings?tab=general');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update church profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings?tab=general">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Church Profile</h1>
          <p className="text-muted-foreground">Comprehensive church information and identity</p>
        </div>
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
                  <CardDescription>Core church identity and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Grace Community Church" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church Motto/Tagline</FormLabel>
                        <FormControl>
                          <Input placeholder="Transforming lives through faith" {...field} />
                        </FormControl>
                        <FormDescription>
                          A short, memorable phrase that captures your church's essence
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="founded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Founded</FormLabel>
                          <FormControl>
                            <Input placeholder="1995" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="denomination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Denomination</FormLabel>
                          <FormControl>
                            <Input placeholder="Non-denominational" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Vision, Mission & Values */}
              <Card>
                <CardHeader>
                  <CardTitle>Vision, Mission & Core Values</CardTitle>
                  <CardDescription>Your church's purpose and guiding principles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="vision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vision Statement *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Where do you see the church going? What's your long-term aspiration?"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your church's future-focused aspirational statement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What is your church's purpose? How do you serve your community?"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your church's purpose and what you do daily
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coreValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Values *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Faith, Love, Service, Excellence, Integrity..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The fundamental beliefs and principles that guide your church
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church History</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share your church's story, major milestones, and journey..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief history of how your church started and grew
                        </FormDescription>
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
                  <CardDescription>How people can reach your church</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@church.org" {...field} />
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
                          <FormLabel>Primary Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
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

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourchurch.org" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Physical Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Physical Address</CardTitle>
                  <CardDescription>Church location details</CardDescription>
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

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>Connect your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/yourchurch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter/X</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/yourchurch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/yourchurch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/@yourchurch" {...field} />
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
                  <CardTitle>Church Leadership</CardTitle>
                  <CardDescription>Key leadership positions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="seniorPastor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senior Pastor *</FormLabel>
                          <FormControl>
                            <Input placeholder="Rev. Dr. John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assistantPastor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assistant Pastor</FormLabel>
                          <FormControl>
                            <Input placeholder="Pastor Mary Johnson" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="secretary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Secretary</FormLabel>
                          <FormControl>
                            <Input placeholder="Sarah Williams" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="treasurer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church Treasurer</FormLabel>
                          <FormControl>
                            <Input placeholder="Michael Brown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Church capacity and service details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seating Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} />
                          </FormControl>
                          <FormDescription>Maximum seating capacity</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="membershipSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Membership Size</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="350" {...field} />
                          </FormControl>
                          <FormDescription>Current registered members</FormDescription>
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
                            placeholder="Sunday: 8:00 AM, 10:00 AM&#10;Wednesday: 7:00 PM Bible Study"
                            rows={4}
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Church Logo */}
              <Card>
                <CardHeader>
                  <CardTitle>Church Logo</CardTitle>
                  <CardDescription>Upload your church logo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    {logoPreview ? (
                      <AvatarImage src={logoPreview} alt="Church Logo" />
                    ) : (
                      <AvatarFallback className="text-4xl">
                        <Church className="h-16 w-16" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="w-full">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg hover:border-brand-primary transition-colors">
                        <Upload className="mr-2 h-4 w-4" />
                        <span className="text-sm">Upload Logo</span>
                      </div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Founded:</span>
                    <span className="font-medium">{form.watch('founded') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <span className="font-medium">{form.watch('membershipSize') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{form.watch('capacity') || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Denomination:</span>
                    <span className="font-medium">{form.watch('denomination') || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
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
                        Save Church Profile
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/settings?tab=general')}
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
