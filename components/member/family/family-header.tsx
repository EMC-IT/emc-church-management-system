import { UserPlus, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberFamilyUnit } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface FamilyHeaderProps {
  family: MemberFamilyUnit;
  onAddMemberClick: () => void;
  className?: string;
}

export function FamilyHeader({ family, onAddMemberClick, className }: FamilyHeaderProps) {
  const memberCount = family.members.length;

  return (
    <Card className={cn(className)}>
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Home className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                {family.familyName}
              </h2>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>

            {family.address && (
              <p className="text-xs text-muted-foreground">
                {family.address}
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onAddMemberClick}
          className="gap-2 font-medium shrink-0 w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span>Add Family Member</span>
        </Button>
      </CardContent>
    </Card>
  );
}
