/**
 * Real Media API Service
 * 
 * Implements the same interface as the mock mediaApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';

/**
 * Get all media items with optional filtering, sorting, and pagination
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to paginated media items
 */
export const getMedia = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/media${queryString}`);
};

/**
 * Get a single media item by ID
 * @param {string} id - Media item ID
 * @returns {Promise} - Promise resolving to media item
 */
export const getMediaById = async (id) => {
  return apiRequest(`/media/${id}`);
};

/**
 * Create a new media item
 * @param {Object} mediaItem - Media item data
 * @returns {Promise} - Promise resolving to created media item
 */
export const createMedia = async (mediaItem) => {
  return apiRequest('/media', 'POST', mediaItem);
};

/**
 * Update a media item
 * @param {string} id - Media item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated media item
 */
export const updateMedia = async (id, updates) => {
  return apiRequest(`/media/${id}`, 'PUT', updates);
};

/**
 * Delete a media item
 * @param {string} id - Media item ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteMedia = async (id) => {
  return apiRequest(`/media/${id}`, 'DELETE');
};

/**
 * Batch update media items
 * @param {Array} ids - Array of media item IDs
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to success message
 */
export const batchUpdateMedia = async (ids, updates) => {
  return apiRequest('/media/batch', 'PUT', { ids, updates });
};

/**
 * Batch delete media items
 * @param {Array} ids - Array of media item IDs
 * @returns {Promise} - Promise resolving to success message
 */
export const batchDeleteMedia = async (ids) => {
  return apiRequest('/media/batch', 'DELETE', { ids });
};

/**
 * Get media usage statistics
 * @returns {Promise} - Promise resolving to usage statistics
 */
export const getMediaStats = async () => {
  return apiRequest('/media/stats');
};

// Export all media API functions
export default {
  getMedia,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  batchUpdateMedia,
  batchDeleteMedia,
  getMediaStats
};