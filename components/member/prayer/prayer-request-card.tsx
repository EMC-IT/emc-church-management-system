'use client';

import { format, parseISO } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberPrayerRequest } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface PrayerRequestCardProps {
  request: MemberPrayerRequest;
  onViewDetails: (request: MemberPrayerRequest) => void;
  onMarkAnswered?: (request: MemberPrayerRequest) => void;
  onDelete?: (request: MemberPrayerRequest) => void;
  className?: string;
}

export function PrayerRequestCard({
  request,
  onViewDetails,
  onMarkAnswered,
  onDelete,
  className,
}: PrayerRequestCardProps) {
  let formattedDate = 'Recently';
  try {
    formattedDate = format(parseISO(request.createdAt), 'MMM d, yyyy');
  } catch {
    formattedDate = request.createdAt;
  }

  const isAnswered = request.status === 'Answered';
  const isPraying = request.status === 'Praying';

  return (
    <Card
      className={cn(
        'flex flex-col justify-between hover:border-primary/40 transition-colors',
        isAnswered && 'border-emerald-500/30 bg-emerald-500/5',
        className
      )}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neutral" size="sm">
              {request.category}
            </Badge>
            <Badge variant="info" size="sm">
              {request.privacy}
            </Badge>
            {request.isUrgent && (
              <Badge variant="danger" size="sm">
                Urgent
              </Badge>
            )}
          </div>

          <StatusBadge status={request.status} size="sm" />
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(request)}
          className="text-left font-heading font-semibold text-base text-foreground leading-snug hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          {request.title}
        </button>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {request.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-2 flex-1">
        {/* Answered Testimony snippet if answered */}
        {isAnswered && request.testimony && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground space-y-1">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Testimony of Praise
            </span>
            <p className="text-muted-foreground line-clamp-2 italic leading-relaxed">
              &ldquo;{request.testimony}&rdquo;
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{formattedDate}</span>

        <div className="flex items-center gap-1.5">
          {!isAnswered && onMarkAnswered && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onMarkAnswered(request)}
              className="h-8 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark Answered</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(request)}
            className="h-8 text-xs font-medium"
          >
            Details
          </Button>

          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(request)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Remove request"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
