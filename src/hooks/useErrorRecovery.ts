/**
 * useErrorRecovery Hook
 * 
 * React hook for using error recovery functionality in components
 */

import { useState, useEffect } from 'react';
import ErrorRecoveryManager, { 
  ErrorRecoveryConfig, 
  ErrorRecoveryEvent 
} from '../utils/errorRecovery';

/**
 * React hook for error recovery management
 */
export function useErrorRecovery(config?: ErrorRecoveryConfig) {
  const [manager] = useState(() => new ErrorRecoveryManager(config));
  const [isOnline, setIsOnline] = useState(() => manager.isOnline());
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleEvent = (event: ErrorRecoveryEvent) => {
      switch (event.type) {
        case 'network-status-changed':
          setIsOnline(event.data.isOnline);
          break;
        case 'error-reported':
          setErrorCount(event.data.errorCount);
          break;
      }
    };

    manager.addListener(handleEvent);
    return () => manager.removeListener(handleEvent);
  }, [manager]);

  useEffect(() => {
    return () => manager.destroy();
  }, [manager]);

  return {
    executeWithRecovery: manager.executeWithRecovery.bind(manager),
    isOnline,
    errorCount,
    resetErrorCount: manager.resetErrorCount.bind(manager),
    getNetworkInfo: manager.getNetworkInfo.bind(manager)
  };
}

/**
 * Hook for simple online/offline detection
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useErrorRecovery;