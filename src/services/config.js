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

// Get Next.js runtime configuration
const { publicRuntimeConfig = {} } = getConfig() || {};
const { apiConfig = {}, mockConfig = {} } = publicRuntimeConfig;

// Utility function to get config value with priority:
// 1. Local storage (if available)
// 2. Runtime config
// 3. Default value
const getConfigValue = (key, runtimeValue, defaultValue) => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      // Get saved config from localStorage
      const savedConfig = JSON.parse(localStorage.getItem('dataSourceConfig') || '{}');
      if (savedConfig[key] !== undefined) {
        return savedConfig[key];
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
  }
  
  return runtimeValue !== undefined ? runtimeValue : defaultValue;
};

const config = {
  /**
   * Use real API instead of mock data
   * Set to false to use mock data, true to use real API calls
   */
  useRealApi: getConfigValue('useRealApi', apiConfig.useRealApi, false),
  
  /**
   * Base URL for API requests
   */
  apiBaseUrl: getConfigValue('apiBaseUrl', apiConfig.apiBaseUrl, 'https://api.medialibrary.example.com/v1'),
  
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
      'Content-Type': 'application/json'
    },
    
    // Whether to include credentials (cookies) with requests
    withCredentials: true
  },
  
  /**
   * Update configuration settings and persist to localStorage if in browser
   * @param {Object} newConfig - New configuration values to apply
   */
  updateConfig: (newConfig) => {
    // Update the current config object
    Object.keys(newConfig).forEach(key => {
      if (key === 'mock' && typeof newConfig.mock === 'object') {
        Object.keys(newConfig.mock).forEach(mockKey => {
          if (mockKey === 'delay' && typeof newConfig.mock.delay === 'object') {
            Object.keys(newConfig.mock.delay).forEach(delayKey => {
              config.mock.delay[delayKey] = newConfig.mock.delay[delayKey];
            });
          } else {
            config.mock[mockKey] = newConfig.mock[mockKey];
          }
        });
      } else {
        config[key] = newConfig[key];
      }
    });
    
    // Persist to localStorage if in browser environment
    if (typeof window !== 'undefined') {
      try {
        const persistConfig = {
          useRealApi: config.useRealApi,
          apiBaseUrl: config.apiBaseUrl,
          mockDelayMin: config.mock.delay.min,
          mockDelayMax: config.mock.delay.max,
          mockDelayFixed: config.mock.delay.fixed,
          mockErrorRate: config.mock.errorRate
        };
        localStorage.setItem('dataSourceConfig', JSON.stringify(persistConfig));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    
    return config;
  }
};

export default config;