import { Building2, HeartHandshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface MinistriesEmptyStateProps {
  onExploreClick: () => void;
  className?: string;
}

export function MinistriesEmptyState({ onExploreClick, className }: MinistriesEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Building2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          You&apos;re not currently serving in a ministry
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Every believer is gifted to serve. Explore church ministry teams and discover fulfilling volunteer opportunities to build God&apos;s Kingdom.
        </p>
        <Button onClick={onExploreClick} size="sm" className="gap-2 font-medium">
          <HeartHandshake className="h-4 w-4" />
          <span>Explore Ministries</span>
        </Button>
      </CardContent>
    </Card>
  );
}
