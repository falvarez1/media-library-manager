/**
 * useNotification Hook
 * 
 * A convenient hook that provides easy access to the notification system
 * with enhanced functionality and common use cases.
 * 
 * This hook wraps the NotificationContext and provides additional utilities
 * for common notification patterns used throughout the application.
 */

import { useCallback } from 'react';
import {
  useNotificationContext,
  type NotificationOptions,
  type NotificationType,
  type NotificationPosition
} from '../contexts/NotificationContext';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Enhanced notification options with common presets
 */
export interface UseNotificationOptions extends Omit<NotificationOptions, 'type'> {
  /** Whether to show a loading state before the notification (useful for async operations) */
  showLoading?: boolean;
  /** Loading message to show before the actual notification */
  loadingMessage?: string;
  /** Whether to automatically clear previous notifications of the same type */
  clearPrevious?: boolean;
}

/**
 * Quick notification methods for common use cases
 */
export interface QuickNotificationMethods {
  /** Show upload success notification */
  uploadSuccess: (filename?: string) => string;
  /** Show upload error notification */
  uploadError: (error?: string) => string;
  /** Show save success notification */
  saveSuccess: (item?: string) => string;
  /** Show save error notification */
  saveError: (error?: string) => string;
  /** Show delete success notification */
  deleteSuccess: (item?: string) => string;
  /** Show delete error notification */
  deleteError: (error?: string) => string;
  /** Show copy success notification */
  copySuccess: (item?: string) => string;
  /** Show move success notification */
  moveSuccess: (item?: string) => string;
  /** Show network error notification */
  networkError: (action?: string) => string;
  /** Show permission error notification */
  permissionError: (action?: string) => string;
  /** Show maintenance notification */
  maintenance: (message?: string) => string;
  /** Show update available notification */
  updateAvailable: () => string;
}

/**
 * Async operation notification helpers
 */
export interface AsyncNotificationMethods {
  /** Show notification for async operation with loading state */
  notifyAsync: <T>(
    operation: () => Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: UseNotificationOptions
  ) => Promise<T>;
  
  /** Show notification for upload operation */
  notifyUpload: <T>(
    uploadOperation: () => Promise<T>,
    filename?: string,
    options?: UseNotificationOptions
  ) => Promise<T>;
  
  /** Show notification for save operation */
  notifySave: <T>(
    saveOperation: () => Promise<T>,
    itemName?: string,
    options?: UseNotificationOptions
  ) => Promise<T>;
  
  /** Show notification for delete operation */
  notifyDelete: <T>(
    deleteOperation: () => Promise<T>,
    itemName?: string,
    options?: UseNotificationOptions
  ) => Promise<T>;
}

/**
 * Complete useNotification return type
 */
export interface UseNotificationReturn {
  // Basic notification methods (from context)
  notify: (title: string, options?: NotificationOptions) => string;
  notifySuccess: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  notifyError: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  notifyWarning: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  notifyInfo: (title: string, options?: Omit<NotificationOptions, 'type'>) => string;
  
  // Control methods
  dismiss: (id: string) => void;
  clearAll: () => void;
  setPosition: (position: NotificationPosition) => void;
  
  // Quick notification methods
  quick: QuickNotificationMethods;
  
  // Async operation helpers
  async: AsyncNotificationMethods;
  
