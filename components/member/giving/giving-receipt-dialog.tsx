'use client';

import { Printer, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberGivingTransaction } from '@/lib/types/member';
import { formatCurrency } from '@/lib/utils';

export interface GivingReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: MemberGivingTransaction | null;
}

export function GivingReceiptDialog({
  open,
  onOpenChange,
  transaction,
}: GivingReceiptDialogProps) {
  if (!transaction) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center sm:text-center pb-2 border-b border-border/40">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-bold">Contribution Receipt</DialogTitle>
          <DialogDescription className="text-xs">
            Official acknowledgment from EMC Church
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {/* Amount Callout */}
          <div className="rounded-lg bg-muted/40 p-4 text-center border border-border/50">
            <span className="text-xs text-muted-foreground block mb-1">Amount Given</span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              {formatCurrency(transaction.amount, 'GHS')}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 divide-y divide-border/30 text-xs">
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Receipt Number</span>
              <span className="font-mono font-medium text-foreground">
                {transaction.receiptNumber || 'RCP-PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Giving Category</span>
              <span className="font-semibold text-foreground">{transaction.category}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium text-foreground">{transaction.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-muted-foreground">
                {transaction.transactionReference}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">{formatDate(transaction.date)}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={transaction.status} size="sm" />
            </div>

            {transaction.notes && (
              <div className="pt-2 flex flex-col gap-1">
                <span className="text-muted-foreground">Note / Purpose</span>
                <p className="text-foreground italic">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border/40">
          <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
