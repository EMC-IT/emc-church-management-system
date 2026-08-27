'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Users,
  AlertTriangle,
  Upload,
  Trash2,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Form validation schema for family member
const familyMemberFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 120;
  }, 'Enter a valid date of birth'),
  gender: z.enum(['Male', 'Female']),
  membershipStatus: z.enum(['Active', 'New', 'Inactive', 'Transferred', 'Archived']),
  joinDate: z.string(),
  relationship: z.enum(['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other']),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
    phone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
    relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
  }),
  avatar: z.any().optional(),
});

type FamilyMemberFormData = z.infer<typeof familyMemberFormSchema>;

export default function AddFamilyMemberPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  // Mock member data for development
  const mockMember: Member = {
    id: memberId,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+233 24 123 4567',
    address: '123 Main Street, Accra, Ghana',
    dateOfBirth: '1988-05-15',
    gender: 'Male',
    membershipStatus: 'Active',
    joinDate: '2023-01-15',
    avatar: null,
    familyId: 'fam1',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+233 24 123 4568',
      relationship: 'Spouse'
    },
    customFields: {},
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  };

  const form = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'Male',
      membershipStatus: 'New',
      joinDate: new Date().toISOString().split('T')[0],
      relationship: 'Child',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
  });

  // Load member data
  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await membersService.getMember(memberId);
        // setMember(response.data);
        setMember(mockMember);
      } catch (err: any) {
        setError(err.message || 'Failed to load member');
        toast({
          title: 'Error',
          description: 'Failed to load member details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadMember();
    }
  }, [memberId, toast]);

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const onSubmit = async (data: FamilyMemberFormData) => {
    try {
      setSaving(true);

      // Create FormData for file upload
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'emergencyContact') {
          formData.append(key, JSON.stringify(data[key as keyof FamilyMemberFormData]));
        } else {
          formData.append(key, data[key as keyof FamilyMemberFormData] as string);
        }
      });

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Add family member
      const response = await membersService.addFamilyMember(memberId, formData as any);
      const newFamilyMember = response.data;
      
      toast({
        title: 'Success',
        description: 'Family member added successfully',
      });
      
      router.push(`/dashboard/members/${memberId}/family`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add family member',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Member not found'}
        </div>
        <Button asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/members/${member.id}/family`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add Family Member</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Personal Information</h2>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <FileUpload
                    accept="image/*"
                    maxFiles={1}
                    maxSize={5 * 1024 * 1024}
                    onUpload={(files) => handleAvatarUpload(files[0])}
                    onRemove={handleRemoveAvatar}
                    placeholder="Upload Photo"
                    className="w-full"
                  />
                </div>

                <div className="flex-1 grid grid-cols-12 gap-5 w-full">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6">
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Grace" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6">
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Mensah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Relationship *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Grandparent">Grandparent</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={(_, dateStr) => field.onChange(dateStr)}
                          placeholder="DD/MM/YYYY"
                          isDateOfBirth
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Residential Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Residential address..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Membership Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Membership Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="joinDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Join Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={(_, dateStr) => field.onChange(dateStr)}
                          placeholder="Select join date"
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="membershipStatus"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Membership Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
                          <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Emergency Contact Section */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Emergency Contact</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContact.phone"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Contact Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+233 24 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContact.relationship"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Relationship *</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse / Mother" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/members/${member.id}/family`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Family Member
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 