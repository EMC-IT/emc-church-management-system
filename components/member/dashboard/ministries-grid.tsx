import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberMinistry } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MinistriesGridProps {
  ministries?: MemberMinistry[];
  className?: string;
}

const fallbackMinistries: MemberMinistry[] = [
  {
    id: 'm1',
    name: 'Worship Team',
    category: 'Worship & Creative Arts',
    branch: 'Main Branch',
    campus: 'Main Branch',
    description: 'Praise and worship team',
    myRoles: ['Vocalist'],
    myRole: 'Vocalist',
    leader: { id: 'l1', name: 'Pastor David', title: 'Director' },
    leadPastorOrLeader: 'Pastor David',
    schedule: { serviceName: 'Sunday', dayOfWeek: 'Sunday', serviceTime: '7:00 AM', venue: 'Sanctuary', frequency: 'Weekly' },
    status: 'Active',
    joinedDate: '2023-01-01',
  },
  {
    id: 'm2',
    name: 'Usher Ministry',
    category: 'Ushering & Protocol',
    branch: 'Main Branch',
    campus: 'Main Branch',
    description: 'Sanctuary ushering',
    myRoles: ['Member'],
    myRole: 'Member',
    leader: { id: 'l2', name: 'Elder James', title: 'Head of Protocol' },
    leadPastorOrLeader: 'Elder James',
    schedule: { serviceName: 'Sunday', dayOfWeek: 'Sunday', serviceTime: '7:00 AM', venue: 'Sanctuary', frequency: 'Weekly' },
    status: 'Active',
    joinedDate: '2023-01-01',
  },
  {
    id: 'm3',
    name: 'Media Team',
    category: 'Media & Tech',
    branch: 'Main Branch',
    campus: 'Main Branch',
    description: 'Audio and broadcasting',
    myRoles: ['Audio Engineer'],
    myRole: 'Audio Engineer',
    leader: { id: 'l3', name: 'Pastor Isaac', title: 'Director' },
    leadPastorOrLeader: 'Pastor Isaac',
    schedule: { serviceName: 'Sunday', dayOfWeek: 'Sunday', serviceTime: '7:00 AM', venue: 'Sanctuary', frequency: 'Weekly' },
    status: 'Active',
    joinedDate: '2023-01-01',
  },
];

export function MinistriesGrid({ ministries = [], className }: MinistriesGridProps) {
  const displayMinistries = ministries.length > 0 ? ministries.slice(0, 3) : fallbackMinistries;

  return (
    <section aria-label="Ministries I'm Part Of" className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Ministries I&apos;m Part Of</h3>
        <Link
          href="/portal/ministries"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayMinistries.map((ministry) => (
          <Link
            key={ministry.id}
            href="/portal/ministries"
            className="block group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <Card className="h-full hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2 flex flex-col justify-between h-full">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <Badge variant="neutral" size="sm">
                      {ministry.category}
                    </Badge>
                    <StatusBadge
                      status={ministry.myRole || ministry.myRoles[0] || 'Member'}
                      size="sm"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {ministry.name}
                  </h4>
                </div>

                <p className="text-xs text-muted-foreground truncate pt-1">
                  Lead: {ministry.leader?.name || ministry.leadPastorOrLeader || 'Ministry Pastor'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
