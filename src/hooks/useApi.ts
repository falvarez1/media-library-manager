/**
 * Custom hook for consuming the API services
 * 
 * This hook provides a consistent way to integrate the service layer with React components,
 * handling loading states, errors, and API responses with full TypeScript support.
 */

import { useState, useEffect, useCallback, useMemo, DependencyList } from 'react';
import api from '../services/api';
import config from '../services/config';

// Import types
import type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  ExtendedApiError,
  ApiConfig,
  MediaItem,
  MediaQuery,
  MediaFilterOptions,
  UpdateMediaItem,
  Folder,
  FolderTree,
  FolderQuery,
  Collection,
  CollectionQuery,
  CreateFolder,
  UpdateFolder,
  CreateCollection,
  UpdateCollection,
  User,
  MediaId,
  FolderId,
  CollectionId,
  TagId,
  TagCategoryId,
  UserId,
  BatchOperationRequest
} from '../types';

// Import tag-related types from the services
import type {
  Tag,
  TagCategory,
  PopularTag,
  TagSuggestion,
  CreateTag,
  UpdateTag,
  CreateTagCategory,
  UpdateTagCategory
} from '../services/api/tagsService';

// ============================================================================
// CORE HOOK TYPES
// ============================================================================

/**
 * Generic API function type that returns a Promise with ApiResponse
 */
type ApiFunction<TParams = any, TData = any> = (params?: TParams) => Promise<ApiResponse<TData>>;

/**
 * API function that takes no parameters
 */
type ApiNoParamsFunction<TData = any> = () => Promise<ApiResponse<TData>>;

/**
 * Return type for useApi hook
 */
export interface UseApiReturn<TData> {
  data: TData;
  loading: boolean;
  error: ExtendedApiError | null;
  refetch: (newParams?: Partial<TParams>) => Promise<TData | null>;
}

/**
 * Return type for mutation hooks (create, update, delete operations)
 */
export interface UseMutationReturn<TData, TParams = any> {
  mutate: (params: TParams) => Promise<TData>;
  loading: boolean;
  error: ExtendedApiError | null;
  success: ApiResponse<TData> | null;
  reset: () => void;
}

/**
 * Return type for batch operation hooks
 */
export interface UseBatchOperationReturn<TData> {
  execute: (itemIds: string[], params?: Record<string, unknown>) => Promise<TData>;
  loading: boolean;
  error: ExtendedApiError | null;
  success: ApiResponse<TData> | null;
  reset: () => void;
}

/**
 * Options for media hooks
 */
export interface MediaHookOptions extends MediaQuery {
  folder?: string;
}

/**
 * Options for paginated data hooks
 */
export interface PaginatedData<TItem> {
  items: TItem[];
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

// ============================================================================
// CORE useApi HOOK
// ============================================================================

/**
 * Generic hook for making API calls with proper TypeScript support
 * @param apiFn - API function to call
 * @param deps - Dependencies array for useEffect
 * @param initialData - Initial data value
 * @param initialParams - Initial parameters for the API call
 * @returns Object with data, loading state, error, and refetch function
 */
export function useApi<TData = any, TParams = any>(
  apiFn: ApiFunction<TParams, TData>,
  deps: DependencyList = [],
  initialData: TData | null = null,
  initialParams: TParams | null = null
): UseApiReturn<TData | null> {
  const [data, setData] = useState<TData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [params, setParams] = useState<TParams | null>(initialParams);

  const fetchData = useCallback(async (callParams: TParams | null = params): Promise<TData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFn(callParams || undefined);
      setData(response.data);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn, params]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [...deps]);

