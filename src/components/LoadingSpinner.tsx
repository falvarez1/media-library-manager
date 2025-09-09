/**
 * LoadingSpinner Component
 * 
 * A flexible, accessible loading spinner with multiple sizes, styles, and layout options.
 * Includes semantic loading messages and ARIA support for screen readers.
 */

import React from 'react';
import { Loader, Loader2, RotateCw, RefreshCw } from 'lucide-react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'bars' | 'ring';
export type SpinnerStyle = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Visual variant of the spinner */
  variant?: SpinnerVariant;
  /** Color style of the spinner */
  style?: SpinnerStyle;
  /** Loading message to display */
  message?: string;
  /** Secondary message or description */
  description?: string;
  /** Whether to show the message */
  showMessage?: boolean;
  /** Whether to center the spinner */
  centered?: boolean;
  /** Whether to show as overlay */
  overlay?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Delay before showing spinner (in ms) */
  delay?: number;
  /** Whether the spinner is currently visible */
  visible?: boolean;
  /** Callback when delay timeout completes */
  onDelayComplete?: () => void;
}

// ============================================================================
// SIZE AND STYLE CONFIGURATIONS
// ============================================================================

const SPINNER_SIZES = {
  xs: { size: 12, text: 'text-xs', spacing: 'space-y-1' },
  sm: { size: 16, text: 'text-xs', spacing: 'space-y-2' },
  md: { size: 24, text: 'text-sm', spacing: 'space-y-2' },
  lg: { size: 32, text: 'text-base', spacing: 'space-y-3' },
  xl: { size: 48, text: 'text-lg', spacing: 'space-y-4' },
  xxl: { size: 64, text: 'text-xl', spacing: 'space-y-4' }
} as const;

const SPINNER_STYLES = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  neutral: 'text-gray-400'
} as const;

// ============================================================================
// SPINNER VARIANTS
// ============================================================================

interface SpinnerIconProps {
  size: number;
  className: string;
}

/**
 * Default rotating icon spinner
 */
const DefaultSpinner: React.FC<SpinnerIconProps> = ({ size, className }) => (
  <Loader 
    size={size} 
    className={`animate-spin ${className}`}
    role="status"
    aria-hidden="true"
  />
);

/**
 * Dots loading animation
 */
