'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberPageHeader } from '@/components/member/shared';
import { GivingView } from './giving-view';
import {
  MemberGivingSummary,
  MemberGivingTransaction,
  MemberGivingTrendPoint,
  MemberTaxStatement,
} from '@/lib/types/member';

export interface GivingPageContainerProps {
  summary: MemberGivingSummary;
  trend: MemberGivingTrendPoint[];
  statements: MemberTaxStatement[];
  transactions: MemberGivingTransaction[];
}

export function GivingPageContainer({
  summary,
  trend,
  statements,
  transactions,
}: GivingPageContainerProps) {
  const [isGiveDialogOpen, setIsGiveDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Giving"
        description="View your giving history, statements, and contribution records."
        actions={
          <Button
            onClick={() => setIsGiveDialogOpen(true)}
            size="sm"
            className="gap-2 font-medium"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Give Now</span>
          </Button>
        }
      />

      <GivingView
        initialSummary={summary}
        initialTrend={trend}
        initialStatements={statements}
        initialTransactions={transactions}
        isGiveDialogOpen={isGiveDialogOpen}
        onOpenGiveDialogChange={setIsGiveDialogOpen}
      />
    </div>
  );
}
