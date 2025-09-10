/**
 * User Context for Media Library Manager
 * 
 * Provides comprehensive user state management including authentication,
 * preferences, saved searches, and recent activity tracking.
 * 
 * @author Media Library Manager Team
 */

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback, 
  ReactNode 
} from 'react';
import { 
  User, 
  UserPreferences,
  AuthResponse,
  AuthCredentials,
  UserId,
  MediaType,
  ISO8601String,
  DEFAULT_USER_PREFERENCES
} from '../types';
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from '../utils/storage';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Saved search interface for user's stored search queries
 */
export interface SavedSearch {
  id: string;
  name: string;
  timestamp: string;
  params: {
    query: string;
    types: MediaType[];
    tags: string[];
    dateStart: string;
    dateEnd: string;
    sizeMin: string;
    sizeMax: string;
  };
  isPublic?: boolean;
  description?: string;
}

/**
 * Recent activity item for tracking user actions
 */
export interface RecentActivity {
  id: string;
  userId: UserId;
  action: 'view' | 'upload' | 'download' | 'share' | 'search' | 'create_collection' | 'edit' | 'delete';
  resourceType: 'media' | 'folder' | 'collection' | 'search';
  resourceId: string;
  resourceName: string;
  timestamp: ISO8601String;
  metadata?: {
    previousValue?: any;
    newValue?: any;
    searchQuery?: string;
    shareRecipients?: string[];
    fileSize?: number;
    mediaType?: MediaType;
  };
}

/**
 * User context state interface
 */
interface UserState {
  // Core user data
  user: User | null;
  userPreferences: UserPreferences;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  savedSearches: SavedSearch[];
  recentActivity: RecentActivity[];
  
  // Session info
  sessionExpiry: Date | null;
  lastActivity: Date | null;
}

/**
 * User context actions
 */
type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_SAVED_SEARCHES'; payload: SavedSearch[] }
  | { type: 'ADD_SAVED_SEARCH'; payload: SavedSearch }
  | { type: 'REMOVE_SAVED_SEARCH'; payload: string }
  | { type: 'SET_RECENT_ACTIVITY'; payload: RecentActivity[] }
  | { type: 'ADD_RECENT_ACTIVITY'; payload: RecentActivity }
  | { type: 'CLEAR_RECENT_ACTIVITY' }
  | { type: 'UPDATE_LAST_ACTIVITY'; payload: Date }
  | { type: 'SET_SESSION_EXPIRY'; payload: Date | null }
  | { type: 'RESET_STATE' };

/**
 * User context interface
 */
interface UserContextType extends UserState {
  // Authentication methods
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Preference methods
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => void;
  
  // Saved searches methods
  saveSearch: (search: Omit<SavedSearch, 'id' | 'timestamp'>) => void;
  removeSavedSearch: (searchId: string) => void;
  loadSavedSearch: (searchId: string) => SavedSearch | null;
  updateSavedSearch: (searchId: string, updates: Partial<SavedSearch>) => void;
  
  // Recent activity methods
  addToRecentActivity: (activity: Omit<RecentActivity, 'id' | 'timestamp' | 'userId'>) => void;
  clearRecentActivity: () => void;
  getRecentActivityByType: (type: RecentActivity['resourceType']) => RecentActivity[];
  
  // Utility methods
  isSessionValid: () => boolean;
  updateLastActivity: () => void;
  exportUserData: () => object;
  importUserData: (data: object) => void;
}

/**
 * Provider props interface
 */
interface UserProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_STATE: UserState = {
  user: null,
  userPreferences: DEFAULT_USER_PREFERENCES,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  savedSearches: [],
  recentActivity: [],
  sessionExpiry: null,
  lastActivity: null,
};

const MAX_RECENT_ACTIVITY_ITEMS = 50;
const MAX_SAVED_SEARCHES = 20;
const SESSION_WARNING_MINUTES = 5;

// Storage keys
const USER_STORAGE_KEYS = {
  USER_DATA: 'userData',
  USER_PREFERENCES: 'userPreferences', 
  SAVED_SEARCHES: 'savedSearches',
  RECENT_ACTIVITY: 'recentActivity',
  SESSION_DATA: 'sessionData',
} as const;

