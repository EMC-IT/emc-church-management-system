'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Spinner variant types
 */
export type SpinnerVariant = 'default' | 'dots' | 'bars' | 'circle' | 'pulse' | 'bounce' | 'wave' | 'ring';

/**
 * Spinner size types
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Spinner variant */
  variant?: SpinnerVariant;
  /** Spinner size */
  size?: SpinnerSize;
  /** Custom color */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Loading text */
  text?: string;
  /** Whether to show as overlay */
  overlay?: boolean;
  /** Whether to blur background when overlay */
  blurBackground?: boolean;
  /** Custom overlay background */
  overlayBackground?: string;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Whether to center the spinner */
  center?: boolean;
}

/**
 * Size configurations
 */
const sizeConfig = {
  xs: {
    spinner: 'h-3 w-3',
    text: 'text-xs',
    gap: 'gap-1'
  },
  sm: {
    spinner: 'h-4 w-4',
    text: 'text-sm',
    gap: 'gap-2'
  },
  md: {
    spinner: 'h-6 w-6',
    text: 'text-base',
    gap: 'gap-2'
  },
  lg: {
    spinner: 'h-8 w-8',
    text: 'text-lg',
    gap: 'gap-3'
  },
  xl: {
    spinner: 'h-12 w-12',
    text: 'text-xl',
    gap: 'gap-4'
  }
};

/**
 * Speed configurations
 */
const speedConfig = {
  slow: 'duration-1000',
  normal: 'duration-700',
  fast: 'duration-500'
};

/**
 * LoadingSpinner component with multiple variants and overlay support
 * 
 * @example
 * ```tsx
 * <LoadingSpinner
 *   variant="dots"
 *   size="lg"
 *   text="Loading..."
 *   overlay
 * />
 * ```
 */
export function LoadingSpinner({
  variant = 'default',
  size = 'md',
  color,
  className,
  text,
  overlay = false,
  blurBackground = true,
  overlayBackground,
  speed = 'normal',
  center = false
}: LoadingSpinnerProps) {
  const sizeClasses = sizeConfig[size];
  const speedClass = speedConfig[speed];
  
  const colorClasses = color
    ? { color }
    : 'text-brand-primary';

  const renderSpinner = () => {
    const baseClasses = cn(sizeClasses.spinner, speedClass);
    
    switch (variant) {
      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-current animate-pulse',
                  sizeClasses.spinner.replace('h-', 'h-').replace('w-', 'w-'),
                  speedClass
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  ...(color && { backgroundColor: color })
                }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className={cn('flex items-end space-x-1', className)}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-current animate-pulse',
                  'w-1',
                  size === 'xs' ? 'h-2' : size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : size === 'lg' ? 'h-6' : 'h-8',
                  speedClass
                )}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  ...(color && { backgroundColor: color })
                }}
              />
            ))}
          </div>
        );
      
      case 'circle':
        return (
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              baseClasses,
              className
            )}
            style={color ? { borderColor: color, borderTopColor: 'transparent' } : {}}
          />
        );
      
      case 'pulse':
        return (
          <div
            className={cn(
              'animate-pulse rounded-full bg-current',
              baseClasses,
              className
            )}
            style={color ? { backgroundColor: color } : {}}
          />
        );
      
      case 'bounce':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-current animate-bounce',
                  sizeClasses.spinner.replace('h-', 'h-').replace('w-', 'w-'),
                  speedClass
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  ...(color && { backgroundColor: color })
                }}
              />
            ))}
          </div>
        );
      
      case 'wave':
        return (
          <div className={cn('flex items-center space-x-1', className)}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-current rounded-full',
                  'w-1',
                  size === 'xs' ? 'h-2' : size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : size === 'lg' ? 'h-6' : 'h-8'
                )}
                style={{
                  animation: `wave 1.4s ease-in-out ${i * 0.1}s infinite`,
                  ...(color && { backgroundColor: color })
                }}
              />
            ))}
          </div>
        );
      
      case 'ring':
        return (
          <div className={cn('relative', baseClasses, className)}>
            <div
              className="absolute inset-0 rounded-full border-2 border-current opacity-25"
              style={color ? { borderColor: color } : {}}
            />
            <div
              className={cn(
                'absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin',
                speedClass
              )}
              style={color ? { borderTopColor: color } : {}}
            />
          </div>
        );
      
      default: // default (lucide icon)
        return (
          <Loader2
            className={cn(
              'animate-spin',
              baseClasses,
              className
            )}
            style={color ? { color } : {}}
          />
        );
    }
  };

  const spinnerContent = (
    <div
      className={cn(
        'flex items-center',
        sizeClasses.gap,
        center && 'justify-center',
        text ? 'flex-col' : '',
        !color && colorClasses
      )}
    >
      {renderSpinner()}
      {text && (
        <span className={cn('font-medium', sizeClasses.text)}>
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          blurBackground && 'backdrop-blur-sm',
          className
        )}
        style={{
          backgroundColor: overlayBackground || 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="bg-background rounded-lg p-6 shadow-lg">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
}

/**
 * FullPageLoader component for full page loading states
 */
export interface FullPageLoaderProps extends Omit<LoadingSpinnerProps, 'overlay'> {
  /** Custom background color */
  backgroundColor?: string;
  /** Logo or brand element */
  logo?: React.ReactNode;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
}

export function FullPageLoader({
  backgroundColor = 'bg-background',
  logo,
  showProgress = false,
  progress = 0,
  text = 'Loading...',
  ...spinnerProps
}: FullPageLoaderProps) {
  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col items-center justify-center', backgroundColor)}>
      <div className="text-center space-y-6">
        {logo && (
          <div className="mb-8">
            {logo}
          </div>
        )}
        
        <LoadingSpinner
          {...spinnerProps}
          text={text}
          center
        />
        
        {showProgress && (
          <div className="w-64 space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-brand-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InlineLoader component for inline loading states
 */
export interface InlineLoaderProps extends LoadingSpinnerProps {
  /** Whether to replace content or show alongside */
  replace?: boolean;
  /** Content to show when not loading */
  children?: React.ReactNode;
  /** Whether currently loading */
  loading?: boolean;
}

export function InlineLoader({
  replace = false,
  children,
  loading = true,
  ...spinnerProps
}: InlineLoaderProps) {
  if (!loading) {
    return <>{children}</>;
  }

  if (replace) {
    return <LoadingSpinner {...spinnerProps} />;
  }

  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner {...spinnerProps} />
      {children}
    </div>
  );
}

/**
 * ButtonLoader component for button loading states
 */
export interface ButtonLoaderProps {
  /** Whether the button is loading */
  loading?: boolean;
  /** Button content when not loading */
  children: React.ReactNode;
  /** Loading text */
  loadingText?: string;
  /** Spinner size */
  size?: SpinnerSize;
  /** Additional classes */
  className?: string;
}

export function ButtonLoader({
  loading = false,
  children,
  loadingText,
  size = 'sm',
  className
}: ButtonLoaderProps) {
  return (
    <span className={cn('flex items-center space-x-2', className)}>
      {loading && (
        <LoadingSpinner
          variant="default"
          size={size}
        />
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </span>
  );
}

// Add wave animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes wave {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }
  `;
  document.head.appendChild(style);
}

LoadingSpinner.displayName = 'LoadingSpinner';
FullPageLoader.displayName = 'FullPageLoader';
InlineLoader.displayName = 'InlineLoader';
ButtonLoader.displayName = 'ButtonLoader';