/**
 * Mock Tags API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for tags,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import tags from '../data/tags';
import { delay, wrapResponse, createError, simulateRandomFailure } from '../utils/apiUtils';

// Deep clone tags array to avoid unintended side effects when modifying data
let tagItems = JSON.parse(JSON.stringify(tags));

/**
 * Get all tags
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to tags
 */
export const getTags = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch tags', 503, 'service_unavailable');
  
  let result = [...tagItems];
  
  // Sort by name or count if specified
  if (options.sortBy === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (options.sortBy === 'count') {
    result.sort((a, b) => b.count - a.count);
  }
  
  // Apply limit if specified
  if (options.limit && !isNaN(options.limit)) {
    result = result.slice(0, parseInt(options.limit));
  }
  
  return wrapResponse(result);
};

/**
 * Get a single tag by ID
 * @param {string} id - Tag ID
 * @returns {Promise} - Promise resolving to tag
 */
export const getTagById = async (id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch tag', 503, 'service_unavailable');
  
  const tag = tagItems.find(tag => tag.id === id);
  if (!tag) {
    throw createError('Tag not found', 404, 'not_found');
  }
  
  return wrapResponse(tag);
};

/**
 * Get media items with a specific tag
 * @param {string} id - Tag ID
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to media items with tag
 */
export const getMediaWithTag = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch media with tag', 503, 'service_unavailable');
  
  // Check if tag exists
  const tag = tagItems.find(tag => tag.id === id);
  if (!tag) {
    throw createError('Tag not found', 404, 'not_found');
  }
  
  // Get media items with this tag
  const mediaItems = await import('../data/media')
    .then(module => {
      const allMedia = module.default;
      return allMedia.filter(item => 
        item.tags && item.tags.includes(tag.name)
      );
    });
  
  // Apply pagination if specified
  let result = mediaItems;
  if (options.page && options.pageSize) {
    const page = parseInt(options.page);
    const pageSize = parseInt(options.pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    result = {
      items: mediaItems.slice(start, end),
      meta: {
        total: mediaItems.length,
        page,
        pageSize,
        totalPages: Math.ceil(mediaItems.length / pageSize)
      }
    };
  }
  
  return wrapResponse({
    tag,
    media: result
  });
};

/**
 * Create a new tag
 * @param {Object} tagData - Tag data
 * @returns {Promise} - Promise resolving to created tag
 */
export const createTag = async (tagData) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to create tag', 503, 'service_unavailable');
  
  // Validate required fields
  if (!tagData.name) {
    throw createError('Tag name is required', 400, 'invalid_request');
  }
  
  // Check if tag already exists
  const tagExists = tagItems.some(tag => 
    tag.name.toLowerCase() === tagData.name.toLowerCase()
  );
  
  if (tagExists) {
    throw createError('Tag with this name already exists', 409, 'tag_exists');
  }
  
  // Generate random color if not specified
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', 
    '#14B8A6', '#8B5CF6', '#F43F5E', '#0EA5E9', '#F97316', '#EF4444'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Create new tag
  const newTag = {
    id: `tag_${Date.now()}`,
    count: 0,
    color: tagData.color || randomColor,
    ...tagData
  };
  
  tagItems.push(newTag);
  return wrapResponse(newTag, 'Tag created successfully');
};

/**
 * Update a tag
 * @param {string} id - Tag ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated tag
 */
export const updateTag = async (id, updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update tag', 503, 'service_unavailable');
  
  const index = tagItems.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw createError('Tag not found', 404, 'not_found');
  }
  
  // Check if name is being updated and already exists
  if (updates.name && updates.name !== tagItems[index].name) {
    const nameExists = tagItems.some(tag => 
      tag.id !== id && tag.name.toLowerCase() === updates.name.toLowerCase()
    );
    
    if (nameExists) {
      throw createError('Tag with this name already exists', 409, 'tag_exists');
    }
  }
  
  // Create a copy of updates and exclude protected fields
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  delete allowedUpdates.count;
  
  // Update tag
  tagItems[index] = {
    ...tagItems[index],
    ...allowedUpdates
  };
  
  return wrapResponse(tagItems[index], 'Tag updated successfully');
};

/**
 * Delete a tag
 * @param {string} id - Tag ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteTag = async (id) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to delete tag', 503, 'service_unavailable');
  
  const index = tagItems.findIndex(tag => tag.id === id);
  if (index === -1) {
    throw createError('Tag not found', 404, 'not_found');
  }
  
  // Get the tag name before deletion for media updates
  const tagName = tagItems[index].name;
  
  // Delete tag
  tagItems.splice(index, 1);
  
  // In a real implementation, we would remove this tag from all media items
  // Here we're simulating that by importing and updating the media items
  // This is not ideal in a mock implementation, but demonstrates the concept
  try {
    const mediaModule = await import('../data/media');
    const mediaItems = mediaModule.default;
    
    // Update media items to remove the tag
    // Note: In a real implementation, this would be a database transaction
    for (const item of mediaItems) {
      if (item.tags && item.tags.includes(tagName)) {
        item.tags = item.tags.filter(tag => tag !== tagName);
      }
    }
  } catch (error) {
    console.error('Error updating media items after tag deletion:', error);
  }
  
  return wrapResponse(null, 'Tag deleted successfully');
};

/**
 * Get popular tags based on usage count
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to popular tags
 */
export const getPopularTags = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch popular tags', 503, 'service_unavailable');
  
  const { limit = 10 } = options;
  
  // Sort by count descending and take top N
  const popularTags = [...tagItems]
    .sort((a, b) => b.count - a.count)
    .slice(0, parseInt(limit));
  
  return wrapResponse(popularTags);
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