import { Calendar, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface EventsEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  className?: string;
}

export function EventsEmptyState({
  title = 'No events found',
  description = 'Try adjusting your search query, category, or date filters to discover more events.',
  onResetFilters,
  className,
}: EventsEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Calendar className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          {description}
        </p>
        {onResetFilters && (
          <Button onClick={onResetFilters} size="sm" variant="outline" className="gap-2 font-medium">
            <Search className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