  // Function to update params and refetch
  const refetch = useCallback((newParams: TParams | null = null): Promise<TData | null> => {
    if (newParams !== null) {
      setParams(newParams);
      return fetchData(newParams);
    }
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// ============================================================================
// MEDIA HOOKS
// ============================================================================

/**
 * Hook for fetching media items with pagination
 */
export const useMedia = (
  options: MediaHookOptions = {}, 
  deps: DependencyList = []
): UseApiReturn<PaginatedData<MediaItem> | null> => {
  const executeApi = useCallback(async (): Promise<ApiResponse<PaginatedData<MediaItem>>> => {
    // API takes MediaQuery options which may include folder
    // Check if api.media exists and has the method
    if (!api.media || typeof api.media.getMedia !== 'function') {
      console.error('API structure:', { 
        api, 
        media: api.media,
        mediaKeys: api.media ? Object.keys(api.media) : 'media is undefined',
        getMediaType: api.media?.getMedia ? typeof api.media.getMedia : 'undefined'
      });
      throw new Error('api.media.getMedia is not available');
    }
    const response = await api.media.getMedia(options);
    
    // Transform PaginatedResponse to expected format
    return {
      data: {
        items: response.data,
        meta: response.pagination
      },
      success: response.success,
      message: response.message,
      timestamp: response.timestamp,
      requestId: response.requestId
    };
  }, [options]);
  
  return useApi<PaginatedData<MediaItem>>(
    executeApi, 
    deps, 
    { items: [], meta: {} }
  );
};

/**
 * Hook for fetching a single media item by ID
 */
export const useMediaItem = (
  id: MediaId, 
  deps: DependencyList = []
): UseApiReturn<MediaItem | null> => {
  const executeApi = useCallback((): Promise<ApiResponse<MediaItem>> => 
    api.media.getMediaById(id), [id]);
  
  return useApi<MediaItem>(
    executeApi,
    [id, ...(deps || [])],
    null
  );
};

// ============================================================================
// FOLDER HOOKS
// ============================================================================

/**
 * Hook for fetching folders
 */
export const useFolders = (
  options: FolderQuery = {}, 
  deps: DependencyList = []
): UseApiReturn<Folder[] | null> => {
  const fetchAllFolders = useCallback(async (): Promise<ApiResponse<Folder[]>> => {
    const response = await api.folders.getFolders();
    return response;
  }, []);
  
  return useApi<Folder[]>(fetchAllFolders, deps, []);
};

/**
 * Hook for fetching folder tree structure
 */
export const useFolderTree = (
  deps: DependencyList = []
): UseApiReturn<FolderTree[] | null> => {
  return useApi<FolderTree[]>(api.folders.getFolderTree, deps, []);
};

/**
 * Hook for creating folders
 */
export const useCreateFolder = (): UseMutationReturn<Folder, CreateFolder> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Folder> | null>(null);

  const mutate = async (folderData: CreateFolder): Promise<Folder> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.createFolder(folderData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for updating folders
 */
export const useUpdateFolder = (): UseMutationReturn<Folder, { id: FolderId; updates: UpdateFolder }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Folder> | null>(null);

  const mutate = async ({ id, updates }: { id: FolderId; updates: UpdateFolder }): Promise<Folder> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.updateFolder(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for deleting folders
 */
export const useDeleteFolder = (): UseMutationReturn<{ success: boolean }, { id: FolderId; options?: { deleteChildren?: boolean } }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<{ success: boolean }> | null>(null);

  const mutate = async ({ id, options = {} }: { id: FolderId; options?: { deleteChildren?: boolean } }): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.deleteFolder(id, options);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for fetching folder contents
 */
export const useFolderContents = (
  id: FolderId, 
  options: { deleteChildren?: boolean } = {}, 
  deps?: DependencyList
): UseApiReturn<any | null> => {
  // Check if we should skip the API call
  const shouldSkip = options?.skip === true || !id;
  
  // Ensure deps is always an array
  const safeDeps = Array.isArray(deps) ? deps : [];
  
  // Create a stable options string for dependency tracking
  const optionsStr = JSON.stringify(options || {});
  
  // Create the API execution function
  const executeApi = useCallback((): Promise<ApiResponse<any>> => {
    // If skip is true or no valid ID, return empty result
    if (shouldSkip) {
      return Promise.resolve({ 
        data: null, 
        success: true,
        message: 'Skipped'
      });
    }
    return api.folders.getFolderContents(id, options);
  }, [id, optionsStr, shouldSkip]);
    
  return useApi<any>(
    executeApi, 
    [id, optionsStr, shouldSkip, ...safeDeps]
  );
};

/**
 * Hook for updating a media item
 */
export const useUpdateMediaItem = (): UseMutationReturn<MediaItem, { id: MediaId; updates: UpdateMediaItem }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<MediaItem> | null>(null);

  const mutate = async ({ id, updates }: { id: MediaId; updates: UpdateMediaItem }): Promise<MediaItem> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.media.updateMedia(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

// ============================================================================
// COLLECTION HOOKS
// ============================================================================

/**
 * Hook for fetching collections
 */
export const useCollections = (
  options: CollectionQuery = {}, 
  deps: DependencyList = []
): UseApiReturn<PaginatedData<Collection> | null> => {
  const executeApi = useCallback(async (): Promise<ApiResponse<PaginatedData<Collection>>> => {
    const response = await api.collections.getCollections(options);
    // Transform PaginatedResponse to expected format
    return {
      data: {
        items: response.data,
        meta: response.pagination
      },
      success: response.success,
      message: response.message,
      timestamp: response.timestamp,
      requestId: response.requestId
    };
  }, [options]);
  
  return useApi<PaginatedData<Collection>>(
    executeApi, 
    deps, 
    { items: [], meta: {} }
  );
};

/**
 * Hook for creating collections
 */
export const useCreateCollection = (): UseMutationReturn<Collection, CreateCollection> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Collection> | null>(null);

  const mutate = async (collectionData: CreateCollection): Promise<Collection> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.createCollection(collectionData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for updating collections
 */
export const useUpdateCollection = (): UseMutationReturn<Collection, { id: CollectionId; updates: UpdateCollection }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Collection> | null>(null);

  const mutate = async ({ id, updates }: { id: CollectionId; updates: UpdateCollection }): Promise<Collection> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.updateCollection(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for deleting collections
 */
export const useDeleteCollection = (): UseMutationReturn<{ success: boolean }, { id: CollectionId; options?: { deleteChildren?: boolean } }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<{ success: boolean }> | null>(null);

  const mutate = async ({ id, options = {} }: { id: CollectionId; options?: { deleteChildren?: boolean } }): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.deleteCollection(id, options);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for adding items to collections
 */
export const useAddItemsToCollection = (): UseMutationReturn<Collection, { collectionId: CollectionId; itemIds: MediaId[] }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Collection> | null>(null);

  const mutate = async ({ collectionId, itemIds }: { collectionId: CollectionId; itemIds: MediaId[] }): Promise<Collection> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.addItemsToCollection({ collectionId, mediaIds: itemIds });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for removing items from collections
 */
export const useRemoveItemsFromCollection = (): UseMutationReturn<Collection, { collectionId: CollectionId; itemIds: MediaId[] }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Collection> | null>(null);

  const mutate = async ({ collectionId, itemIds }: { collectionId: CollectionId; itemIds: MediaId[] }): Promise<Collection> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.removeItemsFromCollection({ collectionId, mediaIds: itemIds });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

// ============================================================================
// MEDIA OPERATIONS HOOKS
// ============================================================================

/**
 * Hook for moving media items
 */
export const useMoveMedia = (): UseMutationReturn<any, { mediaIds: MediaId[]; targetFolderId: FolderId }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<any> | null>(null);

  const mutate = async ({ mediaIds, targetFolderId }: { mediaIds: MediaId[]; targetFolderId: FolderId }): Promise<any> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.moveMedia({ mediaIds, targetFolderId });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for copying media items
 */
export const useCopyMedia = (): UseMutationReturn<any, { mediaIds: MediaId[]; targetFolderId: FolderId }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<any> | null>(null);

  const mutate = async ({ mediaIds, targetFolderId }: { mediaIds: MediaId[]; targetFolderId: FolderId }): Promise<any> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.copyMedia({ mediaIds, targetFolderId });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for exporting media items
 */
interface ExportOptions {
  format?: string;
  quality?: number;
  includeMetadata?: boolean;
}

export const useExportMedia = (): UseMutationReturn<{ url?: string; success: boolean }, { mediaIds: MediaId[]; options?: ExportOptions }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<any> | null>(null);

  const mutate = async ({ mediaIds, options = {} }: { mediaIds: MediaId[]; options?: ExportOptions }): Promise<{ url?: string; success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.exportMedia({ mediaIds, ...options });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for sharing media items
 */
interface ShareOptions {
  permissions?: string[];
  expiry?: string;
  password?: string;
}

export const useShareMedia = (): UseMutationReturn<{ shareUrl?: string; success: boolean }, { mediaIds: MediaId[]; shareOptions?: ShareOptions }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<any> | null>(null);

  const mutate = async ({ mediaIds, shareOptions = {} }: { mediaIds: MediaId[]; shareOptions?: ShareOptions }): Promise<{ shareUrl?: string; success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.shareMedia({ mediaIds, ...shareOptions });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

// ============================================================================
// TAG HOOKS
// ============================================================================

/**
 * Hook for fetching tags
 */
export const useTags = (
  options: { deleteChildren?: boolean } = {}, 
  deps: DependencyList = []
): UseApiReturn<Tag[] | null> => {
  const executeApi = useCallback(async (): Promise<ApiResponse<Tag[]>> => {
    const response = await api.tags.getTags(options);
    // Transform PaginatedResponse to expected format if needed
    if ('pagination' in response) {
      const paginatedResponse = response as PaginatedResponse<Tag>;
      return {
        data: paginatedResponse.data,
        success: paginatedResponse.success,
        message: paginatedResponse.message,
        timestamp: paginatedResponse.timestamp,
        requestId: paginatedResponse.requestId
      };
    }
    return response as ApiResponse<Tag[]>;
  }, [options]);
  
  return useApi<Tag[]>(executeApi, deps, []);
};

/**
 * Hook for fetching tag categories
 */
export const useTagCategories = (
  deps: DependencyList = []
): UseApiReturn<TagCategory[] | null> => {
  return useApi<TagCategory[]>(api.tags.getTagCategories, deps, []);
};

/**
 * Hook for creating tag categories
 */
export const useCreateTagCategory = (): UseMutationReturn<TagCategory, CreateTagCategory> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<TagCategory> | null>(null);

  const mutate = async (categoryData: CreateTagCategory): Promise<TagCategory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.createTagCategory(categoryData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for updating tag categories
 */
export const useUpdateTagCategory = (): UseMutationReturn<TagCategory, { id: TagCategoryId; updates: Partial<TagCategory> }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<TagCategory> | null>(null);

  const mutate = async ({ id, updates }: { id: TagCategoryId; updates: Partial<TagCategory> }): Promise<TagCategory> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.updateTagCategory(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for creating tags
 */
export const useCreateTag = (): UseMutationReturn<Tag, CreateTag> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Tag> | null>(null);

  const mutate = async (tagData: CreateTag): Promise<Tag> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.createTag(tagData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for updating tags
 */
export const useUpdateTag = (): UseMutationReturn<Tag, { id: TagId; updates: Partial<Tag> }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<Tag> | null>(null);

  const mutate = async ({ id, updates }: { id: TagId; updates: Partial<Tag> }): Promise<Tag> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.updateTag(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for deleting tags
 */
export const useDeleteTag = (): UseMutationReturn<{ success: boolean }, TagId> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<{ success: boolean }> | null>(null);

  const mutate = async (id: TagId): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.deleteTag(id);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for batch updating tags
 */
interface BatchUpdateResult {
  success: boolean;
  updatedCount: number;
}

export const useBatchUpdateTags = (): UseMutationReturn<BatchUpdateResult, { mediaIds: MediaId[]; updates: { tags?: TagId[]; addTags?: TagId[]; removeTags?: TagId[] } }> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<any> | null>(null);

  const mutate = async ({ mediaIds, updates }: { mediaIds: MediaId[]; updates: { tags?: TagId[]; addTags?: TagId[]; removeTags?: TagId[] } }): Promise<BatchUpdateResult> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.batchUpdateTags({ mediaIds, updates });
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

/**
 * Hook for fetching popular tags
 */
export const usePopularTags = (
  options: { deleteChildren?: boolean } = {}, 
  deps: DependencyList = []
): UseApiReturn<PopularTag[] | null> => {
  const executeApi = useCallback((): Promise<ApiResponse<PopularTag[]>> => 
    api.tags.getPopularTags(options), [options]);
  
  return useApi<PopularTag[]>(executeApi, deps, []);
};

/**
 * Hook for getting tag suggestions
 */
export const useTagSuggestions = (
  query: string, 
  options: { deleteChildren?: boolean } = {}, 
  deps: DependencyList = []
): UseApiReturn<TagSuggestion[] | null> => {
  const executeApi = useCallback(async (): Promise<ApiResponse<TagSuggestion[]>> => {
    if (!query || query.length < 1) {
      return { data: [], success: true, timestamp: new Date().toISOString(), requestId: '' };
    }
    return await api.tags.getTagSuggestions({ query, ...options });
  }, [query, options]);
  
  return useApi<TagSuggestion[]>(executeApi, [query, ...deps], []);
};

/**
 * Hook for deleting tag categories
 */
export const useDeleteTagCategory = (): UseMutationReturn<{ success: boolean }, TagCategoryId> => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ExtendedApiError | null>(null);
  const [success, setSuccess] = useState<ApiResponse<{ success: boolean }> | null>(null);

  const mutate = async (id: TagCategoryId): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.deleteTagCategory(id);
      setSuccess(response);
      return response.data;
    } catch (err) {
      const apiError = err as ExtendedApiError;
      setError(apiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, success, reset };
};

// ============================================================================
// USER HOOKS
// ============================================================================

/**
 * Hook for fetching current user information
 */
export const useCurrentUser = (
  deps: DependencyList = []
): UseApiReturn<User | null> => {
  return useApi<User>(api.users.getCurrentUser, deps, null);
};

// ============================================================================
// CONFIGURATION HOOKS
// ============================================================================

/**
 * Configuration information about the data source
 */
export interface DataSourceConfig {
  isUsingRealApi: boolean;
  apiBaseUrl: string;
  dataSource: 'real' | 'mock';
  config: ApiConfig;
}

/**
 * Hook that exposes the current data source configuration
 * @returns Current data source information
 */
export const useDataSource = (): DataSourceConfig => {
  return {
    isUsingRealApi: config.useRealApi,
    apiBaseUrl: config.apiBaseUrl,
    dataSource: config.useRealApi ? 'real' : 'mock',
    config
  };
};


// Default export for main useApi hook
export default useApi;