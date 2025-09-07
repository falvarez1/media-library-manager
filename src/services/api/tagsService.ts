/**
 * Real Tags API Service
 * 
 * Implements the same interface as the mock tagsApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';
import type {
  TagId,
  TagCategoryId,
  MediaId,
  HexColor,
  ISO8601String,
  BaseQuery,
  TimestampFields
} from '../../types/common.types';
import type {
  MediaItem,
  MediaQuery
} from '../../types/media.types';
import type {
  ApiResponse,
  PaginatedResponse
} from '../../types/common.types';

// ============================================================================
// TAG TYPES (since no separate tag types file exists)
// ============================================================================

/**
 * Tag interface
 */
export interface Tag extends TimestampFields {
  id: TagId;
  name: string;
  description?: string;
  color: HexColor;
  category?: TagCategoryId;
  usageCount: number;
  isSystemTag: boolean; // System-generated vs user-created
  isVisible: boolean; // Whether to show in UI
  synonyms?: string[]; // Alternative names for the tag
  metadata?: {
    aiGenerated?: boolean;
    confidence?: number; // For AI-generated tags
    source?: string; // Source of the tag (user, ai, import, etc.)
  };
}

/**
 * Tag category interface
 */
export interface TagCategory extends TimestampFields {
  id: TagCategoryId;
  name: string;
  description?: string;
  color: HexColor;
  icon?: string;
  sortOrder: number;
  isSystem: boolean;
  tagCount: number;
}

/**
 * Tag query options
 */
export interface TagQuery extends BaseQuery {
  category?: TagCategoryId;
  usageCountMin?: number;
  usageCountMax?: number;
  isSystemTag?: boolean;
  isVisible?: boolean;
  hasDescription?: boolean;
  createdBy?: string;
  aiGenerated?: boolean;
}

/**
 * Popular tag with usage statistics
 */
export interface PopularTag extends Tag {
  recentUsage: number; // Usage in recent period
  trending: boolean; // Whether usage is increasing
  relatedTags: string[]; // Commonly used together
}

/**
 * Tag suggestion
 */
export interface TagSuggestion {
  name: string;
  confidence: number; // 0-1
  category?: string;
  reason?: string; // Why this tag was suggested
  existing?: boolean; // Whether tag already exists
}

/**
 * Tag creation payload
 */
export type CreateTag = Pick<Tag,
  | 'name'
  | 'description'
  | 'color'
  | 'category'
  | 'synonyms'
> & {
  metadata?: Partial<Tag['metadata']>;
};

/**
 * Tag update payload
 */
export type UpdateTag = Partial<Pick<Tag,
  | 'name'
  | 'description'
  | 'color'
  | 'category'
  | 'isVisible'
  | 'synonyms'
  | 'metadata'
>>;

/**
 * Tag category creation payload
 */
export type CreateTagCategory = Pick<TagCategory,
  | 'name'
  | 'description'
  | 'color'
  | 'icon'
  | 'sortOrder'
>;

/**
 * Tag category update payload
 */
export type UpdateTagCategory = Partial<Pick<TagCategory,
  | 'name'
  | 'description'
  | 'color'
  | 'icon'
  | 'sortOrder'
>>;

/**
 * Batch tag update request
 */
export interface BatchTagUpdate {
  mediaIds: MediaId[];
  updates: {
    add?: string[]; // Tags to add
    remove?: string[]; // Tags to remove
    replace?: string[]; // Replace all tags with these
  };
}

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all tags
 * @param options - Query options
 * @returns Promise resolving to tags
 */
export const getTags = async (options: TagQuery = {}): Promise<PaginatedResponse<Tag>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<Tag>>(`/tags${queryString}`);
};

/**
 * Get a single tag by ID
 * @param id - Tag ID
 * @returns Promise resolving to tag
 */
export const getTagById = async (id: TagId): Promise<ApiResponse<Tag>> => {
  return apiRequest<ApiResponse<Tag>>(`/tags/${id}`);
};

/**
 * Get media items with a specific tag
 * @param id - Tag ID
 * @param options - Query options
 * @returns Promise resolving to media items with tag
 */
export const getMediaWithTag = async (
  id: TagId,
  options: MediaQuery = {}
): Promise<PaginatedResponse<MediaItem>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<MediaItem>>(`/tags/${id}/media${queryString}`);
};

/**
 * Create a new tag
 * @param tagData - Tag data
 * @returns Promise resolving to created tag
 */
export const createTag = async (tagData: CreateTag): Promise<ApiResponse<Tag>> => {
  return apiRequest<ApiResponse<Tag>>('/tags', 'POST', tagData);
};

/**
 * Update a tag
 * @param id - Tag ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated tag
 */
export const updateTag = async (id: TagId, updates: UpdateTag): Promise<ApiResponse<Tag>> => {
  return apiRequest<ApiResponse<Tag>>(`/tags/${id}`, 'PUT', updates);
};

/**
 * Delete a tag
 * @param id - Tag ID
 * @param options - Delete options
 * @returns Promise resolving to success message
 */
export const deleteTag = async (
  id: TagId,
  options: { force?: boolean; replaceWith?: TagId } = {}
): Promise<ApiResponse<{ success: boolean }>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{ success: boolean }>>(`/tags/${id}${queryString}`, 'DELETE');
};

/**
 * Get popular tags based on usage count
 * @param options - Query options
 * @returns Promise resolving to popular tags
 */
export const getPopularTags = async (options: {
  limit?: number;
  period?: 'day' | 'week' | 'month' | 'year' | 'all';
  category?: TagCategoryId;
  trending?: boolean;
} = {}): Promise<ApiResponse<PopularTag[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<PopularTag[]>>(`/tags/popular${queryString}`);
};

