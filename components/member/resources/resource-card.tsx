'use client';

import { format, parseISO } from 'date-fns';
import { Download, ExternalLink, Play, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberResource } from '@/lib/types/member';
import {
  RESOURCE_TYPE_CONFIG,
  formatFileSize,
  formatDuration,
} from '@/lib/config/member/resources';
import { cn } from '@/lib/utils';

export interface ResourceCardProps {
  resource: MemberResource;
  onViewDetails: (resource: MemberResource) => void;
  onAction?: (resource: MemberResource) => void;
  className?: string;
}

export function ResourceCard({
  resource,
  onViewDetails,
  onAction,
  className,
}: ResourceCardProps) {
  const typeConfig = RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.PDF;

  let formattedDate = '';
  if (resource.publishedAt) {
    try {
      formattedDate = format(parseISO(resource.publishedAt), 'MMM d, yyyy');
    } catch {
      formattedDate = resource.publishedAt;
    }
  }

  const metaString = [
    resource.category,
    resource.fileSize ? formatFileSize(resource.fileSize) : '',
    resource.duration ? formatDuration(resource.duration) : '',
    formattedDate,
  ]
    .filter(Boolean)
    .join(' · ');

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAction) {
      onAction(resource);
    } else if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      onViewDetails(resource);
    }
  };

  return (
    <Card
      className={cn(
        'flex flex-col justify-between hover:border-primary/40 transition-colors cursor-pointer group',
        className
      )}
      onClick={() => onViewDetails(resource)}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="neutral" size="sm">
            {resource.type}
          </Badge>

          {resource.isFeatured && (
            <span className="text-[11px] font-semibold text-primary">
              Featured
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-heading font-semibold text-base text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>

          {(resource.speaker || resource.author || resource.ministry) && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {resource.speaker
                ? `Speaker: ${resource.speaker}`
                : resource.author
                  ? `Author: ${resource.author}`
                  : resource.ministry}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {resource.description}
        </p>
      </CardHeader>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground text-[11px] truncate">
          {metaString}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrimaryAction}
          className="h-8 text-xs font-medium gap-1 shrink-0"
        >
          {resource.type === 'Audio' ? (
            <Play className="h-3 w-3" />
          ) : resource.type === 'Video' ? (
            <Play className="h-3 w-3" />
          ) : resource.type === 'PDF' || resource.type === 'Document' ? (
            <Download className="h-3 w-3" />
          ) : resource.externalUrl ? (
            <ExternalLink className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
          <span>{typeConfig.actionLabel}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
