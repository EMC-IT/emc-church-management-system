'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield,
  ArrowLeft,
  Save,
  Users,
  Calendar,
  Mail,
  DollarSign,
  BarChart3,
  CheckSquare,
  Tag,
  FileText,
  Folder,
  Building2,
  Settings as SettingsIcon,
  TrendingUp,
  Package,
  Search,
  Activity,
  Heart,
  HeartHandshake,
  GraduationCap,
  UsersRound,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSION_CATEGORIES, ROLE_PERMISSIONS, ROLES } from '@/lib/permissions';

const categoryIcons: Record<string, LucideIcon> = {
  'dashboard': BarChart3,
  'activity-logs': Activity,
  'members': Users,
  'attendance': CheckSquare,
  'groups': UsersRound,
  'departments': Building2,
  'sunday-school': GraduationCap,
  'prayer-requests': Heart,
  'pastoral-care': HeartHandshake,
  'events': Calendar,
  'finance': DollarSign,
  'assets': Package,
  'communications': Mail,
  'settings': SettingsIcon,
  'profile': User,
};

// Role templates for quick setup
const roleTemplates = [
  {
    name: 'Administrator',
    description: 'Full access to all modules and configurations',
    icon: Shield,
  },
  {
    name: 'Pastor',
    description: 'Pastoral care, preaching, groups, and ministry leadership',
    icon: Users,
  },
  {
    name: 'Secretary',
    description: 'Administrative records, members, attendance, and communications',
    icon: FileText,
  },
  {
    name: 'Finance Officer',
    description: 'Comprehensive financial records, giving, budgets, and statements',
    icon: DollarSign,
  },
  {
    name: 'Department Head',
    description: 'Departmental management, small groups, events, and rosters',
    icon: Building2,
  },
  {
    name: 'View Only',
    description: 'Read-only access across all general pages and dashboards',
    icon: Tag,
  }
];

