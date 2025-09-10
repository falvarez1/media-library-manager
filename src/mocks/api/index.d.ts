/**
 * Type declarations for the mock API module
 */

import type { 
  MediaItem, 
  Folder, 
  Collection, 
  Tag, 
  User,
  MediaId,
  FolderId,
  CollectionId,
  TagId,
  UserId
} from '../../types';

export interface MockMediaApi {
  getMedia: (params?: any) => Promise<any>;
  getMediaById: (id: MediaId) => Promise<any>;
  createMedia: (data: any) => Promise<any>;
  updateMedia: (id: MediaId, data: any) => Promise<any>;
  deleteMedia: (id: MediaId) => Promise<any>;
  toggleStar: (id: MediaId) => Promise<any>;
  toggleFavorite: (id: MediaId) => Promise<any>;
  batchUpdateMedia: (data: any) => Promise<any>;
  batchDeleteMedia: (ids: MediaId[]) => Promise<any>;
  getMediaStats: () => Promise<any>;
}

export interface MockFoldersApi {
  getFolders: (params?: any) => Promise<any>;
  getFolderById: (id: FolderId) => Promise<any>;
  createFolder: (data: any) => Promise<any>;
  updateFolder: (id: FolderId, data: any) => Promise<any>;
  deleteFolder: (id: FolderId) => Promise<any>;
  moveFolder: (id: FolderId, parentId: FolderId | null) => Promise<any>;
  getFolderContents: (id: FolderId) => Promise<any>;
}

export interface MockCollectionsApi {
  getCollections: (params?: any) => Promise<any>;
  getCollectionById: (id: CollectionId) => Promise<any>;
  createCollection: (data: any) => Promise<any>;
  updateCollection: (id: CollectionId, data: any) => Promise<any>;
  deleteCollection: (id: CollectionId) => Promise<any>;
  addToCollection: (collectionId: CollectionId, mediaIds: MediaId[]) => Promise<any>;
  removeFromCollection: (collectionId: CollectionId, mediaIds: MediaId[]) => Promise<any>;
}

export interface MockTagsApi {
  getTags: (params?: any) => Promise<any>;
  getTagById: (id: TagId) => Promise<any>;
  createTag: (data: any) => Promise<any>;
  updateTag: (id: TagId, data: any) => Promise<any>;
  deleteTag: (id: TagId) => Promise<any>;
  mergeTags: (sourceId: TagId, targetId: TagId) => Promise<any>;
}

export interface MockUsersApi {
  getUsers: () => Promise<any>;
  getUserById: (id: UserId) => Promise<any>;
  getCurrentUser: () => Promise<any>;
  updateUserPreferences: (preferences: any) => Promise<any>;
  deleteRecentSearch: (searchTerm: string) => Promise<any>;
}

export interface MockApi {
  media: MockMediaApi;
  folders: MockFoldersApi;
  collections: MockCollectionsApi;
  tags: MockTagsApi;
  users: MockUsersApi;
}

declare const api: MockApi;
export default api;

export const mediaApi: MockMediaApi;
export const foldersApi: MockFoldersApi;
export const collectionsApi: MockCollectionsApi;
export const tagsApi: MockTagsApi;
export const usersApi: MockUsersApi;