// ============================================================================
// REDUCER
// ============================================================================

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: action.payload !== null,
        error: null
      };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'UPDATE_PREFERENCES':
      const newPreferences = { ...state.userPreferences, ...action.payload };
      return { ...state, userPreferences: newPreferences };
      
    case 'SET_SAVED_SEARCHES':
      return { ...state, savedSearches: action.payload };
      
    case 'ADD_SAVED_SEARCH':
      const updatedSearches = [action.payload, ...state.savedSearches].slice(0, MAX_SAVED_SEARCHES);
      return { ...state, savedSearches: updatedSearches };
      
    case 'REMOVE_SAVED_SEARCH':
      return { 
        ...state, 
        savedSearches: state.savedSearches.filter(search => search.id !== action.payload)
      };
      
    case 'SET_RECENT_ACTIVITY':
      return { ...state, recentActivity: action.payload };
      
    case 'ADD_RECENT_ACTIVITY':
      const updatedActivity = [action.payload, ...state.recentActivity].slice(0, MAX_RECENT_ACTIVITY_ITEMS);
      return { ...state, recentActivity: updatedActivity };
      
    case 'CLEAR_RECENT_ACTIVITY':
      return { ...state, recentActivity: [] };
      
    case 'UPDATE_LAST_ACTIVITY':
      return { ...state, lastActivity: action.payload };
      
    case 'SET_SESSION_EXPIRY':
      return { ...state, sessionExpiry: action.payload };
      
    case 'RESET_STATE':
      return INITIAL_STATE;
      
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const UserContext = createContext<UserContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * User Context Provider component
 * 
 * Provides user authentication, preferences, and activity management
 * throughout the application with automatic persistence to localStorage.
 */
