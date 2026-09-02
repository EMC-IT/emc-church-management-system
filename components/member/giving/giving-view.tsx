'use client';

import { useState, useTransition } from 'react';
import { GivingSummary } from './giving-summary';
import { GivingTrend } from './giving-trend';
import { GivingBreakdown } from './giving-breakdown';
import { GivingHistory } from './giving-history';
import { GivingStatements } from './giving-statements';
import { GiveNowDialog } from './give-now-dialog';
import { GivingReceiptDialog } from './giving-receipt-dialog';
import { GivingEmptyState } from './giving-empty-state';
import {
  MemberGivingSummary,
  MemberGivingTransaction,
  MemberGivingTrendPoint,
  MemberTaxStatement,
  MemberGivingFilter,
} from '@/lib/types/member';
import { memberGivingService } from '@/services/member';

export interface GivingViewProps {
  initialSummary: MemberGivingSummary;
  initialTrend: MemberGivingTrendPoint[];
  initialStatements: MemberTaxStatement[];
  initialTransactions: MemberGivingTransaction[];
  isGiveDialogOpen?: boolean;
  onOpenGiveDialogChange?: (open: boolean) => void;
}

export function GivingView({
  initialSummary,
  initialTrend,
  initialStatements,
  initialTransactions,
  isGiveDialogOpen: controlledGiveOpen,
  onOpenGiveDialogChange: setControlledGiveOpen,
}: GivingViewProps) {
  const [summary, setSummary] = useState<MemberGivingSummary>(initialSummary);
  const [trend, setTrend] = useState<MemberGivingTrendPoint[]>(initialTrend);
  const [statements] = useState<MemberTaxStatement[]>(initialStatements);
  const [transactions, setTransactions] = useState<MemberGivingTransaction[]>(initialTransactions);
  const [filter, setFilter] = useState<MemberGivingFilter>({
    dateRange: 'all',
    category: 'all',
    paymentMethod: 'all',
    status: 'all',
    search: '',
  });

  const [internalGiveOpen, setInternalGiveOpen] = useState(false);
  const isGiveOpen = controlledGiveOpen !== undefined ? controlledGiveOpen : internalGiveOpen;
  const setIsGiveOpen = setControlledGiveOpen || setInternalGiveOpen;

  const [receiptTransaction, setReceiptTransaction] = useState<MemberGivingTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [, startTransition] = useTransition();

  const handleFilterChange = (newFilter: MemberGivingFilter) => {
    setFilter(newFilter);
    startTransition(async () => {
      const filtered = await memberGivingService.getTransactions(newFilter);
      setTransactions(filtered);
    });
  };

  const handleViewReceipt = (tx: MemberGivingTransaction) => {
    setReceiptTransaction(tx);
    setIsReceiptOpen(true);
  };

  const handleGivingSuccess = (newTx: MemberGivingTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setSummary((prev) => ({
      ...prev,
      totalGivenYearToDate: prev.totalGivenYearToDate + newTx.amount,
      totalGiftsCountThisYear: prev.totalGiftsCountThisYear + 1,
      lastGift: {
        amount: newTx.amount,
        category: newTx.category,
        date: newTx.date,
        paymentMethod: newTx.paymentMethod,
      },
      givingThisYearTotal: prev.givingThisYearTotal + newTx.amount,
    }));
  };

  const hasGivingHistory =
    summary.totalGivenYearToDate > 0 || initialTransactions.length > 0;

  if (!hasGivingHistory) {
    return (
      <div className="space-y-6">
        <GivingEmptyState onGiveNowClick={() => setIsGiveOpen(true)} />
        <GiveNowDialog
          open={isGiveOpen}
          onOpenChange={setIsGiveOpen}
          onGivingSuccess={handleGivingSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Summary Stat Cards */}
      <GivingSummary summary={summary} />

      {/* 2. Main Analytics Row: Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <GivingTrend trend={trend} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <GivingBreakdown breakdown={summary.categoryBreakdown} />
        </div>
      </div>

      {/* 3. Comprehensive Filterable Giving History Table with Pagination */}
      <GivingHistory
        transactions={transactions}
        filter={filter}
        onFilterChange={handleFilterChange}
        onViewReceipt={handleViewReceipt}
      />

      {/* 4. Annual Tax & Contribution Statements */}
      <GivingStatements statements={statements} />

      {/* 5. Give Now Modal Dialog */}
      <GiveNowDialog
        open={isGiveOpen}
        onOpenChange={setIsGiveOpen}
        onGivingSuccess={handleGivingSuccess}
      />

      {/* 6. Transaction Receipt Modal Dialog */}
      <GivingReceiptDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        transaction={receiptTransaction}
      />
    </div>
  );
}
