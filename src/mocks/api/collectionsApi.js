/**
 * Mock Collections API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for collections,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import collections from '../data/collections';
import { delay, wrapResponse, createError, simulateRandomFailure, paginate } from '../utils/apiUtils';

// Deep clone collections array to avoid unintended side effects when modifying data
let collectionItems = JSON.parse(JSON.stringify(collections));

/**
 * Get all collections with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to collections
 */
export const getCollections = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch collections', 503, 'service_unavailable');
  
  const { 
    createdBy = null, 
    isShared = null, 
    parentId = null, 
    page = 1, 
    pageSize = 20,
    recursive = false
  } = options;
  
  // Filter collections
  let filtered = [...collectionItems];
  
  if (createdBy) {
    filtered = filtered.filter(collection => collection.createdBy === createdBy);
  }
  
  if (isShared !== null) {
    filtered = filtered.filter(collection => collection.isShared === (isShared === 'true' || isShared === true));
  }
  
  // Filter by parent ID
  if (parentId !== null) {
    // If recursive is true, get all descendants
    if (recursive) {
      const getDescendants = (parentId) => {
        const directChildren = filtered.filter(collection => collection.parentId === parentId);
        const descendants = [...directChildren];
        
        directChildren.forEach(child => {
          descendants.push(...getDescendants(child.id));
        });
        
        return descendants;
      };
      
      filtered = getDescendants(parentId);
    } else {
      filtered = filtered.filter(collection => collection.parentId === parentId);
    }
  }
  
  // Return paginated results
  const paginatedResults = paginate(filtered, page, pageSize);
  return wrapResponse(paginatedResults);
};

/**
 * Get a single collection by ID
 * @param {string} id - Collection ID
 * @returns {Promise} - Promise resolving to collection
 */
export const getCollectionById = async (id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch collection', 503, 'service_unavailable');
  
  const collection = collectionItems.find(collection => collection.id === id);
  if (!collection) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  return wrapResponse(collection);
};

/**
 * Get child collections for a given parent collection
 * @param {string} id - Parent collection ID
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to child collections
 */
export const getChildCollections = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch child collections', 503, 'service_unavailable');
  
  const { page = 1, pageSize = 20 } = options;
  
  // Check if parent collection exists
  const parentCollection = collectionItems.find(collection => collection.id === id);
  if (!parentCollection) {
    throw createError('Parent collection not found', 404, 'not_found');
  }
  
  // Get child collections
  const childCollections = collectionItems.filter(collection => collection.parentId === id);
  
  // Return paginated results
  const paginatedResults = paginate(childCollections, page, pageSize);
  return wrapResponse({
    parent: parentCollection,
    children: paginatedResults
  });
};

/**
 * Get collection contents (media items within a collection)
 * @param {string} id - Collection ID
 * @param {Object} options - Query options for pagination
 * @returns {Promise} - Promise resolving to media items in collection
 */
export const getCollectionContents = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch collection contents', 503, 'service_unavailable');
  
  const { page = 1, pageSize = 20, includeChildCollections = false } = options;
  
  // Check if collection exists
  const collection = collectionItems.find(collection => collection.id === id);
  if (!collection) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  let allItemIds = [...collection.items];
  
  // Include items from child collections if requested
  if (includeChildCollections === true || includeChildCollections === 'true') {
    const getChildItemIds = (parentId) => {
      const childCollections = collectionItems.filter(coll => coll.parentId === parentId);
      let childItemIds = [];
      
      childCollections.forEach(childCollection => {
        childItemIds = [...childItemIds, ...childCollection.items];
        // Recursively get items from nested collections
        childItemIds = [...childItemIds, ...getChildItemIds(childCollection.id)];
      });
      
      return childItemIds;
    };
    
    allItemIds = [...allItemIds, ...getChildItemIds(id)];
    // Remove duplicates
    allItemIds = [...new Set(allItemIds)];
  }
  
  // Get media items in collection
  const mediaItems = await import('../data/media')
    .then(module => {
      const allMedia = module.default;
      return allMedia.filter(item => allItemIds.includes(item.id));
    });
  
  // Return paginated results
  const paginatedItems = paginate(mediaItems, page, pageSize);
  return wrapResponse({
    collection,
    contents: paginatedItems
  });
};

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise} - Promise resolving to created collection
 */
