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

export function MinistriesGrid({ ministries = [], className }: MinistriesGridProps) {
  const displayMinistries = ministries.length > 0 ? ministries.slice(0, 3) : [
    { id: 'm1', name: 'Worship Team', category: 'Music & Creative', myRole: 'Vocalist', leadPastorOrLeader: 'Pastor David' },
    { id: 'm2', name: 'Usher Ministry', category: 'Hospitality', myRole: 'Member', leadPastorOrLeader: 'Elder James' },
    { id: 'm3', name: 'Media Team', category: 'Tech & Broadcast', myRole: 'Audio Engineer', leadPastorOrLeader: 'Pastor Isaac' },
  ];

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
                    <StatusBadge status={ministry.myRole} size="sm" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {ministry.name}
                  </h4>
                </div>

                <p className="text-xs text-muted-foreground truncate pt-1">
                  Lead: {ministry.leadPastorOrLeader}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