  // State
  notifications: Array<any>;
  position: NotificationPosition;
  isPaused: boolean;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Enhanced notification hook with common patterns and utilities
 * 
 * Provides easy access to the notification system with additional convenience
 * methods for common use cases like uploads, saves, errors, etc.
 * 
 * @returns Enhanced notification methods and state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { notifySuccess, quick, async } = useNotification();
 *   
 *   // Basic usage
 *   const handleBasicSuccess = () => {
 *     notifySuccess('Operation completed!');
 *   };
 *   
 *   // Quick methods
 *   const handleUpload = () => {
 *     quick.uploadSuccess('image.jpg');
 *   };
 *   
 *   // Async operations
 *   const handleAsyncSave = async () => {
 *     await async.notifySave(
 *       () => saveDocument(),
 *       'Document'
 *     );
 *   };
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function useNotification(): UseNotificationReturn {
  const context = useNotificationContext();
  
  const {
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismiss,
    clearAll,
    setPosition,
    notifications,
    position,
    isPaused
  } = context;

  // ============================================================================
  // QUICK NOTIFICATION METHODS
  // ============================================================================

  const quick: QuickNotificationMethods = {
    uploadSuccess: useCallback((filename?: string) => {
      return notifySuccess(
        'Upload completed',
        {
          message: filename ? `${filename} has been uploaded successfully.` : 'File uploaded successfully.',
          duration: 4000
        }
      );
    }, [notifySuccess]),

    uploadError: useCallback((error?: string) => {
      return notifyError(
        'Upload failed',
        {
          message: error || 'There was an error uploading your file. Please try again.',
          duration: 6000
        }
      );
    }, [notifyError]),

    saveSuccess: useCallback((item?: string) => {
      return notifySuccess(
        'Saved successfully',
        {
          message: item ? `${item} has been saved.` : 'Changes have been saved.',
          duration: 3000
        }
      );
    }, [notifySuccess]),

    saveError: useCallback((error?: string) => {
      return notifyError(
        'Save failed',
        {
          message: error || 'Unable to save changes. Please try again.',
          duration: 6000
        }
      );
    }, [notifyError]),

    deleteSuccess: useCallback((item?: string) => {
      return notifySuccess(
        'Deleted successfully',
        {
          message: item ? `${item} has been deleted.` : 'Item has been deleted.',
          duration: 3000
        }
      );
    }, [notifySuccess]),

    deleteError: useCallback((error?: string) => {
      return notifyError(
        'Delete failed',
        {
          message: error || 'Unable to delete item. Please try again.',
          duration: 6000
        }
      );
    }, [notifyError]),

    copySuccess: useCallback((item?: string) => {
      return notifySuccess(
        'Copied successfully',
        {
          message: item ? `${item} has been copied.` : 'Item has been copied.',
          duration: 2000
        }
      );
    }, [notifySuccess]),

    moveSuccess: useCallback((item?: string) => {
      return notifySuccess(
        'Moved successfully',
        {
          message: item ? `${item} has been moved.` : 'Item has been moved.',
          duration: 3000
        }
      );
    }, [notifySuccess]),

    networkError: useCallback((action?: string) => {
      return notifyError(
        'Network error',
        {
          message: action 
            ? `Unable to ${action} due to a network error. Please check your connection and try again.`
            : 'Network connection lost. Please check your connection and try again.',
          duration: 8000
        }
      );
    }, [notifyError]),

    permissionError: useCallback((action?: string) => {
      return notifyError(
        'Permission denied',
        {
          message: action 
            ? `You don't have permission to ${action}.`
            : "You don't have permission to perform this action.",
          duration: 6000
        }
      );
    }, [notifyError]),

    maintenance: useCallback((message?: string) => {
      return notifyWarning(
        'Maintenance mode',
        {
          message: message || 'The system is currently undergoing maintenance. Some features may be temporarily unavailable.',
          duration: 0 // Don't auto-dismiss
        }
      );
    }, [notifyWarning]),

    updateAvailable: useCallback(() => {
      return notifyInfo(
        'Update available',
        {
          message: 'A new version of the application is available.',
          duration: 0, // Don't auto-dismiss
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
        }
      );
    }, [notifyInfo])
  };

  // ============================================================================
  // ASYNC OPERATION METHODS
  // ============================================================================

  const asyncMethods: AsyncNotificationMethods = {
    notifyAsync: useCallback(async <T>(
      operation: () => Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      },
      options: UseNotificationOptions = {}
    ): Promise<T> => {
      // Show loading notification
      const loadingId = notifyInfo(messages.loading, {
        duration: 0, // Don't auto-dismiss loading
        dismissible: false
      });

      try {
        const result = await operation();
        
        // Dismiss loading and show success
        dismiss(loadingId);
        notifySuccess(messages.success, {
          duration: options.duration || 4000,
          ...options
        });
        
        return result;
      } catch (error) {
        // Dismiss loading and show error
        dismiss(loadingId);
        notifyError(messages.error, {
          message: error instanceof Error ? error.message : 'An unexpected error occurred.',
          duration: options.duration || 6000,
          ...options
        });
        
        throw error; // Re-throw for caller handling
      }
    }, [notifyInfo, notifySuccess, notifyError, dismiss]),

    notifyUpload: useCallback(async <T>(
      uploadOperation: () => Promise<T>,
      filename?: string,
      options: UseNotificationOptions = {}
    ): Promise<T> => {
      return asyncMethods.notifyAsync(
        uploadOperation,
        {
          loading: filename ? `Uploading ${filename}...` : 'Uploading file...',
          success: filename ? `${filename} uploaded successfully` : 'File uploaded successfully',
          error: 'Upload failed'
        },
        options
      );
    }, []),

    notifySave: useCallback(async <T>(
      saveOperation: () => Promise<T>,
      itemName?: string,
      options: UseNotificationOptions = {}
    ): Promise<T> => {
      return asyncMethods.notifyAsync(
        saveOperation,
        {
          loading: itemName ? `Saving ${itemName}...` : 'Saving...',
          success: itemName ? `${itemName} saved successfully` : 'Saved successfully',
          error: 'Save failed'
        },
        options
      );
    }, []),

    notifyDelete: useCallback(async <T>(
      deleteOperation: () => Promise<T>,
      itemName?: string,
      options: UseNotificationOptions = {}
    ): Promise<T> => {
      return asyncMethods.notifyAsync(
        deleteOperation,
        {
          loading: itemName ? `Deleting ${itemName}...` : 'Deleting...',
          success: itemName ? `${itemName} deleted successfully` : 'Deleted successfully',
          error: 'Delete failed'
        },
        options
      );
    }, [])
  };

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  return {
    // Basic methods
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    dismiss,
    clearAll,
    setPosition,
    
    // Quick methods
    quick,
    
    // Async methods
    async: asyncMethods,
    
    // State
    notifications,
    position,
    isPaused
  };
}

