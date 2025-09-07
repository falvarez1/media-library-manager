/**
 * API types for the Media Library Manager
 * 
 * This file contains all types related to API requests, responses,
 * error handling, and service interactions.
 */

import {
  MediaId,
  FolderId,
  CollectionId,
  UserId,
  TagId,
  ISO8601String,
  ApiResponse,
  PaginatedResponse,
  BaseQuery,
  ApiError
} from './common.types';

import { MediaItem, MediaQuery, CreateMediaItem, UpdateMediaItem, BatchOperationRequest as MediaBatchOperationRequest } from './media.types';
import { Folder, FolderQuery, CreateFolder, UpdateFolder, BulkFolderOperation } from './folder.types';
import { Collection, CollectionQuery, CreateCollection, UpdateCollection, BulkCollectionOperation } from './collection.types';
import { User, UserQuery, CreateUser, UpdateUser, AuthCredentials, AuthResponse } from './auth.types';

// ============================================================================
// BASE API TYPES
// ============================================================================

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
  withCredentials: boolean;
  apiVersion: string;
}

/**
 * Request options
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

/**
 * API endpoint definition
 */
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  authenticated?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

// ============================================================================
// MEDIA API TYPES
// ============================================================================

/**
 * Media API requests
 */
export interface MediaApiRequests {
  getMedia: {
    params?: MediaQuery;
    response: PaginatedResponse<MediaItem>;
  };
  
  getMediaById: {
    params: { id: MediaId };
    response: ApiResponse<MediaItem>;
  };
  
  createMedia: {
    body: CreateMediaItem;
    response: ApiResponse<MediaItem>;
  };
  
  updateMedia: {
    params: { id: MediaId };
    body: UpdateMediaItem;
    response: ApiResponse<MediaItem>;
  };
  
  deleteMedia: {
    params: { id: MediaId };
    response: ApiResponse<{ success: boolean }>;
  };
  
  batchUpdateMedia: {
    body: MediaBatchOperationRequest;
    response: ApiResponse<{ updated: number; failed: number }>;
  };
  
  uploadMedia: {
    body: FormData;
    response: ApiResponse<MediaItem>;
  };
  
  getMediaStats: {
    response: ApiResponse<{
      totalItems: number;
      totalSize: number;
      byType: Record<string, number>;
    }>;
  };
}

/**
 * Media upload progress callback
 */
export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

/**
 * Media upload options
 */
export interface MediaUploadOptions {
  folderId: FolderId;
  overwrite?: boolean;
  generateThumbnail?: boolean;
  extractMetadata?: boolean;
  onProgress?: (progress: MediaUploadProgress) => void;
  onSuccess?: (media: MediaItem) => void;
  onError?: (error: ApiError) => void;
}

// ============================================================================
// FOLDER API TYPES
// ============================================================================

/**
 * Folder API requests
 */
export interface FolderApiRequests {
  getFolders: {
    params?: FolderQuery;
    response: PaginatedResponse<Folder>;
  };
  
  getFolderById: {
    params: { id: FolderId };
    response: ApiResponse<Folder>;
  };
  
  createFolder: {
    body: CreateFolder;
    response: ApiResponse<Folder>;
  };
  
  updateFolder: {
    params: { id: FolderId };
    body: UpdateFolder;
    response: ApiResponse<Folder>;
  };
  
  deleteFolder: {
    params: { id: FolderId };
    response: ApiResponse<{ success: boolean }>;
  };
  
  getFolderTree: {
    params?: { rootId?: FolderId; maxDepth?: number };
    response: ApiResponse<Folder[]>;
  };
  
  bulkOperateFolder: {
    body: BulkFolderOperation;
    response: ApiResponse<{ processed: number; failed: number }>;
  };
}

// ============================================================================
// COLLECTION API TYPES
// ============================================================================

/**
 * Collection API requests
 */
export interface CollectionApiRequests {
  getCollections: {
    params?: CollectionQuery;
    response: PaginatedResponse<Collection>;
  };
  
  getCollectionById: {
    params: { id: CollectionId };
    response: ApiResponse<Collection>;
  };
  
  createCollection: {
    body: CreateCollection;
    response: ApiResponse<Collection>;
  };
  
  updateCollection: {
    params: { id: CollectionId };
    body: UpdateCollection;
    response: ApiResponse<Collection>;
  };
  
