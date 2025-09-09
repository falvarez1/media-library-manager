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

/**
 * Get job status
 * @param {string} jobId - Job ID to check status for
 * @returns {Promise} - Promise resolving to job status
 */
export const getJobStatus = async (jobId) => {
  return apiRequest(`/jobs/${jobId}`, 'GET');
};

/**
 * Cancel a job
 * @param {string} jobId - Job ID to cancel
 * @returns {Promise} - Promise resolving to cancellation status
 */
export const cancelJob = async (jobId) => {
  return apiRequest(`/jobs/${jobId}/cancel`, 'POST');
};

/**
 * Duplicate media items
 * @param {Array} ids - Array of media item IDs to duplicate
 * @returns {Promise} - Promise resolving to duplicated items
 */
export const duplicateMedia = async (ids) => {
  return apiRequest('/media/duplicate', 'POST', { ids });
};

/**
 * Rename media item
 * @param {string} id - Media item ID
 * @param {string} newName - New name for the media item
 * @returns {Promise} - Promise resolving to updated item
 */
export const renameMedia = async (id, newName) => {
  return apiRequest(`/media/${id}/rename`, 'POST', { newName });
};

/**
 * Convert media format
 * @param {Array} ids - Array of media item IDs to convert
 * @param {Object} options - Conversion options (format, quality, etc.)
 * @returns {Promise} - Promise resolving to conversion job ID
 */
export const convertMedia = async (ids, options = {}) => {
  return apiRequest('/media/convert', 'POST', { ids, options });
};

/**
 * Compress media files
 * @param {Array} ids - Array of media item IDs to compress
 * @param {Object} options - Compression options (quality, format, etc.)
 * @returns {Promise} - Promise resolving to compression job ID
 */
export const compressMedia = async (ids, options = {}) => {
  return apiRequest('/media/compress', 'POST', { ids, options });
};

/**
 * Generate thumbnails for media
 * @param {Array} ids - Array of media item IDs
 * @param {Object} options - Thumbnail options (size, quality, etc.)
 * @returns {Promise} - Promise resolving to thumbnail generation status
 */
export const generateThumbnails = async (ids, options = {}) => {
  return apiRequest('/media/thumbnails', 'POST', { ids, options });
};

/**
 * Extract metadata from media files
 * @param {Array} ids - Array of media item IDs
 * @returns {Promise} - Promise resolving to extracted metadata
 */
export const extractMetadata = async (ids) => {
  return apiRequest('/media/metadata', 'POST', { ids });
};

/**
 * Validate media files
 * @param {Array} ids - Array of media item IDs to validate
 * @returns {Promise} - Promise resolving to validation results
 */
export const validateMedia = async (ids) => {
  return apiRequest('/media/validate', 'POST', { ids });
};

/**
 * Restore media from trash
 * @param {Array} ids - Array of media item IDs to restore
 * @returns {Promise} - Promise resolving to restored items
 */
export const restoreMedia = async (ids) => {
  return apiRequest('/media/restore', 'POST', { ids });
};

/**
 * Permanently delete media items
 * @param {Array} ids - Array of media item IDs to permanently delete
 * @returns {Promise} - Promise resolving to deletion status
 */
export const permanentlyDeleteMedia = async (ids) => {
  return apiRequest('/media/delete/permanent', 'POST', { ids });
};

export default {
  moveMedia,
  copyMedia,
  exportMedia,
  shareMedia,
  bulkImport,
  getJobStatus,
  cancelJob,
  duplicateMedia,
  renameMedia,
  convertMedia,
  compressMedia,
  generateThumbnails,
  extractMetadata,
  validateMedia,
  restoreMedia,
  permanentlyDeleteMedia
};