'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import {
  ArrowLeft,
  Save,
  User,
  Users,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Mock data for departments, groups, and members
const MOCK_DEPARTMENTS = [
  { id: 'd1', name: 'Media' },
  { id: 'd2', name: 'Music' },
  { id: 'd3', name: 'Protocol' },
  { id: 'd4', name: 'Children’s Ministry' },
  { id: 'd5', name: 'Finance' },
];
const MOCK_GROUPS = [
  { id: 'g1', name: 'Ushering' },
  { id: 'g2', name: 'Choir' },
  { id: 'g3', name: 'Prayer Warriors' },
  { id: 'g4', name: 'Technical' },
  { id: 'g5', name: 'Evangelism' },
];
const MOCK_MEMBERS = [
  { id: 'm1', name: 'John Doe' },
  { id: 'm2', name: 'Jane Smith' },
  { id: 'm3', name: 'Kwame Boateng' },
  { id: 'm4', name: 'Abena Mensah' },
  { id: 'm5', name: 'Kojo Appiah' },
];

// Zod schema for a new convert
const newConvertSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  contact1: z.string().min(10, 'Contact 1 must be at least 10 digits'),
  gender: z.enum(['Male', 'Female']),
  dateOfBirth: z.string().optional().or(z.literal('')),
  branch: z.enum(['Adenta (HQ)', 'Adusa', 'Liberia', 'Somanya', 'Mampong']),
  serviceType: z.enum(['Empowered Kids', 'Empowerment', 'Jesus Generation', 'Precious Pearls']),
  status: z.enum(['Member', 'Attender', 'Special Guest', 'Stop Coming']),
  location: z.string().min(2, 'Location is required'),
});

// Zod schema for a full member
const memberFormSchema = z.object({
  title: z.enum(['Rev.', 'Ps.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Mgt.']),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  branch: z.enum(['Adenta (HQ)', 'Adusa', 'Liberia', 'Somanya', 'Mampong']),
  serviceType: z.enum(['Empowered Kids', 'Empowerment', 'Jesus Generation', 'Precious Pearls']),
  status: z.enum(['Member', 'Attender', 'Special Guest', 'Stop Coming']),
  contact1: z.string().min(10, 'Contact 1 must be at least 10 digits'),
  contact2: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female']),
  dateOfBirth: z.string().optional().or(z.literal('')),
  ageGroup: z.enum(['Youth', 'Adult', 'Children', 'Baby']),
  lifeDevelopment: z.enum(['Membership', 'Maturity', 'Ministry', 'Accountability', 'None']),
  departments: z.array(z.string()).optional(),
  groups: z.array(z.string()).optional(),
  waterBaptism: z.enum(['Yes', 'No']),
  holyGhostBaptism: z.enum(['Yes', 'No']),
  leadershipRole: z.string().optional().or(z.literal('')),
  specialGuestInvitedBy: z.string(),
  specialGuestInvitedByCustom: z.string().optional(),
  avatar: z.any().optional(),
  location: z.string().min(2, 'Location is required'),
});

