'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberFamilyMember } from '@/lib/types/member';
import { familyMemberSchema, FamilyMemberFormData } from '@/lib/validation/member';
import { memberFamilyService } from '@/services/member';
import { DatePicker } from '@/components/ui/date-picker';

export interface EditFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberFamilyMember | null;
  onMemberUpdated: (updatedMember: MemberFamilyMember) => void;
}

export function EditFamilyDialog({
  open,
  onOpenChange,
  member,
  onMemberUpdated,
}: EditFamilyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      relationship: 'Child',
      gender: 'Male',
      dateOfBirth: '',
      phone: '',
      email: '',
      isRegisteredMember: false,
      canManagePermissions: false,
    },
  });

  useEffect(() => {
    if (member) {
      reset({
        firstName: member.firstName,
        lastName: member.lastName,
        relationship: member.relationship,
        gender: member.gender || 'Male',
        dateOfBirth: member.dateOfBirth || '',
        phone: member.phone || '',
        email: member.email || '',
        isRegisteredMember: member.isRegisteredMember,
        canManagePermissions: member.canManagePermissions,
      });
      setSuccessMessage(null);
    }
  }, [member, reset]);

  const selectedRelationship = watch('relationship');
  const selectedGender = watch('gender');

  const onSubmit = async (data: FamilyMemberFormData) => {
    if (!member) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const updated = await memberFamilyService.updateFamilyMember(member.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        isRegisteredMember: data.isRegisteredMember,
        canManagePermissions: data.canManagePermissions,
      });

      setSuccessMessage('Family member updated successfully.');
      onMemberUpdated(updated);

      setTimeout(() => {
        setSuccessMessage(null);
        onOpenChange(false);
      }, 800);
    } catch {
      // Handle simulated error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Family Member</DialogTitle>
          <DialogDescription>
            Update details and household relationship for {member?.firstName} {member?.lastName}.
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="editFamFirstName">First Name *</Label>
              <Input
                id="editFamFirstName"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editFamLastName">Last Name *</Label>
              <Input
                id="editFamLastName"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="editRelationship">Relationship *</Label>
              <Select
                value={selectedRelationship}
                onValueChange={(val) =>
                  setValue(
                    'relationship',
                    val as 'Head' | 'Spouse' | 'Child' | 'Dependent' | 'Other'
                  )
                }
              >
                <SelectTrigger id="editRelationship">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Dependent">Dependent</SelectItem>
                  <SelectItem value="Head">Head of House</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editFamGender">Gender</Label>
              <Select
                value={selectedGender}
                onValueChange={(val) =>
                  setValue('gender', val as 'Male' | 'Female' | 'Other')
                }
              >
                <SelectTrigger id="editFamGender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editFamDob">Date of Birth</Label>
            <DatePicker
              id="editFamDob"
              value={watch('dateOfBirth')}
              onChange={(_, dateStr) => setValue('dateOfBirth', dateStr, { shouldValidate: true })}
              placeholder="DD/MM/YYYY"
              isDateOfBirth
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editFamPhone">Phone Number</Label>
            <Input id="editFamPhone" {...register('phone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editFamEmail">Email Address</Label>
            <Input id="editFamEmail" type="email" {...register('email')} />
          </div>

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
