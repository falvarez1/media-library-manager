/**
 * Mock Media API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for media items,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import media from '../data/media';
import { delay, wrapResponse, createError, simulateRandomFailure, paginate } from '../utils/apiUtils';

// Deep clone media array to avoid unintended side effects when modifying data
let mediaItems = JSON.parse(JSON.stringify(media));

/**
 * Get all media items with optional filtering, sorting, and pagination
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to paginated media items
 */
export const getMedia = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to fetch media items', 503, 'service_unavailable');
  
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'name',
    sortOrder = 'asc',
    folder = null,
    collection = null,
    search = '',
    types = [],
    tags = [],
    status = [],
    used = null,
    dateFrom = null,
    dateTo = null,
    starred = null,
    favorited = null
  } = options;
  
  // Filter by folder
  let filtered = [...mediaItems];
  
  if (folder && folder !== 'all') {
    try {
      // Import folders to get the hierarchy
      const foldersModule = await import('../data/folders');
      const allFolders = foldersModule.default;
      
      // Get all folders that are direct or indirect children of the selected folder
      const folderIds = [folder];
      
      // Helper function to find child folders
      const findChildFolders = (parentId) => {
        const childFolders = allFolders.filter(f => f.parent === parentId);
        childFolders.forEach(child => {
          folderIds.push(child.id);
          findChildFolders(child.id);
        });
      };
      
      // Find all child folders
      findChildFolders(folder);
      
      // Filter media by any folder in the hierarchy
      filtered = filtered.filter(item => folderIds.includes(item.folder));
    } catch (error) {
      console.error('Error filtering by folder:', error);
      // If there's an error, just filter by the exact folder ID
      filtered = filtered.filter(item => item.folder === folder);
    }
  }
  
  // Filter by collection
  if (collection) {
    try {
      // In a real implementation, this would be a server-side join
      // Here we're simulating it by filtering items that belong to the collection
      const collectionsModule = await import('../data/collections');
      const allCollections = collectionsModule.default;
      const targetCollection = allCollections.find(c => c.id === collection);
      const collectionItems = targetCollection ? targetCollection.items : [];
      
      filtered = filtered.filter(item => collectionItems.includes(item.id));
    } catch (error) {
      console.error('Error filtering by collection:', error);
    }
  }
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.path.toLowerCase().includes(searchLower) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      (item.ai_tags && item.ai_tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  // Filter by type
  if (types.length > 0) {
    filtered = filtered.filter(item => types.includes(item.type));
  }
  
  // Filter by tags
  if (tags.length > 0) {
    filtered = filtered.filter(item => 
      item.tags && tags.some(tag => item.tags.includes(tag))
    );
  }
  
  // Filter by status
  if (status.length > 0) {
    filtered = filtered.filter(item => status.includes(item.status));
  }
  
  // Filter by usage
  if (used !== null) {
    filtered = filtered.filter(item => item.used === (used === 'true' || used === true));
  }
  
  // Filter by date range
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filtered = filtered.filter(item => new Date(item.modified) >= fromDate);
  }
  
  if (dateTo) {
    const toDate = new Date(dateTo);
    filtered = filtered.filter(item => new Date(item.modified) <= toDate);
  }
  
  // Filter by starred/favorited
  if (starred !== null) {
    filtered = filtered.filter(item => item.starred === (starred === 'true' || starred === true));
  }
  
  if (favorited !== null) {
    filtered = filtered.filter(item => item.favorited === (favorited === 'true' || favorited === true));
  }
  
  // Sort results
  filtered.sort((a, b) => {
    let valueA, valueB;
    
    switch(sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'size':
        // Convert size strings to comparable numbers
        valueA = parseFloat(a.size);
        valueB = parseFloat(b.size);
        break;
      case 'date':
      case 'modified':
        valueA = new Date(a.modified);
        valueB = new Date(b.modified);
        break;
      case 'created':
        valueA = new Date(a.created);
        valueB = new Date(b.created);
        break;
      case 'type':
        valueA = a.type;
        valueB = b.type;
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }
    
    // Handle non-comparable values
    if (valueA === valueB) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;
    
    // Apply sort order
    const result = valueA < valueB ? -1 : 1;
    return sortOrder === 'asc' ? result : -result;
  });
  
  // Return paginated results
  const paginatedResult = paginate(filtered, page, pageSize);
  return wrapResponse(paginatedResult);
};

/**
 * Get a single media item by ID
 * @param {string} id - Media item ID
 * @returns {Promise} - Promise resolving to media item
 */
export const getMediaById = async (id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch media item', 503, 'service_unavailable');
  
  const item = mediaItems.find(item => item.id === id);
  if (!item) {
    throw createError('Media item not found', 404, 'not_found');
  }
  
  return wrapResponse(item);
};

/**
 * Create a new media item
 * @param {Object} mediaItem - Media item data
 * @returns {Promise} - Promise resolving to created media item
 */
export const createMedia = async (mediaItem) => {
  await delay(1000); // Longer delay to simulate upload
  simulateRandomFailure(0.05, 'Failed to create media item', 503, 'service_unavailable');
  
  // Validate required fields
  if (!mediaItem.name || !mediaItem.type || !mediaItem.folder) {
    throw createError('Missing required fields', 400, 'invalid_request');
  }
  
  // Create new item with defaults
  const newItem = {
    id: `${Date.now()}`,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    starred: false,
    favorited: false,
    used: false,
    usedIn: [],
    status: 'draft',
    tags: [],
    ...mediaItem
  };
  
  mediaItems.push(newItem);
  return wrapResponse(newItem, 'Media item created successfully');
};

