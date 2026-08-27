"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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

// Permission categories and their permissions
const PERMISSIONS = {
  members: {
    label: 'Members Management',
    permissions: [
      { id: 'members.view', label: 'View Members', description: 'View member list and profiles' },
      { id: 'members.create', label: 'Add Members', description: 'Create new member records' },
      { id: 'members.edit', label: 'Edit Members', description: 'Update member information' },
      { id: 'members.delete', label: 'Delete Members', description: 'Remove member records' },
      { id: 'members.export', label: 'Export Members', description: 'Export member data' },
    ],
  },
  finance: {
    label: 'Financial Management',
    permissions: [
      { id: 'finance.view', label: 'View Financial Data', description: 'View income and expenses' },
      { id: 'finance.create', label: 'Record Transactions', description: 'Add income and expenses' },
      { id: 'finance.edit', label: 'Edit Transactions', description: 'Modify financial records' },
      { id: 'finance.delete', label: 'Delete Transactions', description: 'Remove financial records' },
      { id: 'finance.reports', label: 'Financial Reports', description: 'Generate financial reports' },
      { id: 'finance.approve', label: 'Approve Transactions', description: 'Approve financial transactions' },
    ],
  },
  events: {
    label: 'Events Management',
    permissions: [
      { id: 'events.view', label: 'View Events', description: 'View event calendar and details' },
      { id: 'events.create', label: 'Create Events', description: 'Add new events' },
      { id: 'events.edit', label: 'Edit Events', description: 'Modify event details' },
      { id: 'events.delete', label: 'Delete Events', description: 'Remove events' },
      { id: 'events.publish', label: 'Publish Events', description: 'Make events public' },
    ],
  },
  attendance: {
    label: 'Attendance Tracking',
    permissions: [
      { id: 'attendance.view', label: 'View Attendance', description: 'View attendance records' },
      { id: 'attendance.create', label: 'Record Attendance', description: 'Mark attendance' },
      { id: 'attendance.edit', label: 'Edit Attendance', description: 'Modify attendance records' },
      { id: 'attendance.delete', label: 'Delete Attendance', description: 'Remove attendance records' },
      { id: 'attendance.reports', label: 'Attendance Reports', description: 'Generate attendance reports' },
    ],
  },
  communications: {
    label: 'Communications',
    permissions: [
      { id: 'comms.view', label: 'View Messages', description: 'View communication history' },
      { id: 'comms.send', label: 'Send Messages', description: 'Send emails and SMS' },
      { id: 'comms.broadcast', label: 'Mass Communication', description: 'Send bulk messages' },
      { id: 'comms.templates', label: 'Manage Templates', description: 'Create message templates' },
    ],
  },
  groups: {
    label: 'Groups Management',
    permissions: [
      { id: 'groups.view', label: 'View Groups', description: 'View groups and members' },
      { id: 'groups.create', label: 'Create Groups', description: 'Add new groups' },
      { id: 'groups.edit', label: 'Edit Groups', description: 'Modify group details' },
      { id: 'groups.delete', label: 'Delete Groups', description: 'Remove groups' },
    ],
  },
  prayerRequests: {
    label: 'Prayer Requests',
    permissions: [
      { id: 'prayer.view', label: 'View Requests', description: 'View prayer requests' },
      { id: 'prayer.create', label: 'Submit Requests', description: 'Submit prayer requests' },
      { id: 'prayer.edit', label: 'Edit Requests', description: 'Modify prayer requests' },
      { id: 'prayer.delete', label: 'Delete Requests', description: 'Remove prayer requests' },
      { id: 'prayer.viewConfidential', label: 'View Confidential', description: 'View confidential prayers' },
    ],
  },
  settings: {
    label: 'System Settings',
    permissions: [
      { id: 'settings.view', label: 'View Settings', description: 'View system settings' },
      { id: 'settings.edit', label: 'Edit Settings', description: 'Modify system settings' },
      { id: 'settings.users', label: 'Manage Users', description: 'Create and manage users' },
      { id: 'settings.roles', label: 'Manage Roles', description: 'Create and manage roles' },
      { id: 'settings.backup', label: 'Backup Management', description: 'Create and restore backups' },
      { id: 'settings.integrations', label: 'API Integrations', description: 'Manage integrations' },
    ],
  },
};

