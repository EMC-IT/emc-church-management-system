import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MemberLoadingStateProps {
  message?: string;
  className?: string;
  rows?: number;
}

export function MemberLoadingState({
  message = 'Loading member information...',
  className,
  rows = 3,
}: MemberLoadingStateProps) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className={cn('text-center', className)}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">{message}</p>
        <div className="w-full max-w-md space-y-2 pt-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-muted/60 rounded animate-pulse"
              style={{ width: `${100 - i * 15}%` }}
            />
          ))}
        </div>
        <span className="sr-only">Loading</span>
      </CardContent>
    </Card>
  );
}
