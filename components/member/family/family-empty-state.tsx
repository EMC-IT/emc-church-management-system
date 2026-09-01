import { Users, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface FamilyEmptyStateProps {
  onAddMemberClick: () => void;
  className?: string;
}

export function FamilyEmptyState({ onAddMemberClick, className }: FamilyEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Users className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="space-y-1 max-w-sm">
          <h3 className="text-base font-semibold text-foreground font-heading">
            No family members added yet
          </h3>
          <p className="text-xs text-muted-foreground">
            You haven&apos;t added any family members or dependents to your household profile.
          </p>
        </div>

        <div className="pt-2">
          <Button size="sm" onClick={onAddMemberClick} className="gap-2 font-medium">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            <span>Add Family Member</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
