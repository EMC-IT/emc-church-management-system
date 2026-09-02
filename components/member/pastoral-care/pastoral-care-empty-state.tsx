import Link from 'next/link';
import { HeartHandshake, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface PastoralCareEmptyStateProps {
  className?: string;
}

export function PastoralCareEmptyState({ className }: PastoralCareEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <HeartHandshake className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          No pastoral care requests
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          If you are facing a difficult season, navigating major life decisions, or in need of pastoral visitation or spiritual guidance, you can request confidential support from the pastors.
        </p>
        <Link href="/portal/pastoral-care/request">
          <Button size="sm" className="gap-2 font-medium">
            <Plus className="h-4 w-4" />
            <span>Request Pastoral Care</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
