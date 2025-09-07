/**
 * Service Layer Configuration
 *
 * This file contains configuration settings for the service layer,
 * allowing runtime toggling between real API calls and mock data.
 *
 * Configuration can be set through:
 * 1. Environment variables (in .env files or deployment environment)
 * 2. Next.js runtime configuration (in next.config.ts)
 * 3. Local storage (for client-side persistence of user preferences)
 */

import getConfig from 'next/config';
import storage from '../utils/storage';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  /**
   * Use real API instead of mock data
   * Set to false to use mock data, true to use real API calls
   */
  useRealApi: boolean;
  
  /**
   * Base URL for API requests
   */
  apiBaseUrl: string;
  
  /**
   * Authentication settings
   */
  auth: {
    /** Token endpoint for authentication */
    tokenUrl: string;
    /** Refresh token endpoint */
    refreshTokenUrl: string;
  };
  
  /**
   * Mock data configuration (when useRealApi is false)
   */
  mock: {
    /** Delay for mock API responses in milliseconds */
    delay: {
      min: number;
      max: number;
      /** Fixed delay value (overrides min/max when set) */
      fixed: number | null;
    };
    /** Rate at which mock API calls will randomly fail (0-1) */
    errorRate: number;
  };
  
  /**
   * Real API configuration (when useRealApi is true)
   */
  api: {
    /** Timeout for real API requests in milliseconds */
    timeout: number;
    /** Default headers to include with all requests */
    defaultHeaders: Record<string, string>;
    /** Whether to include credentials (cookies) with requests */
    withCredentials: boolean;
  };
  
  /**
   * Update configuration settings and persist to localStorage if in browser
   */
  updateConfig: (newConfig: Partial<ServiceConfig>) => ServiceConfig;
}

/**
 * Data source configuration for localStorage persistence
 */
interface DataSourceConfig {
  useRealApi?: boolean;
  apiBaseUrl?: string;
  mockDelayMin?: number;
  mockDelayMax?: number;
  mockDelayFixed?: number | null;
  mockErrorRate?: number;
}

/**
 * Next.js runtime configuration structure
 */
interface RuntimeConfig {
  publicRuntimeConfig?: {
    apiConfig?: {
      useRealApi?: boolean;
      apiBaseUrl?: string;
    };
    mockConfig?: {
      delayMin?: number;
      delayMax?: number;
      delayFixed?: number | null;
      errorRate?: number;
    };
  };
}

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

// Get Next.js runtime configuration
const nextConfig: RuntimeConfig = getConfig() || {};
const { publicRuntimeConfig = {} } = nextConfig;
const { apiConfig = {}, mockConfig = {} } = publicRuntimeConfig;

/**
 * Utility function to get config value with priority:
 * 1. Local storage (if available)
 * 2. Runtime config
 * 3. Default value
 */
const getConfigValue = <T>(
  key: keyof DataSourceConfig,
  runtimeValue: T | undefined,
  defaultValue: T
): T => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      // Get saved config from localStorage
      const savedConfig = storage.get<DataSourceConfig>('dataSourceConfig', {});
      if (savedConfig[key] !== undefined) {
        return savedConfig[key] as T;
      }
    } catch (e) {
      // Error reading from localStorage - ignore and use fallback
      console.warn('Error reading from localStorage:', e);
    }
  }
  
  return runtimeValue !== undefined ? runtimeValue : defaultValue;
};

/**
 * Update configuration helper with better type safety
 */
