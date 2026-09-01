'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Tag,
  BadgeCent,
  TrendingUp,
  FolderOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';
import { IncomeCategory, IncomeRecord } from '@/lib/types';

export default function CategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [category, setCategory] = useState<IncomeCategory | null>(null);
  const [records, setRecords] = useState<IncomeRecord[]>([]);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const catId = String(params.id);
      const [catData, listRes] = await Promise.all([
        incomeService.getCategoryById(catId),
        incomeService.getIncomeList({ categoryId: catId, limit: 20 }),
      ]);

      setCategory(catData);
      setRecords(listRes.data);

      setForm({
        name: catData.name,
        code: catData.code || '',
        description: catData.description || '',
        isActive: catData.isActive,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load category details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    if (!form.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category Name is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await incomeService.updateCategory(category.id, {
        name: form.name.trim(),
        code: form.code?.trim() || undefined,
        description: form.description?.trim() || undefined,
        isActive: form.isActive,
      });
      setCategory(res.data);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Category updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update category.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    try {
      await incomeService.deleteCategory(category.id);
      toast({
        title: 'Success',
        description: 'Category deleted.',
      });
      router.push('/dashboard/finance/income/categories');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnDef<IncomeRecord>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          {row.original.reference && (
            <div className="text-xs text-muted-foreground">{row.original.reference}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source / Payer',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.source}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const isReceived = row.original.status === 'received';
        return (
          <div className={`font-medium ${isReceived ? 'text-brand-success' : 'text-amber-600'}`}>
            {formatCurrency(row.original.amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{new Date(row.original.date).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={5} />;
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <PageHeader title="Category Not Found" />
        <Button asChild variant="outline">
          <Link href="/dashboard/finance/income/categories">Return to Categories</Link>
        </Button>
      </div>
    );
  }

  const totalGenerated = records.reduce((sum, r) => (r.status === 'received' ? sum + r.amount : sum), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/finance/income/categories" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title={isEditing ? 'Edit Category' : category.name} />
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteDialog.openDialog(category)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Status"
              value={category.isActive ? 'Active' : 'Inactive'}
              icon={Tag}
              accent={category.isActive ? 'success' : 'secondary'}
            />
            <StatCard
              title="Total Received"
              value={formatCurrency(totalGenerated || category.totalIncome || 0)}
              icon={BadgeCent}
              accent="primary"
            />
            <StatCard
              title="Recorded Entries"
              value={String(records.length || category.recordCount || 0)}
              icon={FolderOpen}
              accent="accent"
            />
          </div>

          {/* Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Code</span>
                  <span className="font-medium">{category.code || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Created</span>
                  <span className="font-medium">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">Description</span>
                  <p className="mt-1 text-foreground">
                    {category.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Income Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {records.length} transactions
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={records}
                recordLabel="transaction"
                searchKey="description"
                searchPlaceholder="Search category transactions..."
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Edit Mode Form matching Giving Layout */
        <form onSubmit={handleUpdate} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Category Code</Label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3.5 md:col-span-2">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-status" className="text-sm font-medium cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Active categories are selectable when recording new income transactions.
                  </p>
                </div>
                <Switch
                  id="edit-status"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  aria-label="Active Status"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        title="Delete Income Category"
        description="Are you sure you want to delete this category? Historical transactions will remain preserved."
        itemName={category.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
