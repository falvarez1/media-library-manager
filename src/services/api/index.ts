/**
 * API Service
 * Provides a unified interface that switches between mock and real API
 */

import mockApi from '../../mocks/api';
import { realApi } from './realApi';
import { API_CONFIG } from '../../config/api.config';
import {
  ApiServiceInterface,
  MediaApiInterface,
  FoldersApiInterface,
  CollectionsApiInterface,
  TagsApiInterface,
  UsersApiInterface,
  MockApiService,
  RealApiService,
  MockMediaApi,
  MockFoldersApi,
  MockCollectionsApi,
  MockTagsApi,
  MockUsersApi,
  RealMediaApi,
  RealFoldersApi,
  RealCollectionsApi,
  RealTagsApi,
  RealUsersApi
} from '../../types/apiService.types';

// Type the imported APIs
const typedMockApi = mockApi as MockApiService;
const typedRealApi = realApi as RealApiService;

// Export the appropriate API based on configuration
const baseApi = API_CONFIG.useMockData ? typedMockApi : typedRealApi;

// Create normalized API structure that works with both mock and real APIs
const normalizedMediaApi: MediaApiInterface = API_CONFIG.useMockData ? {
  // Mock API already has these methods
  getMedia: (typedMockApi.media as MockMediaApi).getMedia,
  getMediaById: (typedMockApi.media as MockMediaApi).getMediaById,
  createMedia: (typedMockApi.media as MockMediaApi).createMedia,
  updateMedia: (typedMockApi.media as MockMediaApi).updateMedia,
  deleteMedia: (typedMockApi.media as MockMediaApi).deleteMedia,
  toggleStar: (typedMockApi.media as MockMediaApi).toggleStar,
  toggleFavorite: (typedMockApi.media as MockMediaApi).toggleFavorite,
  batchUpdateMedia: (typedMockApi.media as MockMediaApi).batchUpdateMedia,
  batchDeleteMedia: (typedMockApi.media as MockMediaApi).batchDeleteMedia,
  getMediaStats: (typedMockApi.media as MockMediaApi).getMediaStats
} : {
  // Map real API methods to mock API naming convention
  getMedia: (typedRealApi.media as RealMediaApi).list || (async () => ({ data: [], total: 0, page: 1, pageSize: 20 })),
  getMediaById: (typedRealApi.media as RealMediaApi).get || (async () => ({ data: null })),
  createMedia: (typedRealApi.media as RealMediaApi).create || (async () => ({ data: null })),
  updateMedia: (typedRealApi.media as RealMediaApi).update || (async () => ({ data: null })),
  deleteMedia: (typedRealApi.media as RealMediaApi).delete || (async () => ({ data: { success: false } })),
  toggleStar: (typedRealApi.media as RealMediaApi).toggleStar || (async () => ({ data: null })),
  toggleFavorite: (typedRealApi.media as RealMediaApi).toggleFavorite || (async () => ({ data: null })),
  batchUpdateMedia: (typedRealApi.media as RealMediaApi).batchTag || (async () => ({ data: { updated: 0, failed: 0 } })),
  batchDeleteMedia: (typedRealApi.media as RealMediaApi).batchDelete || (async () => ({ data: { deleted: 0, failed: 0 } })),
  getMediaStats: async () => ({ data: { totalCount: 0 } }) // Not implemented in real API
};

const normalizedFoldersApi: FoldersApiInterface = API_CONFIG.useMockData ? {
  getFolders: (typedMockApi.folders as MockFoldersApi).getFolders,
  getFolderById: (typedMockApi.folders as MockFoldersApi).getFolderById,
  createFolder: (typedMockApi.folders as MockFoldersApi).createFolder,
  updateFolder: (typedMockApi.folders as MockFoldersApi).updateFolder,
  deleteFolder: (typedMockApi.folders as MockFoldersApi).deleteFolder,
  getFolderTree: (typedMockApi.folders as MockFoldersApi).getFolderTree || (typedMockApi.folders as MockFoldersApi).getTree || (async () => ({ data: [] })),
  getFolderContents: (typedMockApi.folders as MockFoldersApi).getFolderContents
} : {
  getFolders: (typedRealApi.folders as RealFoldersApi).list || (async () => ({ data: [], total: 0, page: 1, pageSize: 20 })),
  getFolderById: (typedRealApi.folders as RealFoldersApi).get || (async () => ({ data: null })),
  createFolder: (typedRealApi.folders as RealFoldersApi).create || (async () => ({ data: null })),
  updateFolder: (typedRealApi.folders as RealFoldersApi).update || (async () => ({ data: null })),
  deleteFolder: (typedRealApi.folders as RealFoldersApi).delete || (async () => ({ data: { success: false } })),
  getFolderTree: (typedRealApi.folders as RealFoldersApi).getTree || (async () => ({ data: [] })),
  getFolderContents: (typedRealApi.folders as RealFoldersApi).getContents || (async () => ({ data: { folders: [], media: [] } }))
};

