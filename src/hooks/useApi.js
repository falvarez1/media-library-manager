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
  return useApi(api.media.getMedia, deps, { items: [], meta: {} }, options);
};

export const useMediaItem = (id, deps = []) => {
  return useApi(
    useCallback(() => api.media.getMediaById(id), [id]), 
    [id, ...deps]
  );
};

// Common API hooks for folders
export const useFolders = (options = {}, deps = []) => {
  return useApi(api.folders.getFolders, deps, [], options);
};

export const useFolderTree = (deps = []) => {
  return useApi(api.folders.getFolderTree, deps, []);
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

// Common API hooks for tags
export const useTags = (options = {}, deps = []) => {
  return useApi(api.tags.getTags, deps, [], options);
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