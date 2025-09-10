/**
 * ProgressiveImage Component
 * 
 * A progressive image loading component with blur-up effect, error handling,
 * and accessibility features. Provides smooth loading transitions and fallbacks.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface ProgressiveImageProps {
  /** Main image source URL */
  src: string;
  /** Low-quality placeholder image URL (optional) */
  placeholderSrc?: string;
  /** Alternative text for accessibility */
  alt: string;
  /** Custom className for styling */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Object fit behavior */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  /** Whether to show loading spinner */
  showLoading?: boolean;
  /** Whether to enable blur effect */
  enableBlur?: boolean;
  /** Blur amount in pixels */
  blurAmount?: number;
  /** Loading transition duration in ms */
  transitionDuration?: number;
  /** Whether to use intersection observer for lazy loading */
  lazy?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Loading threshold for intersection observer */
  threshold?: number;
  /** Callback when image starts loading */
  onLoadStart?: () => void;
  /** Callback when image loads successfully */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when image fails to load */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Callback when loading state changes */
  onLoadingStateChange?: (state: ImageLoadingState) => void;
  /** Custom error fallback component */
  errorFallback?: React.ReactNode;
  /** Whether to retry loading on error */
  enableRetry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a low-quality placeholder data URL
 */
function generatePlaceholderDataUrl(width: number = 40, height: number = 40, color: string = '#f3f4f6'): string {
  return `data:image/svg+xml,%3csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='${encodeURIComponent(color)}'/%3e%3c/svg%3e`;
}

/**
 * Preload an image and return a promise
 */
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Create intersection observer for lazy loading
 */
