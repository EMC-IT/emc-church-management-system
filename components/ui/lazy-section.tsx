'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLazyLoading, useLazyLoadWithRetry, LazyLoadingOptions } from '@/hooks/use-lazy-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Loading strategy types
 */
export type LoadingStrategy = 'immediate' | 'lazy' | 'on-demand' | 'progressive';

/**
 * Props for the LazySection component
 */
export interface LazySectionProps extends LazyLoadingOptions {
  /** Content to render when loaded */
  children: React.ReactNode;
  /** Loading strategy */
  strategy?: LoadingStrategy;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Function to load data */
  loadData?: () => Promise<any>;
  /** Whether the section is currently loading */
  loading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Additional CSS classes */
  className?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Whether to show section header */
  showHeader?: boolean;
  /** Whether to enable retry on error */
  enableRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Minimum height for the section */
  minHeight?: string | number;
  /** Whether to show loading skeleton */
  showSkeleton?: boolean;
  /** Skeleton variant */
  skeletonVariant?: 'card' | 'list' | 'table' | 'form' | 'custom';
  /** Number of skeleton items */
  skeletonCount?: number;
  /** Callback when section loads */
  onLoad?: () => void;
  /** Callback when section errors */
  onError?: (error: Error) => void;
  /** Whether to wrap in a card */
  card?: boolean;
  /** Progressive loading steps */
  progressiveSteps?: Array<{
    component: React.ReactNode;
    delay?: number;
  }>;
}

/**
 * LazySection component for lazy loading entire content sections
 * 
 * @example
 * ```tsx
 * <LazySection
 *   strategy="lazy"
 *   title="User Statistics"
 *   loadData={fetchUserStats}
 *   showSkeleton
 *   skeletonVariant="card"
 * >
 *   <UserStatsComponent />
 * </LazySection>
 * ```
 */
export function LazySection({
  children,
  strategy = 'lazy',
  loadingComponent,
  errorComponent,
  loadData,
  loading: externalLoading,
  error: externalError,
  className,
  title,
  description,
  showHeader = false,
  enableRetry = true,
  maxRetries = 3,
  minHeight,
  showSkeleton = true,
  skeletonVariant = 'card',
  skeletonCount = 3,
  onLoad,
  onError,
  card = false,
  progressiveSteps,
  ...lazyOptions
}: LazySectionProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [internalError, setInternalError] = React.useState<Error | null>(null);
  const [data, setData] = React.useState<any>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [retryCount, setRetryCount] = React.useState(0);

  // Use external loading/error states if provided, otherwise use internal
  const loading = externalLoading ?? internalLoading;
  const error = externalError ?? internalError;

  const { ref, inView, hasBeenInView } = useLazyLoading({
    triggerOnce: strategy !== 'on-demand',
    ...lazyOptions
  });

  // Load data when section comes into view
  React.useEffect(() => {
    if (strategy === 'immediate' || (strategy === 'lazy' && inView) || (strategy === 'on-demand' && hasBeenInView)) {
      if (loadData && !data && !loading && !error) {
        handleLoadData();
      }
    }
  }, [strategy, inView, hasBeenInView, loadData, data, loading, error]);

  // Progressive loading effect
  React.useEffect(() => {
    if (strategy === 'progressive' && progressiveSteps && inView) {
      const loadNextStep = () => {
        if (currentStep < progressiveSteps.length - 1) {
          const nextStep = currentStep + 1;
          const delay = progressiveSteps[nextStep]?.delay || 500;
          
          setTimeout(() => {
            setCurrentStep(nextStep);
          }, delay);
        }
      };

      loadNextStep();
    }
  }, [strategy, progressiveSteps, inView, currentStep]);

  const handleLoadData = async () => {
    if (!loadData) return;

    try {
      setInternalLoading(true);
      setInternalError(null);
      const result = await loadData();
      setData(result);
      setRetryCount(0);
      onLoad?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load section');
      setInternalError(error);
      onError?.(error);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      handleLoadData();
    }
  };

  const renderSkeleton = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    if (!showSkeleton) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    switch (skeletonVariant) {
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        );
      
      case 'form':
        return (
          <div className="space-y-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        );
      
      case 'custom':
        return (
          <div className="space-y-4">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        );
      
      default: // card
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load content</h3>
        <p className="text-muted-foreground mb-4">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {enableRetry && retryCount < maxRetries && (
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={loading}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            {loading ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
      </div>
    );
  };

  const renderProgressiveContent = () => {
    if (!progressiveSteps) return children;
    
    return (
      <div className="space-y-4">
        {progressiveSteps.slice(0, currentStep + 1).map((step, index) => (
          <div
            key={index}
            className={cn(
              'animate-in fade-in duration-500',
              index === currentStep && 'slide-in-from-bottom-4'
            )}
          >
            {step.component}
          </div>
        ))}
        {currentStep < progressiveSteps.length - 1 && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (error) {
      return renderError();
    }

    if (loading || (strategy === 'lazy' && !inView)) {
      return renderSkeleton();
    }

    if (strategy === 'progressive') {
      return renderProgressiveContent();
    }

    return children;
  };

  const containerStyle: React.CSSProperties = {
    minHeight
  };

  const content = (
    <div
      ref={ref}
      className={cn('lazy-section', className)}
      style={containerStyle}
    >
      {showHeader && (title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      {renderContent()}
    </div>
  );

  if (card) {
    return (
      <Card className={className}>
        {showHeader && (title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent>
          <div ref={ref} style={containerStyle}>
            {renderContent()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return content;
}

/**
 * LazyTabs component for lazy loading tab content
 */
export interface LazyTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    loadData?: () => Promise<any>;
  }>;
  defaultTab?: string;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export function LazyTabs({
  tabs,
  defaultTab,
  className,
  onTabChange
}: LazyTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);
  const [loadedTabs, setLoadedTabs] = React.useState<Set<string>>(new Set([activeTab]));

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLoadedTabs(prev => new Set(Array.from(prev).concat(tabId)));
    onTabChange?.(tabId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'transition-all duration-200',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {loadedTabs.has(tab.id) ? (
              <LazySection
                strategy="immediate"
                loadData={tab.loadData}
                showSkeleton
                skeletonVariant="card"
              >
                {tab.content}
              </LazySection>
            ) : (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

LazySection.displayName = 'LazySection';
LazyTabs.displayName = 'LazyTabs';