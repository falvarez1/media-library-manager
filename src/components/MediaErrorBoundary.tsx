/**
 * MediaErrorBoundary Component
 * 
 * Specialized error boundary for media-related components with media-specific
 * fallback UI and recovery mechanisms.
 */

import React, { ReactNode, ErrorInfo } from 'react';
import { Image, Play, FileText, Volume2, AlertTriangle, RefreshCw, SkipForward } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import type { MediaId, MediaType } from '../types';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface MediaErrorBoundaryProps {
  children: ReactNode;
  mediaId?: MediaId;
  mediaType?: MediaType;
  onSkip?: () => void;
  onRetry?: () => void;
  fallbackTitle?: string;
  showSkipOption?: boolean;
}

interface MediaErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
  mediaId?: MediaId;
  mediaType?: MediaType;
  onSkip?: () => void;
  fallbackTitle?: string;
  showSkipOption?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get appropriate icon for media type
 */
function getMediaTypeIcon(mediaType?: MediaType, size: number = 48) {
  switch (mediaType) {
    case 'image':
      return <Image size={size} />;
    case 'video':
      return <Play size={size} />;
    case 'audio':
      return <Volume2 size={size} />;
    case 'document':
      return <FileText size={size} />;
    default:
      return <AlertTriangle size={size} />;
  }
}

/**
 * Get user-friendly media type name
 */
function getMediaTypeName(mediaType?: MediaType): string {
  switch (mediaType) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
      return 'audio';
    case 'document':
      return 'document';
    default:
      return 'media';
  }
}

/**
 * Determine if error is likely media-specific
 */
function isMediaSpecificError(error: Error): boolean {
  const mediaErrorPatterns = [
    'Failed to load resource',
    'Network error',
    'CORS',
    'Unauthorized',
    'Forbidden',
    'Not Found',
    '404',
    '403',
    '401',
    '500',
    'decode',
    'format',
    'codec',
    'unsupported'
  ];

  return mediaErrorPatterns.some(pattern =>
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

// ============================================================================
// MEDIA ERROR FALLBACK COMPONENT
// ============================================================================

function MediaErrorFallback({
  error,
  errorInfo,
  retry,
  mediaId,
  mediaType,
  onSkip,
  fallbackTitle,
  showSkipOption = true
}: MediaErrorFallbackProps) {
  const isMediaError = isMediaSpecificError(error);
  const mediaName = getMediaTypeName(mediaType);

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[200px]">
      <div className="text-center max-w-sm">
        {/* Media Type Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full p-3 bg-red-100 text-red-600">
            {getMediaTypeIcon(mediaType, 36)}
          </div>
        </div>

        {/* Error Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {fallbackTitle || `Unable to load ${mediaName}`}
        </h3>

        {/* Error Message */}
        <p className="text-gray-600 mb-6 text-sm">
          {isMediaError 
            ? `This ${mediaName} couldn't be loaded. It might be corrupted, moved, or you may not have permission to view it.`
            : `There was an unexpected error while loading this ${mediaName}. Please try again.`
          }
        </p>

        {/* Media ID (if available) */}
        {mediaId && (
          <p className="text-xs text-gray-400 mb-4 font-mono">
            Media ID: {mediaId}
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {/* Retry Button */}
            <button
              onClick={retry}
              className="
                px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                flex items-center justify-center space-x-2
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors
              "
              aria-label={`Retry loading ${mediaName}`}
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>

            {/* Skip Button (for media viewers/galleries) */}
            {showSkipOption && onSkip && (
              <button
                onClick={onSkip}
                className="
                  px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700
                  flex items-center justify-center space-x-2
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  transition-colors
                "
                aria-label={`Skip this ${mediaName}`}
              >
                <SkipForward size={16} />
                <span>Skip</span>
              </button>
            )}
          </div>

          {/* Helpful tips based on error type */}
          {isMediaError && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Troubleshooting tips:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Ensure you have permission to view this {mediaName}</li>
                <li>• The {mediaName} file might have been moved or deleted</li>
                {mediaType === 'video' && <li>• Your browser might not support this video format</li>}
                {mediaType === 'audio' && <li>• Your browser might not support this audio format</li>}
                {mediaType === 'document' && <li>• The document might be corrupted or in an unsupported format</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MediaErrorBoundary Component
 * 
 * Specialized error boundary for media components with media-specific error handling
 */
const MediaErrorBoundary: React.FC<MediaErrorBoundaryProps> = ({
  children,
  mediaId,
  mediaType,
  onSkip,
  onRetry,
  fallbackTitle,
  showSkipOption = true
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log media-specific error details
    console.error('[MediaErrorBoundary] Media error occurred:', {
      mediaId,
      mediaType,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Call optional onRetry callback
    onRetry?.();
  };

  const customFallback = (error: Error, errorInfo: ErrorInfo, retry: () => void) => (
    <MediaErrorFallback
      error={error}
      errorInfo={errorInfo}
      retry={retry}
      mediaId={mediaId}
      mediaType={mediaType}
      onSkip={onSkip}
      fallbackTitle={fallbackTitle}
      showSkipOption={showSkipOption}
    />
  );

  return (
    <ErrorBoundary
      fallback={customFallback}
      onError={handleError}
      level="component"
      name={`MediaErrorBoundary-${mediaType || 'unknown'}`}
    >
      {children}
    </ErrorBoundary>
  );
};

export default MediaErrorBoundary;
export type { MediaErrorBoundaryProps };