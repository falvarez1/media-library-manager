'use client';

import React from 'react';
import useNotification from '../hooks/useNotification';

/**
 * NotificationDemo component for testing and demonstrating the notification system
 * This component provides buttons to test different notification types and scenarios
 */
export function NotificationDemo() {
  const { notifySuccess, notifyError, notifyWarning, notifyInfo, quick, async: asyncNotify, clearAll } = useNotification();

  // Simulate an async operation
  const simulateAsyncOperation = (shouldSucceed: boolean = true) => {
    return new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve('Operation completed successfully!');
        } else {
          reject(new Error('Operation failed for demo purposes'));
        }
      }, 2000);
    });
  };

  const handleTestBasicNotifications = () => {
    notifySuccess('Success!', { message: 'This is a success notification' });
    setTimeout(() => notifyError('Error!', { message: 'This is an error notification' }), 500);
    setTimeout(() => notifyWarning('Warning!', { message: 'This is a warning notification' }), 1000);
    setTimeout(() => notifyInfo('Info!', { message: 'This is an info notification' }), 1500);
  };

  const handleTestQuickMethods = () => {
    quick.uploadSuccess('demo-file.jpg');
    setTimeout(() => quick.saveSuccess('Document'), 1000);
    setTimeout(() => quick.copySuccess('Image'), 2000);
  };

  const handleTestAsyncSuccess = async () => {
    try {
      await asyncNotify.notifyAsync(
        () => simulateAsyncOperation(true),
        {
          loading: 'Processing your request...',
          success: 'Request completed successfully!',
          error: 'Request failed'
        }
      );
    } catch (error) {
      // Error is already handled by the async method
    }
  };

  const handleTestAsyncError = async () => {
    try {
      await asyncNotify.notifyAsync(
        () => simulateAsyncOperation(false),
        {
          loading: 'Processing your request...',
          success: 'Request completed successfully!',
          error: 'Request failed'
        }
      );
    } catch (error) {
      // Error is already handled by the async method
    }
  };

  const handleTestWithAction = () => {
    notifyInfo('Update Available', {
      message: 'A new version is available for download.',
      duration: 0, // Don't auto-dismiss
      action: {
        label: 'Download',
        onClick: () => {
          notifySuccess('Download started!');
        }
      }
    });
  };

  const handleTestLongRunning = () => {
    notifyWarning('Long Running Task', {
      message: 'This notification will stay visible until manually dismissed.',
      duration: 0, // Don't auto-dismiss
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-white border border-gray-300 rounded-lg shadow-lg z-40 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Notification Demo</h3>
      <div className="space-y-2">
        <button
          onClick={handleTestBasicNotifications}
          className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Basic Types
        </button>
        
        <button
          onClick={handleTestQuickMethods}
          className="w-full px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Test Quick Methods
        </button>
        
        <button
          onClick={handleTestAsyncSuccess}
          className="w-full px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Test Async Success
        </button>
        
        <button
          onClick={handleTestAsyncError}
          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Test Async Error
        </button>
        
        <button
          onClick={handleTestWithAction}
          className="w-full px-3 py-2 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        >
          Test With Action
        </button>
        
        <button
          onClick={handleTestLongRunning}
          className="w-full px-3 py-2 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          Test Long Running
        </button>
        
        <button
          onClick={clearAll}
          className="w-full px-3 py-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

export default NotificationDemo;