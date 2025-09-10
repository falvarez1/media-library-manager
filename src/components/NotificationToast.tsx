'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink
} from 'lucide-react';
import {
  useNotificationContext,
  type Notification,
  type NotificationPosition
} from '../contexts/NotificationContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Props for individual toast notification
 */
interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Props for the notification container
 */
interface NotificationContainerProps {
  position: NotificationPosition;
  children: React.ReactNode;
}

// ============================================================================
// STYLING CONFIGURATION
// ============================================================================

/**
 * Icon mapping for different notification types
 */
const TYPE_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
} as const;

/**
 * Color schemes for different notification types
 */
const TYPE_STYLES = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-500',
    title: 'text-green-900',
    message: 'text-green-700',
    button: 'text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    title: 'text-red-900',
    message: 'text-red-700',
    button: 'text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-900',
    message: 'text-yellow-700',
    button: 'text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-900',
    message: 'text-blue-700',
    button: 'text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200'
  }
} as const;

/**
 * Position-specific styling for notification container
 */
const POSITION_STYLES = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end flex-col-reverse',
  'bottom-left': 'bottom-4 left-4 items-start flex-col-reverse',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2 items-center',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 items-center flex-col-reverse'
} as const;


// ============================================================================
// INDIVIDUAL TOAST COMPONENT
// ============================================================================

/**
 * Individual toast notification component
 */
function Toast({ notification, onDismiss, onMouseEnter, onMouseLeave }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  
  const {
    id,
    type,
    title,
    message,
    dismissible,
    action,
    isExiting
  } = notification;

  const IconComponent = TYPE_ICONS[type];
  const styles = TYPE_STYLES[type];

  // Handle entrance animation
  useEffect(() => {
    if (!isExiting) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10); // Small delay to ensure DOM is ready
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  // Handle exit animation
  useEffect(() => {
    if (isExiting) {
      setIsVisible(false);
    }
  }, [isExiting]);

  // Handle keyboard accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && dismissible) {
      event.preventDefault();
      onDismiss(id);
    }
    if (event.key === 'Enter' && action) {
      event.preventDefault();
      action.onClick();
    }
  };

  return (
    <div
      ref={toastRef}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative flex items-start p-4 mb-3 rounded-lg shadow-lg border transition-all duration-300 ease-in-out
        min-w-[320px] max-w-[480px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${styles.container}
        ${isVisible && !isExiting ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}
        ${isExiting ? 'opacity-0 transform scale-95' : ''}
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <IconComponent 
          size={20} 
          className={styles.icon}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className={`text-sm font-medium ${styles.title}`}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p className={`mt-1 text-sm ${styles.message}`}>
            {message}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <div className="mt-3">
            <button
              type="button"
              onClick={action.onClick}
              className={`
                inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${styles.button}
              `}
            >
              {action.label}
              <ExternalLink size={12} className="ml-1" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <div className="flex-shrink-0 ml-3">
          <button
            type="button"
            onClick={() => onDismiss(id)}
            className={`
              inline-flex rounded-md p-1.5 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${styles.button}
            `}
            aria-label="Dismiss notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && !isExiting && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current opacity-30 transition-all ease-linear"
            style={{
              animation: `toast-progress ${notification.duration}ms linear`,
              animationPlayState: 'running'
            }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NOTIFICATION CONTAINER COMPONENT
// ============================================================================

/**
 * Container component for positioning notifications
 */
function NotificationContainer({ position, children }: NotificationContainerProps) {
  return (
    <div
      className={`
        fixed z-50 flex flex-col pointer-events-none
        ${POSITION_STYLES[position]}
      `}
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="pointer-events-auto space-y-0">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN NOTIFICATION TOAST COMPONENT
// ============================================================================

/**
 * Main NotificationToast component that renders all active notifications
 * 
 * Features:
 * - Renders notifications in a portal for proper z-index stacking
 * - Supports multiple positions
 * - Handles hover to pause auto-dismiss
 * - Provides keyboard accessibility
 * - Smooth enter/exit animations
 * - Progress indicators for auto-dismiss
 * 
 * This component automatically renders based on the notification context state
 * and doesn't require manual instantiation in most cases.
 */
export function NotificationToast() {
  const [isMounted, setIsMounted] = useState(false);
  const {
    notifications,
    position,
    dismiss,
    setPaused
  } = useNotificationContext();

  // Ensure we only render on client side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render on server side or if no notifications
  if (!isMounted || notifications.length === 0) {
    return null;
  }

  const handleMouseEnter = () => {
    setPaused(true);
  };

  const handleMouseLeave = () => {
    setPaused(false);
  };

  // Render notifications in a portal
  return createPortal(
    <NotificationContainer position={position}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={dismiss}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </NotificationContainer>,
    document.body
  );
}

// ============================================================================
// ADDITIONAL ANIMATIONS (to be added to global CSS)
// ============================================================================

/**
 * Custom CSS animations for toast notifications
 * These should be added to your global CSS file or Tailwind config
 */
export const TOAST_ANIMATIONS_CSS = `
/* Toast progress bar animation */
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Slide animations for different positions */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slide-in-down {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-out-up {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
}

@keyframes slide-in-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-out-down {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Utility classes for Tailwind */
.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-slide-out-right {
  animation: slide-out-right 0.3s ease-in;
}

.animate-slide-in-left {
  animation: slide-in-left 0.3s ease-out;
}

.animate-slide-out-left {
  animation: slide-out-left 0.3s ease-in;
}

.animate-slide-in-down {
  animation: slide-in-down 0.3s ease-out;
}

.animate-slide-out-up {
  animation: slide-out-up 0.3s ease-in;
}

.animate-slide-in-up {
  animation: slide-in-up 0.3s ease-out;
}

.animate-slide-out-down {
  animation: slide-out-down 0.3s ease-in;
}
`;

// ============================================================================
// EXPORTS
// ============================================================================

export default NotificationToast;
export type { ToastProps, NotificationContainerProps };