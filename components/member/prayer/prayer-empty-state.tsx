'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface PrayerEmptyStateProps {
  onSubmitRequest?: () => void;
  className?: string;
}

export function PrayerEmptyState({
  onSubmitRequest,
  className,
}: PrayerEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <Heart className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          No prayer requests yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
          Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God. We are here to pray with you.
        </p>

        {onSubmitRequest ? (
          <Button size="sm" onClick={onSubmitRequest} className="gap-2 font-medium">
            <Plus className="h-4 w-4" />
            <span>Submit a Prayer Request</span>
          </Button>
        ) : (
          <Link href="/portal/prayer/new">
            <Button size="sm" className="gap-2 font-medium">
              <Plus className="h-4 w-4" />
              <span>Submit a Prayer Request</span>
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