const DotsSpinner: React.FC<SpinnerIconProps> = ({ size, className }) => {
  const dotSize = Math.max(2, size / 8);
  const spacing = size / 6;
  
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-hidden="true"
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-current rounded-full animate-pulse"
            style={{
              width: dotSize,
              height: dotSize,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Pulse animation
 */
const PulseSpinner: React.FC<SpinnerIconProps> = ({ size, className }) => (
  <div
    className={`border-2 border-current border-opacity-30 rounded-full animate-pulse ${className}`}
    style={{ width: size, height: size }}
    role="status"
    aria-hidden="true"
  />
);

/**
 * Bars loading animation
 */
const BarsSpinner: React.FC<SpinnerIconProps> = ({ size, className }) => {
  const barWidth = Math.max(1, size / 8);
  const barMaxHeight = size * 0.6;
  
  return (
    <div 
      className={`flex items-end justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-hidden="true"
    >
      <div className="flex space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-current animate-pulse"
            style={{
              width: barWidth,
              height: barMaxHeight,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.2s',
              transform: `scaleY(${0.4 + (Math.sin(Date.now() * 0.01 + i) + 1) * 0.3})`
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Ring spinner with rotating border
 */
const RingSpinner: React.FC<SpinnerIconProps> = ({ size, className }) => (
  <div
    className={`border-2 border-gray-200 border-t-current rounded-full animate-spin ${className}`}
    style={{ width: size, height: size }}
    role="status"
    aria-hidden="true"
  />
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  style = 'primary',
  message,
  description,
  showMessage = true,
  centered = false,
  overlay = false,
  className = '',
  ariaLabel,
  delay = 0,
  visible = true,
  onDelayComplete
}) => {
  const [isVisible, setIsVisible] = React.useState(delay === 0);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Handle delay before showing spinner
  React.useEffect(() => {
    if (!visible) {
      setIsVisible(false);
      return;
    }

    if (delay > 0) {
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        onDelayComplete?.();
      }, delay);
    } else {
      setIsVisible(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, visible, onDelayComplete]);

  // Don't render if not visible
  if (!isVisible || !visible) {
    return null;
  }

  const sizeConfig = SPINNER_SIZES[size];
  const styleClass = SPINNER_STYLES[style];

  // Select spinner component based on variant
  const SpinnerComponent = React.useMemo(() => {
    switch (variant) {
      case 'dots':
        return DotsSpinner;
      case 'pulse':
        return PulseSpinner;
      case 'bars':
        return BarsSpinner;
      case 'ring':
        return RingSpinner;
      default:
        return DefaultSpinner;
    }
  }, [variant]);

  // Base container classes
  const containerClasses = [
    'flex items-center',
    centered ? 'justify-center' : '',
    overlay ? 'fixed inset-0 z-50 bg-white bg-opacity-75 backdrop-blur-sm' : '',
    className
  ].filter(Boolean).join(' ');

  // Content wrapper classes
  const contentClasses = [
    'flex',
    showMessage && (message || description) ? 'flex-col items-center' : 'items-center',
    sizeConfig.spacing
  ].filter(Boolean).join(' ');

  // Generate aria-label
  const spinnerAriaLabel = ariaLabel || 
    (message ? `Loading: ${message}` : 'Loading...');

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Spinner */}
        <div 
          className="flex items-center justify-center"
          role="status"
          aria-label={spinnerAriaLabel}
        >
          <SpinnerComponent 
            size={sizeConfig.size}
            className={styleClass}
          />
        </div>

        {/* Loading message */}
        {showMessage && (message || description) && (
          <div className="text-center">
            {message && (
              <div className={`font-medium text-gray-900 ${sizeConfig.text}`}>
                {message}
              </div>
            )}
            {description && (
              <div className={`text-gray-600 ${sizeConfig.text === 'text-xs' ? 'text-xs' : 'text-sm'} mt-1`}>
                {description}
              </div>
            )}
          </div>
        )}

        {/* Screen reader only text */}
        <span className="sr-only">
          {message || 'Loading content, please wait...'}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Full page loading overlay
 */
export const PageLoader: React.FC<Partial<LoadingSpinnerProps>> = (props) => (
  <LoadingSpinner
    size="xl"
    overlay
    centered
    message="Loading..."
    {...props}
  />
);

/**
 * Button loading spinner
 */
export const ButtonLoader: React.FC<{ size?: SpinnerSize }> = ({ size = 'sm' }) => (
  <LoadingSpinner
    size={size}
    variant="default"
    style="neutral"
    showMessage={false}
    className="mr-2"
  />
);

/**
 * Inline loading spinner
 */
export const InlineLoader: React.FC<{ message?: string }> = ({ message }) => (
  <LoadingSpinner
    size="sm"
    message={message}
    showMessage={!!message}
    style="secondary"
  />
);

/**
 * Card/section loading spinner
 */
export const SectionLoader: React.FC<Partial<LoadingSpinnerProps>> = (props) => (
  <LoadingSpinner
    size="lg"
    centered
    message="Loading section..."
    className="py-12"
    {...props}
  />
);

/**
 * Minimal spinner for tight spaces
 */
export const MiniLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingSpinner
    size="xs"
    variant="ring"
    showMessage={false}
    className={className}
  />
);

// ============================================================================
// HOOKS FOR LOADING STATES
// ============================================================================

/**
 * Hook for managing loading states with automatic delays
 */
export function useLoadingState(initialLoading = false, delay = 300) {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [showSpinner, setShowSpinner] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (isLoading) {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setShowSpinner(true);
        }, delay);
      } else {
        setShowSpinner(true);
      }
    } else {
      setShowSpinner(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, delay]);

  return {
    isLoading,
    showSpinner,
    setLoading: setIsLoading
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default LoadingSpinner;
export type { 
  LoadingSpinnerProps, 
  SpinnerSize, 
  SpinnerVariant, 
  SpinnerStyle 
};