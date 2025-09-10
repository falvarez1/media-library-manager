/**
 * Error Recovery Utilities
 * 
 * Comprehensive error recovery mechanisms including offline detection,
 * retry strategies, and connection monitoring.
 */

import { logWarn, logError } from '../services/logger';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface NetworkInfo {
  isOnline: boolean;
  connectionType?: string;
  downlink?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface ErrorRecoveryConfig {
  enableOfflineDetection?: boolean;
  enableRetryMechanism?: boolean;
  enableNetworkMonitoring?: boolean;
  enableErrorReporting?: boolean;
  retryOptions?: RetryOptions;
}

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

// ============================================================================
// NETWORK DETECTION
// ============================================================================

/**
 * Get current network information
 */
export function getNetworkInfo(): NetworkInfo {
  const isOnline = navigator.onLine;
  
  // Check for Network Information API support
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (connection) {
    return {
      isOnline,
      connectionType: connection.type,
      downlink: connection.downlink,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  return { isOnline };
}

/**
 * Determine connection quality based on network info
 */
export function getConnectionQuality(networkInfo: NetworkInfo): ConnectionQuality {
  if (!networkInfo.isOnline) {
    return 'offline';
  }

  const { effectiveType, rtt, downlink } = networkInfo;

  // Use effective type if available (4g, 3g, 2g, slow-2g)
  if (effectiveType) {
    switch (effectiveType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
        return 'fair';
      case 'slow-2g':
        return 'poor';
    }
  }

  // Use RTT and downlink as fallback
  if (rtt !== undefined && downlink !== undefined) {
    if (rtt < 100 && downlink > 5) {
      return 'excellent';
    } else if (rtt < 300 && downlink > 2) {
      return 'good';
    } else if (rtt < 600 && downlink > 0.5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  // Default to good if we can't determine quality
  return 'good';
}

/**
 * Test actual network connectivity by making a request
 */
export async function testConnectivity(
  testUrl: string = '/api/health',
  timeout: number = 5000
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(testUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    logWarn('ErrorRecovery', 'Connectivity test failed', error);
    return false;
  }
}

// ============================================================================
// OFFLINE DETECTION
// ============================================================================

export class OfflineDetector {
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private isOnline: boolean = navigator.onLine;
  private testInterval: NodeJS.Timeout | null = null;
  private testUrl: string;
  private testIntervalMs: number;

  constructor(testUrl: string = '/api/health', testIntervalMs: number = 30000) {
    this.testUrl = testUrl;
    this.testIntervalMs = testIntervalMs;
    this.initialize();
  }

  private initialize() {
    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Start periodic connectivity testing
    this.startConnectivityTesting();
  }

  private handleOnline = () => {
    this.setOnlineStatus(true);
  };

  private handleOffline = () => {
    this.setOnlineStatus(false);
  };

  private setOnlineStatus(isOnline: boolean) {
    if (this.isOnline !== isOnline) {
      this.isOnline = isOnline;
      this.notifyListeners(isOnline);
    }
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        logError('ErrorRecovery', 'Error in offline detector listener', error);
      }
    });
  }

  private startConnectivityTesting() {
    this.testInterval = setInterval(async () => {
      // Only test if browser thinks we're online
      if (navigator.onLine) {
        const isConnected = await testConnectivity(this.testUrl);
        this.setOnlineStatus(isConnected);
      }
    }, this.testIntervalMs);
  }

  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.add(listener);
  }

  public removeListener(listener: (isOnline: boolean) => void) {
    this.listeners.delete(listener);
  }

  public getCurrentStatus(): boolean {
    return this.isOnline;
  }

  public destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
    
    this.listeners.clear();
  }
}

// ============================================================================
// RETRY MECHANISMS
// ============================================================================

/**
 * Sleep function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default retry condition - retry on network and server errors
 */
function defaultRetryCondition(error: Error): boolean {
  // Retry on network errors
  if (error.name === 'NetworkError' || error.message.includes('fetch')) {
    return true;
  }

  // Retry on HTTP errors (if it's an HTTP error with status)
  const httpError = error as any;
  if (httpError.status) {
    // Retry on 5xx server errors and specific 4xx errors
    return httpError.status >= 500 || 
           httpError.status === 408 || // Request Timeout
           httpError.status === 429;   // Too Many Requests
  }

  // Retry on chunk loading errors (common in SPAs)
  if (error.name === 'ChunkLoadError' || 
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk')) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if this is the last attempt or condition fails
      if (attempt === maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      // Add some jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;

      // Notify about retry
      onRetry?.(attempt + 1, lastError);

      // Wait before retrying
      await sleep(jitteredDelay);
    }
  }

  throw lastError!;
}

/**
 * Retry specifically for API calls with network awareness
 */
export async function retryApiCall<T>(
  apiFn: () => Promise<T>,
  options: RetryOptions & { offlineDetector?: OfflineDetector } = {}
): Promise<T> {
  const { offlineDetector, ...retryOptions } = options;

  return retryWithBackoff(
    async () => {
      // Check if we're offline before attempting the call
      if (offlineDetector && !offlineDetector.getCurrentStatus()) {
        throw new Error('Device is offline');
      }

      return await apiFn();
    },
    {
      retryCondition: (error) => {
        // Don't retry if we're offline
        if (error.message === 'Device is offline') {
          return false;
        }
        
        return defaultRetryCondition(error);
      },
      ...retryOptions
    }
  );
}

// ============================================================================
// ERROR RECOVERY MANAGER
// ============================================================================

