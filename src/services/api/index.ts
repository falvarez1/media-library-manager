/**
 * API Service
 * Provides a unified interface that switches between mock and real API
 */

import mockApi from '../../mocks/api';
import { realApi } from './realApi';
import { API_CONFIG } from '../../config/api.config';

// Export the appropriate API based on configuration
const baseApi = API_CONFIG.useMockData ? mockApi : realApi;

// Create normalized API structure that works with both mock and real APIs
const normalizedMediaApi = API_CONFIG.useMockData ? {
  // Mock API already has these methods
  getMedia: baseApi.media.getMedia,
  getMediaById: baseApi.media.getMediaById,
  createMedia: baseApi.media.createMedia,
  updateMedia: baseApi.media.updateMedia,
  deleteMedia: baseApi.media.deleteMedia,
  toggleStar: baseApi.media.toggleStar,
  toggleFavorite: baseApi.media.toggleFavorite,
  batchUpdateMedia: baseApi.media.batchUpdateMedia,
  batchDeleteMedia: baseApi.media.batchDeleteMedia,
  getMediaStats: baseApi.media.getMediaStats
} : {
  // Map real API methods to mock API naming convention
  getMedia: baseApi.media.list,
  getMediaById: baseApi.media.get,
  createMedia: baseApi.media.create,
  updateMedia: baseApi.media.update,
  deleteMedia: baseApi.media.delete,
  toggleStar: baseApi.media.toggleStar,
  toggleFavorite: baseApi.media.toggleFavorite,
  batchUpdateMedia: baseApi.media.batchTag,
  batchDeleteMedia: baseApi.media.batchDelete,
  getMediaStats: async () => ({ data: { totalCount: 0 } }) // Not implemented in real API
};

const normalizedFoldersApi = API_CONFIG.useMockData ? {
  getFolders: baseApi.folders.getFolders,
  getFolderById: baseApi.folders.getFolderById,
  createFolder: baseApi.folders.createFolder,
  updateFolder: baseApi.folders.updateFolder,
  deleteFolder: baseApi.folders.deleteFolder,
  getFolderTree: baseApi.folders.getFolderTree,
  getFolderContents: baseApi.folders.getFolderContents
} : {
  getFolders: baseApi.folders.list,
  getFolderById: baseApi.folders.get,
  createFolder: baseApi.folders.create,
  updateFolder: baseApi.folders.update,
  deleteFolder: baseApi.folders.delete,
  getFolderTree: baseApi.folders.getTree,
  getFolderContents: baseApi.folders.getContents
};

const normalizedCollectionsApi = API_CONFIG.useMockData ? {
  getCollections: baseApi.collections.getCollections,
  getCollectionById: baseApi.collections.getCollectionById,
  createCollection: baseApi.collections.createCollection,
  updateCollection: baseApi.collections.updateCollection,
  deleteCollection: baseApi.collections.deleteCollection,
  addItemsToCollection: baseApi.collections.addItemsToCollection,
  removeItemsFromCollection: baseApi.collections.removeItemsFromCollection
} : {
  getCollections: baseApi.collections.list,
  getCollectionById: baseApi.collections.get,
  createCollection: baseApi.collections.create,
  updateCollection: baseApi.collections.update,
  deleteCollection: baseApi.collections.delete,
  addItemsToCollection: baseApi.collections.addItems,
  removeItemsFromCollection: baseApi.collections.removeItems
};

const normalizedTagsApi = API_CONFIG.useMockData ? baseApi.tags : {
  getTags: baseApi.tags.list,
  getTagById: baseApi.tags.get,
  createTag: baseApi.tags.create,
  updateTag: baseApi.tags.update,
  deleteTag: baseApi.tags.delete,
  // Add mock-specific methods with fallbacks
  getTagCategories: async () => ({ data: [] }),
  createTagCategory: async (data: any) => ({ data }),
  updateTagCategory: async (id: string, data: any) => ({ data: { id, ...data } }),
  deleteTagCategory: async () => ({ data: { success: true } }),
  getPopularTags: async () => ({ data: [] }),
  getTagSuggestions: async () => ({ data: [] }),
  batchUpdateTags: async () => ({ data: { success: true, updatedCount: 0 } })
};

const normalizedUsersApi = API_CONFIG.useMockData ? baseApi.users : {
  getCurrentUser: baseApi.users.getCurrent,
  updateUser: baseApi.users.update,
  getPreferences: baseApi.users.getPreferences,
  updatePreferences: baseApi.users.updatePreferences
};

// Ensure consistent API structure
export const api = {
  media: normalizedMediaApi,
  folders: normalizedFoldersApi,
  collections: normalizedCollectionsApi,
  tags: normalizedTagsApi,
  users: normalizedUsersApi,
  mediaOperations: baseApi.mediaOperations || {},
  auth: (baseApi as any).auth || undefined
};

// Export individual API modules for convenience
export const mediaApi = api.media;
export const folderApi = api.folders;
export const collectionApi = api.collections;
export const tagApi = api.tags;
export const userApi = api.users;
export const authApi = api.auth;

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