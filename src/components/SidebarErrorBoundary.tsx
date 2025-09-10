/**
 * SidebarErrorBoundary Component
 * 
 * Specialized error boundary for sidebar components with compact fallback UI
 * that maintains the sidebar layout and functionality.
 */

import React, { ReactNode, ErrorInfo } from 'react';
import { 
  Sidebar, 
  AlertTriangle, 
  RefreshCw, 
  ChevronLeft,
  Folder,
  Library,
  Tags,
} from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface SidebarErrorBoundaryProps {
  children: ReactNode;
  sidebarSection?: 'navigation' | 'folders' | 'collections' | 'tags' | 'filters';
  isCollapsible?: boolean;
  onCollapse?: () => void;
  onRetry?: () => void;
  showMinimized?: boolean;
}

interface SidebarErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
  sidebarSection?: string;
  isCollapsible?: boolean;
  onCollapse?: () => void;
  showMinimized?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get appropriate icon for sidebar section
 */
function getSidebarSectionIcon(section?: string, size: number = 20) {
  switch (section) {
    case 'folders':
      return <Folder size={size} />;
    case 'collections':
      return <Library size={size} />;
    case 'tags':
      return <Tags size={size} />;
    case 'navigation':
      return <Sidebar size={size} />;
    default:
      return <AlertTriangle size={size} />;
  }
}

/**
 * Get user-friendly section name
 */
function getSidebarSectionName(section?: string): string {
  switch (section) {
    case 'folders':
      return 'Folders';
    case 'collections':
      return 'Collections';
    case 'tags':
      return 'Tags';
    case 'navigation':
      return 'Navigation';
    case 'filters':
      return 'Filters';
    default:
      return 'Sidebar';
  }
}

// ============================================================================
// SIDEBAR ERROR FALLBACK COMPONENT
// ============================================================================

function SidebarErrorFallback({
  retry,
  sidebarSection,
  isCollapsible,
  onCollapse,
  showMinimized = false
}: SidebarErrorFallbackProps) {
  const sectionName = getSidebarSectionName(sidebarSection);

  // Minimized view for when sidebar is collapsed or error is minor
  if (showMinimized) {
    return (
      <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs text-red-700 font-medium">Error</span>
          </div>
          <button
            onClick={retry}
            className="
              p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded
              focus:outline-none focus:ring-1 focus:ring-red-500
              transition-colors
            "
            aria-label={`Retry loading ${sectionName}`}
            title={`Retry loading ${sectionName}`}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
    );
  }

  // Full error view for expanded sidebar
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-center">
        {/* Section Icon */}
        <div className="flex justify-center mb-3">
          <div className="rounded-full p-2 bg-red-100 text-red-600">
            {getSidebarSectionIcon(sidebarSection, 20)}
          </div>
        </div>

        {/* Error Title */}
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          {sectionName} unavailable
        </h4>

        {/* Error Message */}
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          There was a problem loading the {sectionName.toLowerCase()} section. 
          You can continue using other parts of the app.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Retry Button */}
          <button
            onClick={retry}
            className="
              w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-md 
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:ring-offset-2 transition-colors
              flex items-center justify-center space-x-1
            "
            aria-label={`Retry loading ${sectionName}`}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>

          {/* Collapse Button (if collapsible) */}
          {isCollapsible && onCollapse && (
            <button
              onClick={onCollapse}
              className="
                w-full px-3 py-1 text-xs text-gray-600 hover:text-gray-800 
                hover:bg-gray-100 rounded-md focus:outline-none focus:ring-1 
                focus:ring-gray-400 transition-colors
                flex items-center justify-center space-x-1
              "
              aria-label="Minimize sidebar"
            >
              <ChevronLeft size={12} />
              <span>Minimize</span>
            </button>
          )}
        </div>

        {/* Quick tips for common sidebar errors */}
        <div className="mt-3 p-2 bg-blue-50 rounded text-left">
          <h5 className="text-xs font-medium text-blue-800 mb-1">Quick fixes:</h5>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Check your internet connection</li>
            {sidebarSection === 'folders' && <li>• Verify folder permissions</li>}
            {sidebarSection === 'collections' && <li>• Collections may be temporarily unavailable</li>}
            {sidebarSection === 'tags' && <li>• Tag data may be syncing</li>}
            <li>• Try refreshing the page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SidebarErrorBoundary Component
 * 
 * Specialized error boundary for sidebar components with compact error UI
 */
const SidebarErrorBoundary: React.FC<SidebarErrorBoundaryProps> = ({
  children,
  sidebarSection = 'navigation',
  isCollapsible = false,
  onCollapse,
  onRetry,
  showMinimized = false
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log sidebar-specific error details
    console.error('[SidebarErrorBoundary] Sidebar error occurred:', {
      sidebarSection,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Call optional onRetry callback
    onRetry?.();
  };

  const customFallback = (error: Error, errorInfo: ErrorInfo, retry: () => void) => (
    <SidebarErrorFallback
      error={error}
      errorInfo={errorInfo}
      retry={retry}
      sidebarSection={sidebarSection}
      isCollapsible={isCollapsible}
      onCollapse={onCollapse}
      showMinimized={showMinimized}
    />
  );

  return (
    <ErrorBoundary
      fallback={customFallback}
      onError={handleError}
      level="section"
      name={`SidebarErrorBoundary-${sidebarSection}`}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SidebarErrorBoundary;
export type { SidebarErrorBoundaryProps };