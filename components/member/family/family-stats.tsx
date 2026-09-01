import { Users, UserCheck, Baby } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { MemberFamilyMember } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface FamilyStatsProps {
  members: MemberFamilyMember[];
  className?: string;
}

export function FamilyStats({ members, className }: FamilyStatsProps) {
  const totalCount = members.length;
  const registeredCount = members.filter((m) => m.isRegisteredMember).length;
  const childrenCount = members.filter(
    (m) => m.relationship === 'Child' || m.relationship === 'Dependent'
  ).length;

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
      <StatCard
        title="Total Family Members"
        value={totalCount}
        icon={Users}
        description="Members in household unit"
      />
      <StatCard
        title="Registered Church Members"
        value={registeredCount}
        icon={UserCheck}
        description="Active church members"
      />
      <StatCard
        title="Children & Dependents"
        value={childrenCount}
        icon={Baby}
        description="Under household care"
      />
    </div>
  );
}
