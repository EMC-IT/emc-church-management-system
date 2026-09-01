import Link from 'next/link';
import { CalendarX, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface AttendanceEmptyStateProps {
  className?: string;
}

export function AttendanceEmptyState({ className }: AttendanceEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <CalendarX className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          No attendance records yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Your attendance history and consistency trends will appear here when you check in to church services.
        </p>
        <Button asChild size="sm" className="gap-2">
          <Link href="/portal/events">
            <span>Explore Upcoming Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
