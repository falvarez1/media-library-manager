/**
 * Media Operations API Service
 * 
 * Provides functionality for media file operations like move, copy, and batch operations
 */

import { apiRequest } from './apiUtils';

/**
 * Move media items to a different folder
 * @param {Array} ids - Array of media item IDs to move
 * @param {string} targetFolderId - Target folder ID
 * @returns {Promise} - Promise resolving to success message
 */
export const moveMedia = async (ids, targetFolderId) => {
  return apiRequest('/media/move', 'POST', { ids, targetFolderId });
};

/**
 * Copy media items to a different folder
 * @param {Array} ids - Array of media item IDs to copy
 * @param {string} targetFolderId - Target folder ID
 * @returns {Promise} - Promise resolving to success message
 */
export const copyMedia = async (ids, targetFolderId) => {
  return apiRequest('/media/copy', 'POST', { ids, targetFolderId });
};

/**
 * Export media items
 * @param {Array} ids - Array of media item IDs to export
 * @param {Object} options - Export options (format, quality, etc.)
 * @returns {Promise} - Promise resolving to export URL
 */
export const exportMedia = async (ids, options = {}) => {
  return apiRequest('/media/export', 'POST', { ids, options });
};

/**
 * Share media items
 * @param {Array} ids - Array of media item IDs to share
 * @param {Object} shareOptions - Share options (recipients, permissions, expiry)
 * @returns {Promise} - Promise resolving to sharing info
 */
export const shareMedia = async (ids, shareOptions = {}) => {
  return apiRequest('/media/share', 'POST', { ids, shareOptions });
};

/**
 * Import media items in bulk
 * @param {Object} importOptions - Import options (source, filter, etc.)
 * @returns {Promise} - Promise resolving to imported items
 */
export const bulkImport = async (importOptions = {}) => {
  return apiRequest('/media/import', 'POST', importOptions);
};

export default {
  moveMedia,
  copyMedia,
  exportMedia,
  shareMedia,
  bulkImport
};