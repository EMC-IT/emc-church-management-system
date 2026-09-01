'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  FolderOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Calendar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';

// Brand colors
const BRAND_CATEGORY_COLORS = [
  { name: 'Primary Blue', value: '#2E8DB0' },
  { name: 'Secondary Blue', value: '#28ACD1' },
  { name: 'Brand Gold', value: '#C49831' },
  { name: 'Brand Green', value: '#A5CF5D' },
  { name: 'Slate', value: '#475569' },
];

// Mock categories data
const mockCategories = [
  {
    id: '1',
    name: 'Worship',
    description: 'Sunday services, prayer meetings, and worship events',
    color: '#2E8DB0',
    icon: '🙏',
    eventCount: 12,
    isActive: true,
    createdAt: '2024-01-01T10:00:00',
    updatedAt: '2024-01-15T14:30:00'
  },
  {
    id: '2',
    name: 'Study',
    description: 'Bible studies, seminars, and educational events',
    color: '#A5CF5D',
    icon: '📖',
    eventCount: 8,
    isActive: true,
    createdAt: '2024-01-02T11:00:00',
    updatedAt: '2024-01-10T16:20:00'
  },
  {
    id: '3',
    name: 'Conference',
    description: 'Large gatherings, conferences, and special events',
    color: '#28ACD1',
    icon: '🎤',
    eventCount: 3,
    isActive: true,
    createdAt: '2024-01-03T12:00:00',
    updatedAt: '2024-01-12T09:15:00'
  },
  {
    id: '4',
    name: 'Outreach',
    description: 'Community service and evangelism activities',
    color: '#C49831',
    icon: '🤝',
    eventCount: 6,
    isActive: true,
    createdAt: '2024-01-04T13:00:00',
    updatedAt: '2024-01-14T11:45:00'
  },
  {
    id: '5',
    name: 'Youth',
    description: 'Youth ministry events and activities',
    color: '#2E8DB0',
    icon: '🎯',
    eventCount: 15,
    isActive: true,
    createdAt: '2024-01-05T14:00:00',
    updatedAt: '2024-01-16T13:30:00'
  },
  {
    id: '6',
    name: 'Children',
    description: 'Children ministry and Sunday school events',
    color: '#C49831',
    icon: '🧸',
    eventCount: 10,
    isActive: true,
    createdAt: '2024-01-06T15:00:00',
    updatedAt: '2024-01-17T10:20:00'
  },
  {
    id: '7',
    name: 'Music',
    description: 'Choir practice, concerts, and musical events',
    color: '#28ACD1',
    icon: '🎵',
    eventCount: 7,
    isActive: true,
    createdAt: '2024-01-07T16:00:00',
    updatedAt: '2024-01-18T15:10:00'
  },
  {
    id: '8',
    name: 'Training',
    description: 'Leadership training and skill development',
    color: '#475569',
    icon: '🎓',
    eventCount: 4,
    isActive: false,
    createdAt: '2024-01-08T17:00:00',
    updatedAt: '2024-01-19T12:40:00'
  }
];

const iconOptions = ['🙏', '📖', '🎤', '🤝', '🎯', '🧸', '🎵', '🎓', '🎉', '💒', '✝️', '🕊️', '❤️', '🌟', '🔥'];

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export default function EventCategoriesPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const deleteDialog = useDeleteDialog();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#2E8DB0',
    icon: '🙏',
    isActive: true
  });
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && category.isActive) ||
                         (statusFilter === 'Inactive' && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length,
    totalEvents: categories.reduce((sum, cat) => sum + cat.eventCount, 0)
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.color) newErrors.color = 'Color is required';
    if (!formData.icon) newErrors.icon = 'Icon is required';

    const isDuplicate = categories.some(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== selectedCategory?.id
    );
    if (isDuplicate) {
      newErrors.name = 'A category with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#2E8DB0',
      icon: '🙏',
      isActive: true
    });
    setErrors({});
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCategory = {
        id: Date.now().toString(),
        ...formData,
        eventCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCategories(prev => [...prev, newCategory]);
      setAddDialogOpen(false);
      resetForm();
      toast.success('Category created successfully');
    } catch {
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm() || !selectedCategory) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...cat, ...formData, updatedAt: new Date().toISOString() }
          : cat
      ));
      
      setEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      toast.success('Category updated successfully');
    } catch {
      toast.error('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCategory = async (item: { id: string; name: string }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCategories(prev => prev.filter(cat => cat.id !== item.id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
      throw error;
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isActive: !cat.isActive, updatedAt: new Date().toISOString() }
          : cat
      ));
      
      toast.success('Category status updated successfully');
    } catch {
      toast.error('Failed to update category status');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: any) => {
    deleteDialog.openDialog({ id: category.id, name: category.name, eventCount: category.eventCount });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/events" aria-label="Back to Events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Event Categories</h1>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new event category with custom settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Worship"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this category"
                  rows={3}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="color">Brand Color</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAND_CATEGORY_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.value }} />
                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-base mr-2">{icon}</span>
                          <span>{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Categories" value={stats.total} icon={Tag} />
        <StatCard title="Active Categories" value={stats.active} icon={Settings} />
        <StatCard title="Inactive Categories" value={stats.inactive} icon={Settings} />
        <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="transition-colors hover:border-foreground/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 bg-primary/10 text-primary"
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <div className="pt-0.5">
                      <StatusBadge status={category.isActive ? 'active' : 'inactive'} />
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                      <Settings className="mr-2 h-4 w-4" />
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(category)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{category.eventCount} events</span>
                </div>
                <span>
                  Updated {new Date(category.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No categories found matching your criteria.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Category Name *</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="editDescription">Description *</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this category"
                rows={3}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editColor">Brand Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_CATEGORY_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.value }} />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="editIcon">Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-base mr-2">{icon}</span>
                        <span>{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(confirmDeleteCategory)}
        title="Delete Category?"
        description={`This action cannot be undone and will affect ${deleteDialog.itemToDelete?.eventCount || 0} events.`}
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
        confirmText="Delete Category"
        destructive={true}
      />
    </div>
  );
}