// ============================================================================
// ADDITIONAL UTILITY HOOKS
// ============================================================================

/**
 * Hook for handling form submission notifications
 * 
 * @param onSubmit - Form submission handler
 * @returns Enhanced submit handler with notifications
 */
export function useFormNotification<T = any>(
  onSubmit: (data: T) => Promise<void>
) {
  const { async: asyncNotify } = useNotification();
  
  return useCallback(async (data: T) => {
    await asyncNotify.notifyAsync(
      () => onSubmit(data),
      {
        loading: 'Submitting...',
        success: 'Form submitted successfully',
        error: 'Submission failed'
      }
    );
  }, [onSubmit, asyncNotify]);
}

/**
 * Hook for handling API operation notifications
 * 
 * @param operation - API operation to wrap
 * @param operationName - Name of the operation for messages
 * @returns Enhanced operation with notifications
 */
export function useApiNotification<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string
) {
  const { async: asyncNotify } = useNotification();
  
  return useCallback(async (...args: T): Promise<R> => {
    return asyncNotify.notifyAsync(
      () => operation(...args),
      {
        loading: `${operationName}...`,
        success: `${operationName} completed`,
        error: `${operationName} failed`
      }
    );
  }, [operation, operationName, asyncNotify]);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useNotification;
export type {
  UseNotificationOptions,
  UseNotificationReturn,
  QuickNotificationMethods,
  AsyncNotificationMethods
};