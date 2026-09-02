import Link from 'next/link';
import { Compass, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface JourneyEmptyStateProps {
  className?: string;
}

export function JourneyEmptyState({ className }: JourneyEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          Your journey is just beginning
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          As you participate in church gatherings, cell fellowships, discipleship classes, and baptism, your personal milestones will be recorded here.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link href="/portal/groups">
            <Button size="sm" variant="outline" className="gap-2 font-medium">
              <Users className="h-4 w-4" />
              <span>Find a Group</span>
            </Button>
          </Link>

          <Link href="/portal/events">
            <Button size="sm" className="gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              <span>Explore Events</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
