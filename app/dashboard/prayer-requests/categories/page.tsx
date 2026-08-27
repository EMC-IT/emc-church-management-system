'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderOpen,
  ArrowLeft,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

// Brand aligned colors
const BRAND_CATEGORY_COLORS = [
  { value: '#2E8DB0', label: 'Primary Blue' },
  { value: '#28ACD1', label: 'Secondary Blue' },
  { value: '#C49831', label: 'Brand Gold' },
  { value: '#A5CF5D', label: 'Brand Green' },
  { value: '#475569', label: 'Slate' },
];

// Mock data
const mockCategories: PrayerCategory[] = [
  {
    id: '1',
    name: 'Healing & Health',
    description: 'Prayers for physical, mental, and emotional healing',
    color: '#2E8DB0',
    icon: '❤️',
    requestCount: 45,
    activeRequests: 12,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Family & Relationships',
    description: 'Prayers for family unity, marriage, and relationships',
    color: '#28ACD1',
    icon: '👨‍👩‍👧‍👦',
    requestCount: 38,
    activeRequests: 8,
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    name: 'Financial Needs',
    description: 'Prayers for financial provision and wisdom',
    color: '#C49831',
    icon: '💰',
    requestCount: 29,
    activeRequests: 15,
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    name: 'Guidance & Direction',
    description: 'Prayers for wisdom, decisions, and life direction',
    color: '#2E8DB0',
    icon: '🧭',
    requestCount: 52,
    activeRequests: 18,
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    name: 'Salvation & Deliverance',
    description: 'Prayers for salvation, deliverance, and breakthrough',
    color: '#28ACD1',
    icon: '✝️',
    requestCount: 31,
    activeRequests: 9,
    createdAt: '2024-01-01',
  },
  {
    id: '6',
    name: 'Protection & Safety',
    description: 'Prayers for protection, safety, and security',
    color: '#C49831',
    icon: '🛡️',
    requestCount: 24,
    activeRequests: 6,
    createdAt: '2024-01-01',
  },
  {
    id: '7',
    name: 'Thanksgiving & Praise',
    description: 'Prayers of gratitude and thanksgiving',
    color: '#A5CF5D',
    icon: '🙏',
    requestCount: 67,
    activeRequests: 22,
    createdAt: '2024-01-01',
  },
  {
    id: '8',
    name: 'Mission & Outreach',
    description: 'Prayers for mission work and evangelism',
    color: '#475569',
    icon: '🌍',
    requestCount: 19,
    activeRequests: 7,
    createdAt: '2024-01-01',
  },
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
    color: '#2E8DB0',
    icon: '📁',
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    try {
      const newCategory: PrayerCategory = {
        id: Date.now().toString(),
        ...formData,
        requestCount: 0,
        activeRequests: 0,
        createdAt: new Date().toISOString(),
      };

      setCategories([...categories, newCategory]);
      setIsAddDialogOpen(false);
      setFormData({ name: '', description: '', color: '#2E8DB0', icon: '📁' });

      toast({
        title: 'Category Created',
        description: 'Prayer category has been created successfully',
      });
    } catch {
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
      const updatedCategories = categories.map(cat =>
        cat.id === selectedCategory.id
          ? { ...cat, ...formData }
          : cat
      );

      setCategories(updatedCategories);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '', color: '#2E8DB0', icon: '📁' });

      toast({
        title: 'Category Updated',
        description: 'Prayer category has been updated successfully',
      });
    } catch {
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
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);

      toast({
        title: 'Category Deleted',
        description: 'Prayer category has been deleted successfully',
      });
    } catch {
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
      color: category.color || '#2E8DB0',
      icon: category.icon || '📁',
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
              className="flex items-center justify-center w-8 h-8 rounded-lg text-base shrink-0 bg-primary/10 text-primary"
            >
              <span>{category.icon || '📁'}</span>
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">{category.name}</p>
              <p className="text-xs text-muted-foreground max-w-md truncate">
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
        <span className="font-medium text-sm text-foreground">{row.original.requestCount}</span>
      ),
    },
    {
      accessorKey: 'activeRequests',
      header: 'Active Requests',
      cell: ({ row }) => (
        <Badge variant="neutral" size="sm">{row.original.activeRequests}</Badge>
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(category)}
                className="text-destructive focus:text-destructive"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/prayer-requests" aria-label="Back to Prayer Requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Prayer Categories</h1>
        </div>

        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Categories" value={categories.length} icon={FolderOpen} />
        <StatCard title="Total Requests" value={totalRequests} icon={Heart} />
        <StatCard title="Active Requests" value={totalActive} icon={Clock} />
        <StatCard title="Avg per Category" value={categories.length > 0 ? Math.round(totalRequests / categories.length) : 0} icon={TrendingUp} />
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        recordLabel="category"
        recordLabelPlural="categories"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search categories..."
      />

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prayer Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">Category Name *</Label>
              <Input
                id="add-name"
                placeholder="Healing & Health"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                placeholder="Description of this prayer category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-icon">Icon (Emoji) *</Label>
                <Input
                  id="add-icon"
                  placeholder="📁"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Accent *</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {BRAND_CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-7 h-7 rounded-md border-2 transition-transform ${
                        formData.color === color.value ? 'border-foreground scale-110' : 'border-transparent'
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
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!formData.name || !formData.description}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prayer Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                placeholder="Healing & Health"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Description of this prayer category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-icon">Icon (Emoji) *</Label>
                <Input
                  id="edit-icon"
                  placeholder="📁"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Brand Accent *</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {BRAND_CATEGORY_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-7 h-7 rounded-md border-2 transition-transform ${
                        formData.color === color.value ? 'border-foreground scale-110' : 'border-transparent'
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
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleEdit} disabled={!formData.name || !formData.description}>
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
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;? This action cannot be undone.
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
