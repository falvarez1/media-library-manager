/**
 * Real Tags API Service
 * 
 * Implements the same interface as the mock tagsApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';

/**
 * Get all tags
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to tags
 */
export const getTags = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/tags${queryString}`);
};

/**
 * Get a single tag by ID
 * @param {string} id - Tag ID
 * @returns {Promise} - Promise resolving to tag
 */
export const getTagById = async (id) => {
  return apiRequest(`/tags/${id}`);
};

/**
 * Get media items with a specific tag
 * @param {string} id - Tag ID
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to media items with tag
 */
export const getMediaWithTag = async (id, options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/tags/${id}/media${queryString}`);
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise} - Promise resolving to created tag
 */
export const createTag = async (tagData) => {
  return apiRequest('/tags', 'POST', tagData);
};

/**
 * Update a tag
 * @param {string} id - Tag ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated tag
 */
export const updateTag = async (id, updates) => {
  return apiRequest(`/tags/${id}`, 'PUT', updates);
};

/**
 * Delete a tag
 * @param {string} id - Tag ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteTag = async (id) => {
  return apiRequest(`/tags/${id}`, 'DELETE');
};

/**
 * Get popular tags based on usage count
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to popular tags
 */
export const getPopularTags = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/tags/popular${queryString}`);
};

// Export all tag API functions
export default {
  getTags,
  getTagById,
  getMediaWithTag,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags
};