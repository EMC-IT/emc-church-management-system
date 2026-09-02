import Link from 'next/link';
import { CalendarX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EventNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full text-center border-border/60 shadow-sm">
        <CardContent className="p-8 sm:p-10 space-y-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center border border-border/40">
            <CalendarX className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold font-heading text-foreground">
              Event Not Found
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The event you are looking for may have concluded, been cancelled, or is no longer available on the church calendar.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link href="/portal/events">
              <Button size="sm" className="gap-1.5 font-medium text-xs h-9">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Events Calendar</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
