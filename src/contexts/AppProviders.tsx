'use client';

import React, { 
  ReactNode, 
  Component, 
  ErrorInfo 
} from 'react';
import { NavigationProvider } from './NavigationContext';
import { FilterProvider } from './FilterContext';
import { UIStateProvider } from './UIStateContext';
import { UserProvider } from './UserContext';
import { MediaOperationsProvider } from './MediaOperationsContext';

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name: string;
}

/**
 * Error boundary component for wrapping providers
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ProviderErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    console.error(`Error in ${this.props.name} provider:`, error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>Something went wrong in {this.props.name}</h2>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre className="error-message">
                {this.state.error?.message}
              </pre>
              <pre className="error-stack">
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo && (
                <pre className="error-component-stack">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="error-reload-button"
            >
              Reload Application
            </button>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            .error-boundary {
              min-height: 200px;
              padding: 20px;
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              margin: 10px 0;
            }
            
            .error-boundary-content {
              max-width: 600px;
            }
            
            .error-boundary h2 {
              color: #dc2626;
              margin: 0 0 16px 0;
              font-size: 18px;
              font-weight: 600;
            }
            
            .error-details {
              margin: 16px 0;
            }
            
            .error-details summary {
              cursor: pointer;
              color: #374151;
              font-weight: 500;
              margin-bottom: 8px;
            }
            
            .error-details pre {
              background-color: #f9fafb;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              padding: 12px;
              font-size: 12px;
              line-height: 1.4;
              overflow-x: auto;
              margin: 8px 0;
            }
            
            .error-message {
              color: #dc2626;
            }
            
            .error-stack,
            .error-component-stack {
              color: #6b7280;
            }
            
            .error-reload-button {
              background-color: #dc2626;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              margin-top: 16px;
            }
            
            .error-reload-button:hover {
              background-color: #b91c1c;
            }
          ` }} />
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// PROVIDER WRAPPER COMPONENT
// ============================================================================

interface ProviderWrapperProps {
  name: string;
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Wrapper component that provides error boundary for individual providers
 */
const ProviderWrapper: React.FC<ProviderWrapperProps> = ({
  name,
  children,
  fallback,
  onError
}) => (
  <ProviderErrorBoundary 
    name={name} 
    fallback={fallback}
    onError={onError}
  >
    {children}
  </ProviderErrorBoundary>
);

// ============================================================================
// APP PROVIDERS COMPONENT
// ============================================================================

interface AppProvidersProps {
  children: ReactNode;
  /** Custom error fallback for provider errors */
  errorFallback?: (providerName: string, error: Error, errorInfo: ErrorInfo) => ReactNode;
  /** Global error handler for provider errors */
  onProviderError?: (providerName: string, error: Error, errorInfo: ErrorInfo) => void;
  /** Initial states for providers */
  initialStates?: {
    navigation?: Parameters<typeof NavigationProvider>[0]['initialState'];
    uiState?: Parameters<typeof UIStateProvider>[0]['initialState'];
    mediaOperations?: Parameters<typeof MediaOperationsProvider>[0]['initialState'];
  };
  /** Configuration options for providers */
  providerConfig?: {
    mediaOperations?: {
      autoClearDelay?: number;
    };
  };
}

/**
 * Root application providers component that combines all context providers
 * 
 * This component wraps the entire application with all necessary context providers
 * in the correct dependency order. Each provider is wrapped with an error boundary
 * for maximum resilience.
 * 
 * Provider Order (from outer to inner):
 * 1. UserProvider - User authentication and profile data
 * 2. NavigationProvider - Navigation state and history
 * 3. UIStateProvider - UI state management (depends on navigation)
 * 4. FilterProvider - Filter state and operations
 * 5. MediaOperationsProvider - Media operations (depends on user context)
 * 
 * @param children - The application components to wrap
 * @param errorFallback - Custom error fallback component for provider errors
 * @param onProviderError - Global error handler for provider errors
 * @param initialStates - Initial states for providers that support them
 * @param providerConfig - Configuration options for providers
 */
