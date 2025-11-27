'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ColumnDef } from '@tanstack/react-table';

interface PrayerCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  requestCount: number;
  activeRequests: number;
  createdAt: string;
}

// Mock data
const mockCategories: PrayerCategory[] = [
  {
    id: '1',
    name: 'Healing & Health',
    description: 'Prayers for physical, mental, and emotional healing',
    color: '#EF4444',
    icon: '❤️',
    requestCount: 45,
    activeRequests: 12,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Family & Relationships',
    description: 'Prayers for family unity, marriage, and relationships',
    color: '#F59E0B',
    icon: '👨‍👩‍👧‍👦',
    requestCount: 38,
    activeRequests: 8,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Financial Needs',
    description: 'Prayers for financial provision and wisdom',
    color: '#10B981',
    icon: '💰',
    requestCount: 29,
    activeRequests: 15,
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Guidance & Direction',
    description: 'Prayers for wisdom, decisions, and life direction',
    color: '#3B82F6',
    icon: '🧭',
    requestCount: 52,
    activeRequests: 18,
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Salvation & Deliverance',
    description: 'Prayers for salvation, deliverance, and breakthrough',
    color: '#8B5CF6',
    icon: '✝️',
    requestCount: 31,
    activeRequests: 9,
    createdAt: '2024-01-01',
  },
  {
    id: '6',
    name: 'Protection & Safety',
    description: 'Prayers for protection, safety, and security',
    color: '#EC4899',
    icon: '🛡️',
    requestCount: 24,
    activeRequests: 6,
    createdAt: '2024-01-01',
  },
  {
    id: '7',
    name: 'Thanksgiving & Praise',
    description: 'Prayers of gratitude and thanksgiving',
    color: '#F59E0B',
    icon: '🙏',
    requestCount: 67,
    activeRequests: 22,
    createdAt: '2024-01-01',
  },
  {
    id: '8',
    name: 'Mission & Outreach',
    description: 'Prayers for mission work and evangelism',
    color: '#14B8A6',
    icon: '🌍',
    requestCount: 19,
    activeRequests: 7,
    createdAt: '2024-01-01',
  },
];

const PREDEFINED_COLORS = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#10B981', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#6366F1', label: 'Indigo' },
];

export default function PrayerCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<PrayerCategory[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    try {
      // TODO: Replace with actual API call
      const newCategory: PrayerCategory = {
        id: Date.now().toString(),
        ...formData,
        requestCount: 0,
        activeRequests: 0,
        createdAt: new Date().toISOString(),
      };

      setCategories([...categories, newCategory]);
      setIsAddDialogOpen(false);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });

      toast({
        title: 'Category Created',
        description: 'Prayer category has been created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = () => {
    if (!selectedCategory) return;

    try {
      // TODO: Replace with actual API call
      const updatedCategories = categories.map(cat =>
        cat.id === selectedCategory.id
          ? { ...cat, ...formData }
          : cat
      );

      setCategories(updatedCategories);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });

      toast({
        title: 'Category Updated',
        description: 'Prayer category has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) return;

    try {
      // TODO: Replace with actual API call
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);

      toast({
        title: 'Category Deleted',
        description: 'Prayer category has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (category: PrayerCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: PrayerCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const columns: ColumnDef<PrayerCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <span className="text-xl">{category.icon}</span>
            </div>
            <div>
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-muted-foreground max-w-md truncate">
                {category.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'requestCount',
      header: 'Total Requests',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.requestCount}</span>
      ),
    },
    {
      accessorKey: 'activeRequests',
      header: 'Active Requests',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.activeRequests}</Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(category)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const totalRequests = categories.reduce((sum, cat) => sum + cat.requestCount, 0);
  const totalActive = categories.reduce((sum, cat) => sum + cat.activeRequests, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prayer Categories</h1>
            <p className="text-muted-foreground">Manage prayer request categories</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary hover:bg-brand-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Prayer Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing prayer requests
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Healing & Health"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon (Emoji) *</Label>
                  <Input
                    id="icon"
                    placeholder="📁"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Color *</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {PREDEFINED_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-md border-2 ${
                          formData.color === color.value ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!formData.name || !formData.description}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Heart className="h-4 w-4 text-brand-primary fill-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">{totalActive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? Math.round(totalRequests / categories.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Categories</CardTitle>
          <CardDescription>Manage categories for organizing prayer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredCategories} />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prayer Category</DialogTitle>
            <DialogDescription>
              Update the details of this prayer category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Healing & Health"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-icon">Icon (Emoji) *</Label>
                <Input
                  id="edit-icon"
                  placeholder="📁"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
              <div>
                <Label>Color *</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-md border-2 ${
                        formData.color === color.value ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.name || !formData.description}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prayer Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
              All prayer requests in this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
