'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  FileQuestion,
  WifiOff,
  ShieldAlert,
  Wrench,
  RotateCcw,
  Home,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ErrorVariant = '404' | '500' | 'network' | '403' | '503' | 'custom';

export interface ErrorAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
}

export interface ErrorViewProps {
  variant?: ErrorVariant;
  statusCode?: string | number;
  badgeLabel?: string;
  title: string;
  description: string | ReactNode;
  icon?: LucideIcon;
  primaryAction?: ErrorAction;
  secondaryActions?: ErrorAction[];
  error?: Error & { digest?: string };
  showTechnicalDetails?: boolean;
  supportLink?: string;
  className?: string;
}

const variantConfig: Record<
  ErrorVariant,
  {
    icon: LucideIcon;
    defaultStatusCode: string;
    defaultBadge: string;
    badgeVariant: 'neutral' | 'primary' | 'warning' | 'danger' | 'info';
    iconBgClass: string;
    iconColorClass: string;
  }
> = {
  '404': {
    icon: FileQuestion,
    defaultStatusCode: '404',
    defaultBadge: 'Page Not Found',
    badgeVariant: 'neutral',
    iconBgClass: 'bg-muted/80 border-border/50',
    iconColorClass: 'text-muted-foreground',
  },
  '500': {
    icon: AlertTriangle,
    defaultStatusCode: '500',
    defaultBadge: 'System Error',
    badgeVariant: 'danger',
    iconBgClass: 'bg-destructive/10 border-destructive/20',
    iconColorClass: 'text-destructive',
  },
  network: {
    icon: WifiOff,
    defaultStatusCode: 'Offline',
    defaultBadge: 'Connection Issue',
    badgeVariant: 'warning',
    iconBgClass: 'bg-amber-500/10 border-amber-500/20',
    iconColorClass: 'text-amber-600 dark:text-amber-400',
  },
  '403': {
    icon: ShieldAlert,
    defaultStatusCode: '403',
    defaultBadge: 'Access Denied',
    badgeVariant: 'warning',
    iconBgClass: 'bg-amber-500/10 border-amber-500/20',
    iconColorClass: 'text-amber-600 dark:text-amber-400',
  },
  '503': {
    icon: Wrench,
    defaultStatusCode: '503',
    defaultBadge: 'Scheduled Maintenance',
    badgeVariant: 'info',
    iconBgClass: 'bg-primary/10 border-primary/20',
    iconColorClass: 'text-primary',
  },
  custom: {
    icon: AlertTriangle,
    defaultStatusCode: 'Error',
    defaultBadge: 'Notice',
    badgeVariant: 'neutral',
    iconBgClass: 'bg-muted/80 border-border/50',
    iconColorClass: 'text-foreground',
  },
};

export function ErrorView({
  variant = '500',
  statusCode,
  badgeLabel,
  title,
  description,
  icon: CustomIcon,
  primaryAction,
  secondaryActions,
  error,
  showTechnicalDetails = false,
  supportLink = '/contact',
  className,
}: ErrorViewProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = variantConfig[variant] || variantConfig['500'];
  const Icon = CustomIcon || config.icon;
  const displayStatusCode = statusCode || config.defaultStatusCode;
  const displayBadge = badgeLabel || config.defaultBadge;

  const handleCopyDetails = async () => {
    const errorText = [
      `Status: ${displayStatusCode}`,
      `Title: ${title}`,
      error?.digest ? `Digest: ${error.digest}` : null,
      error?.message ? `Message: ${error.message}` : null,
      error?.stack ? `Stack: ${error.stack}` : null,
      `Timestamp: ${new Date().toISOString()}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('flex items-center justify-center min-h-[65vh] p-4 sm:p-6 select-none', className)}>
      <Card className="max-w-lg w-full text-center border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-6 sm:p-10 space-y-5">
          {/* Top Badge & Status Code */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant={config.badgeVariant} size="sm" className="font-semibold text-[11px] px-2.5 py-0.5">
              {displayBadge}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground/80">
              #{displayStatusCode}
            </span>
          </div>

          {/* Focal Icon */}
          <div
            className={cn(
              'mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300',
              config.iconBgClass,
              config.iconColorClass
            )}
          >
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              {title}
            </h1>
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {typeof description === 'string' ? <p>{description}</p> : description}
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {primaryAction && (
              primaryAction.href ? (
                <Link href={primaryAction.href} className="w-full sm:w-auto">
                  <Button
                    variant={primaryAction.variant || 'default'}
                    size="sm"
                    className="w-full gap-1.5 font-medium text-xs h-9 px-4"
                  >
                    {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
                    <span>{primaryAction.label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={primaryAction.variant || 'default'}
                  size="sm"
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto gap-1.5 font-medium text-xs h-9 px-4"
                >
                  {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
                  <span>{primaryAction.label}</span>
                </Button>
              )
            )}

            {secondaryActions?.map((action, idx) => (
              action.href ? (
                <Link key={idx} href={action.href} className="w-full sm:w-auto">
                  <Button
                    variant={action.variant || 'outline'}
                    size="sm"
                    className="w-full gap-1.5 font-medium text-xs h-9 px-4"
                  >
                    {action.icon && <action.icon className="h-3.5 w-3.5" />}
                    <span>{action.label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  key={idx}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="w-full sm:w-auto gap-1.5 font-medium text-xs h-9 px-4"
                >
                  {action.icon && <action.icon className="h-3.5 w-3.5" />}
                  <span>{action.label}</span>
                </Button>
              )
            ))}
          </div>

          {/* Technical Details Toggle (for dev / diagnostics) */}
          {(showTechnicalDetails || error) && (
            <div className="pt-3 border-t border-border/40 text-left">
              <button
                type="button"
                onClick={() => setDetailsOpen((prev) => !prev)}
                className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                <span className="font-medium">Technical Details</span>
                {detailsOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {detailsOpen && (
                <div className="mt-2.5 p-3 rounded-lg bg-muted/60 border border-border/60 text-xs font-mono space-y-2 text-foreground/90">
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Diagnostic Log</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyDetails}
                      className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Info</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {error?.digest && (
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px] block">Error Digest:</span>
                      <span className="text-foreground break-all">{error.digest}</span>
                    </div>
                  )}

                  {error?.message && (
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px] block">Message:</span>
                      <span className="text-destructive break-all">{error.message}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-muted-foreground pt-1">
                    Timestamp: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help & Support Footer Link */}
          {supportLink && (
            <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <LifeBuoy className="h-3 w-3" />
              <span>Need help?</span>
              <Link href={supportLink} className="text-primary hover:underline font-medium">
                Contact Church Office
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
