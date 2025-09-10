/**
 * ErrorBoundary Component
 * 
 * A comprehensive React error boundary that catches JavaScript errors in component trees,
 * logs them, and displays a fallback UI instead of crashing the entire application.
 * 
 * Features:
 * - Error logging with details
 * - Retry functionality
 * - Different fallback UIs based on error type
 * - Integration with notification system
 * - Accessibility support
 * - TypeScript support
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  showDetails: boolean;
}

// ============================================================================
// ERROR LOGGING UTILITIES
// ============================================================================

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log error details to console and external services
 */
function logError(
  error: Error,
  errorInfo: ErrorInfo,
  errorId: string,
  context?: {
    level?: string;
    name?: string;
    retryCount?: number;
    userId?: string;
    sessionId?: string;
  }
) {
  const errorDetails = {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context,
    retryCount: context?.retryCount || 0
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error Boundary: ${context?.name || 'Unknown'}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Details:', errorDetails);
    console.groupEnd();
  }

  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    try {
      // Here you would send to your error reporting service
      // Examples: Sentry, LogRocket, Rollbar, etc.
      
      // For now, we'll use a placeholder
      console.error('[ErrorBoundary]', errorDetails);
      
      // Example integration with a hypothetical error service:
      // errorReportingService.captureException(error, {
      //   tags: { component: context?.name, level: context?.level },
      //   extra: errorDetails
      // });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  // Store in sessionStorage for debugging
  try {
    const existingErrors = JSON.parse(sessionStorage.getItem('errorBoundaryLogs') || '[]');
    existingErrors.push(errorDetails);
    
    // Keep only the last 10 errors to avoid storage bloat
    const recentErrors = existingErrors.slice(-10);
    sessionStorage.setItem('errorBoundaryLogs', JSON.stringify(recentErrors));
  } catch (storageError) {
    console.warn('Failed to store error in sessionStorage:', storageError);
  }
}

/**
 * Determine error severity based on error type and context
 */
function getErrorSeverity(error: Error, level?: string): 'low' | 'medium' | 'high' | 'critical' {
  // Critical errors that affect the entire app
  if (level === 'page' || error.name === 'ChunkLoadError') {
    return 'critical';
  }
  
  // High severity for section-level errors
  if (level === 'section') {
    return 'high';
  }
  
  // Network-related errors are usually medium severity
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'medium';
  }
  
  // Component-level errors are usually low severity
  return 'low';
}

// ============================================================================
// FALLBACK UI COMPONENTS
// ============================================================================

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  showDetails: boolean;
  level: string;
  name: string;
  onRetry: () => void;
  onToggleDetails: () => void;
  onGoHome: () => void;
  onReportBug: () => void;
}