  deleteCollection: {
    params: { id: CollectionId };
    response: ApiResponse<{ success: boolean }>;
  };
  
  addItemsToCollection: {
    params: { id: CollectionId };
    body: { mediaIds: MediaId[] };
    response: ApiResponse<Collection>;
  };
  
  removeItemsFromCollection: {
    params: { id: CollectionId };
    body: { mediaIds: MediaId[] };
    response: ApiResponse<Collection>;
  };
  
  bulkOperateCollection: {
    body: BulkCollectionOperation;
    response: ApiResponse<{ processed: number; failed: number }>;
  };
}

// ============================================================================
// USER/AUTH API TYPES
// ============================================================================

/**
 * Auth API requests
 */
export interface AuthApiRequests {
  login: {
    body: AuthCredentials;
    response: ApiResponse<AuthResponse>;
  };
  
  logout: {
    response: ApiResponse<{ success: boolean }>;
  };
  
  refreshToken: {
    body: { refreshToken: string };
    response: ApiResponse<AuthResponse>;
  };
  
  getCurrentUser: {
    response: ApiResponse<User>;
  };
  
  updateProfile: {
    body: Partial<User>;
    response: ApiResponse<User>;
  };
  
  changePassword: {
    body: { currentPassword: string; newPassword: string };
    response: ApiResponse<{ success: boolean }>;
  };
  
  resetPassword: {
    body: { email: string };
    response: ApiResponse<{ success: boolean }>;
  };
  
  verifyResetToken: {
    params: { token: string };
    response: ApiResponse<{ valid: boolean }>;
  };
}

/**
 * User management API requests (admin only)
 */
export interface UserApiRequests {
  getUsers: {
    params?: UserQuery;
    response: PaginatedResponse<User>;
  };
  
  getUserById: {
    params: { id: UserId };
    response: ApiResponse<User>;
  };
  
  createUser: {
    body: CreateUser;
    response: ApiResponse<User>;
  };
  
  updateUser: {
    params: { id: UserId };
    body: UpdateUser;
    response: ApiResponse<User>;
  };
  
  deleteUser: {
    params: { id: UserId };
    response: ApiResponse<{ success: boolean }>;
  };
  
  inviteUser: {
    body: { email: string; role: string };
    response: ApiResponse<{ invitationId: string }>;
  };
}

// ============================================================================
// SEARCH API TYPES
// ============================================================================

/**
 * Search API types
 */
export interface SearchApiRequests {
  searchMedia: {
    params: {
      query: string;
      filters?: Record<string, any>;
      limit?: number;
      offset?: number;
    };
    response: ApiResponse<{
      results: MediaItem[];
      total: number;
      facets: Record<string, Array<{ value: string; count: number }>>;
      suggestions: string[];
    }>;
  };
  
  searchCollections: {
    params: {
      query: string;
      limit?: number;
      offset?: number;
    };
    response: ApiResponse<{
      results: Collection[];
      total: number;
    }>;
  };
  
  searchFolders: {
    params: {
      query: string;
      limit?: number;
      offset?: number;
    };
    response: ApiResponse<{
      results: Folder[];
      total: number;
    }>;
  };
  
  getSearchSuggestions: {
    params: { query: string; type?: 'media' | 'collections' | 'folders' };
    response: ApiResponse<string[]>;
  };
}

// ============================================================================
// ANALYTICS API TYPES
// ============================================================================

/**
 * Analytics API requests
 */
export interface AnalyticsApiRequests {
  getMediaAnalytics: {
    params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
      folderId?: FolderId;
    };
    response: ApiResponse<{
      views: number;
      downloads: number;
      uploads: number;
      storage: number;
      timeline: Array<{
        date: string;
        views: number;
        downloads: number;
        uploads: number;
      }>;
      topMedia: Array<{
        id: MediaId;
        name: string;
        views: number;
        downloads: number;
      }>;
    }>;
  };
  
  getUserAnalytics: {
    params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      startDate?: string;
      endDate?: string;
    };
    response: ApiResponse<{
      activeUsers: number;
      totalSessions: number;
      averageSessionDuration: number;
      topUsers: Array<{
        id: UserId;
        name: string;
        activity: number;
      }>;
    }>;
  };
  
  getStorageAnalytics: {
    response: ApiResponse<{
      totalStorage: number;
      usedStorage: number;
      availableStorage: number;
      storageByType: Record<string, number>;
      storageByUser: Array<{
        userId: UserId;
        userName: string;
        storage: number;
      }>;
      projectedUsage: Array<{
        date: string;
        projected: number;
      }>;
    }>;
  };
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * API error categories
 */
