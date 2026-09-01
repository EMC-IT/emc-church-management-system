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
import { MemberProfile, UpdateMemberProfileInput } from '@/lib/types/member';
import { memberProfileSchema, MemberProfileFormData } from '@/lib/validation/member';
import { memberProfileService } from '@/services/member';
import { DatePicker } from '@/components/ui/date-picker';

export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberProfile;
  onProfileUpdated: (updated: MemberProfile) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  member,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberProfileFormData>({
    resolver: zodResolver(memberProfileSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      displayName: member.displayName || `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      alternatePhone: member.alternatePhone || '',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender,
      maritalStatus: member.maritalStatus,
      anniversaryDate: member.anniversaryDate || '',
      address: {
        street: member.address.street || '',
        city: member.address.city || '',
        region: member.address.region || '',
        country: member.address.country || 'Ghana',
        postalCode: member.address.postalCode || '',
      },
      emergencyContact: {
        name: member.emergencyContact?.name || '',
        relationship: member.emergencyContact?.relationship || '',
        phone: member.emergencyContact?.phone || '',
      },
    },
  });

  const selectedGender = watch('gender');
  const selectedMaritalStatus = watch('maritalStatus');

  const onSubmit = async (data: MemberProfileFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const updateInput: UpdateMemberProfileInput = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        address: data.address,
        emergencyContact: data.emergencyContact,
      };

      const updated = await memberProfileService.updateProfile(updateInput);
      setSuccessMessage('Profile updated successfully.');
      onProfileUpdated(updated);

      setTimeout(() => {
        setSuccessMessage(null);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal and contact details. Information is synced with church records.
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" {...register('displayName')} />
                {errors.displayName && (
                  <p className="text-xs text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker
                  id="dateOfBirth"
                  value={watch('dateOfBirth')}
                  onChange={(_, dateStr) => setValue('dateOfBirth', dateStr, { shouldValidate: true })}
                  placeholder="DD/MM/YYYY"
                  isDateOfBirth
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={selectedGender}
                  onValueChange={(val) => setValue('gender', val as 'Male' | 'Female' | 'Other')}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={selectedMaritalStatus}
                  onValueChange={(val) =>
                    setValue('maritalStatus', val as 'Single' | 'Married' | 'Divorced' | 'Widowed')
                  }
                >
                  <SelectTrigger id="maritalStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input id="alternatePhone" {...register('alternatePhone')} />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="street">Residential Street Address</Label>
                <Input id="street" {...register('address.street')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('address.city')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="region">Region / State</Label>
                <Input id="region" {...register('address.region')} />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyName">Contact Name</Label>
                <Input id="emergencyName" {...register('emergencyContact.name')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyRel">Relationship</Label>
                <Input id="emergencyRel" {...register('emergencyContact.relationship')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input id="emergencyPhone" {...register('emergencyContact.phone')} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
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
