'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Edit,
  Trash2,
  Receipt,
  Wallet,
  Tag,
  Calendar,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  Copy,
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { expenseService } from '@/services';
import { ExpenseRecord } from '@/lib/types';

export default function ExpenseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [expense, setExpense] = useState<ExpenseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadExpense = async () => {
      setIsLoading(true);
      try {
        const data = await expenseService.getExpenseById(id);
        setExpense(data);
      } catch (error) {
        console.error('Error loading expense:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadExpense();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await expenseService.deleteExpense(id);
      toast.success('Expense deleted successfully!');
      router.push('/dashboard/finance/expenses');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    }
  };

  const handleDuplicate = async () => {
    if (!expense) return;
    try {
      const res = await expenseService.duplicateExpense(expense.id);
      toast.success('Expense duplicated as pending record');
      router.push(`/dashboard/finance/expenses/${res.data.id}/edit`);
    } catch {
      toast.error('Failed to duplicate expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading || !expense) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-10 w-10 rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-6 w-48">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-xl">
          <div className="h-96 w-full rounded-xl bg-muted animate-pulse" />
        </LazyLoader>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          asChild
        >
          <Link href="/dashboard/finance/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={expense.title}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDuplicate}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/finance/expenses/${expense.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDialog.openDialog(expense)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Main Details Card */}
      <LazySection>
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Wallet className="h-3.5 w-3.5" />
                    Amount
                  </div>
                  <div className="text-2xl font-bold text-destructive">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Tag className="h-3.5 w-3.5" />
                    Category
                  </div>
                  <div>
                    <Badge variant="neutral" className="text-sm font-medium">
                      {expense.categoryName || 'General'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Status
                  </div>
                  <div>
                    <StatusBadge status={expense.status} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment Method
                  </div>
                  <div className="font-medium text-sm text-foreground">{expense.paymentMethod}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5" />
                    Expense Date
                  </div>
                  <div className="font-medium text-sm text-foreground">
                    {format(new Date(expense.date), 'PPP')}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <User className="h-3.5 w-3.5" />
                    Vendor / Payee
                  </div>
                  <div className="font-medium text-sm text-foreground">{expense.vendor}</div>
                </div>

                {expense.receiptNumber && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Receipt className="h-3.5 w-3.5" />
                      Receipt / Invoice #
                    </div>
                    <div className="font-medium text-sm text-foreground">{expense.receiptNumber}</div>
                  </div>
                )}

                {expense.approvedBy && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <User className="h-3.5 w-3.5" />
                      Approved By
                    </div>
                    <div className="font-medium text-sm text-foreground">{expense.approvedBy}</div>
                  </div>
                )}
              </div>

              {(expense.description || expense.notes) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5" />
                      Description / Notes
                    </div>
                    <div className="text-sm text-foreground leading-relaxed">
                      {expense.description || expense.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Record Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="font-medium text-foreground">{format(new Date(expense.createdAt), 'PPP p')}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div className="font-medium text-foreground">{format(new Date(expense.updatedAt), 'PPP p')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        itemName={expense.title}
        loading={deleteDialog.loading}
      />
    </div>
  );
}