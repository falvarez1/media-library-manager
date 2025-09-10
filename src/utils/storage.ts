/**
 * Secure localStorage utility with error handling and type safety
 * Provides safe methods for localStorage operations with fallbacks
 */

import { logError } from '../services/logger';

/**
 * Generic type for values that can be stored in localStorage
 */
type StorageValue = string | number | boolean | object | null;

/**
 * Return type for the useLocalStorage hook
 */
type UseLocalStorageReturn<T> = [T, (value: T) => void];

/**
 * Check if localStorage is available in the current environment
 * @returns {boolean} True if localStorage is available and functional
 */
const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely get item from localStorage with type checking and JSON parsing
 * @param key - Storage key to retrieve
 * @param defaultValue - Default value if key doesn't exist or error occurs
 * @returns Parsed value from localStorage or default value
 */
export const getStorageItem = <T extends StorageValue>(
  key: string, 
  defaultValue: T = null as T
): T => {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(item) as T;
    } catch {
      // If parsing fails, return as string (assuming T extends string)
      return item as T;
    }
  } catch (error) {
    logError('Storage', `Failed to get item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage with automatic JSON serialization
 * @param key - Storage key to set
 * @param value - Value to store (will be stringified if object)
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorageItem = <T extends StorageValue>(
  key: string, 
  value: T
): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const serializedValue = typeof value === 'string' 
      ? value 
      : JSON.stringify(value);
    
    localStorage.setItem(key, serializedValue);
    return true;
  } catch (error) {
    logError('Storage', `Failed to set item in localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 * @param key - Storage key to remove
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorageItem = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logError('Storage', `Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * @returns {boolean} True if successful, false otherwise
 */
export const clearStorage = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    logError('Storage', 'Failed to clear localStorage', error);
    return false;
  }
};

/**
 * Get all keys from localStorage
 * @returns {string[]} Array of all keys in localStorage
 */
export const getStorageKeys = (): string[] => {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    return Object.keys(localStorage);
  } catch (error) {
    logError('Storage', 'Failed to get localStorage keys', error);
    return [];
  }
};

/**
 * React hook for localStorage that provides state synchronization
 * Note: This is a simplified version. In a real React app, you'd use useState and useEffect
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 */
export const useLocalStorage = <T extends StorageValue>(
  key: string, 
  initialValue: T
): UseLocalStorageReturn<T> => {
  // Get the current stored value or use initial value
  const storedValue = getStorageItem<T>(key, initialValue);
  
  /**
   * Set value in localStorage and trigger any necessary updates
   * @param value - New value to store
   */
  const setValue = (value: T): void => {
    setStorageItem(key, value);
    // In a real React implementation, this would trigger a state update
  };
  
  return [storedValue, setValue];
};

/**
 * Storage keys constants for type safety and consistency
 */
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  AUTH_TOKEN: 'authToken',
  RECENT_SEARCHES: 'recentSearches',
  SIDEBAR_STATE: 'sidebarState',
  VIEW_PREFERENCES: 'viewPreferences',
  FILTER_PRESETS: 'filterPresets',
  THEME: 'theme',
  DEBUG_MODE: 'DEBUG_MODE'
} as const;

/**
 * Type for storage keys to ensure only valid keys are used
 */
export type StorageKey = keyof typeof STORAGE_KEYS | string;

/**
 * Storage utility interface for consistent method signatures
 */
export interface StorageUtility {
  get: typeof getStorageItem;
  set: typeof setStorageItem;
  remove: typeof removeStorageItem;
  clear: typeof clearStorage;
  keys: typeof getStorageKeys;
  isAvailable: typeof isLocalStorageAvailable;
  KEYS: typeof STORAGE_KEYS;
}

/**
 * Default export containing all storage utility methods
 */
const storageUtils: StorageUtility = {
  get: getStorageItem,
  set: setStorageItem,
  remove: removeStorageItem,
  clear: clearStorage,
  keys: getStorageKeys,
  isAvailable: isLocalStorageAvailable,
  KEYS: STORAGE_KEYS
} as const;

export default storageUtils;