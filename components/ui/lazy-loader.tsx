'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLazyLoading, LazyLoadingOptions } from '@/hooks/use-lazy-loading';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Props for the LazyLoader component
 */
export interface LazyLoaderProps extends LazyLoadingOptions {
  /** Content to render when the element is in view */
  children: React.ReactNode;
  /** Loading component to show while not in view */
  fallback?: React.ReactNode;
  /** Custom loading component */
  loader?: React.ReactNode;
  /** Height of the container when loading */
  height?: string | number;
  /** Width of the container when loading */
  width?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a fade-in animation when content loads */
  fadeIn?: boolean;
  /** Duration of fade-in animation in milliseconds */
  fadeInDuration?: number;
  /** Whether to maintain the container dimensions during loading */
  maintainDimensions?: boolean;
  /** Error boundary fallback */
  onError?: (error: Error) => void;
}

/**
 * LazyLoader component that uses Intersection Observer to lazy load content
 * 
 * @example
 * ```tsx
 * <LazyLoader
 *   threshold={0.1}
 *   rootMargin="50px"
 *   fadeIn
 *   height={200}
 * >
 *   <ExpensiveComponent />
 * </LazyLoader>
 * ```
 */
export function LazyLoader({
  children,
  fallback,
  loader,
  height,
  width,
  className,
  fadeIn = true,
  fadeInDuration = 300,
  maintainDimensions = false,
  onError,
  ...lazyOptions
}: LazyLoaderProps) {
  const { ref, inView, hasBeenInView } = useLazyLoading(lazyOptions);
  const [hasError, setHasError] = React.useState(false);

  // Error boundary logic
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      onError?.(new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  const containerStyle: React.CSSProperties = {
    height: maintainDimensions || !inView ? height : 'auto',
    width: maintainDimensions || !inView ? width : 'auto',
    transition: fadeIn ? `opacity ${fadeInDuration}ms ease-in-out` : undefined,
    opacity: fadeIn && hasBeenInView ? (inView ? 1 : 0.7) : 1,
  };

  const renderFallback = () => {
    if (loader) return loader;
    if (fallback) return fallback;
    
    // Default skeleton loader
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  };

  const renderError = () => (
    <div className="flex items-center justify-center p-4 text-muted-foreground">
      <div className="text-center">
        <p className="text-sm">Failed to load content</p>
        <button
          onClick={() => setHasError(false)}
          className="mt-2 text-xs text-brand-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={cn('lazy-loader', className)}
      style={containerStyle}
    >
      {hasError ? (
        renderError()
      ) : inView ? (
        <div className={fadeIn ? 'animate-in fade-in duration-300' : ''}>
          {children}
        </div>
      ) : (
        renderFallback()
      )}
    </div>
  );
}

/**
 * LazyContainer component for wrapping multiple lazy-loaded items
 */
export interface LazyContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Gap between lazy-loaded items */
  gap?: string;
  /** Grid configuration for responsive layout */
  grid?: {
    cols?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function LazyContainer({
  children,
  className,
  gap = 'gap-4',
  grid
}: LazyContainerProps) {
  const gridClasses = grid
    ? [
        `grid`,
        grid.cols && `grid-cols-${grid.cols}`,
        grid.sm && `sm:grid-cols-${grid.sm}`,
        grid.md && `md:grid-cols-${grid.md}`,
        grid.lg && `lg:grid-cols-${grid.lg}`,
        grid.xl && `xl:grid-cols-${grid.xl}`,
        gap
      ].filter(Boolean).join(' ')
    : `space-y-4`;

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}

/**
 * LazyList component for efficiently rendering large lists
 */
export interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
  /** Number of items to render initially */
  initialCount?: number;
  /** Number of items to load when scrolling */
  loadMoreCount?: number;
  /** Loading component for additional items */
  loadingComponent?: React.ReactNode;
  /** Whether to enable virtual scrolling */
  virtual?: boolean;
}

export function LazyList<T>({
  items,
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  className,
  initialCount = 10,
  loadMoreCount = 10,
  loadingComponent,
  virtual = false
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = React.useState(initialCount);
  const { ref, inView } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px'
  });

  React.useEffect(() => {
    if (inView && visibleCount < items.length) {
      setVisibleCount(prev => Math.min(prev + loadMoreCount, items.length));
    }
  }, [inView, visibleCount, items.length, loadMoreCount]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  if (virtual) {
    // Simple virtual scrolling implementation
    return (
      <div
        className={cn('overflow-auto', className)}
        style={{ height: containerHeight }}
      >
        <div style={{ height: items.length * itemHeight }}>
          {visibleItems.map((item, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                width: '100%'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {visibleItems.map((item, index) => (
        <div key={index}>
          {renderItem(item, index)}
        </div>
      ))}
      
      {hasMore && (
        <div ref={ref} className="py-4">
          {loadingComponent || (
            <div className="flex justify-center">
              <Skeleton className="h-12 w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Higher-order component for adding lazy loading to any component
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  lazyOptions?: LazyLoadingOptions
) {
  return function LazyWrappedComponent(props: P & { lazyProps?: LazyLoaderProps }) {
    const { lazyProps, ...componentProps } = props;
    
    return (
      <LazyLoader {...lazyOptions} {...lazyProps}>
        <Component {...(componentProps as P)} />
      </LazyLoader>
    );
  };
}

LazyLoader.displayName = 'LazyLoader';
LazyContainer.displayName = 'LazyContainer';
LazyList.displayName = 'LazyList';