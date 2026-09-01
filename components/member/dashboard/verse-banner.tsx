import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyVerse } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface VerseBannerProps {
  dailyVerse: DailyVerse;
  className?: string;
}

export function VerseBanner({ dailyVerse, className }: VerseBannerProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6 sm:p-8 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          Today&apos;s Verse
        </span>

        <blockquote className="space-y-2 max-w-2xl">
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-snug font-heading">
            {dailyVerse.verse}
          </p>
          <cite className="block text-sm font-medium text-muted-foreground not-italic">
            {dailyVerse.citation}
          </cite>
        </blockquote>

        <div className="pt-1">
          <Button
            asChild
            variant="default"
            size="sm"
            className="gap-2 font-medium"
          >
            <Link href={dailyVerse.devotionalHref || '/portal/resources'}>
              <span>Read Devotional</span>
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
