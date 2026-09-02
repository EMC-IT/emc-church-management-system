import { Suspense } from 'react';
import { Metadata } from 'next';
import { GivingPageContainer, GivingSkeleton } from '@/components/member/giving';
import { memberGivingService } from '@/services/member';

export const metadata: Metadata = {
  title: 'My Giving | EMC Member Portal',
  description: 'View your personal giving history, contribution statements, monthly trends, and give online.',
};

export default async function MemberGivingPage() {
  const [summary, trend, statements, transactions] = await Promise.all([
    memberGivingService.getGivingSummary(),
    memberGivingService.getGivingTrend(),
    memberGivingService.getTaxStatements(),
    memberGivingService.getTransactions(),
  ]);

  return (
    <Suspense fallback={<GivingSkeleton />}>
      <GivingPageContainer
        summary={summary}
        trend={trend}
        statements={statements}
        transactions={transactions}
      />
    </Suspense>
  );
}