const normalizedCollectionsApi: CollectionsApiInterface = API_CONFIG.useMockData ? {
  getCollections: (typedMockApi.collections as MockCollectionsApi).getCollections,
  getCollectionById: (typedMockApi.collections as MockCollectionsApi).getCollectionById,
  createCollection: (typedMockApi.collections as MockCollectionsApi).createCollection,
  updateCollection: (typedMockApi.collections as MockCollectionsApi).updateCollection,
  deleteCollection: (typedMockApi.collections as MockCollectionsApi).deleteCollection,
  addItemsToCollection: (typedMockApi.collections as MockCollectionsApi).addItemsToCollection || 
                        (typedMockApi.collections as MockCollectionsApi).addToCollection || 
                        (async () => ({ data: { added: 0 } })),
  removeItemsFromCollection: (typedMockApi.collections as MockCollectionsApi).removeItemsFromCollection || 
                             (typedMockApi.collections as MockCollectionsApi).removeFromCollection || 
                             (async () => ({ data: { removed: 0 } })),
  getCollectionContents: (typedMockApi.collections as MockCollectionsApi).getCollectionContents || 
                        (typedMockApi.collections as MockCollectionsApi).getContents || 
                        (async () => ({ data: [] }))
} : {
  getCollections: (typedRealApi.collections as RealCollectionsApi).list || (async () => ({ data: [], total: 0, page: 1, pageSize: 20 })),
  getCollectionById: (typedRealApi.collections as RealCollectionsApi).get || (async () => ({ data: null })),
  createCollection: (typedRealApi.collections as RealCollectionsApi).create || (async () => ({ data: null })),
  updateCollection: (typedRealApi.collections as RealCollectionsApi).update || (async () => ({ data: null })),
  deleteCollection: (typedRealApi.collections as RealCollectionsApi).delete || (async () => ({ data: { success: false } })),
  addItemsToCollection: (typedRealApi.collections as RealCollectionsApi).addItems || (async () => ({ data: { added: 0 } })),
  removeItemsFromCollection: (typedRealApi.collections as RealCollectionsApi).removeItems || (async () => ({ data: { removed: 0 } })),
  getCollectionContents: (typedRealApi.collections as RealCollectionsApi).getContents || (async () => ({ data: [] }))
};

// Normalize tags API - both mock and real should use the same interface
const normalizedTagsApi: TagsApiInterface = API_CONFIG.useMockData ? {
  // Map mock API methods to normalized names
  getTags: (typedMockApi.tags as MockTagsApi).getTags,
  getTagById: (typedMockApi.tags as MockTagsApi).getTagById,
  createTag: (typedMockApi.tags as MockTagsApi).createTag,
  updateTag: (typedMockApi.tags as MockTagsApi).updateTag,
  deleteTag: (typedMockApi.tags as MockTagsApi).deleteTag,
  getTagCategories: (typedMockApi.tags as MockTagsApi).getTagCategories,
  createTagCategory: (typedMockApi.tags as MockTagsApi).createTagCategory,
  updateTagCategory: (typedMockApi.tags as MockTagsApi).updateTagCategory,
  deleteTagCategory: (typedMockApi.tags as MockTagsApi).deleteTagCategory,
  getPopularTags: (typedMockApi.tags as MockTagsApi).getPopularTags,
  getTagSuggestions: (typedMockApi.tags as MockTagsApi).getTagSuggestions,
  batchUpdateTags: (typedMockApi.tags as MockTagsApi).batchUpdateTags
} : {
  // Map real API methods to normalized names
  getTags: (typedRealApi.tags as RealTagsApi).list || (async () => ({ data: [] })),
  getTagById: (typedRealApi.tags as RealTagsApi).get || (async () => ({ data: null })),
  createTag: (typedRealApi.tags as RealTagsApi).create || (async () => ({ data: null })),
  updateTag: (typedRealApi.tags as RealTagsApi).update || (async () => ({ data: null })),
  deleteTag: (typedRealApi.tags as RealTagsApi).delete || (async () => ({ data: { success: false } })),
  // Add mock-specific methods with fallbacks for real API
  getTagCategories: (typedRealApi.tags as RealTagsApi).getTagCategories || (async () => ({ data: [] })),
  createTagCategory: (typedRealApi.tags as RealTagsApi).createTagCategory || (async (data) => ({ data })),
  updateTagCategory: (typedRealApi.tags as RealTagsApi).updateTagCategory || (async (id, data) => ({ data: { id, ...data } })),
  deleteTagCategory: (typedRealApi.tags as RealTagsApi).deleteTagCategory || (async () => ({ data: { success: true } })),
  getPopularTags: (typedRealApi.tags as RealTagsApi).getPopularTags || (async () => ({ data: [] })),
  getTagSuggestions: (typedRealApi.tags as RealTagsApi).getTagSuggestions || (async () => ({ data: [] })),
  batchUpdateTags: (typedRealApi.tags as RealTagsApi).batchUpdateTags || (async () => ({ data: { success: true, updatedCount: 0 } }))
};

// Normalize users API
const normalizedUsersApi: UsersApiInterface = API_CONFIG.useMockData ? {
  // Mock API uses these names
  getCurrentUser: (typedMockApi.users as MockUsersApi).getCurrentUser,
  updateUser: (typedMockApi.users as MockUsersApi).updateUser,
  getPreferences: (typedMockApi.users as MockUsersApi).getPreferences,
  updatePreferences: (typedMockApi.users as MockUsersApi).updatePreferences
} : {
  // Real API uses these names
  getCurrentUser: (typedRealApi.users as RealUsersApi).getCurrent || (async () => ({ data: null })),
  updateUser: (typedRealApi.users as RealUsersApi).update || (async () => ({ data: null })),
  getPreferences: (typedRealApi.users as RealUsersApi).getPreferences || (async () => ({ data: {} })),
  updatePreferences: (typedRealApi.users as RealUsersApi).updatePreferences || (async () => ({ data: {} }))
};

// Ensure consistent API structure
export const api: ApiServiceInterface = {
  media: normalizedMediaApi,
  folders: normalizedFoldersApi,
  collections: normalizedCollectionsApi,
  tags: normalizedTagsApi,
  users: normalizedUsersApi,
  mediaOperations: baseApi.mediaOperations || {},
  auth: baseApi.auth || undefined
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
    localStorage.setItem("mlm-use-mock-data", String(useMockApi));
    // Reload the page to apply the new API mode
    window.location.reload();
  }
};