/**
 * Update a media item
 * @param {string} id - Media item ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated media item
 */
export const updateMedia = async (id, updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update media item', 503, 'service_unavailable');
  
  const index = mediaItems.findIndex(item => item.id === id);
  if (index === -1) {
    throw createError('Media item not found', 404, 'not_found');
  }
  
  // Prevent updating certain properties
  // Create a copy of updates and exclude protected fields
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  delete allowedUpdates.created;
  
  // Update item
  mediaItems[index] = {
    ...mediaItems[index],
    ...allowedUpdates,
    modified: new Date().toISOString()
  };
  
  return wrapResponse(mediaItems[index], 'Media item updated successfully');
};

/**
 * Delete a media item
 * @param {string} id - Media item ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteMedia = async (id) => {
  await delay();
  simulateRandomFailure(0.05, 'Failed to delete media item', 503, 'service_unavailable');
  
  const index = mediaItems.findIndex(item => item.id === id);
  if (index === -1) {
    throw createError('Media item not found', 404, 'not_found');
  }
  
  // Check if used in collections
  const collections = await import('../data/collections').then(module => module.default);
  const usedInCollections = collections.filter(collection => 
    collection.items && collection.items.includes(id)
  );
  
  if (usedInCollections.length > 0) {
    throw createError(
      `Cannot delete item that is used in ${usedInCollections.length} collection(s)`,
      409,
      'item_in_use'
    );
  }
  
  // Delete item
  mediaItems.splice(index, 1);
  return wrapResponse(null, 'Media item deleted successfully');
};

/**
 * Batch update media items
 * @param {Array} ids - Array of media item IDs
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to success message
 */
export const batchUpdateMedia = async (ids, updates) => {
  await delay(1200); // Longer delay for batch operation
  simulateRandomFailure(0.05, 'Failed to update media items', 503, 'service_unavailable');
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError('No media items specified', 400, 'invalid_request');
  }
  
  // Prevent updating certain properties
  // Create a copy of updates and exclude protected fields
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  delete allowedUpdates.created;
  
  // Track successful updates
  const updated = [];
  const failed = [];
  
  // Update each item
  for (const id of ids) {
    const index = mediaItems.findIndex(item => item.id === id);
    if (index === -1) {
      failed.push({ id, reason: 'not_found' });
      continue;
    }
    
    mediaItems[index] = {
      ...mediaItems[index],
      ...allowedUpdates,
      modified: new Date().toISOString()
    };
    
    updated.push(mediaItems[index]);
  }
  
  return wrapResponse({ 
    updated, 
    failed,
    totalUpdated: updated.length,
    totalFailed: failed.length
  }, 'Media items updated successfully');
};

/**
 * Batch delete media items
 * @param {Array} ids - Array of media item IDs
 * @returns {Promise} - Promise resolving to success message
 */
export const batchDeleteMedia = async (ids) => {
  await delay(1500); // Longer delay for batch operation
  simulateRandomFailure(0.05, 'Failed to delete media items', 503, 'service_unavailable');
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError('No media items specified', 400, 'invalid_request');
  }
  
  // Track successful deletes and failures
  const deleted = [];
  const failed = [];
  
  // Check if used in collections
  const collections = await import('../data/collections').then(module => module.default);
  
  // Delete each item
  for (const id of ids) {
    const index = mediaItems.findIndex(item => item.id === id);
    if (index === -1) {
      failed.push({ id, reason: 'not_found' });
      continue;
    }
    
    // Check if used in collections
    const usedInCollections = collections.filter(collection => 
      collection.items && collection.items.includes(id)
    );
    
    if (usedInCollections.length > 0) {
      failed.push({ 
        id, 
        reason: 'item_in_use',
        message: `Used in ${usedInCollections.length} collection(s)`
      });
      continue;
    }
    
    deleted.push(mediaItems[index]);
    mediaItems.splice(index, 1);
  }
  
  return wrapResponse({
    deleted,
    failed,
    totalDeleted: deleted.length,
    totalFailed: failed.length
  }, 'Media items deleted successfully');
};

/**
 * Get media usage statistics
 * @returns {Promise} - Promise resolving to usage statistics
 */
export const getMediaStats = async () => {
  await delay();
  simulateRandomFailure(0.01, 'Failed to fetch media statistics', 503, 'service_unavailable');
  
  const totalCount = mediaItems.length;
  const typeCount = mediaItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  
  const usedCount = mediaItems.filter(item => item.used).length;
  const unusedCount = totalCount - usedCount;
  
  const totalSize = mediaItems.reduce((acc, item) => {
    // Extract numeric part of size string and convert to MB
    const match = item.size.match(/(\d+(\.\d+)?)\s*MB/);
    if (match) {
      return acc + parseFloat(match[1]);
    }
    return acc;
  }, 0);
  
  return wrapResponse({
    totalCount,
    typeCount,
    usedCount,
    unusedCount,
    totalSize: `${totalSize.toFixed(1)} MB`,
    latestUpload: mediaItems.sort((a, b) => 
      new Date(b.created) - new Date(a.created)
    )[0]
  });
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