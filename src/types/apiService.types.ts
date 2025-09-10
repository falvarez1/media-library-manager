/**
 * API Service Type Definitions
 * Defines the interface for both mock and real API implementations
 */

import { 
  ApiResponse, 
  PaginatedResponse, 
  MediaId, 
  FolderId, 
  CollectionId,
  TagId
} from './common.types';
import { 
  MediaItem, 
  MediaQuery, 
  CreateMediaItem, 
  UpdateMediaItem 
} from './media.types';
import { 
  Folder, 
  FolderQuery, 
  CreateFolder, 
  UpdateFolder 
} from './folder.types';
import { 
  Collection, 
  CollectionQuery, 
  CreateCollection, 
  UpdateCollection 
} from './collection.types';
import { 
  User, 
  UpdateUser, 
  UserPreferences 
} from './auth.types';

// ============================================================================
// MEDIA API INTERFACE
// ============================================================================

export interface MediaApiInterface {
  getMedia(query?: MediaQuery): Promise<PaginatedResponse<MediaItem>>;
  getMediaById(id: MediaId): Promise<ApiResponse<MediaItem>>;
  createMedia(data: CreateMediaItem): Promise<ApiResponse<MediaItem>>;
  updateMedia(id: MediaId, data: UpdateMediaItem): Promise<ApiResponse<MediaItem>>;
  deleteMedia(id: MediaId): Promise<ApiResponse<{ success: boolean }>>;
  toggleStar(id: MediaId): Promise<ApiResponse<MediaItem>>;
  toggleFavorite(id: MediaId): Promise<ApiResponse<MediaItem>>;
  batchUpdateMedia(ids: MediaId[], updates: Partial<UpdateMediaItem>): Promise<ApiResponse<{ updated: number; failed: number }>>;
  batchDeleteMedia(ids: MediaId[]): Promise<ApiResponse<{ deleted: number; failed: number }>>;
  getMediaStats(): Promise<ApiResponse<{ totalCount: number }>>;
}

// ============================================================================
// FOLDERS API INTERFACE
// ============================================================================

export interface FoldersApiInterface {
  getFolders(query?: FolderQuery): Promise<PaginatedResponse<Folder>>;
  getFolderById(id: FolderId): Promise<ApiResponse<Folder>>;
  createFolder(data: CreateFolder): Promise<ApiResponse<Folder>>;
  updateFolder(id: FolderId, data: UpdateFolder): Promise<ApiResponse<Folder>>;
  deleteFolder(id: FolderId): Promise<ApiResponse<{ success: boolean }>>;
  getFolderTree(): Promise<ApiResponse<Folder[]>>;
  getFolderContents(id: FolderId): Promise<ApiResponse<{ folders: Folder[]; media: MediaItem[] }>>;
}

// ============================================================================
// COLLECTIONS API INTERFACE
// ============================================================================

export interface CollectionsApiInterface {
  getCollections(query?: CollectionQuery): Promise<PaginatedResponse<Collection>>;
  getCollectionById(id: CollectionId): Promise<ApiResponse<Collection>>;
  createCollection(data: CreateCollection): Promise<ApiResponse<Collection>>;
  updateCollection(id: CollectionId, data: UpdateCollection): Promise<ApiResponse<Collection>>;
  deleteCollection(id: CollectionId): Promise<ApiResponse<{ success: boolean }>>;
  addItemsToCollection(id: CollectionId, mediaIds: MediaId[]): Promise<ApiResponse<{ added: number }>>;
  removeItemsFromCollection(id: CollectionId, mediaIds: MediaId[]): Promise<ApiResponse<{ removed: number }>>;
  getCollectionContents(id: CollectionId): Promise<ApiResponse<MediaItem[]>>;
}

// ============================================================================
// TAGS API INTERFACE
// ============================================================================

export interface Tag {
  id: TagId;
  name: string;
  color?: string;
  categoryId?: string;
  usageCount?: number;
}

export interface TagCategory {
  id: string;
  name: string;
  color?: string;
  tags?: Tag[];
}

