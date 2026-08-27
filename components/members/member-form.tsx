"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FormFieldGroup, FormSection } from "@/components/ui/form-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { membersService } from "@/services";
import { Member, MemberFormData } from "@/lib/types";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  AlertTriangle,
  Camera,
  Save,
  X
} from "lucide-react";

// Form validation schema
const memberFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"]),
  membershipStatus: z.enum(["New", "Active", "Inactive", "Transferred", "Archived"]),
  joinDate: z.string().optional(),
  familyId: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name must be at least 2 characters"),
    phone: z.string().min(10, "Emergency contact phone must be at least 10 characters"),
    relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  }).optional(),
  customFields: z.record(z.any()).optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export interface MemberFormProps {
  member?: Member;
  onSubmit?: (data: MemberFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function MemberForm({
  member,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: MemberFormProps) {
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(
    member?.avatar || null
  );

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      email: member?.email || "",
      phone: member?.phone || "",
      address: member?.address || "",
      dateOfBirth: member?.dateOfBirth || "",
      gender: member?.gender || "Male",
      membershipStatus: member?.membershipStatus || "New",
      joinDate: member?.joinDate || "",
      familyId: member?.familyId || "",
      emergencyContact: member?.emergencyContact || {
        name: "",
        phone: "",
        relationship: "",
      },
      customFields: member?.customFields || {},
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (data: MemberFormValues) => {
    try {
      const memberData: MemberFormData = {
        ...data,
        joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      };

      if (onSubmit) {
        await onSubmit(memberData);
      } else {
        // Default submission logic
        if (member) {
          await membersService.updateMember(member.id, memberData);
          toast({
            title: "Success",
            description: "Member updated successfully",
          });
        } else {
          await membersService.createMember(memberData);
          toast({
            title: "Success",
            description: "Member created successfully",
          });
        }
      }

      // Handle photo upload if there's a new photo
      if (photoFile && member) {
        await membersService.uploadPhoto(member.id, photoFile);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save member",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
      <div className="space-y-6">
        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(form.watch("firstName"), form.watch("lastName"))}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={loading}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size: 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <FormSection title="Basic Information" description="Member's personal details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="firstName"
              label="First Name"
              type="text"
              placeholder="Enter first name"
              required
              value={form.watch("firstName")}
              onChange={(value) => form.setValue("firstName", value)}
              error={form.formState.errors.firstName?.message}
            />
            
            <FormInput
              name="lastName"
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              required
              value={form.watch("lastName")}
              onChange={(value) => form.setValue("lastName", value)}
              error={form.formState.errors.lastName?.message}
            />
            
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              required
              value={form.watch("email")}
              onChange={(value) => form.setValue("email", value)}
              error={form.formState.errors.email?.message}
            />
            
            <FormInput
              name="phone"
              label="Phone Number"
              type="phone"
              placeholder="Enter phone number"
              required
              value={form.watch("phone")}
              onChange={(value) => form.setValue("phone", value)}
              error={form.formState.errors.phone?.message}
            />
            
            <FormInput
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              required
              value={form.watch("dateOfBirth")}
              onChange={(value) => form.setValue("dateOfBirth", value)}
              error={form.formState.errors.dateOfBirth?.message}
            />
            
            <FormInput
              name="gender"
              label="Gender"
              type="select"
              required
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ]}
              value={form.watch("gender")}
              onChange={(value) => form.setValue("gender", value)}
              error={form.formState.errors.gender?.message}
            />
          </div>
        </FormSection>

        {/* Address Information */}
        <FormSection title="Address Information" description="Member's contact address">
          <FormInput
            name="address"
            label="Address"
            type="textarea"
            placeholder="Enter full address"
            required
            value={form.watch("address")}
            onChange={(value) => form.setValue("address", value)}
            error={form.formState.errors.address?.message}
          />
        </FormSection>

        {/* Membership Information */}
        <FormSection title="Membership Information" description="Church membership details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              name="membershipStatus"
              label="Membership Status"
              type="select"
              required
              options={[
                { value: "New", label: "New" },
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Transferred", label: "Transferred" },
                { value: "Archived", label: "Archived" },
              ]}
              value={form.watch("membershipStatus")}
              onChange={(value) => form.setValue("membershipStatus", value)}
              error={form.formState.errors.membershipStatus?.message}
            />
            
            <FormInput
              name="joinDate"
              label="Join Date"
              type="date"
              value={form.watch("joinDate")}
              onChange={(value) => form.setValue("joinDate", value)}
              error={form.formState.errors.joinDate?.message}
              helpText="Date when member joined the church"
            />
          </div>
          
          {form.watch("membershipStatus") && (
            <div className="mt-4">
              <StatusBadge 
                status={form.watch("membershipStatus").toLowerCase() as any}
                size="lg"
              />
            </div>
          )}
        </FormSection>

        {/* Emergency Contact */}
        <FormSection 
          title="Emergency Contact" 
          description="Emergency contact information"
          collapsible
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              name="emergencyContact.name"
              label="Contact Name"
              type="text"
              placeholder="Enter contact name"
              value={form.watch("emergencyContact.name")}
              onChange={(value) => form.setValue("emergencyContact.name", value)}
              error={form.formState.errors.emergencyContact?.name?.message}
            />
            
            <FormInput
              name="emergencyContact.phone"
              label="Contact Phone"
              type="phone"
              placeholder="Enter contact phone"
              value={form.watch("emergencyContact.phone")}
              onChange={(value) => form.setValue("emergencyContact.phone", value)}
              error={form.formState.errors.emergencyContact?.phone?.message}
            />
            
            <FormInput
              name="emergencyContact.relationship"
              label="Relationship"
              type="text"
              placeholder="e.g., Spouse, Parent"
              value={form.watch("emergencyContact.relationship")}
              onChange={(value) => form.setValue("emergencyContact.relationship", value)}
              error={form.formState.errors.emergencyContact?.relationship?.message}
            />
          </div>
        </FormSection>

        {/* Family Information */}
        <FormSection 
          title="Family Information" 
          description="Family and group associations"
          collapsible
          defaultOpen={false}
        >
          <FormInput
            name="familyId"
            label="Family ID"
            type="text"
            placeholder="Enter family ID (optional)"
            value={form.watch("familyId")}
            onChange={(value) => form.setValue("familyId", value)}
            error={form.formState.errors.familyId?.message}
            helpText="Associate member with a family group"
          />
        </FormSection>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : member ? "Update Member" : "Create Member"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Quick Member Form for basic information
export interface QuickMemberFormProps {
  onSubmit?: (data: Pick<MemberFormData, 'firstName' | 'lastName' | 'email' | 'phone'>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function QuickMemberForm({
  onSubmit,
  onCancel,
  loading = false,
  className,
}: QuickMemberFormProps) {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await membersService.createMember({
          ...data,
          address: "",
          dateOfBirth: "",
          gender: "Male",
          membershipStatus: "New",
          joinDate: new Date().toISOString().split('T')[0],
        });
        toast({
          title: "Success",
          description: "Member created successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create member",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="firstName"
            label="First Name"
            type="text"
            placeholder="Enter first name"
            required
            value={form.watch("firstName")}
            onChange={(value) => form.setValue("firstName", value)}
            error={form.formState.errors.firstName?.message}
          />
          
          <FormInput
            name="lastName"
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            required
            value={form.watch("lastName")}
            onChange={(value) => form.setValue("lastName", value)}
            error={form.formState.errors.lastName?.message}
          />
          
          <FormInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            required
            value={form.watch("email")}
            onChange={(value) => form.setValue("email", value)}
            error={form.formState.errors.email?.message}
          />
          
          <FormInput
            name="phone"
            label="Phone Number"
            type="phone"
            placeholder="Enter phone number"
            required
            value={form.watch("phone")}
            onChange={(value) => form.setValue("phone", value)}
            error={form.formState.errors.phone?.message}
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Member"}
          </Button>
        </div>
      </div>
    </form>
  );
} 