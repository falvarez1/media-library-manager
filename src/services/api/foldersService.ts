/**
 * Real Folders API Service
 * 
 * Implements the same interface as the mock foldersApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';
import type {
  Folder,
  FolderQuery,
  FolderTree,
  FolderTreeQuery,
  CreateFolder,
  UpdateFolder,
  BulkFolderOperation,
  FolderStats,
  MoveFolderRequest,
  CopyFolderRequest,
  ShareFolderRequest,
  FolderShare,
  FolderActivity
} from '../../types/folder.types';
import type {
  MediaItem,
  MediaQuery
} from '../../types/media.types';
import type {
  ApiResponse,
  PaginatedResponse,
  FolderId
} from '../../types/common.types';

/**
 * Get all folders with optional filtering
 * @param options - Query options
 * @returns Promise resolving to folders
 */
export const getFolders = async (options: FolderQuery = {}): Promise<PaginatedResponse<Folder>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<Folder>>(`/folders${queryString}`);
};

/**
 * Get folder tree structure (hierarchical)
 * @param options - Tree query options
 * @returns Promise resolving to folder tree
 */
export const getFolderTree = async (options: FolderTreeQuery = {}): Promise<ApiResponse<FolderTree[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<FolderTree[]>>(`/folders/tree${queryString}`);
};

/**
 * Get a single folder by ID
 * @param id - Folder ID
 * @returns Promise resolving to folder
 */
export const getFolderById = async (id: FolderId): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>(`/folders/${id}`);
};

/**
 * Get folder contents (media items within a folder)
 * @param id - Folder ID
 * @param options - Query options for pagination and filtering
 * @returns Promise resolving to media items in folder
 */
export const getFolderContents = async (
  id: FolderId,
  options: MediaQuery = {}
): Promise<PaginatedResponse<MediaItem>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<MediaItem>>(`/folders/${id}/contents${queryString}`);
};

/**
 * Create a new folder
 * @param folderData - Folder data
 * @returns Promise resolving to created folder
 */
export const createFolder = async (folderData: CreateFolder): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>('/folders', 'POST', folderData);
};

/**
 * Update a folder
 * @param id - Folder ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated folder
 */
export const updateFolder = async (id: FolderId, updates: UpdateFolder): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>(`/folders/${id}`, 'PUT', updates);
};

/**
 * Delete a folder
 * @param id - Folder ID
 * @param options - Delete options
 * @returns Promise resolving to success message
 */
export const deleteFolder = async (
  id: FolderId,
  options: { force?: boolean; moveContentsTo?: FolderId } = {}
): Promise<ApiResponse<{ success: boolean }>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{ success: boolean }>>(`/folders/${id}${queryString}`, 'DELETE');
};

/**
 * Move a folder to a new parent
 * @param request - Move folder request
 * @returns Promise resolving to moved folder
 */
export const moveFolder = async (request: MoveFolderRequest): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>('/folders/move', 'POST', request);
};

/**
 * Copy a folder
 * @param request - Copy folder request
 * @returns Promise resolving to copied folder
 */
export const copyFolder = async (request: CopyFolderRequest): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>('/folders/copy', 'POST', request);
};

/**
 * Get folder statistics
 * @param id - Folder ID
 * @returns Promise resolving to folder statistics
 */
export const getFolderStats = async (id: FolderId): Promise<ApiResponse<FolderStats>> => {
  return apiRequest<ApiResponse<FolderStats>>(`/folders/${id}/stats`);
};

/**
 * Bulk operation on multiple folders
 * @param operation - Bulk operation request
 * @returns Promise resolving to operation result
 */
export const bulkFolderOperation = async (
  operation: BulkFolderOperation
): Promise<ApiResponse<{ processed: number; failed: number }>> => {
  return apiRequest<ApiResponse<{ processed: number; failed: number }>>('/folders/bulk', 'POST', operation);
};

/**
 * Search folders
 * @param query - Search query string
 * @param options - Search options
 * @returns Promise resolving to search results
 */
export const searchFolders = async (
  query: string,
  options: Partial<FolderQuery> = {}
): Promise<PaginatedResponse<Folder>> => {
  const searchParams = {
    search: query,
    ...options
  };
  const queryString = buildQueryString(searchParams);
  return apiRequest<PaginatedResponse<Folder>>(`/folders/search${queryString}`);
};

/**
 * Get folder breadcrumbs
 * @param id - Folder ID
 * @returns Promise resolving to breadcrumb path
 */
export const getFolderBreadcrumbs = async (id: FolderId): Promise<ApiResponse<Array<{
  id: FolderId;
  name: string;
  path: string;
}>>> => {
  return apiRequest<ApiResponse<Array<{
    id: FolderId;
    name: string;
    path: string;
  }>>>(`/folders/${id}/breadcrumbs`);
};

/**
 * Share a folder with users
 * @param request - Share folder request
 * @returns Promise resolving to sharing result
 */
export const shareFolder = async (request: ShareFolderRequest): Promise<ApiResponse<FolderShare>> => {
  return apiRequest<ApiResponse<FolderShare>>('/folders/share', 'POST', request);
};

/**
 * Get folder sharing information
 * @param id - Folder ID
 * @returns Promise resolving to sharing information
 */
export const getFolderShares = async (id: FolderId): Promise<ApiResponse<FolderShare[]>> => {
  return apiRequest<ApiResponse<FolderShare[]>>(`/folders/${id}/shares`);
};

/**
 * Remove folder sharing
 * @param shareId - Share ID
 * @returns Promise resolving to success message
 */
export const removeFolderShare = async (shareId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/folders/shares/${shareId}`, 'DELETE');
};

/**
 * Get folder activity log
 * @param id - Folder ID
 * @param options - Query options for pagination
 * @returns Promise resolving to activity log
 */
export const getFolderActivity = async (
  id: FolderId,
  options: { limit?: number; offset?: number } = {}
): Promise<PaginatedResponse<FolderActivity>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<FolderActivity>>(`/folders/${id}/activity${queryString}`);
};

/**
 * Get recent folders for a user
 * @param options - Query options
 * @returns Promise resolving to recent folders
 */
export const getRecentFolders = async (options: {
  limit?: number;
  includeStats?: boolean;
} = {}): Promise<ApiResponse<Array<{
  folder: Folder;
  lastAccessed: string;
  accessCount: number;
}>>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<Array<{
    folder: Folder;
    lastAccessed: string;
    accessCount: number;
  }>>>(`/folders/recent${queryString}`);
};

/**
 * Set folder color
 * @param id - Folder ID
 * @param color - Hex color code
 * @returns Promise resolving to updated folder
 */
export const setFolderColor = async (
  id: FolderId,
  color: string
): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>(`/folders/${id}/color`, 'PATCH', { color });
};

/**
 * Archive/unarchive a folder
 * @param id - Folder ID
 * @param archived - Archive status
 * @returns Promise resolving to updated folder
 */
export const setFolderArchived = async (
  id: FolderId,
  archived: boolean
): Promise<ApiResponse<Folder>> => {
  return apiRequest<ApiResponse<Folder>>(`/folders/${id}/archive`, 'PATCH', { archived });
};

// Export all folder API functions
const foldersService = {
  getFolders,
  getFolderTree,
  getFolderById,
  getFolderContents,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder,
  copyFolder,
  getFolderStats,
  bulkFolderOperation,
  searchFolders,
  getFolderBreadcrumbs,
  shareFolder,
  getFolderShares,
  removeFolderShare,
  getFolderActivity,
  getRecentFolders,
  setFolderColor,
  setFolderArchived
};

export default foldersService;