export interface TagsApiInterface {
  getTags(): Promise<ApiResponse<Tag[]>>;
  getTagById(id: TagId): Promise<ApiResponse<Tag>>;
  createTag(data: Partial<Tag>): Promise<ApiResponse<Tag>>;
  updateTag(id: TagId, data: Partial<Tag>): Promise<ApiResponse<Tag>>;
  deleteTag(id: TagId): Promise<ApiResponse<{ success: boolean }>>;
  getTagCategories(): Promise<ApiResponse<TagCategory[]>>;
  createTagCategory(data: Partial<TagCategory>): Promise<ApiResponse<TagCategory>>;
  updateTagCategory(id: string, data: Partial<TagCategory>): Promise<ApiResponse<TagCategory>>;
  deleteTagCategory(id: string): Promise<ApiResponse<{ success: boolean }>>;
  getPopularTags(limit?: number): Promise<ApiResponse<Tag[]>>;
  getTagSuggestions(query: string): Promise<ApiResponse<Tag[]>>;
  batchUpdateTags(updates: Array<{ id: TagId; data: Partial<Tag> }>): Promise<ApiResponse<{ success: boolean; updatedCount: number }>>;
}

// ============================================================================
// USERS API INTERFACE
// ============================================================================

export interface UsersApiInterface {
  getCurrentUser(): Promise<ApiResponse<User | null>>;
  updateUser(id: string, data: UpdateUser): Promise<ApiResponse<User>>;
  getPreferences(): Promise<ApiResponse<UserPreferences>>;
  updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>>;
}

// ============================================================================
// COMPLETE API INTERFACE
// ============================================================================

export interface ApiServiceInterface {
  media: MediaApiInterface;
  folders: FoldersApiInterface;
  collections: CollectionsApiInterface;
  tags: TagsApiInterface;
  users: UsersApiInterface;
  mediaOperations?: any; // Legacy, to be defined
  auth?: any; // Auth API if needed
}

// ============================================================================
// MOCK API INTERFACE (for typing the mock imports)
// ============================================================================

export interface MockMediaApi {
  getMedia: MediaApiInterface['getMedia'];
  getMediaById: MediaApiInterface['getMediaById'];
  createMedia: MediaApiInterface['createMedia'];
  updateMedia: MediaApiInterface['updateMedia'];
  deleteMedia: MediaApiInterface['deleteMedia'];
  toggleStar: MediaApiInterface['toggleStar'];
  toggleFavorite: MediaApiInterface['toggleFavorite'];
  batchUpdateMedia: MediaApiInterface['batchUpdateMedia'];
  batchDeleteMedia: MediaApiInterface['batchDeleteMedia'];
  getMediaStats: MediaApiInterface['getMediaStats'];
}

export interface MockFoldersApi {
  getFolders: FoldersApiInterface['getFolders'];
  getFolderById: FoldersApiInterface['getFolderById'];
  createFolder: FoldersApiInterface['createFolder'];
  updateFolder: FoldersApiInterface['updateFolder'];
  deleteFolder: FoldersApiInterface['deleteFolder'];
  getFolderTree?: FoldersApiInterface['getFolderTree'];
  getTree?: FoldersApiInterface['getFolderTree'];
  getFolderContents: FoldersApiInterface['getFolderContents'];
}

export interface MockCollectionsApi {
  getCollections: CollectionsApiInterface['getCollections'];
  getCollectionById: CollectionsApiInterface['getCollectionById'];
  createCollection: CollectionsApiInterface['createCollection'];
  updateCollection: CollectionsApiInterface['updateCollection'];
  deleteCollection: CollectionsApiInterface['deleteCollection'];
  addItemsToCollection?: CollectionsApiInterface['addItemsToCollection'];
  addToCollection?: CollectionsApiInterface['addItemsToCollection'];
  removeItemsFromCollection?: CollectionsApiInterface['removeItemsFromCollection'];
  removeFromCollection?: CollectionsApiInterface['removeItemsFromCollection'];
  getCollectionContents?: CollectionsApiInterface['getCollectionContents'];
  getContents?: CollectionsApiInterface['getCollectionContents'];
}

