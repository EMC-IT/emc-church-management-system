'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Base skeleton loader props
 */
export interface BaseSkeletonProps {
  className?: string;
  /** Number of items to show */
  count?: number;
  /** Whether to animate the skeleton */
  animate?: boolean;
}

/**
 * Card skeleton loader for card-based content
 */
export interface CardSkeletonProps extends BaseSkeletonProps {
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show avatar in header */
  showAvatar?: boolean;
  /** Number of content lines */
  contentLines?: number;
  /** Whether to show footer actions */
  showActions?: boolean;
  /** Card height */
  height?: string;
}

export function CardSkeleton({
  className,
  count = 1,
  animate = true,
  showHeader = true,
  showAvatar = false,
  contentLines = 3,
  showActions = false,
  height
}: CardSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';

  const renderCard = (index: number) => (
    <Card key={index} className={cn('w-full', className)} style={{ height }}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <Skeleton className={cn('h-10 w-10 rounded-full', skeletonClass)} />
            )}
            <div className="space-y-2 flex-1">
              <Skeleton className={cn('h-4 w-3/4', skeletonClass)} />
              <Skeleton className={cn('h-3 w-1/2', skeletonClass)} />
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="space-y-2">
        {Array.from({ length: contentLines }).map((_, lineIndex) => (
          <Skeleton
            key={lineIndex}
            className={cn(
              'h-4',
              lineIndex === contentLines - 1 ? 'w-2/3' : 'w-full',
              skeletonClass
            )}
          />
        ))}
        
        {showActions && (
          <div className="flex space-x-2 pt-4">
            <Skeleton className={cn('h-8 w-20', skeletonClass)} />
            <Skeleton className={cn('h-8 w-16', skeletonClass)} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className={cn('space-y-4', count > 1 && 'grid gap-4 md:grid-cols-2 lg:grid-cols-3')}>
      {Array.from({ length: count }).map((_, index) => renderCard(index))}
    </div>
  );
}

/**
 * Table skeleton loader for data tables
 */
export interface TableSkeletonProps extends BaseSkeletonProps {
  /** Number of columns */
  columns?: number;
  /** Number of rows */
  rows?: number;
  /** Whether to show table header */
  showHeader?: boolean;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Whether to show search/filters */
  showFilters?: boolean;
}

