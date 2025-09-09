'use client';

import React, { 
  createContext, 
  useContext, 
  useCallback, 
  useMemo, 
  useReducer,
  ReactNode 
} from 'react';
import { 
  MediaId, 
  FolderId, 
  CollectionId 
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available view modes for the application
 */
export type NavigationView = 'folder' | 'collection' | 'search';

/**
 * Navigation state interface
 */
export interface NavigationState {
  /** Current view mode */
  currentView: NavigationView;
  /** Currently active folder ID */
  currentFolder: FolderId | null;
  /** Currently active collection ID */
  currentCollection: CollectionId | null;
  /** Current search term */
  searchTerm: string;
  /** Array of selected media IDs */
  selectedMedia: MediaId[];
  /** Currently selected media ID for quick view */
  selectedMediaId: MediaId | null;
  /** Navigation history for back/forward functionality */
  history: NavigationHistoryItem[];
  /** Current position in navigation history */
  historyIndex: number;
  /** Loading state for navigation operations */
  isNavigating: boolean;
}

/**
 * Navigation history item
 */
export interface NavigationHistoryItem {
  view: NavigationView;
  folderId?: FolderId;
  collectionId?: CollectionId;
  searchTerm?: string;
  timestamp: number;
}

/**
 * Navigation actions
 */
export type NavigationAction =
  | { type: 'SET_VIEW'; payload: NavigationView }
  | { type: 'NAVIGATE_TO_FOLDER'; payload: FolderId | null }
  | { type: 'NAVIGATE_TO_COLLECTION'; payload: CollectionId | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SELECT_MEDIA'; payload: MediaId }
  | { type: 'SELECT_MULTIPLE_MEDIA'; payload: MediaId[] }
  | { type: 'TOGGLE_MEDIA_SELECTION'; payload: MediaId }
  | { type: 'SET_SELECTED_MEDIA_ID'; payload: MediaId | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_NAVIGATING'; payload: boolean }
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_FORWARD' }
  | { type: 'CLEAR_HISTORY' };

/**
 * Navigation context interface
 */
export interface NavigationContextValue {
  // State
  state: NavigationState;
  
  // View management
  currentView: NavigationView;
  currentFolder: FolderId | null;
  currentCollection: CollectionId | null;
  searchTerm: string;
  selectedMedia: MediaId[];
  selectedMediaId: MediaId | null;
  isNavigating: boolean;
  
  // History management
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Actions
  setCurrentView: (view: NavigationView) => void;
  navigateToFolder: (folderId: FolderId | null) => void;
  navigateToCollection: (collectionId: CollectionId | null) => void;
  setSearchTerm: (term: string) => void;
  selectMedia: (mediaId: MediaId) => void;
  selectMultipleMedia: (mediaIds: MediaId[]) => void;
  toggleMediaSelection: (mediaId: MediaId) => void;
  setSelectedMediaId: (mediaId: MediaId | null) => void;
  clearSelection: () => void;
  navigateBack: () => void;
  navigateForward: () => void;
  clearHistory: () => void;
}

/**
 * Navigation provider props
 */
export interface NavigationProviderProps {
  children: ReactNode;
  /** Initial navigation state */
  initialState?: Partial<NavigationState>;
}

// ============================================================================
// REDUCER
// ============================================================================

/**
 * Navigation state reducer
 */
function navigationReducer(
  state: NavigationState, 
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case 'SET_VIEW': {
      if (state.currentView === action.payload) {
        return state;
      }

      const historyItem: NavigationHistoryItem = {
        view: action.payload,
        folderId: state.currentFolder || undefined,
        collectionId: state.currentCollection || undefined,
        searchTerm: state.searchTerm || undefined,
        timestamp: Date.now()
      };

      return {
        ...state,
        currentView: action.payload,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          historyItem
        ],
        historyIndex: state.historyIndex + 1,
        selectedMedia: [] // Clear selection when changing views
      };
    }

    case 'NAVIGATE_TO_FOLDER': {
      if (state.currentFolder === action.payload) {
        return state;
      }

      const historyItem: NavigationHistoryItem = {
        view: 'folder',
        folderId: action.payload || undefined,
        timestamp: Date.now()
      };

      return {
        ...state,
        currentView: 'folder',
        currentFolder: action.payload,
        currentCollection: null,
        searchTerm: '',
        selectedMedia: [],
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          historyItem
        ],
        historyIndex: state.historyIndex + 1
      };
    }

    case 'NAVIGATE_TO_COLLECTION': {
      if (state.currentCollection === action.payload) {
        return state;
      }

      const historyItem: NavigationHistoryItem = {
        view: 'collection',
        collectionId: action.payload || undefined,
        timestamp: Date.now()
      };

      return {
        ...state,
        currentView: 'collection',
        currentCollection: action.payload,
        currentFolder: null,
        searchTerm: '',
        selectedMedia: [],
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          historyItem
        ],
        historyIndex: state.historyIndex + 1
      };
    }

    case 'SET_SEARCH_TERM': {
      const historyItem: NavigationHistoryItem = {
        view: 'search',
        searchTerm: action.payload,
        timestamp: Date.now()
      };

      return {
        ...state,
        currentView: 'search',
        searchTerm: action.payload,
        currentFolder: null,
        currentCollection: null,
        selectedMedia: [],
        history: action.payload 
          ? [
              ...state.history.slice(0, state.historyIndex + 1),
              historyItem
            ]
          : state.history,
        historyIndex: action.payload 
          ? state.historyIndex + 1 
          : state.historyIndex
      };
    }

    case 'SELECT_MEDIA': {
      if (state.selectedMedia.includes(action.payload)) {
        return state;
      }

      return {
        ...state,
        selectedMedia: [action.payload]
      };
    }

    case 'SELECT_MULTIPLE_MEDIA': {
      const uniqueIds = Array.from(new Set(action.payload));
      
      return {
        ...state,
        selectedMedia: uniqueIds
      };
    }

    case 'TOGGLE_MEDIA_SELECTION': {
      const isSelected = state.selectedMedia.includes(action.payload);
      
      return {
        ...state,
        selectedMedia: isSelected
          ? state.selectedMedia.filter(id => id !== action.payload)
          : [...state.selectedMedia, action.payload]
      };
    }

    case 'SET_SELECTED_MEDIA_ID': {
      return {
        ...state,
        selectedMediaId: action.payload
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        selectedMedia: [],
        selectedMediaId: null
      };
    }

    case 'SET_NAVIGATING': {
      return {
        ...state,
        isNavigating: action.payload
      };
    }

    case 'NAVIGATE_BACK': {
      if (state.historyIndex <= 0) {
        return state;
      }

      const previousItem = state.history[state.historyIndex - 1];
      
      return {
        ...state,
        historyIndex: state.historyIndex - 1,
        currentView: previousItem.view,
        currentFolder: (previousItem.folderId as FolderId) || null,
        currentCollection: (previousItem.collectionId as CollectionId) || null,
        searchTerm: previousItem.searchTerm || '',
        selectedMedia: []
      };
    }

    case 'NAVIGATE_FORWARD': {
      if (state.historyIndex >= state.history.length - 1) {
        return state;
      }

      const nextItem = state.history[state.historyIndex + 1];
      
      return {
        ...state,
        historyIndex: state.historyIndex + 1,
        currentView: nextItem.view,
        currentFolder: (nextItem.folderId as FolderId) || null,
        currentCollection: (nextItem.collectionId as CollectionId) || null,
        searchTerm: nextItem.searchTerm || '',
        selectedMedia: []
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [{
          view: state.currentView,
          folderId: state.currentFolder || undefined,
          collectionId: state.currentCollection || undefined,
          searchTerm: state.searchTerm || undefined,
          timestamp: Date.now()
        }],
        historyIndex: 0
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

/**
 * Default navigation state
 */
const defaultNavigationState: NavigationState = {
  currentView: 'folder',
  currentFolder: null,
  currentCollection: null,
  searchTerm: '',
  selectedMedia: [],
  selectedMediaId: null,
  history: [{
    view: 'folder',
    timestamp: Date.now()
  }],
  historyIndex: 0,
  isNavigating: false
};

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Navigation context
 */
const NavigationContext = createContext<NavigationContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Navigation context provider component
 * 
 * Provides navigation state and actions to child components.
 * Manages view switching, media selection, and navigation history.
 * 
 * @param children - Child components
 * @param initialState - Optional initial state override
 */
export function NavigationProvider({ 
  children, 
  initialState 
}: NavigationProviderProps) {
  // Initialize state with potential overrides
  const initialStateWithDefaults = useMemo(() => ({
    ...defaultNavigationState,
    ...initialState,
    // Ensure history is properly initialized
    history: initialState?.history || defaultNavigationState.history
  }), [initialState]);

  const [state, dispatch] = useReducer(navigationReducer, initialStateWithDefaults);

  // ============================================================================
  // ACTION CREATORS
  // ============================================================================

  /**
   * Set the current view mode
   * @param view - The view to switch to
   */
  const setCurrentView = useCallback((view: NavigationView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  /**
   * Navigate to a specific folder
   * @param folderId - The folder ID to navigate to (null for root)
   */
  const navigateToFolder = useCallback((folderId: FolderId | null) => {
    dispatch({ type: 'SET_NAVIGATING', payload: true });
    
    // Simulate async navigation
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO_FOLDER', payload: folderId });
      dispatch({ type: 'SET_NAVIGATING', payload: false });
    }, 100);
  }, []);

  /**
   * Navigate to a specific collection
   * @param collectionId - The collection ID to navigate to
   */
  const navigateToCollection = useCallback((collectionId: CollectionId | null) => {
    dispatch({ type: 'SET_NAVIGATING', payload: true });
    
    // Simulate async navigation
    setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO_COLLECTION', payload: collectionId });
      dispatch({ type: 'SET_NAVIGATING', payload: false });
    }, 100);
  }, []);

  /**
   * Set the search term and switch to search view
   * @param term - The search term
   */
  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  /**
   * Select a single media item (replaces current selection)
   * @param mediaId - The media ID to select
   */
  const selectMedia = useCallback((mediaId: MediaId) => {
    dispatch({ type: 'SELECT_MEDIA', payload: mediaId });
  }, []);

  /**
   * Select multiple media items (replaces current selection)
   * @param mediaIds - Array of media IDs to select
   */
  const selectMultipleMedia = useCallback((mediaIds: MediaId[]) => {
    if (mediaIds.length === 0) {
      dispatch({ type: 'CLEAR_SELECTION' });
    } else {
      dispatch({ type: 'SELECT_MULTIPLE_MEDIA', payload: mediaIds });
    }
  }, []);

  /**
   * Toggle selection state of a media item
   * @param mediaId - The media ID to toggle
   */
  const toggleMediaSelection = useCallback((mediaId: MediaId) => {
    dispatch({ type: 'TOGGLE_MEDIA_SELECTION', payload: mediaId });
  }, []);

  /**
   * Set selected media ID for quick view
   */
  const setSelectedMediaId = useCallback((mediaId: MediaId | null) => {
    dispatch({ type: 'SET_SELECTED_MEDIA_ID', payload: mediaId });
  }, []);

  /**
   * Clear all selected media
   */
  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  /**
   * Navigate back in history
   */
  const navigateBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE_BACK' });
  }, []);

  /**
   * Navigate forward in history
   */
  const navigateForward = useCallback(() => {
    dispatch({ type: 'NAVIGATE_FORWARD' });
  }, []);

  /**
   * Clear navigation history
   */
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Whether back navigation is available
   */
  const canGoBack = useMemo(() => state.historyIndex > 0, [state.historyIndex]);

  /**
   * Whether forward navigation is available
   */
  const canGoForward = useMemo(() => {
    return state.historyIndex < state.history.length - 1;
  }, [state.historyIndex, state.history.length]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<NavigationContextValue>(() => ({
    // State
    state,
    
    // Direct state access for convenience
    currentView: state.currentView,
    currentFolder: state.currentFolder,
    currentCollection: state.currentCollection,
    searchTerm: state.searchTerm,
    selectedMedia: state.selectedMedia,
    selectedMediaId: state.selectedMediaId,
    isNavigating: state.isNavigating,
    
    // History state
    canGoBack,
    canGoForward,
    
    // Actions
    setCurrentView,
    navigateToFolder,
    navigateToCollection,
    setSearchTerm,
    selectMedia,
    selectMultipleMedia,
    toggleMediaSelection,
    setSelectedMediaId,
    clearSelection,
    navigateBack,
    navigateForward,
    clearHistory
  }), [
    state,
    canGoBack,
    canGoForward,
    setCurrentView,
    navigateToFolder,
    navigateToCollection,
    setSearchTerm,
    selectMedia,
    selectMultipleMedia,
    toggleMediaSelection,
    setSelectedMediaId,
    clearSelection,
    navigateBack,
    navigateForward,
    clearHistory
  ]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing navigation context
 * 
 * @returns Navigation context value
 * @throws Error if used outside of NavigationProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     currentView, 
 *     navigateToFolder, 
 *     selectedMedia,
 *     selectMedia 
 *   } = useNavigation();
 *   
 *   return (
 *     <div>
 *       <p>Current view: {currentView}</p>
 *       <p>Selected: {selectedMedia.length} items</p>
 *       <button onClick={() => navigateToFolder('folder-123' as FolderId)}>
 *         Go to Folder
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error(
      'useNavigation must be used within a NavigationProvider. ' +
      'Ensure that your component is wrapped with <NavigationProvider>.'
    );
  }
  
  return context;
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for checking if a specific media item is selected
 * 
 * @param mediaId - The media ID to check
 * @returns Whether the media item is selected
 */
export function useIsMediaSelected(mediaId: MediaId): boolean {
  const { selectedMedia } = useNavigation();
  return useMemo(() => selectedMedia.includes(mediaId), [selectedMedia, mediaId]);
}

/**
 * Hook for getting selection count
 * 
 * @returns Number of selected media items
 */
export function useSelectionCount(): number {
  const { selectedMedia } = useNavigation();
  return selectedMedia.length;
}

/**
 * Hook for getting current navigation breadcrumbs
 * 
 * @returns Array of breadcrumb items representing current navigation path
 */
export function useNavigationBreadcrumbs() {
  const { currentView, currentFolder, currentCollection, searchTerm } = useNavigation();
  
  return useMemo(() => {
    const breadcrumbs = [];
    
    switch (currentView) {
      case 'folder':
        breadcrumbs.push({ label: 'Folders', view: 'folder' as NavigationView });
        if (currentFolder) {
          breadcrumbs.push({ 
            label: `Folder ${currentFolder}`, 
            view: 'folder' as NavigationView,
            folderId: currentFolder 
          });
        }
        break;
        
      case 'collection':
        breadcrumbs.push({ label: 'Collections', view: 'collection' as NavigationView });
        if (currentCollection) {
          breadcrumbs.push({ 
            label: `Collection ${currentCollection}`, 
            view: 'collection' as NavigationView,
            collectionId: currentCollection 
          });
        }
        break;
        
      case 'search':
        breadcrumbs.push({ label: 'Search', view: 'search' as NavigationView });
        if (searchTerm) {
          breadcrumbs.push({ 
            label: `"${searchTerm}"`, 
            view: 'search' as NavigationView,
            searchTerm 
          });
        }
        break;
    }
    
    return breadcrumbs;
  }, [currentView, currentFolder, currentCollection, searchTerm]);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NavigationContext;

// Export types for external use
export type { NavigationContextValue, NavigationState, NavigationView };