export interface MockTagsApi {
  getTags: TagsApiInterface['getTags'];
  getTagById: TagsApiInterface['getTagById'];
  createTag: TagsApiInterface['createTag'];
  updateTag: TagsApiInterface['updateTag'];
  deleteTag: TagsApiInterface['deleteTag'];
  getTagCategories: TagsApiInterface['getTagCategories'];
  createTagCategory: TagsApiInterface['createTagCategory'];
  updateTagCategory: TagsApiInterface['updateTagCategory'];
  deleteTagCategory: TagsApiInterface['deleteTagCategory'];
  getPopularTags: TagsApiInterface['getPopularTags'];
  getTagSuggestions: TagsApiInterface['getTagSuggestions'];
  batchUpdateTags: TagsApiInterface['batchUpdateTags'];
}

export interface MockUsersApi {
  getCurrentUser: UsersApiInterface['getCurrentUser'];
  updateUser: UsersApiInterface['updateUser'];
  getPreferences: UsersApiInterface['getPreferences'];
  updatePreferences: UsersApiInterface['updatePreferences'];
}

export interface MockApiService {
  media: MockMediaApi;
  folders: MockFoldersApi;
  collections: MockCollectionsApi;
  tags: MockTagsApi;
  users: MockUsersApi;
  mediaOperations?: any;
  auth?: any;
}

// ============================================================================
// REAL API INTERFACE (for typing the real API imports)
// ============================================================================

export interface RealMediaApi {
  list?: MediaApiInterface['getMedia'];
  get?: MediaApiInterface['getMediaById'];
  create?: MediaApiInterface['createMedia'];
  update?: MediaApiInterface['updateMedia'];
  delete?: MediaApiInterface['deleteMedia'];
  toggleStar?: MediaApiInterface['toggleStar'];
  toggleFavorite?: MediaApiInterface['toggleFavorite'];
  batchTag?: MediaApiInterface['batchUpdateMedia'];
  batchDelete?: MediaApiInterface['batchDeleteMedia'];
}

export interface RealFoldersApi {
  list?: FoldersApiInterface['getFolders'];
  get?: FoldersApiInterface['getFolderById'];
  create?: FoldersApiInterface['createFolder'];
  update?: FoldersApiInterface['updateFolder'];
  delete?: FoldersApiInterface['deleteFolder'];
  getTree?: FoldersApiInterface['getFolderTree'];
  getContents?: FoldersApiInterface['getFolderContents'];
}

export interface RealCollectionsApi {
  list?: CollectionsApiInterface['getCollections'];
  get?: CollectionsApiInterface['getCollectionById'];
  create?: CollectionsApiInterface['createCollection'];
  update?: CollectionsApiInterface['updateCollection'];
  delete?: CollectionsApiInterface['deleteCollection'];
  addItems?: CollectionsApiInterface['addItemsToCollection'];
  removeItems?: CollectionsApiInterface['removeItemsFromCollection'];
  getContents?: CollectionsApiInterface['getCollectionContents'];
}

export interface RealTagsApi {
  list?: TagsApiInterface['getTags'];
  get?: TagsApiInterface['getTagById'];
  create?: TagsApiInterface['createTag'];
  update?: TagsApiInterface['updateTag'];
  delete?: TagsApiInterface['deleteTag'];
  getTagCategories?: TagsApiInterface['getTagCategories'];
  createTagCategory?: TagsApiInterface['createTagCategory'];
  updateTagCategory?: TagsApiInterface['updateTagCategory'];
  deleteTagCategory?: TagsApiInterface['deleteTagCategory'];
  getPopularTags?: TagsApiInterface['getPopularTags'];
  getTagSuggestions?: TagsApiInterface['getTagSuggestions'];
  batchUpdateTags?: TagsApiInterface['batchUpdateTags'];
}

export interface RealUsersApi {
  getCurrent?: UsersApiInterface['getCurrentUser'];
  update?: UsersApiInterface['updateUser'];
  getPreferences?: UsersApiInterface['getPreferences'];
  updatePreferences?: UsersApiInterface['updatePreferences'];
}

export interface RealApiService {
  media: RealMediaApi;
  folders: RealFoldersApi;
  collections: RealCollectionsApi;
  tags: RealTagsApi;
  users: RealUsersApi;
  mediaOperations?: any;
  auth?: any;
}