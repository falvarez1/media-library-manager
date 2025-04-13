/**
 * Custom hook for consuming the API services
 * 
 * This hook provides a consistent way to integrate the service layer with React components,
 * handling loading states, errors, and API responses.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services';
import config from '../services/config';

/**
 * Generic hook for making API calls
 * @param {Function} apiFn - API function to call
 * @param {Array} deps - Dependencies array for useEffect
 * @param {any} initialData - Initial data
 * @param {Object} initialParams - Initial parameters for the API call
 * @returns {Object} - Data, loading state, error, and refetch function
 */
export const useApi = (apiFn, deps = [], initialData = null, initialParams = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (callParams = params) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFn(callParams);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn, params]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  // Function to update params and refetch
  const refetch = useCallback((newParams = null) => {
    if (newParams !== null) {
      setParams(newParams);
      return fetchData(newParams);
    }
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Common API hooks for media
export const useMedia = (options = {}, deps = []) => {
  // Make sure we're passing the folder parameter correctly
  const executeApi = async () => {
    console.log("useMedia hook calling API with options:", options);
    // Directly pass the folder parameter as first argument if it exists
    if (options && options.folder) {
      console.log("Using direct folder parameter:", options.folder);
      const otherOptions = { ...options };
      delete otherOptions.folder;
      return await api.media.getMedia(options.folder, otherOptions);
    } else {
      // Otherwise use the standard options object
      return await api.media.getMedia(options);
    }
  };
  
  return useApi(executeApi, deps, { items: [], meta: {} });
};

export const useMediaItem = (id, deps = []) => {
  return useApi(
    useCallback(() => api.media.getMediaById(id), [id]), 
    [id, ...deps]
  );
};

// Common API hooks for folders
export const useFolders = (options = {}, deps = []) => {
  // Log folder requests for debugging
  console.log('useFolders Hook: Requesting folders with options:', JSON.stringify(options));

  // Get all folders at once to ensure we have complete hierarchy data
  const fetchAllFolders = async () => {
    const response = await api.folders.getFolders();
    console.log(`useFolders Hook: Received ${response.data.length} folders`);
    return response;
  };
  
  const result = useApi(fetchAllFolders, deps, []);
  
  return result;
};

export const useFolderTree = (deps = []) => {
  return useApi(api.folders.getFolderTree, deps, []);
};

export const useCreateFolder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createFolder = async (folderData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.createFolder(folderData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createFolder, loading, error, success };
};

export const useUpdateFolder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updateFolder = async (id, updates) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.updateFolder(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateFolder, loading, error, success };
};

export const useDeleteFolder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const deleteFolder = async (id, options = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.folders.deleteFolder(id, options);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteFolder, loading, error, success };
};

export const useFolderContents = (id, options = {}, deps = []) => {
  return useApi(
    useCallback(() => api.folders.getFolderContents(id, options), [id, options]), 
    [id, ...deps]
  );
};

// Common API hooks for collections
export const useCollections = (options = {}, deps = []) => {
  return useApi(api.collections.getCollections, deps, { items: [], meta: {} }, options);
};

export const useCollectionContents = (id, options = {}, deps = []) => {
  return useApi(
    useCallback(() => api.collections.getCollectionContents(id, options), [id, options]), 
    [id, ...deps]
  );
};

export const useCollection = (id, deps = []) => {
  return useApi(
    useCallback(() => api.collections.getCollectionById(id), [id]),
    [id, ...deps]
  );
};

export const useChildCollections = (id, options = {}, deps = []) => {
  return useApi(
    useCallback(() => api.collections.getChildCollections(id, options), [id, options]),
    [id, ...deps]
  );
};

export const useCreateCollection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createCollection = async (collectionData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.createCollection(collectionData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCollection, loading, error, success };
};

export const useUpdateCollection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updateCollection = async (id, updates) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.updateCollection(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateCollection, loading, error, success };
};

export const useDeleteCollection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const deleteCollection = async (id, options = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.deleteCollection(id, options);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCollection, loading, error, success };
};

export const useAddItemsToCollection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const addItems = async (collectionId, itemIds) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.addItemsToCollection(collectionId, itemIds);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addItems, loading, error, success };
};

export const useRemoveItemsFromCollection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const removeItems = async (collectionId, itemIds) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.collections.removeItemsFromCollection(collectionId, itemIds);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { removeItems, loading, error, success };
};

// Hooks for media operations
export const useMoveMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const moveMedia = async (mediaIds, targetFolderId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.moveMedia(mediaIds, targetFolderId);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { moveMedia, loading, error, success };
};

export const useCopyMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const copyMedia = async (mediaIds, targetFolderId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.copyMedia(mediaIds, targetFolderId);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { copyMedia, loading, error, success };
};

export const useExportMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const exportMedia = async (mediaIds, options = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.exportMedia(mediaIds, options);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { exportMedia, loading, error, success };
};

export const useShareMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const shareMedia = async (mediaIds, shareOptions = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.shareMedia(mediaIds, shareOptions);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { shareMedia, loading, error, success };
};

export const useBulkImport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const bulkImport = async (importOptions = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.mediaOperations.bulkImport(importOptions);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { bulkImport, loading, error, success };
};

// Common API hooks for tags
export const useTags = (options = {}, deps = []) => {
  return useApi(api.tags.getTags, deps, [], options);
};

export const useTagById = (id, deps = []) => {
  return useApi(
    useCallback(() => api.tags.getTagById(id), [id]),
    [id, ...deps]
  );
};

export const useTagCategories = (deps = []) => {
  return useApi(api.tags.getTagCategories, deps, []);
};

export const useCreateTag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createTag = async (tagData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.createTag(tagData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTag, loading, error, success };
};

export const useUpdateTag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updateTag = async (id, updates) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.updateTag(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTag, loading, error, success };
};

export const useDeleteTag = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const deleteTag = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.deleteTag(id);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTag, loading, error, success };
};

export const useCreateTagCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.createTagCategory(categoryData);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCategory, loading, error, success };
};

export const useUpdateTagCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const updateCategory = async (id, updates) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.updateTagCategory(id, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateCategory, loading, error, success };
};

export const useBatchUpdateTags = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const batchUpdate = async (mediaIds, updates) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.tags.batchUpdateTags(mediaIds, updates);
      setSuccess(response);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { batchUpdate, loading, error, success };
};

export const usePopularTags = (options = {}, deps = []) => {
  return useApi(api.tags.getPopularTags, deps, [], options);
};

export const useTagSuggestions = (query, options = {}, deps = []) => {
  const mergedOptions = { ...options, query };
  return useApi(
    api.tags.getTagSuggestions,
    [query, ...deps],
    [],
    mergedOptions
  );
};

export const useMediaWithTag = (tagId, options = {}, deps = []) => {
  return useApi(
    useCallback(() => api.tags.getMediaWithTag(tagId, options), [tagId, options]),
    [tagId, ...deps]
  );
};

// Common API hooks for users
export const useCurrentUser = (deps = []) => {
  return useApi(api.users.getCurrentUser, deps, null);
};


/**
 * Hook that exposes the current data source configuration
 * @returns {Object} - Current data source information
 */
export const useDataSource = () => {
  return {
    isUsingRealApi: config.useRealApi,
    apiBaseUrl: config.apiBaseUrl,
    dataSource: config.useRealApi ? 'real' : 'mock',
    config
  };
};

export default useApi;