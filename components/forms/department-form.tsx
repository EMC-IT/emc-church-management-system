"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Department } from "@/lib/types";
import { Member } from "@/lib/types";

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', firstName: 'John', lastName: 'Doe', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm2', firstName: 'Jane', lastName: 'Smith', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Female', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm3', firstName: 'Kwame', lastName: 'Boateng', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm4', firstName: 'Abena', lastName: 'Mensah', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Female', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
  { id: 'm5', firstName: 'Kojo', lastName: 'Appiah', email: '', phone: '', address: '', dateOfBirth: '', gender: 'Male', membershipStatus: 'Active', joinDate: '', avatar: null, customFields: {}, createdAt: '', updatedAt: '', emergencyContact: { name: '', phone: '', relationship: '' } },
];

const departmentFormSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  leader: z.string().min(2, "Leader name must be at least 2 characters"),
  departmentType: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  members: z.array(z.string()).optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export interface DepartmentFormProps {
  department?: Department;
  onSubmit?: (data: DepartmentFormValues) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function DepartmentForm({
  department,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: DepartmentFormProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
      leader: department?.leader || "",
      departmentType: department?.departmentType || "",
      status: department?.status || "Active",
      members: department?.members || [],
    },
  });

  const [memberSearch, setMemberSearch] = React.useState("");
  const filteredMembers = MOCK_MEMBERS.filter((member) =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSubmit = async (data: DepartmentFormValues) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
      <Card>
        <CardHeader>
          <CardTitle>{department ? "Edit Department" : "Add Department"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input {...form.register("name")}
              placeholder="Department name"
              disabled={loading}
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input {...form.register("description")}
              placeholder="Department description"
              disabled={loading}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leader</label>
            <Input {...form.register("leader")}
              placeholder="Department leader"
              disabled={loading}
            />
            {form.formState.errors.leader && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.leader.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Input {...form.register("departmentType")}
              placeholder="e.g. Administrative, Functional"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={form.watch("status")}
              onValueChange={val => form.setValue("status", val as "Active" | "Inactive")}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign Members</label>
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={e => setMemberSearch(e.target.value)}
              className="mb-2"
              disabled={loading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {filteredMembers.map((member) => (
                <label key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={form.watch("members")?.includes(member.id) || false}
                    onCheckedChange={(checked) => {
                      const current = form.getValues("members") || [];
                      if (checked) {
                        form.setValue("members", [...current, member.id]);
                      } else {
                        form.setValue("members", current.filter((id: string) => id !== member.id));
                      }
                    }}
                  />
                  <span>{member.firstName} {member.lastName}</span>
                </label>
              ))}
              {filteredMembers.length === 0 && (
                <span className="text-xs text-muted-foreground col-span-2">No members found.</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button type="submit" disabled={loading}>
              {department ? "Update" : "Create"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 