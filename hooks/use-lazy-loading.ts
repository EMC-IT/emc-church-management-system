import { useEffect, useRef, useState } from 'react';

/**
 * Configuration options for the lazy loading hook
 */
export interface LazyLoadingOptions {
  /** The root element for intersection observation. Defaults to viewport */
  root?: Element | null;
  /** Margin around the root element. Can be used to trigger loading before element enters viewport */
  rootMargin?: string;
  /** Threshold for triggering the intersection. 0 = as soon as any part is visible, 1 = entire element must be visible */
  threshold?: number | number[];
  /** Whether to only trigger once or continuously observe */
  triggerOnce?: boolean;
  /** Delay before triggering the callback (in milliseconds) */
  delay?: number;
}

/**
 * Return type for the lazy loading hook
 */
export interface LazyLoadingResult {
  /** Ref to attach to the element you want to observe */
  ref: React.RefObject<HTMLDivElement | null>;
  /** Whether the element is currently in view */
  inView: boolean;
  /** Whether the element has been in view at least once */
  hasBeenInView: boolean;
  /** Function to manually trigger the in-view state */
  trigger: () => void;
  /** Function to reset the in-view state */
  reset: () => void;
}

/**
 * Custom hook for lazy loading using Intersection Observer API
 * 
 * @param options Configuration options for the intersection observer
 * @returns Object containing ref, inView state, and control functions
 * 
 * @example
 * ```tsx
 * const { ref, inView, hasBeenInView } = useLazyLoading({
 *   threshold: 0.1,
 *   rootMargin: '50px',
 *   triggerOnce: true
 * });
 * 
 * return (
 *   <div ref={ref}>
 *     {inView && <ExpensiveComponent />}
 *   </div>
 * );
 * ```
 */
export function useLazyLoading(options: LazyLoadingOptions = {}): LazyLoadingResult {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = true,
    delay = 0
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const trigger = () => {
    setInView(true);
    setHasBeenInView(true);
  };

  const reset = () => {
    setInView(false);
    setHasBeenInView(false);
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (!window.IntersectionObserver) {
      // Fallback: immediately trigger for browsers without support
      trigger();
      return;
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      const isIntersecting = entry.isIntersecting;

      if (isIntersecting) {
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            setInView(true);
            setHasBeenInView(true);

            if (triggerOnce && observerRef.current) {
              observerRef.current.disconnect();
            }
          }, delay);
        } else {
          setInView(true);
          setHasBeenInView(true);

          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      } else if (!triggerOnce) {
        // Clear any pending timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setInView(false);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [root, rootMargin, threshold, triggerOnce, delay]);

  return {
    ref,
    inView,
    hasBeenInView,
    trigger,
    reset
  };
}

/**
 * Hook for lazy loading images with additional image-specific features
 * 
 * @param src Image source URL
 * @param options Lazy loading options
 * @returns Object with image loading state and ref
 */
export function useLazyImage(src: string, options: LazyLoadingOptions = {}) {
  const { ref, inView, hasBeenInView } = useLazyLoading(options);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (inView && src && !imageSrc) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setLoaded(true);
        setError(false);
      };

      img.onerror = () => {
        setError(true);
        setLoaded(false);
      };

      img.src = src;
    }
  }, [inView, src, imageSrc]);

  return {
    ref,
    inView,
    hasBeenInView,
    loaded,
    error,
    src: imageSrc
  };
}

/**
 * Hook for lazy loading with retry functionality
 * 
 * @param loadFn Function to execute when element comes into view
 * @param options Lazy loading options with retry configuration
 */
export function useLazyLoadWithRetry<T>(
  loadFn: () => Promise<T>,
  options: LazyLoadingOptions & { maxRetries?: number; retryDelay?: number } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...lazyOptions } = options;
  const { ref, inView, hasBeenInView } = useLazyLoading(lazyOptions);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeLoad = async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadFn();
      setData(result);
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');

      if (attempt < maxRetries) {
        setRetryCount(attempt + 1);
        setTimeout(() => executeLoad(attempt + 1), retryDelay);
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView && !data && !loading) {
      executeLoad();
    }
  }, [inView]);

  const retry = () => {
    if (!loading) {
      executeLoad();
    }
  };

  return {
    ref,
    inView,
    hasBeenInView,
    data,
    loading,
    error,
    retryCount,
    retry
  };
}