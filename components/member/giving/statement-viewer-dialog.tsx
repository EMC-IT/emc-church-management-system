'use client';

import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MemberTaxStatement } from '@/lib/types/member';
import { formatCurrency } from '@/lib/utils';

export interface StatementViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: MemberTaxStatement | null;
  memberName?: string;
}

export function StatementViewerDialog({
  open,
  onOpenChange,
  statement,
  memberName = 'Bismark Asiedu',
}: StatementViewerDialogProps) {
  if (!statement) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadFile = () => {
    if (!statement) return;
    const tithe = (statement.totalGiven * 0.7).toFixed(2);
    const offering = (statement.totalGiven * 0.15).toFixed(2);
    const building = (statement.totalGiven * 0.1).toFixed(2);
    const missions = (statement.totalGiven * 0.05).toFixed(2);

    const csvContent =
      `EMC CHURCH - ANNUAL GIVING & TAX STATEMENT\n` +
      `Member Name,${memberName}\n` +
      `Member ID,EMC-MEM-001\n` +
      `Tax Year,${statement.year}\n` +
      `Date Issued,${statement.generatedDate}\n\n` +
      `Category,Amount (GHS)\n` +
      `Tithe,${tithe}\n` +
      `Offering,${offering}\n` +
      `Building Expansion Fund,${building}\n` +
      `Missions & Benevolence,${missions}\n` +
      `TOTAL CONTRIBUTIONS,${statement.totalGiven.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EMC_Giving_Statement_${statement.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const titheAmount = statement.totalGiven * 0.7;
  const offeringAmount = statement.totalGiven * 0.15;
  const buildingAmount = statement.totalGiven * 0.1;
  const missionsAmount = statement.totalGiven * 0.05;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="border-b border-border/40 pb-3 text-left sm:text-left">
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span className="font-heading font-bold text-sm tracking-wider uppercase">
              EMC Church
            </span>
          </div>
          <DialogTitle className="text-lg font-bold">
            {statement.year} Annual Giving Statement
          </DialogTitle>
          <DialogDescription className="text-xs">
            Official tax and stewardship record of contributions for the calendar year {statement.year}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Member Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
            <div>
              <span className="text-muted-foreground block text-[11px]">Member Name</span>
              <span className="font-semibold text-foreground text-sm">{memberName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Member ID</span>
              <span className="font-mono font-medium text-foreground text-sm">EMC-MEM-001</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Tax Year</span>
              <span className="font-medium text-foreground">January 1 – December 31, {statement.year}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Issue Date</span>
              <span className="font-medium text-foreground">{statement.generatedDate}</span>
            </div>
          </div>

          {/* Total Contributions Highlight */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <span className="text-xs text-muted-foreground block mb-1">
              Total Recorded Annual Contributions
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
              {formatCurrency(statement.totalGiven, 'GHS')}
            </span>
          </div>

          {/* Breakdown Table */}
          <div className="border border-border/40 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                  <TableHead className="text-right text-xs font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Tithe</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(titheAmount, 'GHS')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Offering</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(offeringAmount, 'GHS')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Building Expansion Fund</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(buildingAmount, 'GHS')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Missions & Benevolence</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(missionsAmount, 'GHS')}
                  </TableCell>
                </TableRow>
                <TableRow className="font-bold bg-muted/20 border-t border-border">
                  <TableCell>Total Contributions</TableCell>
                  <TableCell className="text-right text-primary">
                    {formatCurrency(statement.totalGiven, 'GHS')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Verification Notice */}
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground italic pt-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              This official statement certifies all charitable contributions recorded in the EMC Church Management System for the specified period.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="gap-2 border-t border-border/40 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDownloadFile}
            className="gap-1.5 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