export const createCollection = async (collectionData) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to create collection', 503, 'service_unavailable');
  
  // Validate required fields
  if (!collectionData.name) {
    throw createError('Collection name is required', 400, 'invalid_request');
  }
  
  // Validate parent ID if provided
  if (collectionData.parentId) {
    const parentExists = collectionItems.some(c => c.id === collectionData.parentId);
    if (!parentExists) {
      throw createError('Parent collection not found', 404, 'parent_not_found');
    }
  }
  
  // Generate random color if not specified
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', 
    '#14B8A6', '#8B5CF6', '#F43F5E', '#0EA5E9', '#F97316', '#EF4444'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Create new collection
  const newCollection = {
    id: `coll_${Date.now()}`,
    items: collectionData.items || [],
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    color: collectionData.color || randomColor,
    isShared: collectionData.isShared || false,
    sharedWith: collectionData.sharedWith || [],
    parentId: collectionData.parentId || null,
    ...collectionData
  };
  
  collectionItems.push(newCollection);
  return wrapResponse(newCollection, 'Collection created successfully');
};

/**
 * Update a collection
 * @param {string} id - Collection ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated collection
 */
export const updateCollection = async (id, updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update collection', 503, 'service_unavailable');
  
  const index = collectionItems.findIndex(collection => collection.id === id);
  if (index === -1) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  // Validate parent ID if provided
  if (updates.parentId) {
    // Prevent circular references
    if (updates.parentId === id) {
      throw createError('Collection cannot be its own parent', 400, 'invalid_parent');
    }
    
    // Check if parent exists
    const parentExists = collectionItems.some(c => c.id === updates.parentId);
    if (!parentExists) {
      throw createError('Parent collection not found', 404, 'parent_not_found');
    }
    
    // Check for circular references in the hierarchy
    const checkCircularReference = (parentId, childId) => {
      const parent = collectionItems.find(c => c.id === parentId);
      if (!parent) return false;
      if (parent.parentId === childId) return true;
      if (parent.parentId) return checkCircularReference(parent.parentId, childId);
      return false;
    };
    
    if (checkCircularReference(updates.parentId, id)) {
      throw createError('Circular reference detected in collection hierarchy', 400, 'circular_reference');
    }
  }
  
  // Create a copy of updates and exclude protected fields
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  delete allowedUpdates.created;
  
  // Update modified timestamp
  allowedUpdates.modified = new Date().toISOString();
  
  // Update collection
  collectionItems[index] = {
    ...collectionItems[index],
    ...allowedUpdates
  };
  
  return wrapResponse(collectionItems[index], 'Collection updated successfully');
};

/**
 * Delete a collection
 * @param {string} id - Collection ID
 * @param {Object} options - Delete options
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteCollection = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to delete collection', 503, 'service_unavailable');
  
  const { deleteChildren = false } = options;
  
  const index = collectionItems.findIndex(collection => collection.id === id);
  if (index === -1) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  // Check if collection has children
  const hasChildren = collectionItems.some(c => c.parentId === id);
  if (hasChildren && !deleteChildren) {
    throw createError('Collection has child collections. Set deleteChildren to true to delete anyway.', 400, 'has_children');
  }
  
  // Delete child collections recursively if requested
  if (deleteChildren) {
    const deleteChildCollections = (parentId) => {
      const childIds = collectionItems
        .filter(c => c.parentId === parentId)
        .map(c => c.id);
      
      // Recursively delete children of children
      childIds.forEach(deleteChildCollections);
      
      // Delete children
      collectionItems = collectionItems.filter(c => c.parentId !== parentId);
    };
    
    deleteChildCollections(id);
  }
  
  // Delete collection
  collectionItems.splice(index, 1);
  
  return wrapResponse(null, 'Collection deleted successfully');
};

/**
 * Add media items to a collection
 * @param {string} id - Collection ID
 * @param {Array} itemIds - Array of media item IDs to add
 * @returns {Promise} - Promise resolving to updated collection
 */
