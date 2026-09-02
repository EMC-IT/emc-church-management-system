import { HandCoins, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface GivingEmptyStateProps {
  onGiveNowClick: () => void;
  className?: string;
}

export function GivingEmptyState({ onGiveNowClick, className }: GivingEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <HandCoins className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          No giving records yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Your contribution history, giving statements, and receipts will appear here once a gift is recorded.
        </p>
        <Button onClick={onGiveNowClick} size="sm" className="gap-2 font-medium">
          <Plus className="h-4 w-4" />
          <span>Give Now</span>
        </Button>
      </CardContent>
    </Card>
  );
}
