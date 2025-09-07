'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderOpen, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock data for budget categories
const mockCategories = [
  {
    id: '1',
    name: 'Ministry Operations',
    description: 'Day-to-day ministry operations and activities',
    budgetCount: 8,
    totalBudget: 125000,
    status: 'Active',
    color: '#2E8DB0',
    createdAt: '2024-01-15',
    lastUsed: '2024-05-20',
  },
  {
    id: '2',
    name: 'Events & Programs',
    description: 'Special events, conferences, and church programs',
    budgetCount: 12,
    totalBudget: 85000,
    status: 'Active',
    color: '#28ACD1',
    createdAt: '2024-01-15',
    lastUsed: '2024-05-18',
  },
  {
    id: '3',
    name: 'Building Projects',
    description: 'Construction, renovation, and facility improvements',
    budgetCount: 3,
    totalBudget: 250000,
    status: 'Active',
    color: '#C49831',
    createdAt: '2024-02-01',
    lastUsed: '2024-05-15',
  },
  {
    id: '4',
    name: 'Equipment & Technology',
    description: 'Audio/visual equipment, computers, and technology upgrades',
    budgetCount: 6,
    totalBudget: 45000,
    status: 'Active',
    color: '#A5CF5D',
    createdAt: '2024-01-20',
    lastUsed: '2024-05-10',
  },
  {
    id: '5',
    name: 'Community Outreach',
    description: 'Community service projects and outreach programs',
    budgetCount: 4,
    totalBudget: 35000,
    status: 'Active',
    color: '#080A09',
    createdAt: '2024-02-10',
    lastUsed: '2024-05-05',
  },
  {
    id: '6',
    name: 'Maintenance & Repairs',
    description: 'Facility maintenance, repairs, and upkeep',
    budgetCount: 5,
    totalBudget: 28000,
    status: 'Active',
    color: '#6B7280',
    createdAt: '2024-01-25',
    lastUsed: '2024-04-30',
  },
  {
    id: '7',
    name: 'Supplies & Materials',
    description: 'Office supplies, ministry materials, and consumables',
    budgetCount: 7,
    totalBudget: 18000,
    status: 'Active',
    color: '#EF4444',
    createdAt: '2024-01-30',
    lastUsed: '2024-04-25',
  },
  {
    id: '8',
    name: 'Training & Development',
    description: 'Staff training, conferences, and professional development',
    budgetCount: 2,
    totalBudget: 15000,
    status: 'Inactive',
    color: '#8B5CF6',
    createdAt: '2024-03-01',
    lastUsed: '2024-03-15',
  },
];

export default function BudgetCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCategory = (category: any) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'Active').length;
  const totalBudgets = categories.reduce((sum, cat) => sum + cat.budgetCount, 0);
  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalBudget, 0);

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Budget Categories</h1>
            <p className="text-muted-foreground">Manage budget categories and classifications</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/finance/budgets/categories/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {activeCategories} active categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined budget value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Category</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{Math.round(totalAmount / totalCategories).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Average budget amount
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Budgets</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow 
                  key={category.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/finance/budgets/categories/${category.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Created {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{category.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{category.budgetCount}</div>
                      <div className="text-xs text-muted-foreground">budgets</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₵{category.totalBudget.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(category.status)}>
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(category.lastUsed).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/dashboard/finance/budgets/categories/${category.id}`)}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/dashboard/finance/budgets/categories/${category.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first budget category.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/finance/budgets/categories/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
              This action cannot be undone and will affect {categoryToDelete?.budgetCount} existing budgets.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}