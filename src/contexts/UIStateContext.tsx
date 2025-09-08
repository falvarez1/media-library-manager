'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  KeyboardEvent
} from 'react';
import { 
  MediaId, 
  Theme, 
  ViewMode, 
  GridSize 
} from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Available sidebar tabs for navigation
 */
export type SidebarTab = 'files' | 'collections' | 'tags';

/**
 * Global UI state interface containing all UI-related state
 */
export interface UIState {
  // Sidebar state
  showSidebar: boolean;
  sidebarTab: SidebarTab;
  
  // Detail panel state
  showDetails: boolean;
  
  // Quick view modal state
  quickViewItem: MediaId | null;
  
  // Image editor modal state
  showImageEditor: boolean;
  editingMedia: MediaId | null;
  
  // UI preferences
  theme: Theme;
  viewMode: ViewMode;
  gridSize: GridSize;
}

/**
 * UI action types for state management
 */
export type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_TAB'; payload: SidebarTab }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'SHOW_QUICK_VIEW'; payload: MediaId }
  | { type: 'HIDE_QUICK_VIEW' }
  | { type: 'OPEN_IMAGE_EDITOR'; payload: MediaId }
  | { type: 'CLOSE_IMAGE_EDITOR' }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_GRID_SIZE'; payload: GridSize }
  | { type: 'SET_SHOW_SIDEBAR'; payload: boolean }
  | { type: 'SET_SHOW_DETAILS'; payload: boolean };

/**
 * Context value interface including state and actions
 */
export interface UIStateContextValue extends UIState {
  // UI state actions
  toggleSidebar: () => void;
  setSidebarTab: (tab: SidebarTab) => void;
  toggleDetails: () => void;
  showQuickView: (mediaId: MediaId) => void;
  hideQuickView: () => void;
  openImageEditor: (mediaId: MediaId) => void;
  closeImageEditor: () => void;
  closeAllModals: () => void;
  
  // UI preference actions
  setTheme: (theme: Theme) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setGridSize: (gridSize: GridSize) => void;
  setSidebarVisible: (visible: boolean) => void;
  setDetailsVisible: (visible: boolean) => void;
}

/**
 * Provider props interface
 */
export interface UIStateProviderProps {
  children: ReactNode;
  initialState?: Partial<UIState>;
}

// ============================================================================
// INITIAL STATE AND CONSTANTS
// ============================================================================

/**
 * Default UI state values
 */
const DEFAULT_UI_STATE: UIState = {
  showSidebar: true,
  sidebarTab: 'files',
  showDetails: false,
  quickViewItem: null,
  showImageEditor: false,
  editingMedia: null,
  theme: 'system',
  viewMode: 'grid',
  gridSize: 'medium'
};

/**
 * Storage keys for persisting UI preferences
 */
const STORAGE_KEYS = {
  THEME: 'mlm-ui-theme',
  VIEW_MODE: 'mlm-ui-view-mode',
  GRID_SIZE: 'mlm-ui-grid-size',
  SHOW_SIDEBAR: 'mlm-ui-show-sidebar',
  SIDEBAR_TAB: 'mlm-ui-sidebar-tab',
  SHOW_DETAILS: 'mlm-ui-show-details'
} as const;

/**
 * Keyboard shortcuts configuration
 */
const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: 'KeyS',
  TOGGLE_DETAILS: 'KeyD',
  CLOSE_MODALS: 'Escape',
  SWITCH_TO_FILES: 'Digit1',
  SWITCH_TO_COLLECTIONS: 'Digit2',
  SWITCH_TO_TAGS: 'Digit3'
} as const;

// ============================================================================
// REDUCER FUNCTION
// ============================================================================

/**
 * UI state reducer for managing all UI-related state updates
 */
function uiStateReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        showSidebar: !state.showSidebar
      };

    case 'SET_SIDEBAR_TAB':
      return {
        ...state,
        sidebarTab: action.payload,
        // Ensure sidebar is visible when switching tabs
        showSidebar: true
      };

    case 'TOGGLE_DETAILS':
      return {
        ...state,
        showDetails: !state.showDetails
      };

    case 'SHOW_QUICK_VIEW':
      return {
        ...state,
        quickViewItem: action.payload,
        // Close other modals when opening quick view
        showImageEditor: false,
        editingMedia: null
      };

    case 'HIDE_QUICK_VIEW':
      return {
        ...state,
        quickViewItem: null
      };

    case 'OPEN_IMAGE_EDITOR':
      return {
        ...state,
        showImageEditor: true,
        editingMedia: action.payload,
        // Close other modals when opening image editor
        quickViewItem: null
      };

    case 'CLOSE_IMAGE_EDITOR':
      return {
        ...state,
        showImageEditor: false,
        editingMedia: null
      };

    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        quickViewItem: null,
        showImageEditor: false,
        editingMedia: null
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload
      };

    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: action.payload
      };

    case 'SET_SHOW_SIDEBAR':
      return {
        ...state,
        showSidebar: action.payload
      };

    case 'SET_SHOW_DETAILS':
      return {
        ...state,
        showDetails: action.payload
      };

    default:
      return state;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Load UI preferences from localStorage
 */
function loadUIPreferences(): Partial<UIState> {
  try {
    return {
      theme: getStorageItem<Theme>(STORAGE_KEYS.THEME, 'system'),
      viewMode: getStorageItem<ViewMode>(STORAGE_KEYS.VIEW_MODE, 'grid'),
      gridSize: getStorageItem<GridSize>(STORAGE_KEYS.GRID_SIZE, 'medium'),
      showSidebar: getStorageItem<boolean>(STORAGE_KEYS.SHOW_SIDEBAR, true),
      sidebarTab: getStorageItem<SidebarTab>(STORAGE_KEYS.SIDEBAR_TAB, 'files'),
      showDetails: getStorageItem<boolean>(STORAGE_KEYS.SHOW_DETAILS, false)
    };
  } catch (error) {
    console.warn('Failed to load UI preferences from localStorage:', error);
    return {};
  }
}

/**
 * Save UI preferences to localStorage
 */
