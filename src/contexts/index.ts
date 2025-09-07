/**
 * Contexts Index
 * 
 * Central export file for all context providers, hooks, and types.
 * This provides a clean API for importing context functionality throughout the application.
 * 
 * @example
 * ```tsx
 * import { 
 *   AppProviders,
 *   useNavigation,
 *   useFilter,
 *   useUIState,
 *   useUser,
 *   useMediaOperations 
 * } from '@/contexts';
 * ```
 */

// ============================================================================
// PROVIDERS
// ============================================================================

// Main app providers wrapper
export { 
  AppProviders,
  createProvidersConfig,
  useProvidersHealthCheck,
  ProviderErrorBoundary 
} from './AppProviders';

// Individual providers
export { NavigationProvider } from './NavigationContext';
export { FilterProvider } from './FilterContext';
export { UIStateProvider } from './UIStateContext';
export { UserProvider } from './UserContext';
export { MediaOperationsProvider } from './MediaOperationsContext';

// ============================================================================
// HOOKS - Primary hooks for each context
// ============================================================================

// Navigation hooks
export { 
  useNavigation,
  useIsMediaSelected,
  useSelectionCount,
  useNavigationBreadcrumbs 
} from './NavigationContext';

// Filter hooks
export { useFilter } from './FilterContext';

// UI State hooks
export { useUIState } from './UIStateContext';

// User hooks
export { useUser } from './UserContext';

// Media Operations hooks
export { 
  useMediaOperations,
  useIsMediaBeingOperated,
  useActiveOperationsCount,
  useOperationsByType 
} from './MediaOperationsContext';

// ============================================================================
// TYPES - Context interfaces and state types
// ============================================================================

// Navigation types
export type {
  NavigationView,
  NavigationState,
  NavigationContextValue,
  NavigationHistoryItem,
  NavigationProviderProps
} from './NavigationContext';

// Filter types
export type {
  FilterContextValue,
  FilterProviderProps
} from './FilterContext';

// UI State types
export type {
  UIState,
  UIStateContextValue,
  UIStateProviderProps,
  SidebarTab
} from './UIStateContext';

// User types
export type {
  UserContextType,
  UserProviderProps,
  SavedSearch,
  RecentActivity
} from './UserContext';

// Media Operations types
export type {
  MediaOperationsContextValue,
  MediaOperationsState,
  MediaOperationsProviderProps,
  ActiveOperation,
  OperationStatus
} from './MediaOperationsContext';

// App Providers types
export type {
  AppProvidersProps,
  ProviderWrapperProps
} from './AppProviders';

// ============================================================================
// CONVENIENCE EXPORTS - Grouped by functionality
// ============================================================================

/**
 * All navigation-related exports
 */
export const Navigation = {
  Provider: require('./NavigationContext').NavigationProvider,
  useNavigation: require('./NavigationContext').useNavigation,
  useIsMediaSelected: require('./NavigationContext').useIsMediaSelected,
  useSelectionCount: require('./NavigationContext').useSelectionCount,
  useNavigationBreadcrumbs: require('./NavigationContext').useNavigationBreadcrumbs
} as const;

/**
 * All filter-related exports
 */
export const Filter = {
  Provider: require('./FilterContext').FilterProvider,
  useFilter: require('./FilterContext').useFilter
} as const;

/**
 * All UI state-related exports
 */
export const UIState = {
  Provider: require('./UIStateContext').UIStateProvider,
  useUIState: require('./UIStateContext').useUIState
} as const;

/**
 * All user-related exports
 */
export const User = {
  Provider: require('./UserContext').UserProvider,
  useUser: require('./UserContext').useUser
} as const;

/**
 * All media operations-related exports
 */
export const MediaOperations = {
  Provider: require('./MediaOperationsContext').MediaOperationsProvider,
  useMediaOperations: require('./MediaOperationsContext').useMediaOperations,
  useIsMediaBeingOperated: require('./MediaOperationsContext').useIsMediaBeingOperated,
  useActiveOperationsCount: require('./MediaOperationsContext').useActiveOperationsCount,
  useOperationsByType: require('./MediaOperationsContext').useOperationsByType
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if an error is from a context provider
 */
export const isContextError = (error: Error): boolean => {
  return error.message.includes('must be used within a') && 
         error.message.includes('Provider');
};

/**
 * Get the provider name from a context error message
 */
export const getProviderNameFromError = (error: Error): string | null => {
  const match = error.message.match(/must be used within a (\w+Provider)/);
  return match ? match[1] : null;
};

/**
 * Create a context error with consistent formatting
 */
export const createContextError = (hookName: string, providerName: string): Error => {
  return new Error(
    `${hookName} must be used within a ${providerName}. ` +
    `Ensure that your component is wrapped with <${providerName}>.`
  );
};

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

/**
 * Development-only utilities for debugging context state
 */
export const DevUtils = process.env.NODE_ENV === 'development' ? {
  /**
   * Log all context states (development only)
   */
  logContextStates: () => {
    if (typeof window !== 'undefined') {
      console.group('🔍 Context States Debug');
      
      // This would require access to context values, which is tricky from here
      // In practice, this would be used within components that have context access
      console.log('Use this function within a component that has access to contexts');
      console.log('Example: DevUtils.logContextStates() from within a component');
      
      console.groupEnd();
    }
  },

  /**
   * Check if all contexts are properly initialized
   */
  checkContextHealth: () => {
    console.log('Use useProvidersHealthCheck hook within a component to check context health');
  },

  /**
   * Performance monitoring for context re-renders
   */
  monitorContextPerformance: (contextName: string) => {
    console.time(`Context Performance: ${contextName}`);
    return () => {
      console.timeEnd(`Context Performance: ${contextName}`);
    };
  }
} : {};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

/**
 * Default export provides the main AppProviders component
 */
import { AppProviders as AppProvidersComponent } from './AppProviders';
export default AppProvidersComponent;

// ============================================================================
// RE-EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

// Re-export context instances for advanced use cases
export { default as NavigationContext } from './NavigationContext';
export { FilterContext } from './FilterContext';
export { default as UIStateContext } from './UIStateContext';
export { default as UserContext } from './UserContext';
export { default as MediaOperationsContext } from './MediaOperationsContext';