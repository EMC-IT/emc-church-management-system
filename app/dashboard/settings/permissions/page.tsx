'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  School,
  UserCog,
  BarChart3,
  CheckSquare,
  Clock,
  Tag,
  FileText,
  Folder,
  Building2,
  MessageSquare,
  Settings as SettingsIcon,
  TrendingUp,
  Package,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

// Comprehensive permission structure covering all features
const permissionCategories = [
  {
    id: 'dashboard',
    name: 'Dashboard & Analytics',
    icon: BarChart3,
    description: 'Dashboard views and analytics access',
    permissions: [
      { id: 'dashboard.view', name: 'View Dashboard', description: 'Access main dashboard' },
      { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics and reports dashboard' },
      { id: 'analytics.export', name: 'Export Analytics', description: 'Export analytics data and reports' },
      { id: 'analytics.attendance', name: 'View Attendance Analytics', description: 'Access attendance analytics' },
    ]
  },
  {
    id: 'members',
    name: 'Members Management',
    icon: Users,
    description: 'Member records and profiles',
    permissions: [
      { id: 'members.view', name: 'View Members', description: 'View member list and profiles' },
      { id: 'members.create', name: 'Add Members', description: 'Create new member records' },
      { id: 'members.edit', name: 'Edit Members', description: 'Update member information' },
      { id: 'members.delete', name: 'Delete Members', description: 'Remove member records' },
      { id: 'members.import', name: 'Import Members', description: 'Bulk import members from file' },
      { id: 'members.export', name: 'Export Members', description: 'Export member data' },
      { id: 'members.contact', name: 'View Contact Info', description: 'Access member contact details' },
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance Management',
    icon: CheckSquare,
    description: 'Attendance tracking and reports',
    permissions: [
      { id: 'attendance.view', name: 'View Attendance', description: 'View attendance records' },
      { id: 'attendance.take', name: 'Take Attendance', description: 'Mark attendance for services' },
      { id: 'attendance.edit', name: 'Edit Attendance', description: 'Modify attendance records' },
      { id: 'attendance.delete', name: 'Delete Attendance', description: 'Remove attendance records' },
      { id: 'attendance.qr', name: 'QR Check-in', description: 'Use QR code check-in system' },
      { id: 'attendance.history', name: 'View History', description: 'Access attendance history' },
      { id: 'attendance.reports', name: 'View Reports', description: 'Access attendance reports' },
      { id: 'attendance.groups', name: 'Group Attendance', description: 'Manage group attendance' },
      { id: 'attendance.department', name: 'Department Attendance', description: 'Manage department attendance' },
      { id: 'attendance.member', name: 'Member Attendance', description: 'View individual member attendance' },
    ]
  },
  {
    id: 'groups',
    name: 'Groups Management',
    icon: Users,
    description: 'Small groups and ministries',
    permissions: [
      { id: 'groups.view', name: 'View Groups', description: 'View groups list' },
      { id: 'groups.create', name: 'Create Groups', description: 'Add new groups' },
      { id: 'groups.edit', name: 'Edit Groups', description: 'Modify group information' },
      { id: 'groups.delete', name: 'Delete Groups', description: 'Remove groups' },
      { id: 'groups.categories', name: 'Manage Categories', description: 'Manage group categories' },
      { id: 'groups.members', name: 'Manage Members', description: 'Add/remove group members' },
    ]
  },
  {
    id: 'events',
    name: 'Events Management',
    icon: Calendar,
    description: 'Church events and activities',
    permissions: [
      { id: 'events.view', name: 'View Events', description: 'View events list' },
      { id: 'events.create', name: 'Create Events', description: 'Add new events' },
      { id: 'events.edit', name: 'Edit Events', description: 'Modify event details' },
      { id: 'events.delete', name: 'Delete Events', description: 'Remove events' },
      { id: 'events.calendar', name: 'View Calendar', description: 'Access events calendar' },
      { id: 'events.categories', name: 'Manage Categories', description: 'Manage event categories' },
      { id: 'events.templates', name: 'Manage Templates', description: 'Create and edit event templates' },
      { id: 'events.registrations', name: 'Manage Registrations', description: 'Handle event registrations' },
      { id: 'events.attendance', name: 'Event Attendance', description: 'Track event attendance' },
      { id: 'events.export', name: 'Export Events', description: 'Export event data' },
      { id: 'events.bulk', name: 'Bulk Actions', description: 'Perform bulk operations on events' },
    ]
  },
  {
    id: 'communications',
    name: 'Communications',
    icon: Mail,
    description: 'Messages and campaigns',
    permissions: [
      { id: 'communications.view', name: 'View Communications', description: 'View messages and campaigns' },
      { id: 'communications.send', name: 'Send Messages', description: 'Send SMS and email messages' },
      { id: 'communications.campaigns', name: 'Manage Campaigns', description: 'Create and manage campaigns' },
      { id: 'communications.campaigns.create', name: 'Create Campaigns', description: 'Create new campaigns' },
      { id: 'communications.campaigns.edit', name: 'Edit Campaigns', description: 'Modify campaigns' },
      { id: 'communications.campaigns.delete', name: 'Delete Campaigns', description: 'Remove campaigns' },
      { id: 'communications.announcements', name: 'Manage Announcements', description: 'Create and edit announcements' },
      { id: 'communications.newsletters', name: 'Manage Newsletters', description: 'Create and send newsletters' },
      { id: 'communications.templates', name: 'Message Templates', description: 'Manage message templates' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance Management',
    icon: DollarSign,
    description: 'Financial records and reports',
    permissions: [
      { id: 'finance.view', name: 'View Finance', description: 'View financial dashboard' },
      { id: 'finance.income.view', name: 'View Income', description: 'View income records' },
      { id: 'finance.income.create', name: 'Record Income', description: 'Add income entries' },
      { id: 'finance.income.edit', name: 'Edit Income', description: 'Modify income records' },
      { id: 'finance.income.delete', name: 'Delete Income', description: 'Remove income records' },
      { id: 'finance.expenses.view', name: 'View Expenses', description: 'View expense records' },
      { id: 'finance.expenses.create', name: 'Record Expenses', description: 'Add expense entries' },
      { id: 'finance.expenses.edit', name: 'Edit Expenses', description: 'Modify expense records' },
      { id: 'finance.expenses.delete', name: 'Delete Expenses', description: 'Remove expense records' },
      { id: 'finance.giving.view', name: 'View Giving', description: 'View giving records' },
      { id: 'finance.giving.manage', name: 'Manage Giving', description: 'Manage giving records' },
      { id: 'finance.tithes.view', name: 'View Tithes & Offerings', description: 'View tithes and offerings' },
      { id: 'finance.tithes.manage', name: 'Manage Tithes & Offerings', description: 'Manage tithes and offerings' },
      { id: 'finance.budgets.view', name: 'View Budgets', description: 'View budget information' },
      { id: 'finance.budgets.create', name: 'Create Budgets', description: 'Create new budgets' },
      { id: 'finance.budgets.edit', name: 'Edit Budgets', description: 'Modify budgets' },
      { id: 'finance.budgets.delete', name: 'Delete Budgets', description: 'Remove budgets' },
      { id: 'finance.budgets.categories', name: 'Manage Budget Categories', description: 'Manage budget categories' },
      { id: 'finance.budgets.allocations', name: 'Manage Allocations', description: 'Allocate budget funds' },
      { id: 'finance.reports', name: 'View Financial Reports', description: 'Access financial reports' },
      { id: 'finance.export', name: 'Export Financial Data', description: 'Export financial records' },
    ]
  },
  {
    id: 'assets',
    name: 'Assets Management',
    icon: Package,
    description: 'Church assets and inventory',
    permissions: [
      { id: 'assets.view', name: 'View Assets', description: 'View asset list' },
      { id: 'assets.create', name: 'Add Assets', description: 'Create new asset records' },
      { id: 'assets.edit', name: 'Edit Assets', description: 'Modify asset information' },
      { id: 'assets.delete', name: 'Delete Assets', description: 'Remove asset records' },
      { id: 'assets.categories', name: 'Manage Categories', description: 'Manage asset categories' },
      { id: 'assets.reports', name: 'View Reports', description: 'Access asset reports' },
      { id: 'assets.export', name: 'Export Assets', description: 'Export asset data' },
    ]
  },
  {
    id: 'departments',
    name: 'Departments',
    icon: Building2,
    description: 'Department management',
    permissions: [
      { id: 'departments.view', name: 'View Departments', description: 'View department list' },
      { id: 'departments.create', name: 'Create Departments', description: 'Add new departments' },
      { id: 'departments.edit', name: 'Edit Departments', description: 'Modify department information' },
      { id: 'departments.delete', name: 'Delete Departments', description: 'Remove departments' },
      { id: 'departments.categories', name: 'Manage Categories', description: 'Manage department categories' },
      { id: 'departments.members', name: 'Manage Members', description: 'Assign members to departments' },
    ]
  },
  {
    id: 'sunday-school',
    name: 'Sunday School',
    icon: School,
    description: 'Sunday school management',
    permissions: [
      { id: 'sunday-school.view', name: 'View Sunday School', description: 'View Sunday school dashboard' },
      { id: 'sunday-school.classes.view', name: 'View Classes', description: 'View class list' },
      { id: 'sunday-school.classes.create', name: 'Create Classes', description: 'Add new classes' },
      { id: 'sunday-school.classes.edit', name: 'Edit Classes', description: 'Modify class information' },
      { id: 'sunday-school.classes.delete', name: 'Delete Classes', description: 'Remove classes' },
      { id: 'sunday-school.students.view', name: 'View Students', description: 'View student records' },
      { id: 'sunday-school.students.manage', name: 'Manage Students', description: 'Add/edit student records' },
      { id: 'sunday-school.teachers.view', name: 'View Teachers', description: 'View teacher list' },
      { id: 'sunday-school.teachers.manage', name: 'Manage Teachers', description: 'Assign and manage teachers' },
      { id: 'sunday-school.materials.view', name: 'View Materials', description: 'View teaching materials' },
      { id: 'sunday-school.materials.manage', name: 'Manage Materials', description: 'Upload and manage materials' },
      { id: 'sunday-school.attendance', name: 'Take Attendance', description: 'Mark class attendance' },
      { id: 'sunday-school.reports', name: 'View Reports', description: 'Access Sunday school reports' },
    ]
  },
  {
    id: 'prayer-requests',
    name: 'Prayer Requests',
    icon: MessageSquare,
    description: 'Prayer request management',
    permissions: [
      { id: 'prayer-requests.view', name: 'View Prayer Requests', description: 'View all prayer requests' },
      { id: 'prayer-requests.view-confidential', name: 'View Confidential Requests', description: 'Access confidential requests' },
      { id: 'prayer-requests.create', name: 'Create Requests', description: 'Submit new prayer requests' },
      { id: 'prayer-requests.edit', name: 'Edit Requests', description: 'Modify prayer requests' },
      { id: 'prayer-requests.delete', name: 'Delete Requests', description: 'Remove prayer requests' },
      { id: 'prayer-requests.respond', name: 'Respond to Requests', description: 'Add comments and updates' },
      { id: 'prayer-requests.assign', name: 'Assign to Prayer Team', description: 'Assign requests to team members' },
      { id: 'prayer-requests.categories', name: 'Manage Categories', description: 'Manage prayer request categories' },
      { id: 'prayer-requests.status', name: 'Update Status', description: 'Update request status' },
    ]
  },
  {
    id: 'settings',
    name: 'Settings & Administration',
    icon: SettingsIcon,
    description: 'System configuration',
    permissions: [
      { id: 'settings.view', name: 'View Settings', description: 'Access settings dashboard' },
      { id: 'settings.church-profile', name: 'Manage Church Profile', description: 'Edit church information' },
      { id: 'settings.branches.view', name: 'View Branches', description: 'View branch list' },
      { id: 'settings.branches.create', name: 'Create Branches', description: 'Add new branches' },
      { id: 'settings.branches.edit', name: 'Edit Branches', description: 'Modify branch information' },
      { id: 'settings.branches.delete', name: 'Delete Branches', description: 'Remove branches' },
      { id: 'settings.users.view', name: 'View Users', description: 'View user list' },
      { id: 'settings.users.create', name: 'Create Users', description: 'Add new users' },
      { id: 'settings.users.edit', name: 'Edit Users', description: 'Modify user accounts' },
      { id: 'settings.users.delete', name: 'Delete Users', description: 'Remove user accounts' },
      { id: 'settings.users.suspend', name: 'Suspend Users', description: 'Suspend user accounts' },
      { id: 'settings.roles.view', name: 'View Roles', description: 'View role list' },
      { id: 'settings.roles.create', name: 'Create Roles', description: 'Add new roles' },
      { id: 'settings.roles.edit', name: 'Edit Roles', description: 'Modify role permissions' },
      { id: 'settings.roles.delete', name: 'Delete Roles', description: 'Remove roles' },
      { id: 'settings.permissions.manage', name: 'Manage Permissions', description: 'Configure system permissions' },
      { id: 'settings.system', name: 'System Configuration', description: 'Access system settings' },
    ]
  },
];

// Role templates for quick setup
const roleTemplates = [
  {
    name: 'Administrator',
    description: 'Full access to all features',
    icon: Shield,
    color: 'bg-red-500'
  },
  {
    name: 'Pastor',
    description: 'Leadership team access',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    name: 'Secretary',
    description: 'Administrative and records management',
    icon: FileText,
    color: 'bg-green-500'
  },
  {
    name: 'Finance Officer',
    description: 'Financial management and reports',
    icon: DollarSign,
    color: 'bg-yellow-500'
  },
  {
    name: 'Department Head',
    description: 'Department-specific management',
    icon: Building2,
    color: 'bg-purple-500'
  },
  {
    name: 'View Only',
    description: 'Read-only access to most features',
    icon: Tag,
    color: 'bg-gray-500'
  }
];

export default function PermissionsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['dashboard']));

  // Handle category-level permission toggle
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const category = permissionCategories.find(c => c.id === categoryId);
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
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return false;
    return category.permissions.every(p => selectedPermissions.has(p.id));
  };

  // Check if category is partially selected
  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return false;
    const selectedCount = category.permissions.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  // Apply role template
  const applyTemplate = (templateName: string) => {
    const newPermissions = new Set<string>();
    
    switch (templateName) {
      case 'Administrator':
        // Full access to everything
        permissionCategories.forEach(category => {
          category.permissions.forEach(permission => {
            newPermissions.add(permission.id);
          });
        });
        break;
        
      case 'Pastor':
        // Access to most features except some finance and system settings
        permissionCategories.forEach(category => {
          if (category.id !== 'settings') {
            category.permissions.forEach(permission => {
              newPermissions.add(permission.id);
            });
          } else {
            // Limited settings access
            ['settings.view', 'settings.church-profile', 'settings.branches.view'].forEach(p => {
              newPermissions.add(p);
            });
          }
        });
        break;
        
      case 'Secretary':
        // Members, attendance, events, communications
        ['members', 'attendance', 'events', 'communications', 'departments', 'groups'].forEach(catId => {
          const category = permissionCategories.find(c => c.id === catId);
          category?.permissions.forEach(permission => {
            newPermissions.add(permission.id);
          });
        });
        // View-only for dashboard and analytics
        ['dashboard.view', 'analytics.view'].forEach(p => newPermissions.add(p));
        break;
        
      case 'Finance Officer':
        // Full finance access
        const financeCategory = permissionCategories.find(c => c.id === 'finance');
        financeCategory?.permissions.forEach(permission => {
          newPermissions.add(permission.id);
        });
        // View access to dashboard
        ['dashboard.view', 'analytics.view', 'members.view'].forEach(p => {
          newPermissions.add(p);
        });
        break;
        
      case 'Department Head':
        // Department-specific permissions
        ['departments', 'groups', 'events', 'attendance'].forEach(catId => {
          const category = permissionCategories.find(c => c.id === catId);
          category?.permissions.forEach(permission => {
            newPermissions.add(permission.id);
          });
        });
        // View permissions for members
        ['members.view', 'members.contact'].forEach(p => newPermissions.add(p));
        break;
        
      case 'View Only':
        // View-only permissions
        permissionCategories.forEach(category => {
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

  // Filter permissions based on search
  const filteredCategories = permissionCategories.map(category => {
    if (!searchTerm) return category;
    
    const filteredPermissions = category.permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return { ...category, permissions: filteredPermissions };
  }).filter(category => category.permissions.length > 0);

  const handleSave = () => {
    // TODO: Implement actual save logic
    console.log('Saving permissions:', Array.from(selectedPermissions));
    toast.success('Permissions updated successfully');
  };

  const selectedCount = selectedPermissions.size;
  const totalCount = permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.push('/dashboard/settings?tab=roles')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Permissions Management</h1>
            <p className="text-muted-foreground">Configure comprehensive permissions for roles and users</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Across {permissionCategories.length} categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">{selectedCount}</div>
            <p className="text-xs text-muted-foreground">{Math.round((selectedCount / totalCount) * 100)}% of total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionCategories.length}</div>
            <p className="text-xs text-muted-foreground">Feature categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {permissionCategories.filter(c => isCategoryFullySelected(c.id)).length}
            </div>
            <p className="text-xs text-muted-foreground">Fully enabled categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Role Templates */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Templates</CardTitle>
            <CardDescription>Apply pre-configured permission sets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {roleTemplates.map((template) => (
              <Card
                key={template.name}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-brand-primary"
                onClick={() => applyTemplate(template.name)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${template.color}`}>
                    <template.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </Card>
            ))}

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label>Load from Existing Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="pastor">Senior Pastor</SelectItem>
                  <SelectItem value="secretary">Church Secretary</SelectItem>
                  <SelectItem value="finance">Finance Officer</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Permissions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configure Permissions</CardTitle>
                <CardDescription>
                  Select permissions for this role ({selectedCount} selected)
                </CardDescription>
              </div>
              <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Permissions Accordion */}
            <Accordion type="multiple" value={Array.from(expandedCategories)} className="space-y-4">
              {filteredCategories.map((category) => {
                const CategoryIcon = category.icon;
                const isFullySelected = isCategoryFullySelected(category.id);
                const isPartiallySelected = isCategoryPartiallySelected(category.id);
                const selectedInCategory = category.permissions.filter(p => 
                  selectedPermissions.has(p.id)
                ).length;

                return (
                  <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                    <AccordionTrigger 
                      className="px-4 hover:no-underline hover:bg-muted/50"
                      onClick={() => {
                        const newExpanded = new Set(expandedCategories);
                        if (newExpanded.has(category.id)) {
                          newExpanded.delete(category.id);
                        } else {
                          newExpanded.add(category.id);
                        }
                        setExpandedCategories(newExpanded);
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isFullySelected}
                          onCheckedChange={(checked) => {
                            handleCategoryToggle(category.id, checked as boolean);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={isPartiallySelected ? 'data-[state=checked]:bg-brand-secondary' : ''}
                        />
                        <CategoryIcon className="h-5 w-5 text-brand-primary" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        </div>
                        <Badge variant="secondary">
                          {selectedInCategory}/{category.permissions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
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
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
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
                <h3 className="text-lg font-medium">No permissions found</h3>
                <p className="text-muted-foreground">Try adjusting your search term</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