function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// ============================================================================
// PROGRESSIVE IMAGE COMPONENT
// ============================================================================

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  placeholderSrc,
  alt,
  className = '',
  style = {},
  width,
  height,
  objectFit = 'cover',
  showLoading = true,
  enableBlur = true,
  blurAmount = 10,
  transitionDuration = 300,
  lazy = false,
  rootMargin = '50px',
  threshold = 0.1,
  onLoadStart,
  onLoad,
  onError,
  onLoadingStateChange,
  errorFallback,
  enableRetry = true,
  maxRetries = 3,
  retryDelay = 1000,
  ...props
}) => {
  // State management
  const [loadingState, setLoadingState] = useState<ImageLoadingState>('idle');
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInView, setIsInView] = useState(!lazy);

  // Refs
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update loading state and notify parent
  const updateLoadingState = useCallback((state: ImageLoadingState) => {
    setLoadingState(state);
    onLoadingStateChange?.(state);
  }, [onLoadingStateChange]);

  // Handle image loading
  const handleImageLoad = useCallback(async () => {
    if (!src || !isInView) return;

    updateLoadingState('loading');
    onLoadStart?.();

    try {
      // Preload the image
      await preloadImage(src);
      
      // Set the source and update state
      setCurrentSrc(src);
      updateLoadingState('loaded');
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to load image:', error);
      updateLoadingState('error');
      
      // Retry logic
      if (enableRetry && retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleImageLoad();
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
      }
    }
  }, [src, isInView, updateLoadingState, onLoadStart, enableRetry, retryCount, maxRetries, retryDelay]);

  // Handle retry manually
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    updateLoadingState('idle');
    handleImageLoad();
  }, [handleImageLoad, updateLoadingState]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    observerRef.current = createIntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [lazy, rootMargin, threshold, isInView]);

  // Start loading when in view
  useEffect(() => {
    if (isInView && loadingState === 'idle') {
      handleImageLoad();
    }
  }, [isInView, loadingState, handleImageLoad]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      observerRef.current?.disconnect();
    };
  }, []);

  // Event handlers
  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    onLoad?.(event);
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    updateLoadingState('error');
    onError?.(event);
  }, [onError, updateLoadingState]);

  // Determine which source to use
  const displaySrc = currentSrc || placeholderSrc || generatePlaceholderDataUrl(
    typeof width === 'number' ? width : 200,
    typeof height === 'number' ? height : 200
  );

  // Calculate styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width,
    height,
    ...style
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: `all ${transitionDuration}ms ease-in-out`,
    filter: loadingState === 'loading' && enableBlur ? `blur(${blurAmount}px)` : 'none',
    transform: loadingState === 'loaded' ? 'scale(1)' : 'scale(1.05)',
    opacity: loadingState === 'error' ? 0.5 : 1
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transition: `opacity ${transitionDuration}ms ease-in-out`,
    opacity: loadingState === 'loading' || loadingState === 'error' ? 1 : 0,
    pointerEvents: loadingState === 'loading' || loadingState === 'error' ? 'auto' : 'none'
  };

  // Render error state
  if (loadingState === 'error' && errorFallback) {
    return <div className={className} style={containerStyle}>{errorFallback}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`progressive-image-container ${className}`}
      style={containerStyle}
      role="img"
      aria-label={alt}
      {...props}
    >
      {/* Main image */}
      {displaySrc && (
        <img
          ref={imgRef}
          src={displaySrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
        />
      )}

      {/* Loading/Error overlay */}
      <div style={overlayStyle}>
        {loadingState === 'loading' && showLoading && (
          <LoadingSpinner
            size="md"
            message="Loading image..."
            showMessage={false}
            style="primary"
          />
        )}

        {loadingState === 'error' && (
          <div className="flex flex-col items-center space-y-3 p-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Failed to load image
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {retryCount < maxRetries 
                  ? `Retrying... (${retryCount}/${maxRetries})`
                  : 'Unable to load after multiple attempts'
                }
              </p>
              {enableRetry && retryCount >= maxRetries && (
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Accessibility */}
      <span className="sr-only">
        {loadingState === 'loading' && 'Image loading...'}
        {loadingState === 'error' && 'Image failed to load'}
        {loadingState === 'loaded' && alt}
      </span>
    </div>
  );
};

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Avatar image with progressive loading
 */
export const ProgressiveAvatar: React.FC<Omit<ProgressiveImageProps, 'objectFit' | 'className'> & {
  size?: number;
  className?: string;
}> = ({ size = 48, className = '', ...props }) => (
  <ProgressiveImage
    {...props}
    width={size}
    height={size}
    objectFit="cover"
    className={`rounded-full ${className}`}
    enableBlur={false}
    lazy={false}
  />
);

/**
 * Thumbnail image with progressive loading
 */
export const ProgressiveThumbnail: React.FC<Omit<ProgressiveImageProps, 'objectFit'> & {
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2';
}> = ({ aspectRatio = 'square', className = '', ...props }) => {
  const aspectClasses = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]'
  };

  return (
    <ProgressiveImage
      {...props}
      objectFit="cover"
      className={`${aspectClasses[aspectRatio]} ${className}`}
    />
  );
};

/**
 * Hero image with progressive loading
 */
export const ProgressiveHero: React.FC<ProgressiveImageProps> = (props) => (
  <ProgressiveImage
    {...props}
    objectFit="cover"
    showLoading={true}
    enableBlur={true}
    lazy={false}
    className={`w-full h-64 md:h-96 ${props.className || ''}`}
  />
);

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing progressive image loading state
 */
export function useProgressiveImage(src: string, lazy = false) {
  const [state, setState] = useState<ImageLoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!src) return;

    setState('loading');
    setError(null);

    try {
      await preloadImage(src);
      setState('loaded');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load image'));
      setState('error');
    }
  }, [src]);

  useEffect(() => {
    if (!lazy) {
      load();
    }
  }, [load, lazy]);

  return {
    state,
    error,
    load,
    isLoading: state === 'loading',
    isLoaded: state === 'loaded',
    hasError: state === 'error'
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ProgressiveImage;

export type { ProgressiveImageProps };