/**
 * API Service
 * Provides a unified interface that switches between mock and real API
 */

import mockApi from '../../mocks/api';
import { realApi } from './realApi';
import { API_CONFIG } from '../../config/api.config';

// Export the appropriate API based on configuration
export const api = API_CONFIG.useMockData ? mockApi : realApi;

// Export individual API modules for convenience
export const mediaApi = api.media;
export const folderApi = api.folders || (api as any).foldersApi;
export const collectionApi = api.collections || (api as any).collectionsApi;
export const tagApi = api.tags || (api as any).tagsApi;
export const userApi = api.users || (api as any).usersApi;
export const authApi = (api as any).auth || undefined;

// Export configuration helpers
export { API_CONFIG, buildApiUrl, getAuthHeaders, apiRequest } from '../../config/api.config';

// Helper to switch between mock and real API at runtime
export function switchApiMode(useMock: boolean) {
  // Store preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('mlm-use-mock-data', useMock.toString());
    // Reload to apply changes
    window.location.reload();
  }
}

// Helper to check current API mode
export function isUsingMockApi(): boolean {
  return API_CONFIG.useMockData;
}

export default api;