export const UserProvider: React.FC<UserProviderProps> = ({ 
  children, 
  apiBaseUrl = '/api' 
}) => {
  const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);

  // ============================================================================
  // EFFECT HOOKS - DATA LOADING AND PERSISTENCE
  // ============================================================================

  /**
   * Load user data from localStorage on mount
   */
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load user data
        const userData = getStorageItem<User | null>(USER_STORAGE_KEYS.USER_DATA, null);
        if (userData) {
          dispatch({ type: 'SET_USER', payload: userData });
        }

        // Load preferences
        const preferences = getStorageItem<UserPreferences>(
          USER_STORAGE_KEYS.USER_PREFERENCES, 
          DEFAULT_USER_PREFERENCES
        );
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });

        // Load saved searches
        const savedSearches = getStorageItem<SavedSearch[]>(
          USER_STORAGE_KEYS.SAVED_SEARCHES, 
          []
        );
        dispatch({ type: 'SET_SAVED_SEARCHES', payload: savedSearches });

        // Load recent activity
        const recentActivity = getStorageItem<RecentActivity[]>(
          USER_STORAGE_KEYS.RECENT_ACTIVITY, 
          []
        );
        dispatch({ type: 'SET_RECENT_ACTIVITY', payload: recentActivity });

        // Load session data
        const sessionData = getStorageItem<{ expiry: string; lastActivity: string } | null>(
          USER_STORAGE_KEYS.SESSION_DATA, 
          null
        );
        if (sessionData) {
          dispatch({ type: 'SET_SESSION_EXPIRY', payload: new Date(sessionData.expiry) });
          dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: new Date(sessionData.lastActivity) });
        }
      } catch (error) {
        console.error('Error loading user data from storage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
      }
    };

    loadStoredData();
  }, []);

  /**
   * Persist user data to localStorage when state changes
   */
  useEffect(() => {
    if (state.user) {
      setStorageItem(USER_STORAGE_KEYS.USER_DATA, state.user);
    } else {
      removeStorageItem(USER_STORAGE_KEYS.USER_DATA);
    }
  }, [state.user]);

  useEffect(() => {
    setStorageItem(USER_STORAGE_KEYS.USER_PREFERENCES, state.userPreferences);
  }, [state.userPreferences]);

  useEffect(() => {
    setStorageItem(USER_STORAGE_KEYS.SAVED_SEARCHES, state.savedSearches);
  }, [state.savedSearches]);

  useEffect(() => {
    setStorageItem(USER_STORAGE_KEYS.RECENT_ACTIVITY, state.recentActivity);
  }, [state.recentActivity]);

  useEffect(() => {
    if (state.sessionExpiry && state.lastActivity) {
      setStorageItem(USER_STORAGE_KEYS.SESSION_DATA, {
        expiry: state.sessionExpiry.toISOString(),
        lastActivity: state.lastActivity.toISOString()
      });
    }
  }, [state.sessionExpiry, state.lastActivity]);

  /**
   * Session validation and auto-refresh
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.sessionExpiry) return;

    const checkSession = () => {
      const now = new Date();
      const timeUntilExpiry = state.sessionExpiry!.getTime() - now.getTime();
      const warningTime = SESSION_WARNING_MINUTES * 60 * 1000;

      if (timeUntilExpiry <= 0) {
        // Session expired
        logout();
      } else if (timeUntilExpiry <= warningTime) {
        // Session expiring soon, attempt refresh
        refreshToken().catch(() => {
          console.warn('Failed to refresh session token');
        });
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.sessionExpiry]);

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Authenticate user with credentials
   */
  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResponse> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();
      
      // Update state with user data
      dispatch({ type: 'SET_USER', payload: authResponse.user });
      dispatch({ type: 'UPDATE_PREFERENCES', payload: authResponse.user.preferences });
      
      // Set session data
      const expiryDate = new Date(authResponse.expiresAt);
      dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiryDate });
      dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: new Date() });

      // Store auth token
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);

      // Log activity
      addToRecentActivity({
        action: 'view',
        resourceType: 'media',
        resourceId: 'session',
        resourceName: 'Login',
        metadata: {}
      });

      return authResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiBaseUrl]);

  /**
   * Log out user and clear session data
   */
  const logout = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Attempt server-side logout
      const token = getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN, '');
      if (token) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignore logout errors - continue with local cleanup
        });
      }
    } finally {
      // Clear local state and storage
      dispatch({ type: 'RESET_STATE' });
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(USER_STORAGE_KEYS.USER_DATA);
      removeStorageItem(USER_STORAGE_KEYS.SESSION_DATA);
      
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [apiBaseUrl]);

  /**
   * Refresh authentication token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    const token = getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN, '');
    if (!token) return;

    try {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const authResponse: AuthResponse = await response.json();
        const expiryDate = new Date(authResponse.expiresAt);
        dispatch({ type: 'SET_SESSION_EXPIRY', payload: expiryDate });
        dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: new Date() });
        setStorageItem(STORAGE_KEYS.AUTH_TOKEN, authResponse.token);
      } else {
        // Refresh failed, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [apiBaseUrl, logout]);

  // ============================================================================
  // PREFERENCE METHODS
  // ============================================================================

  /**
   * Update user preferences with optional server sync
   */
  const updatePreferences = useCallback(async (
    preferences: Partial<UserPreferences>
  ): Promise<void> => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });

    // Update user object if it exists
    if (state.user) {
      const updatedUser = {
        ...state.user,
        preferences: { ...state.user.preferences, ...preferences }
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });

      // Sync with server if authenticated
      try {
        const token = getStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN, '');
        if (token) {
          await fetch(`${apiBaseUrl}/users/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(preferences),
          });
        }
      } catch (error) {
        console.warn('Failed to sync preferences with server:', error);
      }
    }
  }, [state.user, apiBaseUrl]);

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: DEFAULT_USER_PREFERENCES });
  }, []);

  // ============================================================================
  // SAVED SEARCH METHODS
  // ============================================================================

  /**
   * Save a search query for later use
   */
  const saveSearch = useCallback((search: Omit<SavedSearch, 'id' | 'timestamp'>) => {
    const newSearch: SavedSearch = {
      ...search,
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_SAVED_SEARCH', payload: newSearch });
    
    // Log activity
    addToRecentActivity({
      action: 'create_collection',
      resourceType: 'search',
      resourceId: newSearch.id,
      resourceName: newSearch.name,
      metadata: { searchQuery: newSearch.params.query }
    });
  }, []);

  /**
   * Remove a saved search
   */
  const removeSavedSearch = useCallback((searchId: string) => {
    dispatch({ type: 'REMOVE_SAVED_SEARCH', payload: searchId });
    
    // Log activity
    addToRecentActivity({
      action: 'delete',
      resourceType: 'search',
      resourceId: searchId,
      resourceName: 'Saved Search'
    });
  }, []);

  /**
   * Load and return a saved search by ID
   */
  const loadSavedSearch = useCallback((searchId: string): SavedSearch | null => {
    const search = state.savedSearches.find(s => s.id === searchId);
    
    if (search) {
      // Log activity
      addToRecentActivity({
        action: 'view',
        resourceType: 'search',
        resourceId: search.id,
        resourceName: search.name,
        metadata: { searchQuery: search.params.query }
      });
    }
    
    return search || null;
  }, [state.savedSearches]);

  /**
   * Update an existing saved search
   */
  const updateSavedSearch = useCallback((
    searchId: string, 
    updates: Partial<SavedSearch>
  ) => {
    const updatedSearches = state.savedSearches.map(search => 
      search.id === searchId ? { ...search, ...updates } : search
    );
    dispatch({ type: 'SET_SAVED_SEARCHES', payload: updatedSearches });
  }, [state.savedSearches]);

  // ============================================================================
  // RECENT ACTIVITY METHODS
  // ============================================================================

  /**
   * Add new activity to recent activity list
   */
  const addToRecentActivity = useCallback((
    activity: Omit<RecentActivity, 'id' | 'timestamp' | 'userId'>
  ) => {
    if (!state.user) return;

    const newActivity: RecentActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString() as ISO8601String,
      userId: state.user.id,
    };
    
    dispatch({ type: 'ADD_RECENT_ACTIVITY', payload: newActivity });
    dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: new Date() });
  }, [state.user]);

  /**
   * Clear all recent activity
   */
  const clearRecentActivity = useCallback(() => {
    dispatch({ type: 'CLEAR_RECENT_ACTIVITY' });
  }, []);

  /**
   * Get recent activity filtered by resource type
   */
  const getRecentActivityByType = useCallback((
    type: RecentActivity['resourceType']
  ): RecentActivity[] => {
    return state.recentActivity.filter(activity => activity.resourceType === type);
  }, [state.recentActivity]);

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if current session is valid
   */
  const isSessionValid = useCallback((): boolean => {
    if (!state.isAuthenticated || !state.sessionExpiry) return false;
    return new Date() < state.sessionExpiry;
  }, [state.isAuthenticated, state.sessionExpiry]);

  /**
   * Update last activity timestamp
   */
  const updateLastActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_LAST_ACTIVITY', payload: new Date() });
  }, []);

  /**
   * Export user data for backup/transfer
   */
  const exportUserData = useCallback((): object => {
    return {
      preferences: state.userPreferences,
      savedSearches: state.savedSearches,
      recentActivity: state.recentActivity.slice(0, 10), // Only recent items
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }, [state.userPreferences, state.savedSearches, state.recentActivity]);

  /**
   * Import user data from backup
   */
  const importUserData = useCallback((data: any) => {
    try {
      if (data.preferences) {
        dispatch({ type: 'UPDATE_PREFERENCES', payload: data.preferences });
      }
      if (data.savedSearches && Array.isArray(data.savedSearches)) {
        dispatch({ type: 'SET_SAVED_SEARCHES', payload: data.savedSearches });
      }
      if (data.recentActivity && Array.isArray(data.recentActivity)) {
        const activities = data.recentActivity.map((activity: any) => ({
          ...activity,
          userId: state.user?.id || activity.userId
        }));
        dispatch({ type: 'SET_RECENT_ACTIVITY', payload: activities });
      }
    } catch (error) {
      console.error('Failed to import user data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import user data' });
    }
  }, [state.user]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: UserContextType = {
    // State
    ...state,
    
    // Authentication methods
    login,
    logout,
    refreshToken,
    
    // Preference methods
    updatePreferences,
    resetPreferences,
    
    // Saved search methods
    saveSearch,
    removeSavedSearch,
    loadSavedSearch,
    updateSavedSearch,
    
    // Recent activity methods
    addToRecentActivity,
    clearRecentActivity,
    getRecentActivityByType,
    
    // Utility methods
    isSessionValid,
    updateLastActivity,
    exportUserData,
    importUserData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access user context
 * 
 * @returns UserContextType - Complete user context with state and methods
 * @throws Error if used outside of UserProvider
 * 
 * @example
 * ```tsx
 * const { user, login, updatePreferences, saveSearch } = useUser();
 * 
 * // Check authentication
 * if (!user) {
 *   return <LoginForm onLogin={login} />;
 * }
 * 
 * // Update user preferences
 * const handleThemeChange = (theme: Theme) => {
 *   updatePreferences({ theme });
 * };
 * 
 * // Save a search
 * const handleSaveSearch = () => {
 *   saveSearch({
 *     name: 'My Search',
 *     params: searchParams
 *   });
 * };
 * ```
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error(
      'useUser must be used within a UserProvider. ' +
      'Make sure your component is wrapped in a UserProvider.'
    );
  }
  
  return context;
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { UserContextType, UserProviderProps };

// Default export
export default UserProvider;