export default function AddMemberPage() {
  const [registrationType, setRegistrationType] = useState<'member' | 'convert'>('member');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  // Choose schema based on registration type
  const schema = registrationType === 'member' ? memberFormSchema : newConvertSchema;
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'Mr.',
      fullName: '',
      branch: 'Adenta (HQ)',
      serviceType: 'Empowerment',
      status: 'Member',
      contact1: '',
      contact2: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      ageGroup: 'Adult',
      lifeDevelopment: 'Membership',
      departments: [],
      groups: [],
      waterBaptism: 'No',
      holyGhostBaptism: 'No',
      leadershipRole: '',
      specialGuestInvitedBy: '',
      specialGuestInvitedByCustom: '',
      location: '',
    },
  });

  const handleAvatarUpload = (file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'groups' || key === 'departments') {
          formData.append(key, JSON.stringify(data[key as keyof any]));
        } else {
          formData.append(key, data[key as keyof any] as string);
        }
      });

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Mock API call
      console.log('Form Data Submitted:', Object.fromEntries(formData.entries()));
      // const response = await membersService.createMember(formData as any);
      // const newMember = response.data;
      
      toast({
        title: 'Success',
        description: 'Member added successfully',
      });

      // Redirect to a success page or member list
      // router.push(`/dashboard/members/${newMember.id}`);
      router.push(`/dashboard/members`);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add member',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
            <p className="text-muted-foreground">Register a new church member or convert.</p>
          </div>
        </div>
        <Button asChild variant="outline" className="ml-auto">
          <Link href="/dashboard/members/import">
            <Upload className="mr-2 h-4 w-4" />
            Import Members
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* FIX: Moved Registration Type Toggle inside the Form component */}
          <Card>
            <CardHeader>
                <CardTitle>Registration Type</CardTitle>
                <CardDescription>Select whether you are registering a full member or a new convert.</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={registrationType}
                    onValueChange={(value) => setRegistrationType(value as 'member' | 'convert')}
                    className="flex gap-4 pt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="member" id="r-member" />
                        <label htmlFor="r-member" className="cursor-pointer">Member</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="convert" id="r-convert" />
                        <label htmlFor="r-convert" className="cursor-pointer">New Convert</label>
                    </div>
                </RadioGroup>
            </CardContent>
          </Card>

          {/* Conditionally render fields based on registrationType */}
          {registrationType === 'convert' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  New Convert Registration
                </CardTitle>
                <CardDescription>Register a new convert with essential details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact 1 *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
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
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" placeholder="Select date of birth (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Adenta (HQ)">Adenta (HQ)</SelectItem>
                          <SelectItem value="Adusa">Adusa</SelectItem>
                          <SelectItem value="Liberia">Liberia</SelectItem>
                          <SelectItem value="Somanya">Somanya</SelectItem>
                          <SelectItem value="Mampong">Mampong</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Empowered Kids">Empowered Kids</SelectItem>
                          <SelectItem value="Empowerment">Empowerment</SelectItem>
                          <SelectItem value="Jesus Generation">Jesus Generation</SelectItem>
                          <SelectItem value="Precious Pearls">Precious Pearls</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Attender">Attender</SelectItem>
                          <SelectItem value="Special Guest">Special Guest</SelectItem>
                          <SelectItem value="Stop Coming">Stop Coming</SelectItem>
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
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location (city, area, etc.)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ) : (
            // Full member registration form
            <>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Basic member details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback>
                          <Upload className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <FileUpload
                        onUpload={(files) => handleAvatarUpload(files[0])}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB
                        className="w-full"
                        variant="button"
                        placeholder="Upload Photo"
                      />
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select title" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Rev.">Rev.</SelectItem>
                                <SelectItem value="Ps.">Ps.</SelectItem>
                                <SelectItem value="Mr.">Mr.</SelectItem>
                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                <SelectItem value="Ms.">Ms.</SelectItem>
                                <SelectItem value="Miss.">Miss.</SelectItem>
                                <SelectItem value="Mgt.">Mgt.</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact 1 *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="contact2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" placeholder="Select date of birth (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Youth">Youth</SelectItem>
                            <SelectItem value="Adult">Adult</SelectItem>
                            <SelectItem value="Children">Children</SelectItem>
                            <SelectItem value="Baby">Baby</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
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
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Adenta (HQ)">Adenta (HQ)</SelectItem>
                              <SelectItem value="Adusa">Adusa</SelectItem>
                              <SelectItem value="Liberia">Liberia</SelectItem>
                              <SelectItem value="Somanya">Somanya</SelectItem>
                              <SelectItem value="Mampong">Mampong</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Empowered Kids">Empowered Kids</SelectItem>
                              <SelectItem value="Empowerment">Empowerment</SelectItem>
                              <SelectItem value="Jesus Generation">Jesus Generation</SelectItem>
                              <SelectItem value="Precious Pearls">Precious Pearls</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Attender">Attender</SelectItem>
                            <SelectItem value="Special Guest">Special Guest</SelectItem>
                            <SelectItem value="Stop Coming">Stop Coming</SelectItem>
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
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location (city, area, etc.)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Church Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Church Details
                  </CardTitle>
                  <CardDescription>Church-related details and life development</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Departments</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {form.watch('departments') && form.watch('departments').length > 0
                              ? form.watch('departments').map((deptId: string) =>
                                  MOCK_DEPARTMENTS.find((d) => d.id === deptId)?.name || deptId
                                ).join(', ')
                              : 'Select departments'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="flex flex-col gap-2">
                            {MOCK_DEPARTMENTS.map((dept) => (
                              <label key={dept.id} className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-muted">
                                <Checkbox
                                  checked={form.watch('departments')?.includes(dept.id)}
                                  onCheckedChange={(checked) => {
                                    const current = form.getValues('departments') || [];
                                    if (checked) {
                                      form.setValue('departments', [...current, dept.id]);
                                    } else {
                                      form.setValue('departments', current.filter((id: string) => id !== dept.id));
                                    }
                                  }}
                                  id={`dept-${dept.id}`}
                                />
                                <span className="text-sm">{dept.name}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>

                    <FormItem>
                      <FormLabel>Groups</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal">
                            {form.watch('groups') && form.watch('groups').length > 0
                              ? form.watch('groups').map((groupId: string) =>
                                  MOCK_GROUPS.find((g) => g.id === groupId)?.name || groupId
                                ).join(', ')
                              : 'Select groups'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="flex flex-col gap-2">
                            {MOCK_GROUPS.map((group) => (
                              <label key={group.id} className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-muted">
                                <Checkbox
                                  checked={form.watch('groups')?.includes(group.id)}
                                  onCheckedChange={(checked) => {
                                    const current = form.getValues('groups') || [];
                                    if (checked) {
                                      form.setValue('groups', [...current, group.id]);
                                    } else {
                                      form.setValue('groups', current.filter((id: string) => id !== group.id));
                                    }
                                  }}
                                  id={`group-${group.id}`}
                                />
                                <span className="text-sm">{group.name}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="lifeDevelopment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Life Development</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select life development stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Membership">Membership</SelectItem>
                            <SelectItem value="Maturity">Maturity</SelectItem>
                            <SelectItem value="Ministry">Ministry</SelectItem>
                            <SelectItem value="Accountability">Accountability</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waterBaptism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Water Baptism *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select water baptism status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="holyGhostBaptism"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Holy Ghost Baptism *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Holy Ghost baptism status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Leadership & Invitation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Leadership & Invitation
                  </CardTitle>
                  <CardDescription>Role within the church and invitation details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leadershipRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership Role</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter leadership role (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialGuestInvitedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invited By</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select member or enter custom name" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MOCK_MEMBERS.map(member => (
                              <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                            ))}
                            <SelectItem value="custom">Custom (Enter name below)</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch('specialGuestInvitedBy') === 'custom' && (
                          <FormField
                            control={form.control}
                            name="specialGuestInvitedByCustom"
                            render={({ field }) => (
                                <FormItem className="mt-2">
                                    <FormControl>
                                        <Input placeholder="Enter custom inviter's name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </>
          )}
          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>{registrationType === 'convert' ? 'Registering...' : 'Adding Member...'}</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span>{registrationType === 'convert' ? 'Register New Convert' : 'Add Member'}</span>
                </>
              )}
            </Button>
            {registrationType === 'convert' && (
              <Button variant="secondary" type="button" disabled>
                Next Steps / Promote to Member
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