export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  errorFallback,
  onProviderError,
  initialStates,
  providerConfig
}) => {
  // Create error handlers for each provider
  const createErrorHandler = (providerName: string) => ({
    fallback: errorFallback 
      ? (error: Error, errorInfo: ErrorInfo) => errorFallback(providerName, error, errorInfo)
      : undefined,
    onError: onProviderError 
      ? (error: Error, errorInfo: ErrorInfo) => onProviderError(providerName, error, errorInfo)
      : undefined
  });

  const userErrorHandler = createErrorHandler('UserProvider');
  const navigationErrorHandler = createErrorHandler('NavigationProvider');
  const uiStateErrorHandler = createErrorHandler('UIStateProvider');
  const filterErrorHandler = createErrorHandler('FilterProvider');
  const mediaOperationsErrorHandler = createErrorHandler('MediaOperationsProvider');

  return (
    <ProviderWrapper name="UserProvider" {...userErrorHandler}>
      <UserProvider>
        <ProviderWrapper name="NavigationProvider" {...navigationErrorHandler}>
          <NavigationProvider initialState={initialStates?.navigation}>
            <ProviderWrapper name="UIStateProvider" {...uiStateErrorHandler}>
              <UIStateProvider initialState={initialStates?.uiState}>
                <ProviderWrapper name="FilterProvider" {...filterErrorHandler}>
                  <FilterProvider>
                    <ProviderWrapper name="MediaOperationsProvider" {...mediaOperationsErrorHandler}>
                      <MediaOperationsProvider 
                        initialState={initialStates?.mediaOperations}
                        autoClearDelay={providerConfig?.mediaOperations?.autoClearDelay}
                      >
                        {children}
                      </MediaOperationsProvider>
                    </ProviderWrapper>
                  </FilterProvider>
                </ProviderWrapper>
              </UIStateProvider>
            </ProviderWrapper>
          </NavigationProvider>
        </ProviderWrapper>
      </UserProvider>
    </ProviderWrapper>
  );
};

// ============================================================================
// PROVIDER INITIALIZATION UTILITIES
// ============================================================================

/**
 * Initialize providers with default configuration
 * 
 * Provides sensible defaults for provider configuration and can be customized
 * based on environment or application requirements.
 */
export const createProvidersConfig = (overrides?: {
  mediaOperations?: {
    autoClearDelay?: number;
  };
  development?: {
    enableErrorLogging?: boolean;
  };
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    providerConfig: {
      mediaOperations: {
        autoClearDelay: overrides?.mediaOperations?.autoClearDelay ?? 10000, // 10 seconds
      }
    },
    onProviderError: (providerName: string, error: Error, errorInfo: ErrorInfo) => {
      // Log errors in development
      if (isDevelopment && overrides?.development?.enableErrorLogging !== false) {
        console.group(`🚨 Provider Error: ${providerName}`);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.groupEnd();
      }
      
      // Report errors to error tracking service in production
      if (!isDevelopment) {
        // Example: reportError(error, { context: providerName, componentStack: errorInfo.componentStack });
      }
    },
    errorFallback: (providerName: string, error: Error, errorInfo: ErrorInfo) => (
      <div className="provider-error-fallback">
        <h3>Provider Error: {providerName}</h3>
        <p>There was an error initializing the {providerName}.</p>
        {isDevelopment && (
          <details>
            <summary>Debug Information</summary>
            <pre>{error.message}</pre>
            <pre>{errorInfo.componentStack}</pre>
          </details>
        )}
        <button onClick={() => window.location.reload()}>
          Reload Application
        </button>
      </div>
    )
  };
};

// ============================================================================
// PROVIDER HEALTH CHECK UTILITIES
// ============================================================================

/**
 * Check if all providers are properly initialized
 * 
 * Useful for debugging and ensuring all contexts are available.
 * Should only be used in development or for debugging purposes.
 */
export const useProvidersHealthCheck = (): {
  navigation: boolean;
  filter: boolean;
  uiState: boolean;
  user: boolean;
  mediaOperations: boolean;
  allHealthy: boolean;
} => {
  let navigation = false;
  let filter = false;
  let uiState = false;
  let user = false;
  let mediaOperations = false;

  // Check each provider by trying to access their context
  try {
    const { useNavigation } = require('./NavigationContext');
    useNavigation();
    navigation = true;
  } catch (e) {
    // Provider not available or not properly initialized
  }

  try {
    const { useFilter } = require('./FilterContext');
    useFilter();
    filter = true;
  } catch (e) {
    // Provider not available or not properly initialized
  }

  try {
    const { useUIState } = require('./UIStateContext');
    useUIState();
    uiState = true;
  } catch (e) {
    // Provider not available or not properly initialized
  }

  try {
    const { useUser } = require('./UserContext');
    useUser();
    user = true;
  } catch (e) {
    // Provider not available or not properly initialized
  }

  try {
    const { useMediaOperations } = require('./MediaOperationsContext');
    useMediaOperations();
    mediaOperations = true;
  } catch (e) {
    // Provider not available or not properly initialized
  }

  const allHealthy = navigation && filter && uiState && user && mediaOperations;

  return {
    navigation,
    filter,
    uiState,
    user,
    mediaOperations,
    allHealthy
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AppProviders;

// Export error boundary for standalone use
export { ProviderErrorBoundary };

// Export types
export type { 
  AppProvidersProps,
  ProviderWrapperProps 
};