const createConfigUpdater = (currentConfig: ServiceConfig) => {
  return (newConfig: Partial<ServiceConfig>): ServiceConfig => {
    // Create a deep copy of the current config
    const updatedConfig: ServiceConfig = {
      ...currentConfig,
      ...newConfig,
      auth: {
        ...currentConfig.auth,
        ...(newConfig.auth || {})
      },
      mock: {
        ...currentConfig.mock,
        ...(newConfig.mock || {}),
        delay: {
          ...currentConfig.mock.delay,
          ...(newConfig.mock?.delay || {})
        }
      },
      api: {
        ...currentConfig.api,
        ...(newConfig.api || {})
      }
    };
    
    // Update the reference to the config object
    Object.assign(config, updatedConfig);
    
    // Persist to localStorage if in browser environment
    if (typeof window !== 'undefined') {
      try {
        const persistConfig: DataSourceConfig = {
          useRealApi: config.useRealApi,
          apiBaseUrl: config.apiBaseUrl,
          mockDelayMin: config.mock.delay.min,
          mockDelayMax: config.mock.delay.max,
          mockDelayFixed: config.mock.delay.fixed,
          mockErrorRate: config.mock.errorRate
        };
        storage.set('dataSourceConfig', persistConfig);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    
    return updatedConfig;
  };
};

// ============================================================================
// MAIN CONFIGURATION OBJECT
// ============================================================================

const config: ServiceConfig = {
  /**
   * Use real API instead of mock data
   * Set to false to use mock data, true to use real API calls
   */
  useRealApi: getConfigValue('useRealApi', apiConfig.useRealApi, false),
  
  /**
   * Base URL for API requests
   */
  apiBaseUrl: getConfigValue('apiBaseUrl', apiConfig.apiBaseUrl, 'http://localhost:5005'),
  
  /**
   * Authentication settings
   */
  auth: {
    // Token endpoint for authentication
    tokenUrl: '/auth/token',
    // Refresh token endpoint
    refreshTokenUrl: '/auth/refresh'
  },
  
  /**
   * Mock data configuration (when useRealApi is false)
   */
  mock: {
    // Delay for mock API responses in milliseconds (random between min and max)
    delay: {
      min: getConfigValue('mockDelayMin', mockConfig.delayMin, 200),
      max: getConfigValue('mockDelayMax', mockConfig.delayMax, 800),
      // Fixed delay value (overrides min/max when set)
      fixed: getConfigValue('mockDelayFixed', mockConfig.delayFixed, null)
    },
    
    // Rate at which mock API calls will randomly fail (0-1)
    errorRate: getConfigValue('mockErrorRate', mockConfig.errorRate, 0.05)
  },
  
  /**
   * Real API configuration (when useRealApi is true)
   */
  api: {
    // Timeout for real API requests in milliseconds
    timeout: 30000,
    
    // Default headers to include with all requests
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    
    // Whether to include credentials (cookies) with requests
    withCredentials: true
  },
  
  /**
   * Update configuration settings and persist to localStorage if in browser
   */
  updateConfig: function(newConfig: Partial<ServiceConfig>): ServiceConfig {
    return createConfigUpdater(this)(newConfig);
  }
};

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Environment-specific configuration
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiVersion: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
} as const;

/**
 * Default timeout values for different operations
 */
export const TIMEOUTS = {
  SHORT: 5000,   // 5 seconds
  MEDIUM: 15000, // 15 seconds
  LONG: 30000,   // 30 seconds
  UPLOAD: 120000 // 2 minutes
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504]
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if current environment is development
 */
export const isDevelopment = (): boolean => ENV_CONFIG.isDevelopment;

/**
 * Check if current environment is production
 */
export const isProduction = (): boolean => ENV_CONFIG.isProduction;

/**
 * Check if current environment is test
 */
export const isTest = (): boolean => ENV_CONFIG.isTest;

/**
 * Get full API URL with version
 */
export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = config.apiBaseUrl.endsWith('/') 
    ? config.apiBaseUrl.slice(0, -1) 
    : config.apiBaseUrl;
  const versionedPath = `/api/${ENV_CONFIG.apiVersion}`;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${versionedPath}${cleanEndpoint}`;
};

/**
 * Get mock delay based on configuration
 */
export const getMockDelay = (): number => {
  if (config.mock.delay.fixed !== null) {
    return config.mock.delay.fixed;
  }
  
  const { min, max } = config.mock.delay;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Check if mock error should occur
 */
export const shouldMockError = (): boolean => {
  return Math.random() < config.mock.errorRate;
};

/**
 * Reset configuration to defaults
 */
export const resetConfig = (): ServiceConfig => {
  const defaultConfig: Partial<ServiceConfig> = {
    useRealApi: false,
    apiBaseUrl: 'http://localhost:5005',
    mock: {
      delay: {
        min: 200,
        max: 800,
        fixed: null
      },
      errorRate: 0.05
    }
  };
  
  return config.updateConfig(defaultConfig);
};

export default config;