export default function PermissionsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.id)))
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['dashboard', 'members', 'finance'])
  );

  // Handle category-level permission toggle
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const newPermissions = new Set(selectedPermissions);
    category.permissions.forEach(permission => {
      if (checked) {
        newPermissions.add(permission.id);
      } else {
        newPermissions.delete(permission.id);
      }
    });
    setSelectedPermissions(newPermissions);
  };

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newPermissions = new Set(selectedPermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  // Check if category is fully selected
  const isCategoryFullySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    return category.permissions.every(p => selectedPermissions.has(p.id));
  };

  // Check if category is partially selected
  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    const selectedCount = category.permissions.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  // Apply role template
  const applyTemplate = (templateName: string) => {
    const newPermissions = new Set<string>();
    
    switch (templateName) {
      case 'Administrator':
        PERMISSION_CATEGORIES.forEach(category => {
          category.permissions.forEach(permission => {
            newPermissions.add(permission.id);
          });
        });
        break;
        
      case 'Pastor':
        (ROLE_PERMISSIONS[ROLES.PASTOR] || []).forEach(p => newPermissions.add(p));
        break;
        
      case 'Secretary':
        (ROLE_PERMISSIONS[ROLES.SECRETARY] || []).forEach(p => newPermissions.add(p));
        break;
        
      case 'Finance Officer':
        (ROLE_PERMISSIONS[ROLES.ACCOUNTANT] || []).forEach(p => newPermissions.add(p));
        break;
        
      case 'Department Head':
        ['departments', 'groups', 'events', 'attendance'].forEach(catId => {
          const category = PERMISSION_CATEGORIES.find(c => c.id === catId);
          category?.permissions.forEach(permission => {
            newPermissions.add(permission.id);
          });
        });
        ['dashboard.view', 'members.view', 'members.contact', 'profile.view', 'profile.edit'].forEach(p => {
          newPermissions.add(p);
        });
        break;
        
      case 'View Only':
        PERMISSION_CATEGORIES.forEach(category => {
          category.permissions.forEach(permission => {
            if (permission.id.includes('.view') || permission.name.toLowerCase().includes('view')) {
              newPermissions.add(permission.id);
            }
          });
        });
        break;
    }
    
    setSelectedPermissions(newPermissions);
    toast.success(`Applied ${templateName} template`);
  };

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    const newPermissions = new Set<string>();

    if (roleKey === 'admin') {
      (ROLE_PERMISSIONS[ROLES.SUPER_ADMIN] || []).forEach(p => newPermissions.add(p));
    } else if (roleKey === 'pastor') {
      (ROLE_PERMISSIONS[ROLES.PASTOR] || []).forEach(p => newPermissions.add(p));
    } else if (roleKey === 'secretary') {
      (ROLE_PERMISSIONS[ROLES.SECRETARY] || []).forEach(p => newPermissions.add(p));
    } else if (roleKey === 'finance') {
      (ROLE_PERMISSIONS[ROLES.ACCOUNTANT] || []).forEach(p => newPermissions.add(p));
    } else if (roleKey === 'teacher') {
      (ROLE_PERMISSIONS[ROLES.TEACHER] || []).forEach(p => newPermissions.add(p));
    } else if (roleKey === 'user') {
      PERMISSION_CATEGORIES.forEach(cat => {
        cat.permissions.forEach(p => {
          if (p.id.includes('.view')) newPermissions.add(p.id);
        });
      });
    }

    setSelectedPermissions(newPermissions);
    toast.success(`Loaded permissions from ${roleKey}`);
  };

  // Filter permissions based on search
  const filteredCategories = PERMISSION_CATEGORIES.map(category => {
    if (!searchTerm) return category;
    
    const filteredPermissions = category.permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return { ...category, permissions: filteredPermissions };
  }).filter(category => category.permissions.length > 0);

  const handleSave = () => {
    console.log('Saving permissions:', Array.from(selectedPermissions));
    toast.success('Permissions updated successfully');
  };

  const selectedCount = selectedPermissions.size;
  const totalCount = PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/settings?tab=roles')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Permissions Management</h1>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-1.5 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Permissions"
          value={totalCount}
          icon={Shield}
        />
        <StatCard
          title="Selected"
          value={selectedCount}
          icon={CheckSquare}
          accent="primary"
        />
        <StatCard
          title="Categories"
          value={PERMISSION_CATEGORIES.length}
          icon={Folder}
          accent="secondary"
        />
        <StatCard
          title="Coverage"
          value={PERMISSION_CATEGORIES.filter(c => isCategoryFullySelected(c.id)).length}
          icon={TrendingUp}
          accent="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Role Templates */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roleTemplates.map((template) => (
              <Card
                key={template.name}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border hover:border-primary"
                onClick={() => applyTemplate(template.name)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </Card>
            ))}

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Load from Existing Role</Label>
              <Select value={selectedRole} onValueChange={handleRoleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="pastor">Senior Pastor</SelectItem>
                  <SelectItem value="secretary">Church Secretary</SelectItem>
                  <SelectItem value="finance">Finance Officer</SelectItem>
                  <SelectItem value="teacher">Sunday School Teacher</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Permissions List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Configure Permissions</CardTitle>
              <Badge variant="neutral">{selectedCount}/{totalCount} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all permissions, categories, or actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Permissions Accordion */}
            <Accordion 
              type="multiple" 
              value={Array.from(expandedCategories)} 
              onValueChange={(values) => setExpandedCategories(new Set(values))}
              className="space-y-4"
            >
              {filteredCategories.map((category) => {
                const CategoryIcon = categoryIcons[category.id] || Folder;
                const isFullySelected = isCategoryFullySelected(category.id);
                const isPartiallySelected = isCategoryPartiallySelected(category.id);
                const selectedInCategory = category.permissions.filter(p => 
                  selectedPermissions.has(p.id)
                ).length;

                return (
                  <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                    <div className="flex items-center px-4 hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isFullySelected}
                        onCheckedChange={(checked) => {
                          handleCategoryToggle(category.id, checked as boolean);
                        }}
                        className={isPartiallySelected ? 'data-[state=checked]:bg-primary/60 mr-3' : 'mr-3'}
                        aria-label={`Select all ${category.name} permissions`}
                      />
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 flex-1">
                          <CategoryIcon className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-sm text-foreground">{category.name}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                          <Badge variant="neutral" className="mr-2">
                            {selectedInCategory}/{category.permissions.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3 mt-3 pl-11">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.has(permission.id)}
                              onCheckedChange={(checked) => {
                                handlePermissionToggle(permission.id, checked as boolean);
                              }}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={permission.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium text-sm text-foreground">{permission.name}</div>
                              <div className="text-xs text-muted-foreground">{permission.description}</div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base font-semibold text-foreground">No permissions found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