function saveUIPreferences(state: UIState): void {
  try {
    setStorageItem(STORAGE_KEYS.THEME, state.theme);
    setStorageItem(STORAGE_KEYS.VIEW_MODE, state.viewMode);
    setStorageItem(STORAGE_KEYS.GRID_SIZE, state.gridSize);
    setStorageItem(STORAGE_KEYS.SHOW_SIDEBAR, state.showSidebar);
    setStorageItem(STORAGE_KEYS.SIDEBAR_TAB, state.sidebarTab);
    setStorageItem(STORAGE_KEYS.SHOW_DETAILS, state.showDetails);
  } catch (error) {
    console.warn('Failed to save UI preferences to localStorage:', error);
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * UI state context for global UI state management
 */
const UIStateContext = createContext<UIStateContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * UIStateProvider component that provides global UI state management
 * 
 * Features:
 * - Persistent UI preferences via localStorage
 * - Keyboard shortcuts for common UI actions
 * - Optimized re-renders with memoized actions
 * - Type-safe state management
 * 
 * @param props - Provider props including children and optional initial state
 */
export function UIStateProvider({ children, initialState = {} }: UIStateProviderProps) {
  // Initialize state with defaults, localStorage preferences, and any provided initial state
  const [state, dispatch] = useReducer(
    uiStateReducer,
    {
      ...DEFAULT_UI_STATE,
      ...loadUIPreferences(),
      ...initialState
    }
  );

  // Memoized action creators to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    /**
     * Toggle the visibility of the sidebar
     */
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),

    /**
     * Set the active sidebar tab
     * @param tab - The sidebar tab to activate
     */
    setSidebarTab: (tab: SidebarTab) => dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab }),

    /**
     * Toggle the visibility of the details panel
     */
    toggleDetails: () => dispatch({ type: 'TOGGLE_DETAILS' }),

    /**
     * Show the quick view modal for a specific media item
     * @param mediaId - The ID of the media item to show in quick view
     */
    showQuickView: (mediaId: MediaId) => dispatch({ type: 'SHOW_QUICK_VIEW', payload: mediaId }),

    /**
     * Hide the quick view modal
     */
    hideQuickView: () => dispatch({ type: 'HIDE_QUICK_VIEW' }),

    /**
     * Open the image editor for a specific media item
     * @param mediaId - The ID of the media item to edit
     */
    openImageEditor: (mediaId: MediaId) => dispatch({ type: 'OPEN_IMAGE_EDITOR', payload: mediaId }),

    /**
     * Close the image editor
     */
    closeImageEditor: () => dispatch({ type: 'CLOSE_IMAGE_EDITOR' }),

    /**
     * Close all open modals and overlays
     */
    closeAllModals: () => dispatch({ type: 'CLOSE_ALL_MODALS' }),

    /**
     * Set the application theme
     * @param theme - The theme to apply
     */
    setTheme: (theme: Theme) => dispatch({ type: 'SET_THEME', payload: theme }),

    /**
     * Set the media view mode
     * @param viewMode - The view mode to apply
     */
    setViewMode: (viewMode: ViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: viewMode }),

    /**
     * Set the grid size for grid view mode
     * @param gridSize - The grid size to apply
     */
    setGridSize: (gridSize: GridSize) => dispatch({ type: 'SET_GRID_SIZE', payload: gridSize }),

    /**
     * Set sidebar visibility
     * @param visible - Whether the sidebar should be visible
     */
    setSidebarVisible: (visible: boolean) => dispatch({ type: 'SET_SHOW_SIDEBAR', payload: visible }),

    /**
     * Set details panel visibility
     * @param visible - Whether the details panel should be visible
     */
    setDetailsVisible: (visible: boolean) => dispatch({ type: 'SET_SHOW_DETAILS', payload: visible })
  }), []);

  // Keyboard shortcut handler
  const handleKeyboardShortcut = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts if no input elements are focused and no modifiers except Ctrl/Cmd
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;

    // Allow Escape to work everywhere
    if (event.code === KEYBOARD_SHORTCUTS.CLOSE_MODALS) {
      event.preventDefault();
      actions.closeAllModals();
      return;
    }

    // Skip other shortcuts if input is focused or if Alt/Shift are pressed
    if (isInputFocused || event.altKey || event.shiftKey) return;

    // Handle Ctrl/Cmd + key shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.code) {
        case KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR:
          event.preventDefault();
          actions.toggleSidebar();
          break;
        case KEYBOARD_SHORTCUTS.TOGGLE_DETAILS:
          event.preventDefault();
          actions.toggleDetails();
          break;
        case KEYBOARD_SHORTCUTS.SWITCH_TO_FILES:
          event.preventDefault();
          actions.setSidebarTab('files');
          break;
        case KEYBOARD_SHORTCUTS.SWITCH_TO_COLLECTIONS:
          event.preventDefault();
          actions.setSidebarTab('collections');
          break;
        case KEYBOARD_SHORTCUTS.SWITCH_TO_TAGS:
          event.preventDefault();
          actions.setSidebarTab('tags');
          break;
      }
    }
  }, [actions]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      handleKeyboardShortcut(event as unknown as KeyboardEvent);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyboardShortcut]);

  // Save preferences to localStorage when relevant state changes
  useEffect(() => {
    saveUIPreferences(state);
  }, [
    state.theme,
    state.viewMode,
    state.gridSize,
    state.showSidebar,
    state.sidebarTab,
    state.showDetails
  ]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<UIStateContextValue>(() => ({
    ...state,
    ...actions
  }), [state, actions]);

  return (
    <UIStateContext.Provider value={contextValue}>
      {children}
    </UIStateContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook for consuming UI state context
 * 
 * Provides access to all UI state and actions with type safety.
 * Must be used within a UIStateProvider.
 * 
 * @returns UI state and actions
 * @throws Error if used outside of UIStateProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showSidebar, toggleSidebar, theme, setTheme } = useUIState();
 *   
 *   return (
 *     <div>
 *       <button onClick={toggleSidebar}>
 *         {showSidebar ? 'Hide' : 'Show'} Sidebar
 *       </button>
 *       <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *         <option value="system">System</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUIState(): UIStateContextValue {
  const context = useContext(UIStateContext);
  
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UIStateContext;
export { KEYBOARD_SHORTCUTS, STORAGE_KEYS };
export type { UIState, UIAction, SidebarTab, UIStateContextValue, UIStateProviderProps };