/**
 * Get tag categories
 * @param options - Query options
 * @returns Promise resolving to tag categories
 */
export const getTagCategories = async (options: {
  includeTagCount?: boolean;
  sort?: 'name' | 'sortOrder' | 'tagCount';
  order?: 'asc' | 'desc';
} = {}): Promise<ApiResponse<TagCategory[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<TagCategory[]>>(`/tags/categories${queryString}`);
};

/**
 * Create a new tag category
 * @param categoryData - Tag category data
 * @returns Promise resolving to created tag category
 */
export const createTagCategory = async (categoryData: CreateTagCategory): Promise<ApiResponse<TagCategory>> => {
  return apiRequest<ApiResponse<TagCategory>>('/tags/categories', 'POST', categoryData);
};

/**
 * Update a tag category
 * @param id - Tag category ID
 * @param updates - Fields to update
 * @returns Promise resolving to updated tag category
 */
export const updateTagCategory = async (
  id: TagCategoryId,
  updates: UpdateTagCategory
): Promise<ApiResponse<TagCategory>> => {
  return apiRequest<ApiResponse<TagCategory>>(`/tags/categories/${id}`, 'PUT', updates);
};

/**
 * Delete a tag category
 * @param id - Tag category ID
 * @param options - Delete options
 * @returns Promise resolving to success message
 */
export const deleteTagCategory = async (
  id: TagCategoryId,
  options: { moveTagsTo?: TagCategoryId } = {}
): Promise<ApiResponse<{ success: boolean }>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{ success: boolean }>>(`/tags/categories/${id}${queryString}`, 'DELETE');
};

/**
 * Get tag suggestions based on query
 * @param options - Query options including query string
 * @returns Promise resolving to tag suggestions
 */
export const getTagSuggestions = async (options: {
  query?: string;
  mediaId?: MediaId;
  context?: 'media' | 'collection' | 'folder';
  limit?: number;
  includeAI?: boolean;
} = {}): Promise<ApiResponse<TagSuggestion[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<TagSuggestion[]>>(`/tags/suggestions${queryString}`);
};

/**
 * Batch update tags for multiple media items
 * @param request - Batch tag update request
 * @returns Promise resolving to update result
 */
export const batchUpdateTags = async (
  request: BatchTagUpdate
): Promise<ApiResponse<{ updated: number; failed: number }>> => {
  return apiRequest<ApiResponse<{ updated: number; failed: number }>>('/tags/batch', 'POST', request);
};

/**
 * Search tags by name or description
 * @param query - Search query
 * @param options - Search options
 * @returns Promise resolving to matching tags
 */
export const searchTags = async (
  query: string,
  options: Partial<TagQuery> = {}
): Promise<PaginatedResponse<Tag>> => {
  const searchParams = {
    search: query,
    ...options
  };
  const queryString = buildQueryString(searchParams);
  return apiRequest<PaginatedResponse<Tag>>(`/tags/search${queryString}`);
};

/**
 * Get tag usage statistics
 * @param id - Tag ID
 * @param options - Statistics options
 * @returns Promise resolving to usage statistics
 */
export const getTagStats = async (
  id: TagId,
  options: {
    period?: 'day' | 'week' | 'month' | 'year';
    includeRelated?: boolean;
  } = {}
): Promise<ApiResponse<{
  usage: number;
  trend: 'up' | 'down' | 'stable';
  relatedTags: Array<{ tag: string; correlation: number }>;
  usageOverTime: Array<{ date: string; count: number }>;
}>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{
    usage: number;
    trend: 'up' | 'down' | 'stable';
    relatedTags: Array<{ tag: string; correlation: number }>;
    usageOverTime: Array<{ date: string; count: number }>;
  }>>(`/tags/${id}/stats${queryString}`);
};

/**
 * Merge multiple tags into one
 * @param sourceTagIds - Tags to merge
 * @param targetTagId - Target tag to merge into
 * @returns Promise resolving to merged tag
 */
export const mergeTags = async (
  sourceTagIds: TagId[],
  targetTagId: TagId
): Promise<ApiResponse<Tag>> => {
  return apiRequest<ApiResponse<Tag>>('/tags/merge', 'POST', {
    sourceTagIds,
    targetTagId
  });
};

/**
 * Get AI-generated tags for media
 * @param mediaId - Media item ID
 * @param options - AI tagging options
 * @returns Promise resolving to AI-generated tags
 */
export const getAITags = async (
  mediaId: MediaId,
  options: {
    confidence?: number; // Minimum confidence threshold
    maxTags?: number;
    categories?: TagCategoryId[];
  } = {}
): Promise<ApiResponse<TagSuggestion[]>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<TagSuggestion[]>>(`/media/${mediaId}/ai-tags${queryString}`);
};

/**
 * Apply AI-generated tags to media
 * @param mediaId - Media item ID
 * @param tags - Tags to apply
 * @returns Promise resolving to updated media item
 */
export const applyAITags = async (
  mediaId: MediaId,
  tags: Array<{ name: string; confidence: number }>
): Promise<ApiResponse<MediaItem>> => {
  return apiRequest<ApiResponse<MediaItem>>(`/media/${mediaId}/ai-tags`, 'POST', { tags });
};

// Export all tag API functions
const tagsService = {
  getTags,
  getTagById,
  getMediaWithTag,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  getTagCategories,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory,
  getTagSuggestions,
  batchUpdateTags,
  searchTags,
  getTagStats,
  mergeTags,
  getAITags,
  applyAITags
};

export default tagsService;