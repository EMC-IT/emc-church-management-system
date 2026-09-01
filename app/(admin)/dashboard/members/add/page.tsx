'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { memberFullFormSchema, newConvertSchema } from '@/lib/validation/members';

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

export default function AddMemberPage() {
  const [registrationType, setRegistrationType] = useState<'member' | 'convert'>('member');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: (values, context, options) => {
      const activeSchema = registrationType === 'member' ? memberFullFormSchema : newConvertSchema;
      return zodResolver(activeSchema)(values, context, options);
    },
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
    mode: 'onTouched',
  });

  const handleRegistrationTypeChange = (value: 'member' | 'convert') => {
    setRegistrationType(value);
    form.clearErrors();
  };

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
      Object.keys(data).forEach((key) => {
        if (key === 'groups' || key === 'departments') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key] as string);
        }
      });

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      toast({
        title: 'Success',
        description: registrationType === 'convert' ? 'New convert registered successfully' : 'Member added successfully',
      });

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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Add New Member</h1>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
          <Link href="/dashboard/members/import">
            <Upload className="mr-1.5 h-4 w-4" />
            Import Members
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Registration Type Toggle */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">Registration Type</h2>
              <RadioGroup
                value={registrationType}
                onValueChange={(value) => handleRegistrationTypeChange(value as 'member' | 'convert')}
                className="flex gap-6 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="member" id="r-member" />
                  <label htmlFor="r-member" className="text-sm font-medium cursor-pointer">Full Member</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="convert" id="r-convert" />
                  <label htmlFor="r-convert" className="text-sm font-medium cursor-pointer">New Convert</label>
                </div>
              </RadioGroup>
            </div>
          </Card>

          {/* Conditionally render fields based on registrationType */}
          {registrationType === 'convert' ? (
            <Card className="rounded-xl border border-border p-6">
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-foreground">New Convert Registration</h2>

                <div className="grid grid-cols-12 gap-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6">
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Grace Mensah" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact1"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-6">
                        <FormLabel>Primary Contact *</FormLabel>
                        <FormControl>
                          <Input placeholder="+233 24 123 4567" {...field} />
                        </FormControl>
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
                        <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <FormLabel>Date of Birth</FormLabel>
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
                    name="location"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Location / Residence *</FormLabel>
                        <FormControl>
                          <Input placeholder="East Legon, Accra" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Branch *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
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
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Service Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
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
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
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
                </div>
              </div>
            </Card>
          ) : (
            // Full member registration form
            <>
              {/* Personal Information */}
              <Card className="rounded-xl border border-border p-6">
                <div className="space-y-5">
                  <h2 className="text-base font-semibold text-foreground">Personal Information</h2>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <FileUpload
                        onUpload={(files) => handleAvatarUpload(files[0])}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                        className="w-full"
                        variant="button"
                        placeholder="Upload Photo"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-12 gap-5 w-full">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="col-span-12 sm:col-span-4 lg:col-span-3">
                            <FormLabel>Title *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
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
                          <FormItem className="col-span-12 sm:col-span-8 lg:col-span-9">
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Grace Mensah" {...field} />
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
                      name="contact1"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Primary Contact *</FormLabel>
                          <FormControl>
                            <Input placeholder="+233 24 123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contact2"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Secondary Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="+233 20 987 6543" {...field} />
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
                            <Input type="email" placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-3">
                          <FormLabel>Date of Birth</FormLabel>
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
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-3">
                          <FormLabel>Age Group *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Gender *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Branch *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Service Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
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
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Location / Residence *</FormLabel>
                          <FormControl>
                            <Input placeholder="East Legon, Accra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>

              {/* Church Details */}
              <Card className="rounded-xl border border-border p-6">
                <div className="space-y-5">
                  <h2 className="text-base font-semibold text-foreground">Church Details & Ministry</h2>

                  <div className="grid grid-cols-12 gap-5">
                    <FormField
                      control={form.control}
                      name="departments"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Departments</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start font-normal">
                                {field.value && field.value.length > 0
                                  ? field.value.map((deptId: string) =>
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
                                      checked={field.value?.includes(dept.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, dept.id]);
                                        } else {
                                          field.onChange(current.filter((id: string) => id !== dept.id));
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
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="groups"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Groups</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start font-normal">
                                {field.value && field.value.length > 0
                                  ? field.value.map((groupId: string) =>
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
                                      checked={field.value?.includes(group.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, group.id]);
                                        } else {
                                          field.onChange(current.filter((id: string) => id !== group.id));
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
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lifeDevelopment"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Life Development</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || 'Membership'}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
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
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Water Baptism *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
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
                        <FormItem className="col-span-12 sm:col-span-4">
                          <FormLabel>Holy Ghost Baptism *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
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
                  </div>
                </div>
              </Card>

              {/* Leadership & Invitation */}
              <Card className="rounded-xl border border-border p-6">
                <div className="space-y-5">
                  <h2 className="text-base font-semibold text-foreground">Leadership & Invitation</h2>

                  <div className="grid grid-cols-12 gap-5">
                    <FormField
                      control={form.control}
                      name="leadershipRole"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Leadership Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Deacon / Usher Coordinator" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialGuestInvitedBy"
                      render={({ field }) => (
                        <FormItem className="col-span-12 sm:col-span-6">
                          <FormLabel>Invited By</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member or custom" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MOCK_MEMBERS.map((member) => (
                                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                              ))}
                              <SelectItem value="custom">Custom (Enter name below)</SelectItem>
                            </SelectContent>
                          </Select>
                          {form.watch('specialGuestInvitedBy') === 'custom' && (
                            <FormField
                              control={form.control}
                              name="specialGuestInvitedByCustom"
                              render={({ field: customField }) => (
                                <FormItem className="mt-2">
                                  <FormControl>
                                    <Input placeholder="Inviter full name" {...customField} />
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
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => router.push('/dashboard/members')}>
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
                  <Save className="mr-1.5 h-4 w-4" />
                  <span>{registrationType === 'convert' ? 'Register New Convert' : 'Add Member'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
