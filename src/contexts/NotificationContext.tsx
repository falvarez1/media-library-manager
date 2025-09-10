'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  ReactNode
} from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Available notification types for different messaging contexts
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification positions on screen
 */
export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

/**
 * Individual notification item interface
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Type of notification affecting styling and icons */
  type: NotificationType;
  /** Main notification message */
  title: string;
  /** Optional detailed message */
  message?: string;
  /** Auto-dismiss timeout in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Whether the notification can be manually dismissed */
  dismissible?: boolean;
  /** Timestamp when notification was created */
  createdAt: number;
  /** Whether notification is currently being dismissed */
  isExiting?: boolean;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional callback when notification is dismissed */
  onDismiss?: () => void;
}

/**
 * Configuration options for creating notifications
 */
export interface NotificationOptions {
  /** Type of notification (default: 'info') */
  type?: NotificationType;
  /** Optional detailed message */
  message?: string;
  /** Auto-dismiss timeout in milliseconds (default: 5000, 0 = no auto-dismiss) */
  duration?: number;
  /** Whether the notification can be manually dismissed (default: true) */
  dismissible?: boolean;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional callback when notification is dismissed */
  onDismiss?: () => void;
}

/**
 * Global notification state interface
 */
export interface NotificationState {
  /** Array of active notifications */
  notifications: Notification[];
  /** Position where notifications appear */
  position: NotificationPosition;
  /** Maximum number of notifications to show simultaneously */
  maxNotifications: number;
  /** Whether notifications are paused (hover state) */
  isPaused: boolean;
}

/**
 * Notification action types for state management
 */
export type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'START_EXIT_ANIMATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'SET_POSITION'; payload: NotificationPosition }
  | { type: 'SET_MAX_NOTIFICATIONS'; payload: number }
  | { type: 'SET_PAUSED'; payload: boolean };

/**
 * Context value interface including state and actions
 */
export interface NotificationContextValue extends NotificationState {
  /** Add a new notification */
  notify: (title: string, options?: NotificationOptions) => string;
  /** Add success notification */
  notifySuccess: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  /** Add error notification */
  notifyError: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  /** Add warning notification */
  notifyWarning: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  /** Add info notification */
  notifyInfo: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  /** Dismiss a specific notification */
  dismiss: (id: string) => void;
  /** Clear all notifications */
  clearAll: () => void;
  /** Set notification position */
  setPosition: (position: NotificationPosition) => void;
  /** Set maximum number of notifications */
  setMaxNotifications: (max: number) => void;
  /** Pause/resume auto-dismiss timers */
  setPaused: (paused: boolean) => void;
}

/**
 * Provider props interface
 */
export interface NotificationProviderProps {
  children: ReactNode;
  /** Initial position for notifications (default: 'top-right') */
  position?: NotificationPosition;
  /** Maximum number of notifications to show (default: 5) */
  maxNotifications?: number;
  /** Default duration for auto-dismiss (default: 5000ms) */
  defaultDuration?: number;
}

// ============================================================================
// INITIAL STATE AND CONSTANTS
// ============================================================================

/**
 * Default notification state values
 */
const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  notifications: [],
  position: 'top-right',
  maxNotifications: 5,
  isPaused: false
};

/**
 * Default notification duration in milliseconds
 */
const DEFAULT_DURATION = 5000;

/**
 * Animation duration for enter/exit transitions
 */
export const ANIMATION_DURATION = 300;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for notifications
 */
function generateNotificationId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a notification object with defaults
 */
function createNotification(
  title: string,
  options: NotificationOptions = {},
  defaultDuration: number = DEFAULT_DURATION
): Notification {
  return {
    id: generateNotificationId(),
    type: options.type || 'info',
    title,
    message: options.message,
    duration: options.duration !== undefined ? options.duration : defaultDuration,
    dismissible: options.dismissible !== false,
    createdAt: Date.now(),
    isExiting: false,
    action: options.action,
    onDismiss: options.onDismiss
  };
}

// ============================================================================
// REDUCER FUNCTION
// ============================================================================

