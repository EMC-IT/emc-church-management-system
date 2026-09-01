'use client';

import { useState } from 'react';
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

export interface AddFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemberAdded: (newMember: MemberFamilyMember) => void;
}

export function AddFamilyDialog({
  open,
  onOpenChange,
  onMemberAdded,
}: AddFamilyDialogProps) {
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

  const selectedRelationship = watch('relationship');
  const selectedGender = watch('gender');

  const onSubmit = async (data: FamilyMemberFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const added = await memberFamilyService.addFamilyMember({
        firstName: data.firstName,
        lastName: data.lastName,
        relationship: data.relationship,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        isRegisteredMember: data.isRegisteredMember,
        canManagePermissions: data.canManagePermissions,
        avatarUrl: null,
      });

      setSuccessMessage('Family member added successfully.');
      onMemberAdded(added);

      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        onOpenChange(false);
      }, 900);
    } catch {
      // Error handling simulated
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Register a spouse, child, or dependent to your church household unit.
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
              <Label htmlFor="famFirstName">First Name *</Label>
              <Input
                id="famFirstName"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="famLastName">Last Name *</Label>
              <Input
                id="famLastName"
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
              <Label htmlFor="relationship">Relationship *</Label>
              <Select
                value={selectedRelationship}
                onValueChange={(val) =>
                  setValue(
                    'relationship',
                    val as 'Head' | 'Spouse' | 'Child' | 'Dependent' | 'Other'
                  )
                }
              >
                <SelectTrigger id="relationship">
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
              <Label htmlFor="famGender">Gender</Label>
              <Select
                value={selectedGender}
                onValueChange={(val) =>
                  setValue('gender', val as 'Male' | 'Female' | 'Other')
                }
              >
                <SelectTrigger id="famGender">
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
            <Label htmlFor="famDob">Date of Birth</Label>
            <DatePicker
              id="famDob"
              value={watch('dateOfBirth')}
              onChange={(_, dateStr) => setValue('dateOfBirth', dateStr, { shouldValidate: true })}
              placeholder="DD/MM/YYYY"
              isDateOfBirth
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="famPhone">Phone Number</Label>
            <Input id="famPhone" {...register('phone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="famEmail">Email Address</Label>
            <Input id="famEmail" type="email" {...register('email')} />
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
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
