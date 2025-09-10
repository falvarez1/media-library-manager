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
  getMedia: (baseApi.media as any).getMedia,
  getMediaById: (baseApi.media as any).getMediaById,
  createMedia: (baseApi.media as any).createMedia,
  updateMedia: (baseApi.media as any).updateMedia,
  deleteMedia: (baseApi.media as any).deleteMedia,
  toggleStar: (baseApi.media as any).toggleStar,
  toggleFavorite: (baseApi.media as any).toggleFavorite,
  batchUpdateMedia: (baseApi.media as any).batchUpdateMedia,
  batchDeleteMedia: (baseApi.media as any).batchDeleteMedia,
  getMediaStats: (baseApi.media as any).getMediaStats
} : {
  // Map real API methods to mock API naming convention
  getMedia: (baseApi.media as any).list,
  getMediaById: (baseApi.media as any).get,
  createMedia: (baseApi.media as any).create,
  updateMedia: (baseApi.media as any).update,
  deleteMedia: (baseApi.media as any).delete,
  toggleStar: (baseApi.media as any).toggleStar,
  toggleFavorite: (baseApi.media as any).toggleFavorite,
  batchUpdateMedia: (baseApi.media as any).batchTag,
  batchDeleteMedia: (baseApi.media as any).batchDelete,
  getMediaStats: async () => ({ data: { totalCount: 0 } }) // Not implemented in real API
};

const normalizedFoldersApi = API_CONFIG.useMockData ? {
  getFolders: (baseApi.folders as any).getFolders,
  getFolderById: (baseApi.folders as any).getFolderById,
  createFolder: (baseApi.folders as any).createFolder,
  updateFolder: (baseApi.folders as any).updateFolder,
  deleteFolder: (baseApi.folders as any).deleteFolder,
  getFolderTree: (baseApi.folders as any).getFolderTree || (baseApi.folders as any).getTree,
  getFolderContents: (baseApi.folders as any).getFolderContents
} : {
  getFolders: (baseApi.folders as any).list,
  getFolderById: (baseApi.folders as any).get,
  createFolder: (baseApi.folders as any).create,
  updateFolder: (baseApi.folders as any).update,
  deleteFolder: (baseApi.folders as any).delete,
  getFolderTree: (baseApi.folders as any).getTree,
  getFolderContents: (baseApi.folders as any).getContents
};

const normalizedCollectionsApi = API_CONFIG.useMockData ? {
  getCollections: (baseApi.collections as any).getCollections,
  getCollectionById: (baseApi.collections as any).getCollectionById,
  createCollection: (baseApi.collections as any).createCollection,
  updateCollection: (baseApi.collections as any).updateCollection,
  deleteCollection: (baseApi.collections as any).deleteCollection,
  addItemsToCollection: (baseApi.collections as any).addItemsToCollection || (baseApi.collections as any).addToCollection,
  removeItemsFromCollection: (baseApi.collections as any).removeItemsFromCollection || (baseApi.collections as any).removeFromCollection,
  getCollectionContents: (baseApi.collections as any).getCollectionContents || (baseApi.collections as any).getContents
} : {
  getCollections: (baseApi.collections as any).list,
  getCollectionById: (baseApi.collections as any).get,
  createCollection: (baseApi.collections as any).create,
  updateCollection: (baseApi.collections as any).update,
  deleteCollection: (baseApi.collections as any).delete,
  addItemsToCollection: (baseApi.collections as any).addItems,
  removeItemsFromCollection: (baseApi.collections as any).removeItems,
  getCollectionContents: (baseApi.collections as any).getContents
};

// Normalize tags API - both mock and real should use the same interface
const normalizedTagsApi = API_CONFIG.useMockData ? {
  // Map mock API methods to normalized names
  getTags: (baseApi.tags as any).getTags,
  getTagById: (baseApi.tags as any).getTagById,
  createTag: (baseApi.tags as any).createTag,
  updateTag: (baseApi.tags as any).updateTag,
  deleteTag: (baseApi.tags as any).deleteTag,
  getTagCategories: (baseApi.tags as any).getTagCategories,
  createTagCategory: (baseApi.tags as any).createTagCategory,
  updateTagCategory: (baseApi.tags as any).updateTagCategory,
  deleteTagCategory: (baseApi.tags as any).deleteTagCategory,
  getPopularTags: (baseApi.tags as any).getPopularTags,
  getTagSuggestions: (baseApi.tags as any).getTagSuggestions,
  batchUpdateTags: (baseApi.tags as any).batchUpdateTags
} : {
  // Map real API methods to normalized names
  getTags: (baseApi.tags as any).list || (() => Promise.resolve({ data: [] })),
  getTagById: (baseApi.tags as any).get || (() => Promise.resolve({ data: null })),
  createTag: (baseApi.tags as any).create || (() => Promise.resolve({ data: null })),
  updateTag: (baseApi.tags as any).update || (() => Promise.resolve({ data: null })),
  deleteTag: (baseApi.tags as any).delete || (() => Promise.resolve({ data: null })),
  // Add mock-specific methods with fallbacks for real API
  getTagCategories: (baseApi.tags as any).getTagCategories || (async () => ({ data: [] })),
  createTagCategory: (baseApi.tags as any).createTagCategory || (async (data: any) => ({ data })),
  updateTagCategory: (baseApi.tags as any).updateTagCategory || (async (id: string, data: any) => ({ data: { id, ...data } })),
  deleteTagCategory: (baseApi.tags as any).deleteTagCategory || (async () => ({ data: { success: true } })),
  getPopularTags: (baseApi.tags as any).getPopularTags || (async () => ({ data: [] })),
  getTagSuggestions: (baseApi.tags as any).getTagSuggestions || (async () => ({ data: [] })),
  batchUpdateTags: (baseApi.tags as any).batchUpdateTags || (async () => ({ data: { success: true, updatedCount: 0 } }))
};

// Normalize users API
const normalizedUsersApi = API_CONFIG.useMockData ? {
  // Mock API uses these names
  getCurrentUser: (baseApi.users as any).getCurrentUser,
  updateUser: (baseApi.users as any).updateUser,
  getPreferences: (baseApi.users as any).getPreferences,
  updatePreferences: (baseApi.users as any).updatePreferences
} : {
  // Real API uses these names
  getCurrentUser: (baseApi.users as any).getCurrent || (() => Promise.resolve({ data: null })),
  updateUser: (baseApi.users as any).update || (() => Promise.resolve({ data: null })),
  getPreferences: (baseApi.users as any).getPreferences || (() => Promise.resolve({ data: {} })),
  updatePreferences: (baseApi.users as any).updatePreferences || (() => Promise.resolve({ data: {} }))
};

// Ensure consistent API structure
export const api = {
  media: normalizedMediaApi,
  folders: normalizedFoldersApi,
  collections: normalizedCollectionsApi,
  tags: normalizedTagsApi,
  users: normalizedUsersApi,
  mediaOperations: (baseApi as any).mediaOperations || {},
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

// Helper functions for API mode management
export const isUsingMockApi = (): boolean => {
  return API_CONFIG.useMockData;
};

export const switchApiMode = (useMockApi: boolean): void => {
  API_CONFIG.useMockData = useMockApi;
  // Store preference in localStorage for persistence
  if (typeof window !== "undefined") {
    localStorage.setItem("useMockApi", JSON.stringify(useMockApi));
  }
};