/**
 * Notification state reducer for managing all notification-related state updates
 */
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;
      let notifications = [...state.notifications];

      // Remove oldest notifications if we exceed max
      if (notifications.length >= state.maxNotifications) {
        notifications = notifications.slice(-(state.maxNotifications - 1));
      }

      // Add new notification
      notifications.push(newNotification);

      return {
        ...state,
        notifications
      };
    }

    case 'START_EXIT_ANIMATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isExiting: true }
            : notification
        )
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    case 'SET_POSITION':
      return {
        ...state,
        position: action.payload
      };

    case 'SET_MAX_NOTIFICATIONS':
      return {
        ...state,
        maxNotifications: Math.max(1, action.payload)
      };

    case 'SET_PAUSED':
      return {
        ...state,
        isPaused: action.payload
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Notification context for global notification management
 */
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * NotificationProvider component that provides global notification management
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Configurable auto-dismiss with pause on hover
 * - Position management for notification placement
 * - Maximum notification limits with automatic cleanup
 * - Smooth enter/exit animations
 * - Keyboard accessibility
 * - Action buttons support
 * - Custom dismiss callbacks
 * 
 * @param props - Provider props including children and configuration options
 */
export function NotificationProvider({
  children,
  position = 'top-right',
  maxNotifications = 5,
  defaultDuration = DEFAULT_DURATION
}: NotificationProviderProps) {
  // Initialize state with defaults and any provided initial configuration
  const [state, dispatch] = useReducer(notificationReducer, {
    ...DEFAULT_NOTIFICATION_STATE,
    position,
    maxNotifications
  });

  // Auto-dismiss timer management
  useEffect(() => {
    if (state.isPaused) return;

    const timers: NodeJS.Timeout[] = [];

    state.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0 && !notification.isExiting) {
        const timeRemaining = notification.duration - (Date.now() - notification.createdAt);
        
        if (timeRemaining > 0) {
          const timer = setTimeout(() => {
            // Start exit animation
            dispatch({ type: 'START_EXIT_ANIMATION', payload: notification.id });
            
            // Remove after animation completes
            setTimeout(() => {
              dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
              notification.onDismiss?.();
            }, ANIMATION_DURATION);
          }, timeRemaining);
          
          timers.push(timer);
        } else {
          // Already expired, remove immediately
          dispatch({ type: 'START_EXIT_ANIMATION', payload: notification.id });
          setTimeout(() => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
            notification.onDismiss?.();
          }, ANIMATION_DURATION);
        }
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications, state.isPaused]);

  // Memoized action functions
  const notify = useCallback((title: string, options: NotificationOptions = {}): string => {
    const notification = createNotification(title, options, defaultDuration);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    return notification.id;
  }, [defaultDuration]);

  const notifySuccess = useCallback((title: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
    return notify(title, { ...options, type: 'success' });
  }, [notify]);

  const notifyError = useCallback((title: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
    return notify(title, { ...options, type: 'error' });
  }, [notify]);

  const notifyWarning = useCallback((title: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
    return notify(title, { ...options, type: 'warning' });
  }, [notify]);

  const notifyInfo = useCallback((title: string, options: Omit<NotificationOptions, 'type'> = {}): string => {
    return notify(title, { ...options, type: 'info' });
  }, [notify]);

  const dismiss = useCallback((id: string) => {
    const notification = state.notifications.find(n => n.id === id);
    if (notification) {
      dispatch({ type: 'START_EXIT_ANIMATION', payload: id });
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        notification.onDismiss?.();
      }, ANIMATION_DURATION);
    }
  }, [state.notifications]);

  const clearAll = useCallback(() => {
    // Start exit animation for all notifications
    state.notifications.forEach(notification => {
      dispatch({ type: 'START_EXIT_ANIMATION', payload: notification.id });
    });

    // Remove all after animation completes
    setTimeout(() => {
      state.notifications.forEach(notification => {
        notification.onDismiss?.();
      });
      dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    }, ANIMATION_DURATION);
  }, [state.notifications]);

  const setPosition = useCallback((position: NotificationPosition) => {
    dispatch({ type: 'SET_POSITION', payload: position });
  }, []);

  const setMaxNotifications = useCallback((max: number) => {
    dispatch({ type: 'SET_MAX_NOTIFICATIONS', payload: max });
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    dispatch({ type: 'SET_PAUSED', payload: paused });
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<NotificationContextValue>(() => ({
    ...state,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismiss,
    clearAll,
    setPosition,
    setMaxNotifications,
    setPaused
  }), [
    state,
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismiss,
    clearAll,
    setPosition,
    setMaxNotifications,
    setPaused
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook for consuming notification context
 * 
 * Provides access to all notification state and actions with type safety.
 * Must be used within a NotificationProvider.
 * 
 * @returns Notification state and actions
 * @throws Error if used outside of NotificationProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { notifySuccess, notifyError, clearAll } = useNotificationContext();
 *   
 *   const handleSuccess = () => {
 *     notifySuccess('Operation completed!', {
 *       message: 'Your file has been uploaded successfully.',
 *       action: {
 *         label: 'View',
 *         onClick: () => console.log('View clicked')
 *       }
 *     });
 *   };
 *   
 *   const handleError = () => {
 *     notifyError('Upload failed', {
 *       message: 'Please try again later.',
 *       duration: 0 // Don't auto-dismiss
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Success</button>
 *       <button onClick={handleError}>Error</button>
 *       <button onClick={clearAll}>Clear All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NotificationContext;