export type ApiErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_RESOURCE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'STORAGE_QUOTA_EXCEEDED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

/**
 * Extended API error with more context
 */
export interface ExtendedApiError extends ApiError {
  code: ApiErrorCode;
  field?: string; // For validation errors
  retryable: boolean;
  retryAfter?: number; // For rate limiting
  context?: Record<string, any>;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: ExtendedApiError;
  validationErrors?: ValidationError[];
  timestamp: ISO8601String;
  requestId: string;
  path: string;
  method: string;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

/**
 * Webhook event types
 */
export type WebhookEvent = 
  | 'media.created'
  | 'media.updated'
  | 'media.deleted'
  | 'folder.created'
  | 'folder.updated'
  | 'folder.deleted'
  | 'collection.created'
  | 'collection.updated'
  | 'collection.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted';

/**
 * Webhook payload
 */
export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: ISO8601String;
  data: {
    id: string;
    action: 'created' | 'updated' | 'deleted';
    resource: any;
    userId: UserId;
    organizationId?: string;
  };
  metadata: {
    requestId: string;
    version: string;
    signature: string;
  };
}

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

/**
 * Generic batch operation request
 */
export interface BatchOperationRequest<T = any> {
  operation: string;
  items: string[];
  params?: T;
  async?: boolean; // Process in background
  notifyOnComplete?: boolean;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
  startedAt: ISO8601String;
  completedAt?: ISO8601String;
  estimatedCompletion?: ISO8601String;
}

/**
 * Batch operation status check
 */
export interface BatchOperationStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  progress: number; // 0-100
  message?: string;
  result?: BatchOperationResponse;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number; // requests per window
  remaining: number; // requests remaining in current window
  reset: number; // timestamp when window resets
  retryAfter?: number; // seconds to wait before retry
}

/**
 * Rate limit headers (from HTTP response)
 */
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

// ============================================================================
// CACHING TYPES
// ============================================================================

/**
 * Cache configuration for API responses
 */
export interface CacheConfig {
  ttl: number; // time to live in seconds
  maxSize: number; // maximum cache size in MB
  key: string; // cache key pattern
  invalidateOn?: WebhookEvent[]; // events that invalidate cache
}

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
  size: number; // in bytes
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Extract request type from API request definition
 */
export type ApiRequestType<T> = T extends { body: infer U } 
  ? U 
  : T extends { params: infer U } 
    ? U 
    : never;

/**
 * Extract response type from API request definition
 */
export type ApiResponseType<T> = T extends { response: infer U } ? U : never;

/**
 * Create typed API client interface
 */
export type ApiClient<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends { body: any }
    ? (body: T[K]['body'], options?: RequestOptions) => Promise<ApiResponseType<T[K]>>
    : T[K] extends { params: any }
    ? (params: T[K]['params'], options?: RequestOptions) => Promise<ApiResponseType<T[K]>>
    : (options?: RequestOptions) => Promise<ApiResponseType<T[K]>>;
};

// ============================================================================
// API CLIENT TYPES
// ============================================================================

/**
 * Complete API client interface
 */
export interface MediaLibraryApiClient {
  media: ApiClient<MediaApiRequests>;
  folders: ApiClient<FolderApiRequests>;
  collections: ApiClient<CollectionApiRequests>;
  auth: ApiClient<AuthApiRequests>;
  users: ApiClient<UserApiRequests>;
  search: ApiClient<SearchApiRequests>;
  analytics: ApiClient<AnalyticsApiRequests>;
}

/**
 * API service configuration
 */
export interface ApiServiceConfig extends ApiConfig {
  enableCache: boolean;
  cacheConfig: Record<string, CacheConfig>;
  enableRetry: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
    retryCondition: (error: ExtendedApiError) => boolean;
  };
  interceptors: {
    request: Array<(config: RequestOptions) => RequestOptions>;
    response: Array<(response: any) => any>;
    error: Array<(error: ExtendedApiError) => ExtendedApiError>;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: '/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  apiVersion: 'v1'
};

export const HTTP_STATUS_CODES = {
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
  SERVICE_UNAVAILABLE: 503
} as const;

export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const;