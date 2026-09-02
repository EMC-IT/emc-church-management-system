import { BookOpen, SearchX, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ResourceEmptyStateProps {
  isSearchOrFilter?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export function ResourceEmptyState({
  isSearchOrFilter,
  onClearFilters,
  className,
}: ResourceEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {isSearchOrFilter ? (
            <SearchX className="h-6 w-6" aria-hidden="true" />
          ) : (
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          {isSearchOrFilter ? 'No resources matched your search' : 'No church resources available yet'}
        </h3>

        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          {isSearchOrFilter
            ? 'Try searching with different keywords, or clear category and type filters.'
            : 'New sermon notes, teaching guides, devotionals, and church forms will appear here as they are published.'}
        </p>

        {isSearchOrFilter && onClearFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
