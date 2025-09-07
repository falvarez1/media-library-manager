/**
 * Service Layer for the Media Library Manager
 * 
 * This file serves as the main entry point for the service layer.
 * It exports the appropriate API services based on configuration,
 * allowing runtime toggling between real API calls and mock data.
 */

import config from './config';

// Import real API services
import mediaService from './api/mediaService';
import mediaOperationsService from './api/mediaOperations';
import foldersService from './api/foldersService';
import collectionsService from './api/collectionsService';
import tagsService from './api/tagsService';
import usersService from './api/usersService';

// Import mock API services (with proper type annotations)
import mockMediaApi from '../mocks/api/mediaApi';
import mockFoldersApi from '../mocks/api/foldersApi';
import mockCollectionsApi from '../mocks/api/collectionsApi';
import mockTagsApi from '../mocks/api/tagsApi';
import mockUsersApi from '../mocks/api/usersApi';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Media API service type
 */
export type MediaApiService = typeof mediaService;

/**
 * Media operations API service type
 */
export type MediaOperationsApiService = typeof mediaOperationsService;

/**
 * Folders API service type
 */
export type FoldersApiService = typeof foldersService;

/**
 * Collections API service type
 */
export type CollectionsApiService = typeof collectionsService;

/**
 * Tags API service type
 */
export type TagsApiService = typeof tagsService;

/**
 * Users API service type
 */
export type UsersApiService = typeof usersService;

/**
 * Combined API service interface
 */
export interface ApiServices {
  media: MediaApiService;
  mediaOperations: MediaOperationsApiService;
  folders: FoldersApiService;
  collections: CollectionsApiService;
  tags: TagsApiService;
  users: UsersApiService;
}

/**
 * Service selection function type
 */
type ServiceSelector = <T, U>(realApi: T, mockApi: U) => T | U;

// ============================================================================
// SERVICE SELECTION LOGIC
// ============================================================================

/**
 * Selects the appropriate API implementation based on configuration
 * @param realApi - Real API implementation
 * @param mockApi - Mock API implementation
 * @returns Selected API implementation
 */
const selectService: ServiceSelector = <T, U>(realApi: T, mockApi: U): T | U => {
  return config.useRealApi ? realApi : mockApi;
};

/**
 * Get the current service configuration status
 */
export const getServiceStatus = () => ({
  useRealApi: config.useRealApi,
  apiBaseUrl: config.apiBaseUrl,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

/**
 * Switch between real and mock APIs at runtime
 * @param useReal - Whether to use real API
 * @returns Updated service configuration
 */
export const switchApiMode = (useReal: boolean) => {
  return config.updateConfig({ useRealApi: useReal });
};

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

// Export individual services based on configuration
export const mediaApi = selectService(mediaService, mockMediaApi) as MediaApiService;
export const mediaOperationsApi = mediaOperationsService; // Always use real implementation for operations
export const foldersApi = selectService(foldersService, mockFoldersApi) as FoldersApiService;
export const collectionsApi = selectService(collectionsService, mockCollectionsApi) as CollectionsApiService;
export const tagsApi = selectService(tagsService, mockTagsApi) as TagsApiService;
export const usersApi = selectService(usersService, mockUsersApi) as UsersApiService;

/**
 * Combined API object that includes all services
 * This is the main export that most components should use
 */
const api: ApiServices = {
  media: mediaApi,
  mediaOperations: mediaOperationsApi,
  folders: foldersApi,
  collections: collectionsApi,
  tags: tagsApi,
  users: usersApi
};

// ============================================================================
// ADDITIONAL UTILITY EXPORTS
// ============================================================================

/**
 * Re-export configuration for convenience
 */
export { default as config } from './config';

/**
 * Re-export individual real services for direct access if needed
 */
export const realServices = {
  media: mediaService,
  mediaOperations: mediaOperationsService,
  folders: foldersService,
  collections: collectionsService,
  tags: tagsService,
  users: usersService
} as const;

/**
 * Re-export individual mock services for direct access if needed
 */
export const mockServices = {
  media: mockMediaApi,
  folders: mockFoldersApi,
  collections: mockCollectionsApi,
  tags: mockTagsApi,
  users: mockUsersApi
} as const;

/**
 * Helper function to check if a service is using the real API
 * @param serviceName - Name of the service to check
 * @returns Whether the service is using real API
 */
export const isUsingRealApi = (serviceName?: keyof ApiServices): boolean => {
  if (serviceName === 'mediaOperations') {
    return true; // Always uses real API
  }
  return config.useRealApi;
};

/**
 * Helper function to get service information
 * @returns Object containing service status and metadata
 */
export const getServiceInfo = () => ({
  status: getServiceStatus(),
  services: {
    media: { type: config.useRealApi ? 'real' : 'mock', available: true },
    mediaOperations: { type: 'real', available: true },
    folders: { type: config.useRealApi ? 'real' : 'mock', available: true },
    collections: { type: config.useRealApi ? 'real' : 'mock', available: true },
    tags: { type: config.useRealApi ? 'real' : 'mock', available: true },
    users: { type: config.useRealApi ? 'real' : 'mock', available: true }
  },
  lastUpdated: new Date().toISOString()
});

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default api;