/**
 * Real Media API Service
 * 
 * Implements the same interface as the mock mediaApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';
import type {
  MediaItem,
  MediaQuery,
  CreateMediaItem,
  UpdateMediaItem,
  BatchOperationRequest,
  MediaStats
} from '../../types/media.types';
import type {
  ApiResponse,
  PaginatedResponse,
  MediaId
} from '../../types/common.types';

/**
 * Get all media items with optional filtering, sorting, and pagination
 * @param options - Query options
 * @returns Promise resolving to paginated media items
 */
export const getMedia = async (options: MediaQuery = {}): Promise<PaginatedResponse<MediaItem>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<MediaItem>>(`/media${queryString}`);
};

/**
 * Get a single media item by ID
 * @param id - Media item ID
 * @returns Promise resolving to media item
 */
export const getMediaById = async (id: MediaId): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>(`/media/${id}`);
};

/**
 * Create a new media item
 * @param mediaItem - Media item data
 * @returns Promise resolving to created media item
 */
export const createMedia = async (mediaItem: CreateMediaItem): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>('/media', 'POST', mediaItem);
};

/**
 * Update a media item
 * @param id - Media item ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated media item
 */
export const updateMedia = async (id: MediaId, updates: UpdateMediaItem): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>(`/media/${id}`, 'PUT', updates);
};

/**
 * Delete a media item
 * @param id - Media item ID
 * @returns Promise resolving to success message
 */
export const deleteMedia = async (id: MediaId): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/media/${id}`, 'DELETE');
};

/**
 * Batch update media items
 * @param request - Batch operation request
 * @returns Promise resolving to batch operation result
 */
export const batchUpdateMedia = async (request: BatchOperationRequest): Promise<ApiResponse<{ updated: number; failed: number }>> => {
  return apiRequest<ApiResponse<{ updated: number; failed: number }>>('/media/batch', 'PUT', request);
};

/**
 * Batch delete media items
 * @param ids - Array of media item IDs
 * @returns Promise resolving to batch delete result
 */
export const batchDeleteMedia = async (ids: MediaId[]): Promise<ApiResponse<{ deleted: number; failed: number }>> => {
  return apiRequest<ApiResponse<{ deleted: number; failed: number }>>('/media/batch', 'DELETE', { ids });
};

/**
 * Get media usage statistics
 * @returns Promise resolving to usage statistics
 */
export const getMediaStats = async (): Promise<ApiResponse<MediaStats>> => {
  return apiRequest<ApiResponse<MediaStats>>('/media/stats');
};

/**
 * Upload media file
 * @param formData - FormData containing file and metadata
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to uploaded media item
 */
export const uploadMedia = async (
  formData: FormData,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<ApiResponse<MediaItem>> => {
  const url = '/media/upload';
  
  if (onProgress) {
    // Use the upload helper from apiUtils for progress tracking
    const { upload } = await import('./apiUtils');
    return upload<ApiResponse<MediaItem>>(url, formData, onProgress);
  } else {
    return apiRequest<ApiResponse<MediaItem>>(url, 'POST', formData);
  }
};

/**
 * Search media items
 * @param query - Search query string
 * @param options - Additional search options
 * @returns Promise resolving to search results
 */
export const searchMedia = async (
  query: string,
  options: Partial<MediaQuery> = {}
): Promise<PaginatedResponse<MediaItem>> => {
  const searchParams = {
    search: query,
    ...options
  };
  const queryString = buildQueryString(searchParams);
  return apiRequest<PaginatedResponse<MediaItem>>(`/media/search${queryString}`);
};

/**
 * Get media item's usage information
 * @param id - Media item ID
 * @returns Promise resolving to usage information
 */
export const getMediaUsage = async (id: MediaId): Promise<ApiResponse<{
  usageCount: number;
  locations: Array<{
    type: string;
    name: string;
    url?: string;
    lastUsed: string;
  }>;
}>> => {
  return apiRequest<ApiResponse<{
    usageCount: number;
    locations: Array<{
      type: string;
      name: string;
      url?: string;
      lastUsed: string;
    }>;
  }>>(`/media/${id}/usage`);
};

/**
 * Toggle media item starred status
 * @param id - Media item ID
 * @param starred - New starred status
 * @returns Promise resolving to updated media item
 */
export const toggleStarred = async (id: MediaId, starred: boolean): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>(`/media/${id}/star`, 'POST', { starred });
};

/**
 * Toggle media item favorited status
 * @param id - Media item ID
 * @param favorited - New favorited status
 * @returns Promise resolving to updated media item
 */
export const toggleFavorited = async (id: MediaId, favorited: boolean): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>(`/media/${id}/favorite`, 'POST', { favorited });
};

/**
 * Get media item thumbnail
 * @param id - Media item ID
 * @param size - Thumbnail size (small, medium, large)
 * @returns Promise resolving to thumbnail blob
 */
export const getMediaThumbnail = async (
  id: MediaId,
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<Blob> => {
  const response = await fetch(`/media/${id}/thumbnail?size=${size}`);
  if (!response.ok) {
    throw new Error(`Failed to get thumbnail: ${response.statusText}`);
  }
  return response.blob();
};

/**
 * Download media item
 * @param id - Media item ID
 * @returns Promise resolving to file blob
 */
export const downloadMedia = async (id: MediaId): Promise<Blob> => {
  const response = await fetch(`/media/${id}/download`);
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.statusText}`);
  }
  return response.blob();
};

// Export all media API functions
const mediaService = {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  batchUpdateMedia,
  batchDeleteMedia,
  getMediaStats,
  uploadMedia,
  searchMedia,
  getMediaUsage,
  toggleStarred,
  toggleFavorited,
  getMediaThumbnail,
  downloadMedia
};

export default mediaService;