export const addItemsToCollection = async (id, itemIds) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to add items to collection', 503, 'service_unavailable');
  
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw createError('No media items specified', 400, 'invalid_request');
  }
  
  const index = collectionItems.findIndex(collection => collection.id === id);
  if (index === -1) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  // Validate that all media items exist
  const mediaItems = await import('../data/media').then(module => module.default);
  const existingMediaIds = mediaItems.map(item => item.id);
  const invalidIds = itemIds.filter(id => !existingMediaIds.includes(id));
  
  if (invalidIds.length > 0) {
    throw createError(
      `Invalid media item IDs: ${invalidIds.join(', ')}`,
      400,
      'invalid_media_ids'
    );
  }
  
  // Add items to collection (avoid duplicates)
  const currentItems = collectionItems[index].items || [];
  const newItems = [...new Set([...currentItems, ...itemIds])];
  
  // Update collection
  collectionItems[index] = {
    ...collectionItems[index],
    items: newItems,
    modified: new Date().toISOString()
  };
  
  return wrapResponse(collectionItems[index], 'Items added to collection successfully');
};

/**
 * Remove media items from a collection
 * @param {string} id - Collection ID
 * @param {Array} itemIds - Array of media item IDs to remove
 * @returns {Promise} - Promise resolving to updated collection
 */
export const removeItemsFromCollection = async (id, itemIds) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to remove items from collection', 503, 'service_unavailable');
  
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw createError('No media items specified', 400, 'invalid_request');
  }
  
  const index = collectionItems.findIndex(collection => collection.id === id);
  if (index === -1) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  // Remove items from collection
  const currentItems = collectionItems[index].items || [];
  const newItems = currentItems.filter(itemId => !itemIds.includes(itemId));
  
  // Update collection
  collectionItems[index] = {
    ...collectionItems[index],
    items: newItems,
    modified: new Date().toISOString()
  };
  
  return wrapResponse(collectionItems[index], 'Items removed from collection successfully');
};

/**
 * Share a collection with users
 * @param {string} id - Collection ID
 * @param {Array} userIds - Array of user IDs to share with
 * @returns {Promise} - Promise resolving to updated collection
 */
export const shareCollection = async (id, userIds) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to share collection', 503, 'service_unavailable');
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw createError('No users specified', 400, 'invalid_request');
  }
  
  const index = collectionItems.findIndex(collection => collection.id === id);
  if (index === -1) {
    throw createError('Collection not found', 404, 'not_found');
  }
  
  // Validate that all users exist
  const users = await import('../data/users').then(module => module.default);
  const existingUserIds = users.map(user => user.id);
  const invalidIds = userIds.filter(id => !existingUserIds.includes(id));
  
  if (invalidIds.length > 0) {
    throw createError(
      `Invalid user IDs: ${invalidIds.join(', ')}`,
      400,
      'invalid_user_ids'
    );
  }
  
  // Add users to sharedWith (avoid duplicates)
  const currentSharedWith = collectionItems[index].sharedWith || [];
  const newSharedWith = [...new Set([...currentSharedWith, ...userIds])];
  
  // Update collection
  collectionItems[index] = {
    ...collectionItems[index],
    isShared: true,
    sharedWith: newSharedWith,
    modified: new Date().toISOString()
  };
  
  return wrapResponse(collectionItems[index], 'Collection shared successfully');
};

// Export all collection API functions
export default {
  getCollections,
  getCollectionById,
  getChildCollections,
  getCollectionContents,
  createCollection,
  updateCollection,
  deleteCollection,
  addItemsToCollection,
  removeItemsFromCollection,
  shareCollection
};