/**
 * Real Collections API Service
 * 
 * Implements the same interface as the mock collectionsApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';

/**
 * Get all collections with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to collections
 */
export const getCollections = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/collections${queryString}`);
};

/**
 * Get a single collection by ID
 * @param {string} id - Collection ID
 * @returns {Promise} - Promise resolving to collection
 */
export const getCollectionById = async (id) => {
  return apiRequest(`/collections/${id}`);
};

/**
 * Get collection contents (media items within a collection)
 * @param {string} id - Collection ID
 * @param {Object} options - Query options for pagination
 * @returns {Promise} - Promise resolving to media items in collection
 */
export const getCollectionContents = async (id, options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/collections/${id}/contents${queryString}`);
};

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise} - Promise resolving to created collection
 */
export const createCollection = async (collectionData) => {
  return apiRequest('/collections', 'POST', collectionData);
};

/**
 * Update a collection
 * @param {string} id - Collection ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated collection
 */
export const updateCollection = async (id, updates) => {
  return apiRequest(`/collections/${id}`, 'PUT', updates);
};

/**
 * Delete a collection
 * @param {string} id - Collection ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteCollection = async (id) => {
  return apiRequest(`/collections/${id}`, 'DELETE');
};

/**
 * Add media items to a collection
 * @param {string} id - Collection ID
 * @param {Array} itemIds - Array of media item IDs to add
 * @returns {Promise} - Promise resolving to updated collection
 */
export const addItemsToCollection = async (id, itemIds) => {
  return apiRequest(`/collections/${id}/items`, 'POST', { itemIds });
};

/**
 * Remove media items from a collection
 * @param {string} id - Collection ID
 * @param {Array} itemIds - Array of media item IDs to remove
 * @returns {Promise} - Promise resolving to updated collection
 */
export const removeItemsFromCollection = async (id, itemIds) => {
  return apiRequest(`/collections/${id}/items`, 'DELETE', { itemIds });
};

/**
 * Share a collection with users
 * @param {string} id - Collection ID
 * @param {Array} userIds - Array of user IDs to share with
 * @returns {Promise} - Promise resolving to updated collection
 */
export const shareCollection = async (id, userIds) => {
  return apiRequest(`/collections/${id}/share`, 'POST', { userIds });
};

// Export all collection API functions
export default {
  getCollections,
  getCollectionById,
  getCollectionContents,
  createCollection,
  updateCollection,
  deleteCollection,
  addItemsToCollection,
  removeItemsFromCollection,
  shareCollection
};