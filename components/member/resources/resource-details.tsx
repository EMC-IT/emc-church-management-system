'use client';

import { format, parseISO } from 'date-fns';
import { Download, ExternalLink, Play, FileText, Eye, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberResource } from '@/lib/types/member';
import {
  RESOURCE_TYPE_CONFIG,
  formatFileSize,
  formatDuration,
} from '@/lib/config/member/resources';
import { useToast } from '@/hooks/use-toast';

export interface ResourceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: MemberResource | null;
}

export function ResourceDetailsDialog({
  open,
  onOpenChange,
  resource,
}: ResourceDetailsDialogProps) {
  const { toast } = useToast();

  if (!resource) return null;

  const typeConfig = RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.PDF;
  const TypeIcon = typeConfig.icon;

  let formattedDate = '';
  if (resource.publishedAt) {
    try {
      formattedDate = format(parseISO(resource.publishedAt), 'MMMM d, yyyy');
    } catch {
      formattedDate = resource.publishedAt;
    }
  }

  const metaString = [
    resource.fileSize ? formatFileSize(resource.fileSize) : '',
    resource.duration ? formatDuration(resource.duration) : '',
    resource.fileFormat ? `Format: ${resource.fileFormat}` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const handleAction = () => {
    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    toast({
      title: 'Resource Download',
      description: `Opening ${resource.title}. In production, this initiates secure document transfer.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Badge variant="neutral" size="sm" className="gap-1">
              <TypeIcon className="h-3 w-3" />
              <span>{resource.type}</span>
            </Badge>

            <Badge variant="neutral" size="sm">
              {resource.category}
            </Badge>

            {resource.isFeatured && (
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {resource.title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Published on {formattedDate || 'Recently'} {metaString ? `• ${metaString}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Description */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              About this Resource
            </span>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
              {resource.description}
            </p>
          </div>

          {/* Speaker / Ministry / Metadata */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-2 text-xs">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              Resource Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              {resource.speaker && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Speaker / Teacher</span>
                  <span className="font-medium text-foreground">{resource.speaker}</span>
                </div>
              )}

              {resource.author && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Author / Department</span>
                  <span className="font-medium text-foreground">{resource.author}</span>
                </div>
              )}

              {resource.ministry && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Associated Ministry</span>
                  <span className="font-medium text-foreground">{resource.ministry}</span>
                </div>
              )}

              {resource.fileSize && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">File Size</span>
                  <span className="font-medium text-foreground">{formatFileSize(resource.fileSize)}</span>
                </div>
              )}

              {resource.duration && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Length / Duration</span>
                  <span className="font-medium text-foreground">{formatDuration(resource.duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground block font-medium">Topic Tags:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-foreground px-2.5 py-1 rounded-md font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-medium"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAction}
            className="gap-1.5 font-medium text-xs"
          >
            {resource.type === 'Audio' || resource.type === 'Video' ? (
              <Play className="h-3.5 w-3.5" />
            ) : resource.type === 'PDF' || resource.type === 'Document' ? (
              <Download className="h-3.5 w-3.5" />
            ) : resource.externalUrl ? (
              <ExternalLink className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span>{typeConfig.actionLabel}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
