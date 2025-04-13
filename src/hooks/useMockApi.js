/**
 * Custom hook for consuming the mock API
 * 
 * This hook provides a consistent way to integrate the mock API with React components,
 * handling loading states, errors, and API responses.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../mocks/api';

/**
 * Generic hook for making API calls
 * @param {Function} apiFn - API function to call
 * @param {Array} deps - Dependencies array for useEffect
 * @param {any} initialData - Initial data
 * @param {Object} initialParams - Initial parameters for the API call
 * @returns {Object} - Data, loading state, error, and refetch function
 */
export const useMockApi = (apiFn, deps = [], initialData = null, initialParams = null) => {
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
  return useMockApi(api.media.getMedia, deps, { items: [], meta: {} }, options);
};

export const useMediaItem = (id, deps = []) => {
  return useMockApi(
    useCallback(() => api.media.getMediaById(id), [id]), 
    [id, ...deps]
  );
};

// Common API hooks for folders
export const useFolders = (options = {}, deps = []) => {
  return useMockApi(api.folders.getFolders, deps, [], options);
};

export const useFolderTree = (deps = []) => {
  return useMockApi(api.folders.getFolderTree, deps, []);
};

export const useFolderContents = (id, options = {}, deps = []) => {
  return useMockApi(
    useCallback(() => api.folders.getFolderContents(id, options), [id, options]), 
    [id, ...deps]
  );
};

// Common API hooks for collections
export const useCollections = (options = {}, deps = []) => {
  return useMockApi(api.collections.getCollections, deps, { items: [], meta: {} }, options);
};

export const useCollectionContents = (id, options = {}, deps = []) => {
  return useMockApi(
    useCallback(() => api.collections.getCollectionContents(id, options), [id, options]), 
    [id, ...deps]
  );
};

// Common API hooks for tags
export const useTags = (options = {}, deps = []) => {
  return useMockApi(api.tags.getTags, deps, [], options);
};

// Common API hooks for users
export const useCurrentUser = (deps = []) => {
  return useMockApi(api.users.getCurrentUser, deps, null);
};

export default useMockApi;