export function TableSkeleton({
  className,
  animate = true,
  columns = 4,
  rows = 5,
  showHeader = true,
  showPagination = true,
  showFilters = true
}: TableSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';

  return (
    <div className={cn('space-y-4', className)}>
      {showFilters && (
        <div className="flex items-center justify-between">
          <Skeleton className={cn('h-10 w-64', skeletonClass)} />
          <div className="flex space-x-2">
            <Skeleton className={cn('h-10 w-24', skeletonClass)} />
            <Skeleton className={cn('h-10 w-24', skeletonClass)} />
          </div>
        </div>
      )}
      
      <div className="border rounded-lg">
        {showHeader && (
          <div className="border-b p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <Skeleton key={index} className={cn('h-4 w-full', skeletonClass)} />
              ))}
            </div>
          </div>
        )}
        
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={cn(
                      'h-4',
                      colIndex === 0 ? 'w-3/4' : colIndex === columns - 1 ? 'w-1/2' : 'w-full',
                      skeletonClass
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className={cn('h-4 w-32', skeletonClass)} />
          <div className="flex space-x-2">
            <Skeleton className={cn('h-8 w-8', skeletonClass)} />
            <Skeleton className={cn('h-8 w-8', skeletonClass)} />
            <Skeleton className={cn('h-8 w-8', skeletonClass)} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Form skeleton loader for forms
 */
export interface FormSkeletonProps extends BaseSkeletonProps {
  /** Number of form fields */
  fields?: number;
  /** Whether to show form title */
  showTitle?: boolean;
  /** Whether to show form actions */
  showActions?: boolean;
  /** Layout type */
  layout?: 'single' | 'double' | 'mixed';
}

export function FormSkeleton({
  className,
  animate = true,
  fields = 6,
  showTitle = true,
  showActions = true,
  layout = 'mixed'
}: FormSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';
  
  const getFieldWidth = (index: number) => {
    if (layout === 'single') return 'col-span-full';
    if (layout === 'double') return 'col-span-1';
    // Mixed layout
    return index % 3 === 0 ? 'col-span-full' : 'col-span-1';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {showTitle && (
        <div className="space-y-2">
          <Skeleton className={cn('h-8 w-1/3', skeletonClass)} />
          <Skeleton className={cn('h-4 w-2/3', skeletonClass)} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className={getFieldWidth(index)}>
            <div className="space-y-2">
              <Skeleton className={cn('h-4 w-24', skeletonClass)} />
              <Skeleton className={cn('h-10 w-full', skeletonClass)} />
            </div>
          </div>
        ))}
      </div>
      
      {showActions && (
        <div className="flex space-x-2 pt-4">
          <Skeleton className={cn('h-10 w-24', skeletonClass)} />
          <Skeleton className={cn('h-10 w-20', skeletonClass)} />
        </div>
      )}
    </div>
  );
}

/**
 * List skeleton loader for list items
 */
export interface ListSkeletonProps extends BaseSkeletonProps {
  /** Number of list items */
  items?: number;
  /** Whether to show avatars */
  showAvatar?: boolean;
  /** Whether to show secondary text */
  showSecondary?: boolean;
  /** Whether to show actions */
  showActions?: boolean;
  /** Item height */
  itemHeight?: string;
}

export function ListSkeleton({
  className,
  animate = true,
  items = 5,
  showAvatar = true,
  showSecondary = true,
  showActions = false,
  itemHeight = 'h-16'
}: ListSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={cn('flex items-center space-x-3 p-3 border rounded-lg', itemHeight)}>
          {showAvatar && (
            <Skeleton className={cn('h-10 w-10 rounded-full flex-shrink-0', skeletonClass)} />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton className={cn('h-4 w-3/4', skeletonClass)} />
            {showSecondary && (
              <Skeleton className={cn('h-3 w-1/2', skeletonClass)} />
            )}
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              <Skeleton className={cn('h-8 w-8 rounded', skeletonClass)} />
              <Skeleton className={cn('h-8 w-8 rounded', skeletonClass)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Profile skeleton loader for user profiles
 */
export interface ProfileSkeletonProps extends BaseSkeletonProps {
  /** Whether to show cover image */
  showCover?: boolean;
  /** Whether to show stats */
  showStats?: boolean;
  /** Whether to show bio */
  showBio?: boolean;
  /** Layout variant */
  variant?: 'card' | 'page' | 'compact';
}

export function ProfileSkeleton({
  className,
  animate = true,
  showCover = true,
  showStats = true,
  showBio = true,
  variant = 'card'
}: ProfileSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <Skeleton className={cn('h-12 w-12 rounded-full', skeletonClass)} />
        <div className="space-y-2">
          <Skeleton className={cn('h-4 w-32', skeletonClass)} />
          <Skeleton className={cn('h-3 w-24', skeletonClass)} />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {showCover && (
        <div className="relative">
          <Skeleton className={cn('h-32 w-full rounded-t-lg', skeletonClass)} />
          <div className="absolute -bottom-6 left-6">
            <Skeleton className={cn('h-20 w-20 rounded-full border-4 border-background', skeletonClass)} />
          </div>
        </div>
      )}
      
      <CardContent className={cn('pt-8', !showCover && 'pt-6')}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className={cn('h-6 w-48', skeletonClass)} />
            <Skeleton className={cn('h-4 w-32', skeletonClass)} />
          </div>
          
          {showBio && (
            <div className="space-y-2">
              <Skeleton className={cn('h-4 w-full', skeletonClass)} />
              <Skeleton className={cn('h-4 w-3/4', skeletonClass)} />
            </div>
          )}
          
          {showStats && (
            <div className="flex space-x-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center space-y-1">
                  <Skeleton className={cn('h-6 w-12 mx-auto', skeletonClass)} />
                  <Skeleton className={cn('h-3 w-16', skeletonClass)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Chart skeleton loader for charts and graphs
 */
export interface ChartSkeletonProps extends BaseSkeletonProps {
  /** Chart type */
  type?: 'bar' | 'line' | 'pie' | 'area';
  /** Chart height */
  height?: string;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show title */
  showTitle?: boolean;
}

export function ChartSkeleton({
  className,
  animate = true,
  type = 'bar',
  height = 'h-64',
  showLegend = true,
  showTitle = true
}: ChartSkeletonProps) {
  const skeletonClass = animate ? 'animate-pulse' : '';

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <div className="flex items-center justify-center">
            <Skeleton className={cn('h-32 w-32 rounded-full', skeletonClass)} />
          </div>
        );
      
      case 'line':
      case 'area':
        return (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-end space-x-1" style={{ height: `${20 + Math.random() * 40}px` }}>
                {Array.from({ length: 8 }).map((_, barIndex) => (
                  <Skeleton
                    key={barIndex}
                    className={cn('flex-1', skeletonClass)}
                    style={{ height: `${10 + Math.random() * 30}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      
      default: // bar
        return (
          <div className="flex items-end space-x-2 h-full">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn('flex-1', skeletonClass)}
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {showTitle && (
          <div className="mb-4 space-y-2">
            <Skeleton className={cn('h-6 w-48', skeletonClass)} />
            <Skeleton className={cn('h-4 w-32', skeletonClass)} />
          </div>
        )}
        
        <div className={cn('w-full', height)}>
          {renderChart()}
        </div>
        
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className={cn('h-3 w-3 rounded-full', skeletonClass)} />
                <Skeleton className={cn('h-3 w-16', skeletonClass)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PAGE-LEVEL SKELETON LOADERS
// ============================================================================

export function StatCardSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton({ hasAction = true }: { hasAction?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-7 w-48" />
      </div>
      {hasAction && <Skeleton className="h-9 w-32 rounded-md" />}
    </div>
  );
}

export function TablePageSkeleton({
  hasStats = true,
  columns = 5,
  rows = 6,
}: {
  hasStats?: boolean;
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      {hasStats && <StatCardSkeleton />}
      <Card className="p-6">
        <TableSkeleton columns={columns} rows={rows} />
      </Card>
    </div>
  );
}

export function FormPageSkeleton({
  cardCount = 1,
  fieldsPerCard = 6,
}: {
  cardCount?: number;
  fieldsPerCard?: number;
}) {
  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeaderSkeleton hasAction={false} />
      {Array.from({ length: cardCount }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {Array.from({ length: fieldsPerCard }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      ))}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function DetailsPageSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="flex gap-3 border-b pb-3">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <StatCardSkeleton />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="p-6 lg:col-span-4 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </Card>
        <Card className="p-6 lg:col-span-3 space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}