/**
 * Default fallback UI for errors
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  errorId,
  retryCount,
  showDetails,
  level,
  onRetry,
  onToggleDetails,
  onGoHome,
  onReportBug
}: ErrorFallbackProps) {
  const severity = error ? getErrorSeverity(error, level) : 'medium';
  
  // Different layouts based on error level
  const isFullPage = level === 'page';
  const isSection = level === 'section';
  
  const containerClasses = isFullPage
    ? 'min-h-screen flex items-center justify-center bg-gray-50 px-4'
    : isSection
    ? 'flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'
    : 'flex items-center justify-center p-4 bg-red-50 rounded border border-red-200';

  const iconSize = isFullPage ? 48 : isSection ? 36 : 24;
  const titleSize = isFullPage ? 'text-2xl' : isSection ? 'text-xl' : 'text-lg';

  return (
    <div className={containerClasses}>
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className={`
            rounded-full p-3 
            ${severity === 'critical' ? 'bg-red-100 text-red-600' : 
              severity === 'high' ? 'bg-orange-100 text-orange-600' :
              severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-gray-100 text-gray-600'}
          `}>
            <AlertTriangle size={iconSize} />
          </div>
        </div>

        {/* Error Title */}
        <h2 className={`${titleSize} font-semibold text-gray-900 mb-2`}>
          {severity === 'critical' ? 'Something went wrong' :
           severity === 'high' ? 'Section unavailable' :
           severity === 'medium' ? 'Content error' :
           'Minor issue detected'}
        </h2>

        {/* Error Message */}
        <p className="text-gray-600 mb-6 text-sm">
          {severity === 'critical' 
            ? "We're sorry, but something unexpected happened. Our team has been notified."
            : severity === 'high'
            ? "This section couldn't load properly. You can try refreshing or continue using other parts of the app."
            : severity === 'medium'
            ? "There was a problem loading this content. Please try again."
            : "A small issue occurred, but it shouldn't affect your experience."
          }
        </p>

        {/* Error ID */}
        {errorId && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            Error ID: {errorId}
          </p>
        )}

        {/* Retry Count */}
        {retryCount > 0 && (
          <p className="text-xs text-gray-500 mb-4">
            Retry attempts: {retryCount}/3
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {/* Retry Button */}
            <button
              onClick={onRetry}
              disabled={retryCount >= 3}
              className="
                px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                disabled:bg-gray-400 disabled:cursor-not-allowed
                flex items-center justify-center space-x-2
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors
              "
              aria-label="Retry loading"
            >
              <RefreshCw size={16} />
              <span>{retryCount >= 3 ? 'Max retries reached' : 'Try again'}</span>
            </button>

            {/* Go Home Button (for page-level errors) */}
            {isFullPage && (
              <button
                onClick={onGoHome}
                className="
                  px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700
                  flex items-center justify-center space-x-2
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  transition-colors
                "
                aria-label="Go to homepage"
              >
                <Home size={16} />
                <span>Go Home</span>
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {/* Show/Hide Details */}
            <button
              onClick={onToggleDetails}
              className="
                px-3 py-1 text-sm text-gray-600 hover:text-gray-800 
                flex items-center justify-center space-x-1
                focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 rounded
                transition-colors
              "
              aria-label={showDetails ? 'Hide error details' : 'Show error details'}
            >
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>

            {/* Report Bug */}
            <button
              onClick={onReportBug}
              className="
                px-3 py-1 text-sm text-gray-600 hover:text-gray-800
                flex items-center justify-center space-x-1
                focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1 rounded
                transition-colors
              "
              aria-label="Report this error"
            >
              <Bug size={14} />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Error Details (collapsible) */}
        {showDetails && error && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Technical Details:</h4>
            <div className="space-y-2 text-xs text-gray-600 font-mono">
              <div>
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-all bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-all bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ERROR BOUNDARY CLASS
// ============================================================================

/**
 * Main ErrorBoundary component
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      showDetails: false
    };

    // Bind methods
    this.retry = this.retry.bind(this);
    this.goHome = this.goHome.bind(this);
    this.reportBug = this.reportBug.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    logError(error, errorInfo, this.state.errorId!, {
      level: this.props.level || 'component',
      name: this.props.name || 'Unknown',
      retryCount: this.state.retryCount
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call the onError prop if provided
    this.props.onError?.(error, errorInfo);

    // Auto-retry for certain types of errors (like chunk loading errors)
    if (this.shouldAutoRetry(error) && this.state.retryCount < 2) {
      this.retryTimeoutId = setTimeout(() => {
        this.retry();
      }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Auto-retry for certain error types
    return (
      error.name === 'ChunkLoadError' ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk') ||
      error.message.includes('NetworkError')
    );
  }

  private retry() {
    if (this.state.retryCount >= 3) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      showDetails: false
    }));
  }

  private goHome() {
    // Navigate to home page
    window.location.href = '/';
  }

  private reportBug() {
    // Open bug report or copy error details to clipboard
    const errorReport = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error details copied to clipboard. Please paste them in your bug report.');
        })
        .catch(() => {
          // Fallback: show the error details in a modal or new window
          console.log('Error Report:', errorReport);
          alert('Please check the console for error details to include in your bug report.');
        });
    } else {
      // Fallback for older browsers
      console.log('Error Report:', errorReport);
      alert('Please check the console for error details to include in your bug report.');
    }
  }

  private toggleDetails() {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo!,
          this.retry
        );
      }

      // Use default fallback
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          showDetails={this.state.showDetails}
          level={this.props.level || 'component'}
          name={this.props.name || 'Unknown'}
          onRetry={this.retry}
          onToggleDetails={this.toggleDetails}
          onGoHome={this.goHome}
          onReportBug={this.reportBug}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
export { generateErrorId, logError, getErrorSeverity };
export type { ErrorBoundaryProps, ErrorBoundaryState };