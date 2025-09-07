/**
 * Real Collections API Service
 * 
 * Implements the same interface as the mock collectionsApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';
import type {
  Collection,
  CollectionQuery,
  CollectionTree,
  CollectionTreeQuery,
  CreateCollection,
  UpdateCollection,
  AddItemsToCollectionRequest,
  RemoveItemsFromCollectionRequest,
  ReorderCollectionItemsRequest,
  BulkCollectionOperation,
  MergeCollectionsRequest,
  ShareCollectionRequest,
  CollectionShare,
  CollectionStats,
  CollectionActivity,
  CollectionInvitation
} from '../../types/collection.types';
import type {
  MediaItem,
  MediaQuery
} from '../../types/media.types';
import type {
  ApiResponse,
  PaginatedResponse,
  UserId,
  CollectionId,
  MediaId
} from '../../types/common.types';

/**
 * Get all collections with optional filtering
 * @param options - Query options
 * @returns Promise resolving to collections
 */
export const getCollections = async (options: CollectionQuery = {}): Promise<PaginatedResponse<Collection>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<Collection>>(`/collections${queryString}`);
};

/**
 * Get a single collection by ID
 * @param id - Collection ID
 * @returns Promise resolving to collection
 */
export const getCollectionById = async (id: CollectionId): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}`);
};

/**
 * Get collection contents (media items within a collection)
 * @param id - Collection ID
 * @param options - Query options for pagination and filtering
 * @returns Promise resolving to media items in collection
 */
export const getCollectionContents = async (
  id: CollectionId,
  options: MediaQuery = {}
): Promise<PaginatedResponse<MediaItem>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<MediaItem>>(`/collections/${id}/contents${queryString}`);
};

/**
 * Create a new collection
 * @param collectionData - Collection data
 * @returns Promise resolving to created collection
 */
export const createCollection = async (collectionData: CreateCollection): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>('/collections', 'POST', collectionData);
};

/**
 * Update a collection
 * @param id - Collection ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated collection
 */
export const updateCollection = async (
  id: CollectionId,
  updates: UpdateCollection
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}`, 'PUT', updates);
};

/**
 * Delete a collection
 * @param id - Collection ID
 * @param options - Delete options
 * @returns Promise resolving to success message
 */
export const deleteCollection = async (
  id: CollectionId,
  options: { force?: boolean; moveItemsTo?: CollectionId } = {}
): Promise<ApiResponse<{ success: boolean }>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{ success: boolean }>>(`/collections/${id}${queryString}`, 'DELETE');
};

/**
 * Add media items to a collection
 * @param request - Add items request
 * @returns Promise resolving to updated collection
 */
export const addItemsToCollection = async (
  request: AddItemsToCollectionRequest
): Promise<ApiResponse<Collection>> => {
  const { collectionId, ...body } = request;
  return apiRequest<ApiResponse<Collection>>(`/collections/${collectionId}/items`, 'POST', body);
};

/**
 * Remove media items from a collection
 * @param request - Remove items request
 * @returns Promise resolving to updated collection
 */
export const removeItemsFromCollection = async (
  request: RemoveItemsFromCollectionRequest
): Promise<ApiResponse<Collection>> => {
  const { collectionId, ...body } = request;
  return apiRequest<ApiResponse<Collection>>(`/collections/${collectionId}/items`, 'DELETE', body);
};

/**
 * Reorder items in a collection
 * @param request - Reorder items request
 * @returns Promise resolving to updated collection
 */
export const reorderCollectionItems = async (
  request: ReorderCollectionItemsRequest
): Promise<ApiResponse<Collection>> => {
  const { collectionId, ...body } = request;
  return apiRequest<ApiResponse<Collection>>(`/collections/${collectionId}/reorder`, 'PUT', body);
};

/**
 * Share a collection with users
 * @param request - Share collection request
 * @returns Promise resolving to sharing result
 */
export const shareCollection = async (request: ShareCollectionRequest): Promise<ApiResponse<CollectionShare>> => {
  return apiRequest<ApiResponse<CollectionShare>>('/collections/share', 'POST', request);
};

/**
 * Get collection tree structure (hierarchical)
 * @param options - Tree query options
 * @returns Promise resolving to collection tree
 */
export const getCollectionTree = async (
  options: CollectionTreeQuery = {}
): Promise<ApiResponse<CollectionTree[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<CollectionTree[]>>(`/collections/tree${queryString}`);
};

/**
 * Search collections
 * @param query - Search query string
 * @param options - Search options
 * @returns Promise resolving to search results
 */
export const searchCollections = async (
  query: string,
  options: Partial<CollectionQuery> = {}
): Promise<PaginatedResponse<Collection>> => {
  const searchParams = {
    search: query,
    ...options
  };
  const queryString = buildQueryString(searchParams);
  return apiRequest<PaginatedResponse<Collection>>(`/collections/search${queryString}`);
};

/**
 * Bulk operation on multiple collections
 * @param operation - Bulk operation request
 * @returns Promise resolving to operation result
 */
export const bulkCollectionOperation = async (
  operation: BulkCollectionOperation
): Promise<ApiResponse<{ processed: number; failed: number }>> => {
  return apiRequest<ApiResponse<{ processed: number; failed: number }>>('/collections/bulk', 'POST', operation);
};

