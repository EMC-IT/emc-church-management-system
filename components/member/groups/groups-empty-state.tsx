import { UsersRound, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface GroupsEmptyStateProps {
  onFindGroupClick: () => void;
  className?: string;
}

export function GroupsEmptyState({ onFindGroupClick, className }: GroupsEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <UsersRound className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          You haven&apos;t joined a group yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Find a neighborhood cell group, fellowship, or small group where you can connect, grow, pray, and build authentic Christian community.
        </p>
        <Button onClick={onFindGroupClick} size="sm" className="gap-2 font-medium">
          <Search className="h-4 w-4" />
          <span>Find a Group</span>
        </Button>
      </CardContent>
    </Card>
  );
}
