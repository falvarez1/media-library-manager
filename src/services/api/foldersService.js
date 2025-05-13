/**
 * Real Folders API Service
 * 
 * Implements the same interface as the mock foldersApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';

/**
 * Get all folders with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to folders
 */
export const getFolders = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/folders${queryString}`);
};

/**
 * Get folder tree structure (hierarchical)
 * @returns {Promise} - Promise resolving to folder tree
 */
export const getFolderTree = async () => {
  return apiRequest('/folders/tree');
};

/**
 * Get a single folder by ID
 * @param {string} id - Folder ID
 * @returns {Promise} - Promise resolving to folder
 */
export const getFolderById = async (id) => {
  return apiRequest(`/folders/${id}`);
};

/**
 * Get folder contents (media items within a folder)
 * @param {string} id - Folder ID
 * @param {Object} options - Query options for pagination
 * @returns {Promise} - Promise resolving to media items in folder
 */
export const getFolderContents = async (id, options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/folders/${id}/contents${queryString}`);
};

/**
 * Create a new folder
 * @param {Object} folderData - Folder data
 * @returns {Promise} - Promise resolving to created folder
 */
export const createFolder = async (folderData) => {
  return apiRequest('/folders', 'POST', folderData);
};

/**
 * Update a folder
 * @param {string} id - Folder ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated folder
 */
export const updateFolder = async (id, updates) => {
  return apiRequest(`/folders/${id}`, 'PUT', updates);
};

/**
 * Delete a folder
 * @param {string} id - Folder ID
 * @param {Object} options - Delete options
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteFolder = async (id, options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/folders/${id}${queryString}`, 'DELETE');
};

// Export all folder API functions
export default {
  getFolders,
  getFolderTree,
  getFolderById,
  getFolderContents,
  createFolder,
  updateFolder,
  deleteFolder
};