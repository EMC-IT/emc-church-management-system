'use client';

import { useState } from 'react';
import { FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberTaxStatement } from '@/lib/types/member';
import { formatCurrency, cn } from '@/lib/utils';
import { StatementViewerDialog } from './statement-viewer-dialog';
import { useToast } from '@/hooks/use-toast';

export interface GivingStatementsProps {
  statements: MemberTaxStatement[];
  memberName?: string;
  className?: string;
}

export function GivingStatements({
  statements,
  memberName = 'Bismark Asiedu',
  className,
}: GivingStatementsProps) {
  const [viewingStatement, setViewingStatement] = useState<MemberTaxStatement | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const { toast } = useToast();

  const handleView = (stmt: MemberTaxStatement) => {
    setViewingStatement(stmt);
    setIsViewOpen(true);
  };

  const handleDownload = (stmt: MemberTaxStatement) => {
    const tithe = (stmt.totalGiven * 0.7).toFixed(2);
    const offering = (stmt.totalGiven * 0.15).toFixed(2);
    const building = (stmt.totalGiven * 0.1).toFixed(2);
    const missions = (stmt.totalGiven * 0.05).toFixed(2);

    const csvContent =
      `EMC CHURCH - ANNUAL GIVING & TAX STATEMENT\n` +
      `Member Name,${memberName}\n` +
      `Member ID,EMC-MEM-001\n` +
      `Tax Year,${stmt.year}\n` +
      `Date Issued,${stmt.generatedDate}\n\n` +
      `Category,Amount (GHS)\n` +
      `Tithe,${tithe}\n` +
      `Offering,${offering}\n` +
      `Building Expansion Fund,${building}\n` +
      `Missions & Benevolence,${missions}\n` +
      `TOTAL CONTRIBUTIONS,${stmt.totalGiven.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EMC_Giving_Statement_${stmt.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Statement Downloaded',
      description: `Downloaded EMC ${stmt.year} Annual Giving Statement.`,
    });
  };

  return (
    <>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="p-4 sm:p-5 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground font-heading">
              Annual Giving & Tax Statements
            </CardTitle>
            <span className="text-xs text-muted-foreground">Official Records</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {statements.length > 0 ? (
            statements.map((stmt) => (
              <div
                key={stmt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-foreground">{stmt.title}</h4>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      <span>Year: {stmt.year}</span>
                      <span>•</span>
                      <span>Total Contributions: {formatCurrency(stmt.totalGiven, 'GHS')}</span>
                      <span>•</span>
                      <span>Issued: {stmt.generatedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(stmt)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(stmt)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No annual tax statements have been issued yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statement Viewer Modal Dialog */}
      <StatementViewerDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        statement={viewingStatement}
        memberName={memberName}
      />
    </>
  );
}