// Form validation schema
const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

export default function AddRolePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const selectedPermissions = form.watch('permissions');

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Role data:', data);
      
      toast({
        title: "Role Created",
        description: `${data.name} role has been created with ${data.permissions.length} permissions.`,
      });
      
      router.push('/dashboard/settings?tab=roles');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (categoryKey: string, checked: boolean) => {
    const category = PERMISSIONS[categoryKey as keyof typeof PERMISSIONS];
    const categoryPermissionIds = category.permissions.map(p => p.id);
    
    if (checked) {
      // Add all permissions from this category
      const currentPermissions = form.getValues('permissions');
      const newPermissions = Array.from(new Set([...currentPermissions, ...categoryPermissionIds]));
      form.setValue('permissions', newPermissions);
    } else {
      // Remove all permissions from this category
      const currentPermissions = form.getValues('permissions');
      const newPermissions = currentPermissions.filter(p => !categoryPermissionIds.includes(p));
      form.setValue('permissions', newPermissions);
    }
  };

  const isCategoryFullySelected = (categoryKey: string) => {
    const category = PERMISSIONS[categoryKey as keyof typeof PERMISSIONS];
    const categoryPermissionIds = category.permissions.map(p => p.id);
    return categoryPermissionIds.every(id => selectedPermissions.includes(id));
  };

  const isCategoryPartiallySelected = (categoryKey: string) => {
    const category = PERMISSIONS[categoryKey as keyof typeof PERMISSIONS];
    const categoryPermissionIds = category.permissions.map(p => p.id);
    const hasAny = categoryPermissionIds.some(id => selectedPermissions.includes(id));
    const hasAll = categoryPermissionIds.every(id => selectedPermissions.includes(id));
    return hasAny && !hasAll;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings?tab=roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Create New Role</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Role Information</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Youth Leader / Finance Auditor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Role responsibilities and operational scope..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">Module Access & Permissions</h2>
                  <Badge variant="neutral">{selectedPermissions.length} selected</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPermissions = Object.values(PERMISSIONS).flatMap(cat => 
                        cat.permissions.map(p => p.id)
                      );
                      form.setValue('permissions', allPermissions);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const viewPermissions = Object.values(PERMISSIONS).flatMap(cat => 
                        cat.permissions.filter(p => p.id.includes('.view')).map(p => p.id)
                      );
                      form.setValue('permissions', viewPermissions);
                    }}
                  >
                    View Only
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.setValue('permissions', []);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(PERMISSIONS).map(([categoryKey, category]) => (
                        <div key={categoryKey} className="rounded-lg border border-border p-4 space-y-4">
                          <div className="flex items-center space-x-2 pb-2 border-b border-border">
                            <Checkbox
                              checked={isCategoryFullySelected(categoryKey)}
                              onCheckedChange={(checked) => toggleCategory(categoryKey, checked as boolean)}
                              className={isCategoryPartiallySelected(categoryKey) ? 'data-[state=checked]:bg-primary/50' : ''}
                            />
                            <Label className="text-sm font-semibold cursor-pointer flex-1">
                              {category.label}
                            </Label>
                            {isCategoryFullySelected(categoryKey) && (
                              <CheckCircle className="h-4 w-4 text-brand-success" />
                            )}
                          </div>

                          <div className="space-y-3 pt-1">
                            {category.permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-2.5 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, permission.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== permission.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                      <FormLabel className="text-xs font-medium cursor-pointer">
                                        {permission.label}
                                      </FormLabel>
                                      <FormDescription className="text-[11px] text-muted-foreground">
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/settings?tab=roles')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedPermissions.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating Role...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