export class ErrorRecoveryManager {
  private offlineDetector: OfflineDetector | null = null;
  private config: ErrorRecoveryConfig;
  private errorCount: number = 0;
  private listeners: Set<(event: ErrorRecoveryEvent) => void> = new Set();

  constructor(config: ErrorRecoveryConfig = {}) {
    this.config = {
      enableOfflineDetection: true,
      enableRetryMechanism: true,
      enableNetworkMonitoring: true,
      enableErrorReporting: true,
      retryOptions: {},
      ...config
    };

    this.initialize();
  }

  private initialize() {
    if (this.config.enableOfflineDetection) {
      this.offlineDetector = new OfflineDetector();
      this.offlineDetector.addListener(this.handleOfflineStatusChange);
    }

    if (this.config.enableErrorReporting) {
      this.setupGlobalErrorHandling();
    }
  }

  private handleOfflineStatusChange = (isOnline: boolean) => {
    this.notifyListeners({
      type: 'network-status-changed',
      data: { isOnline, timestamp: Date.now() }
    });

    if (isOnline) {
      this.notifyListeners({
        type: 'connection-restored',
        data: { timestamp: Date.now() }
      });
    }
  };

  private setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason, 'unhandled-promise');
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error, 'javascript-error');
    });
  }

  private reportError(error: Error, type: string) {
    this.errorCount++;
    
    logError('ErrorRecovery', `${type}:`, error);
    
    this.notifyListeners({
      type: 'error-reported',
      data: { 
        error, 
        errorType: type, 
        errorCount: this.errorCount,
        timestamp: Date.now() 
      }
    });
  }

  private notifyListeners(event: ErrorRecoveryEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logError('ErrorRecovery', 'Error in recovery manager listener', error);
      }
    });
  }

  public async executeWithRecovery<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const mergedOptions = {
      ...this.config.retryOptions,
      ...options,
      onRetry: (attempt: number, error: Error) => {
        this.notifyListeners({
          type: 'retry-attempt',
          data: { attempt, error, timestamp: Date.now() }
        });
        options.onRetry?.(attempt, error);
      }
    };

    try {
      if (this.config.enableRetryMechanism) {
        return await retryApiCall(fn, {
          ...mergedOptions,
          offlineDetector: this.offlineDetector || undefined
        });
      } else {
        return await fn();
      }
    } catch (error) {
      this.reportError(error instanceof Error ? error : new Error(String(error)), 'execution-error');
      throw error;
    }
  }

  public getNetworkInfo(): NetworkInfo {
    return getNetworkInfo();
  }

  public isOnline(): boolean {
    return this.offlineDetector?.getCurrentStatus() ?? navigator.onLine;
  }

  public addListener(listener: (event: ErrorRecoveryEvent) => void) {
    this.listeners.add(listener);
  }

  public removeListener(listener: (event: ErrorRecoveryEvent) => void) {
    this.listeners.delete(listener);
  }

  public getErrorCount(): number {
    return this.errorCount;
  }

  public resetErrorCount() {
    this.errorCount = 0;
  }

  public destroy() {
    this.offlineDetector?.destroy();
    this.offlineDetector = null;
    this.listeners.clear();
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ErrorRecoveryEvent {
  type: 'network-status-changed' | 'connection-restored' | 'error-reported' | 'retry-attempt';
  data: any;
}

// ============================================================================
// HOOKS FOR REACT COMPONENTS
// ============================================================================

// Note: React hooks should be imported and used in a separate React component file
// This utility provides the core functionality that can be wrapped in hooks

/**
 * Create a React hook for using error recovery in components
 * Usage: Import React in your component and use this pattern:
 * 
 * const useErrorRecovery = (config?: ErrorRecoveryConfig) => {
 *   const [manager] = useState(() => new ErrorRecoveryManager(config));
 *   const [isOnline, setIsOnline] = useState(() => manager.isOnline());
 *   const [errorCount, setErrorCount] = useState(0);
 * 
 *   useEffect(() => {
 *     const handleEvent = (event: ErrorRecoveryEvent) => {
 *       switch (event.type) {
 *         case 'network-status-changed':
 *           setIsOnline(event.data.isOnline);
 *           break;
 *         case 'error-reported':
 *           setErrorCount(event.data.errorCount);
 *           break;
 *       }
 *     };
 * 
 *     manager.addListener(handleEvent);
 *     return () => manager.removeListener(handleEvent);
 *   }, [manager]);
 * 
 *   useEffect(() => {
 *     return () => manager.destroy();
 *   }, [manager]);
 * 
 *   return {
 *     executeWithRecovery: manager.executeWithRecovery.bind(manager),
 *     isOnline,
 *     errorCount,
 *     resetErrorCount: manager.resetErrorCount.bind(manager),
 *     getNetworkInfo: manager.getNetworkInfo.bind(manager)
 *   };
 * };
 */

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

// Global error recovery manager instance
let globalErrorRecoveryManager: ErrorRecoveryManager | null = null;

export function getGlobalErrorRecoveryManager(): ErrorRecoveryManager {
  if (!globalErrorRecoveryManager) {
    globalErrorRecoveryManager = new ErrorRecoveryManager();
  }
  return globalErrorRecoveryManager;
}

export function destroyGlobalErrorRecoveryManager() {
  if (globalErrorRecoveryManager) {
    globalErrorRecoveryManager.destroy();
    globalErrorRecoveryManager = null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorRecoveryManager;