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
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { MemberFullForm, MemberFullFormValues } from '@/components/forms/member-full-form';

// Form validation schema
const memberFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 120;
  }, 'Please enter a valid date of birth'),
  gender: z.enum(['Male', 'Female']),
  membershipStatus: z.enum(['Active', 'New', 'Inactive', 'Transferred', 'Archived']),
  joinDate: z.string(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
    phone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
    relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
  }),
  avatar: z.any().optional(),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

export default function EditMemberPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  // Mock member data for development (should be replaced with real API call)
  const mockMember: any = {
    id: memberId,
    title: 'Mr.',
    fullName: 'John Smith',
    branch: 'Adenta (HQ)',
    serviceType: 'Empowerment',
    status: 'Member',
    contact1: '+233 24 123 4567',
    contact2: '',
    email: 'john.smith@email.com',
    gender: 'Male',
    dateOfBirth: '1988-05-15',
    ageGroup: 'Adult',
    lifeDevelopment: 'Membership',
    departments: ['d1', 'd2'],
    groups: ['g1'],
    waterBaptism: 'Yes',
    holyGhostBaptism: 'No',
    leadershipRole: 'Usher',
    specialGuestInvitedBy: 'm2',
    specialGuestInvitedByCustom: '',
    avatar: '',
    location: 'Accra',
  };

  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        // Replace with real API call:
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

  const handleSubmit = async (data: MemberFullFormValues, avatarFile: File | null) => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'departments' || key === 'groups') {
          formData.append(key, JSON.stringify((data as any)[key]));
        } else {
          formData.append(key, (data as any)[key]);
        }
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      // Replace with real API call:
      // const response = await membersService.updateMember(memberId, formData);
      // const updatedMember = response.data;
      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      router.push(`/dashboard/members/${memberId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update member',
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/members/${memberId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
          <p className="text-muted-foreground">Update member information</p>
        </div>
      </div>
      <MemberFullForm
        initialValues={{
          ...member,
          branch: member.branch as "Adenta (HQ)" | "Adusa" | "Liberia" | "Somanya" | "Mampong"
        }}
        onSubmit={handleSubmit}
        loading={saving}
        mode="edit"
      />
    </div>
  );
} 