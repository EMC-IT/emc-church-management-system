'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLazyImage, LazyLoadingOptions } from '@/hooks/use-lazy-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Props for the LazyImage component
 */
export interface LazyImageProps extends LazyLoadingOptions {
  /** Image source URL */
  src: string;
  /** Alternative text for the image */
  alt: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Placeholder image URL */
  placeholder?: string;
  /** Blur data URL for blur-up effect */
  blurDataURL?: string;
  /** Whether to show blur-up effect */
  blurUp?: boolean;
  /** Aspect ratio (e.g., '16/9', '4/3', '1/1') */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Object position */
  objectPosition?: string;
  /** Loading priority */
  priority?: boolean;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Source set for responsive images */
  srcSet?: string;
  /** Whether to show loading skeleton */
  showSkeleton?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
  /** Whether to enable retry on error */
  enableRetry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Fade in duration in milliseconds */
  fadeInDuration?: number;
}

/**
 * LazyImage component with blur-up effect, error handling, and retry functionality
 * 
 * @example
 * ```tsx
 * <LazyImage
 *   src="/images/photo.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 *   blurUp
 *   aspectRatio="4/3"
 *   objectFit="cover"
 * />
 * ```
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  blurDataURL,
  blurUp = true,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  priority = false,
  sizes,
  srcSet,
  showSkeleton = true,
  loadingComponent,
  errorComponent,
  onLoad,
  onError,
  enableRetry = true,
  maxRetries = 3,
  fadeInDuration = 300,
  ...lazyOptions
}: LazyImageProps) {
  const {
    ref,
    inView,
    hasBeenInView,
    loaded,
    error,
    src: imageSrc
  } = useLazyImage(src, { triggerOnce: true, ...lazyOptions });
  
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Handle successful load
  const handleLoad = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    onLoad?.();
  }, [onLoad]);

  // Handle error
  const handleError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const error = new Error(`Failed to load image: ${src}`);
    onError?.(error);
  }, [src, onError]);

  // Retry loading
  const retry = React.useCallback(() => {
    if (retryCount < maxRetries && !isRetrying) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
      
      // Force reload by updating src
      if (imgRef.current) {
        const timestamp = Date.now();
        imgRef.current.src = `${src}?retry=${timestamp}`;
      }
    }
  }, [src, retryCount, maxRetries, isRetrying]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    width,
    height,
    aspectRatio,
    position: 'relative',
    overflow: 'hidden'
  };

  // Image styles
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition,
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    opacity: loaded ? 1 : 0
  };

  // Blur placeholder styles
  const blurStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition,
    filter: 'blur(10px)',
    transform: 'scale(1.1)',
    transition: `opacity ${fadeInDuration}ms ease-in-out`,
    opacity: loaded ? 0 : 1
  };

  // Render loading state
  const renderLoading = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    if (showSkeleton) {
      return (
        <Skeleton 
          className={cn('w-full h-full', className)}
          style={containerStyle}
        />
      );
    }

    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={containerStyle}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <div 
        className={cn(
          'flex flex-col items-center justify-center bg-muted text-muted-foreground p-4',
          className
        )}
        style={containerStyle}
      >
        <AlertCircle className="h-8 w-8 mb-2" />
        <p className="text-sm text-center mb-2">Failed to load image</p>
        {enableRetry && retryCount < maxRetries && (
          <button
            onClick={retry}
            disabled={isRetrying}
            className="flex items-center space-x-1 text-xs text-brand-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3 w-3', isRetrying && 'animate-spin')} />
            <span>{isRetrying ? 'Retrying...' : 'Try again'}</span>
          </button>
        )}
      </div>
    );
  };

  // Don't load if not in view and not priority
  if (!priority && !inView && !hasBeenInView) {
    return (
      <div ref={ref} style={containerStyle}>
        {renderLoading()}
      </div>
    );
  }

  // Show error state
  if (error) {
    return renderError();
  }

  // Show loading state
  if (!imageSrc) {
    return (
      <div ref={ref} style={containerStyle}>
        {renderLoading()}
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={cn('relative', className)}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {blurUp && (blurDataURL || placeholder) && (
        <img
          src={blurDataURL || placeholder}
          alt=""
          style={blurStyle}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        srcSet={srcSet}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
      
      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

/**
 * LazyImageGallery component for displaying multiple images
 */
export interface LazyImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    placeholder?: string;
    blurDataURL?: string;
  }>;
  className?: string;
  /** Grid configuration */
  grid?: {
    cols?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** Gap between images */
  gap?: string;
  /** Aspect ratio for all images */
  aspectRatio?: string;
  /** Object fit for all images */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Whether to enable lightbox */
  lightbox?: boolean;
  /** Callback when image is clicked */
  onImageClick?: (index: number, image: any) => void;
}

export function LazyImageGallery({
  images,
  className,
  grid = { cols: 1, sm: 2, md: 3, lg: 4 },
  gap = 'gap-4',
  aspectRatio = '1/1',
  objectFit = 'cover',
  lightbox = false,
  onImageClick
}: LazyImageGalleryProps) {
  const gridClasses = [
    'grid',
    grid.cols && `grid-cols-${grid.cols}`,
    grid.sm && `sm:grid-cols-${grid.sm}`,
    grid.md && `md:grid-cols-${grid.md}`,
    grid.lg && `lg:grid-cols-${grid.lg}`,
    gap
  ].filter(Boolean).join(' ');

  const handleImageClick = (index: number, image: any) => {
    if (lightbox) {
      // Implement lightbox logic here
      console.log('Open lightbox for image:', index);
    }
    onImageClick?.(index, image);
  };

  return (
    <div className={cn(gridClasses, className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            'relative overflow-hidden rounded-lg',
            (lightbox || onImageClick) && 'cursor-pointer hover:opacity-90 transition-opacity'
          )}
          onClick={() => handleImageClick(index, image)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            placeholder={image.placeholder}
            blurDataURL={image.blurDataURL}
            aspectRatio={aspectRatio}
            objectFit={objectFit}
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * LazyAvatar component for user avatars with fallback
 */
export interface LazyAvatarProps extends Omit<LazyImageProps, 'aspectRatio'> {
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the avatar is online */
  online?: boolean;
}

export function LazyAvatar({
  src,
  alt,
  fallback,
  size = 'md',
  online,
  className,
  ...props
}: LazyAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  const renderFallback = () => (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
      sizeClasses[size],
      className
    )}>
      {fallback || alt.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="relative inline-block">
      <LazyImage
        src={src}
        alt={alt}
        aspectRatio="1/1"
        objectFit="cover"
        className={cn('rounded-full', sizeClasses[size], className)}
        errorComponent={renderFallback()}
        {...props}
      />
      
      {online && (
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
      )}
    </div>
  );
}

LazyImage.displayName = 'LazyImage';
LazyImageGallery.displayName = 'LazyImageGallery';
LazyAvatar.displayName = 'LazyAvatar';