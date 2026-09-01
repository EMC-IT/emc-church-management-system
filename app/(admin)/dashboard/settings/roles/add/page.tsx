"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PERMISSION_CATEGORIES } from '@/lib/permissions';

// Form validation schema
const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

export default function CreateRolePage() {
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

  const selectedPermissions = form.watch('permissions') || [];

  const isCategoryFullySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    return category.permissions.every(p => selectedPermissions.includes(p.id));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    const count = category.permissions.filter(p => selectedPermissions.includes(p.id)).length;
    return count > 0 && count < category.permissions.length;
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    const currentPermissions = new Set(selectedPermissions);
    category.permissions.forEach(p => {
      if (checked) {
        currentPermissions.add(p.id);
      } else {
        currentPermissions.delete(p.id);
      }
    });
    form.setValue('permissions', Array.from(currentPermissions));
  };

  const onSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
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

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings?tab=roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Create New Role</h1>
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
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Youth Leader, Finance Admin" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive name for this role
                      </FormDescription>
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
                          placeholder="Describe the responsibilities and access level of this role..." 
                          className="resize-none h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what members with this role are responsible for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Module Access & Permissions */}
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
                      const allPermissions = PERMISSION_CATEGORIES.flatMap(cat => 
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
                      const viewPermissions = PERMISSION_CATEGORIES.flatMap(cat => 
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
                      {PERMISSION_CATEGORIES.map((category) => (
                        <div key={category.id} className="rounded-lg border border-border p-4 space-y-4">
                          <div className="flex items-center space-x-2 pb-2 border-b border-border">
                            <Checkbox
                              checked={isCategoryFullySelected(category.id)}
                              onCheckedChange={(checked) => toggleCategory(category.id, checked as boolean)}
                              className={isCategoryPartiallySelected(category.id) ? 'data-[state=checked]:bg-primary/50' : ''}
                            />
                            <Label className="text-sm font-semibold cursor-pointer flex-1">
                              {category.name}
                            </Label>
                            {isCategoryFullySelected(category.id) && (
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
                                            ? field.onChange([...(field.value || []), permission.id])
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
                                        {permission.name}
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
