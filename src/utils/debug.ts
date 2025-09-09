/**
 * Debug utility for development logging
 * Can be toggled via environment variable or localStorage
 */

/**
 * Check if code is running in development environment
 */
const isDevelopment: boolean = import.meta.env.MODE === 'development';

/**
 * Check if debug mode is enabled via localStorage or environment variable
 * @returns {boolean} True if debug mode is enabled
 */
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem('DEBUG_MODE') === 'true' || 
           import.meta.env.VITE_DEBUG === 'true';
  } catch {
    return false;
  }
};

/**
 * Debug logger that only logs in development mode when debug is enabled
 * @param category - Log category for filtering and identification
 * @param args - Arguments to log
 */
export const debug = (category: string, ...args: unknown[]): void => {
  if (isDevelopment && isDebugEnabled()) {
    console.log(`[${category}]`, ...args);
  }
};

/**
 * Debug error logger that logs errors in development mode
 * @param category - Error category for identification
 * @param error - Error object to log
 * @param args - Additional arguments to log
 */
export const debugError = (category: string, error: Error | unknown, ...args: unknown[]): void => {
  if (isDevelopment) {
    console.error(`[${category}]`, error, ...args);
  }
};

/**
 * Debug warning logger that only logs in development mode when debug is enabled
 * @param category - Warning category for identification
 * @param args - Arguments to log
 */
export const debugWarn = (category: string, ...args: unknown[]): void => {
  if (isDevelopment && isDebugEnabled()) {
    console.warn(`[${category}]`, ...args);
  }
};

/**
 * Performance timer for debugging - starts a timer with the given label
 * @param label - Timer label for identification
 */
export const debugTime = (label: string): void => {
  if (isDevelopment && isDebugEnabled()) {
    console.time(label);
  }
};

/**
 * End performance timer - ends the timer with the given label
 * @param label - Timer label that was used to start the timer
 */
export const debugTimeEnd = (label: string): void => {
  if (isDevelopment && isDebugEnabled()) {
    console.timeEnd(label);
  }
};

/**
 * Debug utility interface for consistent method signatures
 */
export interface DebugUtility {
  log: typeof debug;
  error: typeof debugError;
  warn: typeof debugWarn;
  time: typeof debugTime;
  timeEnd: typeof debugTimeEnd;
}

/**
 * Default export containing all debug methods
 */
const debugUtils: DebugUtility = {
  log: debug,
  error: debugError,
  warn: debugWarn,
  time: debugTime,
  timeEnd: debugTimeEnd
} as const;

export default debugUtils;