/**
 * Merge multiple collections into one
 * @param request - Merge collections request
 * @returns Promise resolving to merged collection
 */
export const mergeCollections = async (
  request: MergeCollectionsRequest
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>('/collections/merge', 'POST', request);
};

/**
 * Get collection statistics
 * @param id - Collection ID
 * @returns Promise resolving to collection statistics
 */
export const getCollectionStats = async (id: CollectionId): Promise<ApiResponse<CollectionStats>> => {
  return apiRequest<ApiResponse<CollectionStats>>(`/collections/${id}/stats`);
};

/**
 * Get collection sharing information
 * @param id - Collection ID
 * @returns Promise resolving to sharing information
 */
export const getCollectionShares = async (id: CollectionId): Promise<ApiResponse<CollectionShare[]>> => {
  return apiRequest<ApiResponse<CollectionShare[]>>(`/collections/${id}/shares`);
};

/**
 * Remove collection sharing
 * @param shareId - Share ID
 * @returns Promise resolving to success message
 */
export const removeCollectionShare = async (shareId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/collections/shares/${shareId}`, 'DELETE');
};

/**
 * Get collection activity log
 * @param id - Collection ID
 * @param options - Query options for pagination
 * @returns Promise resolving to activity log
 */
export const getCollectionActivity = async (
  id: CollectionId,
  options: { limit?: number; offset?: number } = {}
): Promise<PaginatedResponse<CollectionActivity>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<CollectionActivity>>(`/collections/${id}/activity${queryString}`);
};

/**
 * Get recent collections for a user
 * @param options - Query options
 * @returns Promise resolving to recent collections
 */
export const getRecentCollections = async (options: {
  limit?: number;
  includeStats?: boolean;
} = {}): Promise<ApiResponse<Array<{
  collection: Collection;
  lastAccessed: string;
  accessCount: number;
}>>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<Array<{
    collection: Collection;
    lastAccessed: string;
    accessCount: number;
  }>>>(`/collections/recent${queryString}`);
};

/**
 * Duplicate a collection
 * @param id - Collection ID to duplicate
 * @param options - Duplication options
 * @returns Promise resolving to duplicated collection
 */
export const duplicateCollection = async (
  id: CollectionId,
  options: {
    name?: string;
    parentId?: CollectionId;
    copyItems?: boolean;
    copyPermissions?: boolean;
  } = {}
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}/duplicate`, 'POST', options);
};

/**
 * Set collection color
 * @param id - Collection ID
 * @param color - Hex color code
 * @returns Promise resolving to updated collection
 */
export const setCollectionColor = async (
  id: CollectionId,
  color: string
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}/color`, 'PATCH', { color });
};

/**
 * Set collection thumbnail
 * @param id - Collection ID
 * @param mediaId - Media ID to use as thumbnail
 * @returns Promise resolving to updated collection
 */
export const setCollectionThumbnail = async (
  id: CollectionId,
  mediaId: MediaId | null
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}/thumbnail`, 'PATCH', { mediaId });
};

/**
 * Archive/unarchive a collection
 * @param id - Collection ID
 * @param archived - Archive status
 * @returns Promise resolving to updated collection
 */
export const setCollectionArchived = async (
  id: CollectionId,
  archived: boolean
): Promise<ApiResponse<Collection>> => {
  return apiRequest<ApiResponse<Collection>>(`/collections/${id}/archive`, 'PATCH', { archived });
};

/**
 * Get collection invitations for current user
 * @param options - Query options
 * @returns Promise resolving to invitations
 */
export const getCollectionInvitations = async (options: {
  status?: 'pending' | 'accepted' | 'declined' | 'expired';
  limit?: number;
  offset?: number;
} = {}): Promise<PaginatedResponse<CollectionInvitation>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<CollectionInvitation>>(`/collections/invitations${queryString}`);
};

/**
 * Respond to collection invitation
 * @param invitationId - Invitation ID
 * @param response - Response action
 * @returns Promise resolving to success message
 */
export const respondToCollectionInvitation = async (
  invitationId: string,
  response: 'accept' | 'decline'
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(
    `/collections/invitations/${invitationId}/respond`,
    'POST',
    { response }
  );
};

/**
 * Check if media items are in a collection
 * @param id - Collection ID
 * @param mediaIds - Media IDs to check
 * @returns Promise resolving to membership status
 */
export const checkCollectionMembership = async (
  id: CollectionId,
  mediaIds: MediaId[]
): Promise<ApiResponse<Record<string, boolean>>> => {
  return apiRequest<ApiResponse<Record<string, boolean>>>(
    `/collections/${id}/membership`,
    'POST',
    { mediaIds }
  );
};

// Export all collection API functions
const collectionsService = {
  getCollections,
  getCollectionById,
  getCollectionContents,
  createCollection,
  updateCollection,
  deleteCollection,
  addItemsToCollection,
  removeItemsFromCollection,
  reorderCollectionItems,
  shareCollection,
  getCollectionTree,
  searchCollections,
  bulkCollectionOperation,
  mergeCollections,
  getCollectionStats,
  getCollectionShares,
  removeCollectionShare,
  getCollectionActivity,
  getRecentCollections,
  duplicateCollection,
  setCollectionColor,
  setCollectionThumbnail,
  setCollectionArchived,
  getCollectionInvitations,
  respondToCollectionInvitation,
  checkCollectionMembership
};

export default collectionsService;