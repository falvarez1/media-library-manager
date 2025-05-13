/**
 * Mock Tags API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for tags,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import { tags, tagCategories } from '../data/tags';
import { delay, wrapResponse, createError, simulateRandomFailure } from '../utils/apiUtils';

// Deep clone tags array to avoid unintended side effects when modifying data
let tagItems = JSON.parse(JSON.stringify(tags));
let tagCategoryItems = JSON.parse(JSON.stringify(tagCategories));

/**
 * Get all tags
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to tags
 */
export const getTags = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch tags', 503, 'service_unavailable');
  
  let result = [...tagItems];
  const { categoryId, sortBy = 'name', sortDir = 'asc', limit, search } = options;
  
  // Filter by category if specified
  if (categoryId) {
    result = result.filter(tag => tag.categoryId === categoryId);
  }
  
  // Filter by search term if specified
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter(tag => tag.name.toLowerCase().includes(searchTerm));
  }
  
  // Sort by specified field and direction
  if (sortBy === 'name') {
    result.sort((a, b) => {
      return sortDir === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });
  } else if (sortBy === 'count') {
    result.sort((a, b) => {
      return sortDir === 'asc' ? a.count - b.count : b.count - a.count;
    });
  } else if (sortBy === 'category') {
    // First get category names
    const categories = await getTagCategories();
    const categoryMap = new Map(categories.data.map(cat => [cat.id, cat.name]));
    
    result.sort((a, b) => {
      const catA = categoryMap.get(a.categoryId) || '';
      const catB = categoryMap.get(b.categoryId) || '';
      return sortDir === 'asc' 
        ? catA.localeCompare(catB) 
        : catB.localeCompare(catA);
    });
  }
  
  // Apply limit if specified
  if (limit && !isNaN(limit)) {
    result = result.slice(0, parseInt(limit));
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
 * Get tag categories
 * @returns {Promise} - Promise resolving to tag categories
 */
export const getTagCategories = async () => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch tag categories', 503, 'service_unavailable');
  
  return wrapResponse(tagCategoryItems);
};

/**
 * Create a new tag category
 * @param {Object} categoryData - Tag category data
 * @returns {Promise} - Promise resolving to created tag category
 */
export const createTagCategory = async (categoryData) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to create tag category', 503, 'service_unavailable');
  
  // Validate required fields
  if (!categoryData.name) {
    throw createError('Category name is required', 400, 'invalid_request');
  }
  
  // Check if category already exists with the same name
  const categoryExists = tagCategoryItems.some(cat => 
    cat.name.toLowerCase() === categoryData.name.toLowerCase()
  );
  
  if (categoryExists) {
    throw createError('Category with this name already exists', 409, 'category_exists');
  }
  
  // Create new category
  const newCategory = {
    id: `cat_${Date.now()}`,
    name: categoryData.name,
    description: categoryData.description || ''
  };
  
  tagCategoryItems.push(newCategory);
  return wrapResponse(newCategory, 'Tag category created successfully');
};

/**
 * Update a tag category
 * @param {string} id - Tag category ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated tag category
 */
export const updateTagCategory = async (id, updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update tag category', 503, 'service_unavailable');
  
  const index = tagCategoryItems.findIndex(cat => cat.id === id);
  if (index === -1) {
    throw createError('Tag category not found', 404, 'not_found');
  }
  
  // Check if name is being updated and already exists
  if (updates.name && updates.name !== tagCategoryItems[index].name) {
    const nameExists = tagCategoryItems.some(cat => 
      cat.id !== id && cat.name.toLowerCase() === updates.name.toLowerCase()
    );
    
    if (nameExists) {
      throw createError('Category with this name already exists', 409, 'category_exists');
    }
  }
  
  // Update category
  tagCategoryItems[index] = {
    ...tagCategoryItems[index],
    ...updates
  };
  
  return wrapResponse(tagCategoryItems[index], 'Tag category updated successfully');
};

/**
 * Delete a tag category
 * @param {string} id - Tag category ID
 * @param {Object} options - Options for deletion
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteTagCategory = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to delete tag category', 503, 'service_unavailable');
  
  const { force = false } = options;
  
  const index = tagCategoryItems.findIndex(cat => cat.id === id);
  if (index === -1) {
    throw createError('Tag category not found', 404, 'not_found');
  }
  
  // Check if category has tags
  const hasTags = tagItems.some(tag => tag.categoryId === id);
  if (hasTags && !force) {
    throw createError(
      'Category has associated tags. Use force=true to delete anyway.',
      400,
      'category_has_tags'
    );
  }
  
  // If force is true, update tags to remove category reference
  if (hasTags && force) {
    tagItems = tagItems.map(tag => {
      if (tag.categoryId === id) {
        return { ...tag, categoryId: null };
      }
      return tag;
    });
  }
  
  // Delete category
  tagCategoryItems.splice(index, 1);
  
  return wrapResponse(null, 'Tag category deleted successfully');
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
  
  // Validate category ID if provided
  if (tagData.categoryId) {
    const categoryExists = tagCategoryItems.some(cat => cat.id === tagData.categoryId);
    if (!categoryExists) {
      throw createError('Tag category not found', 404, 'category_not_found');
    }
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
    categoryId: tagData.categoryId || null,
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
  
  // Validate category ID if provided
  if (updates.categoryId) {
    const categoryExists = tagCategoryItems.some(cat => cat.id === updates.categoryId);
    if (!categoryExists) {
      throw createError('Tag category not found', 404, 'category_not_found');
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
  
  // If the tag name was updated, we need to update all media items that use this tag
  if (updates.name && updates.name !== tagItems[index].name) {
    try {
      const oldName = tagItems[index].name;
      const newName = updates.name;
      
      // This is a mock implementation - in a real backend, this would be a database transaction
      const mediaModule = await import('../data/media');
      const mediaItems = mediaModule.default;
      
      for (const item of mediaItems) {
        if (item.tags && item.tags.includes(oldName)) {
          item.tags = item.tags.map(t => t === oldName ? newName : t);
        }
      }
    } catch (error) {
      console.error('Error updating media items after tag rename:', error);
    }
  }
  
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
 * Batch update tags for multiple media items
 * @param {Array} mediaIds - Array of media item IDs
 * @param {Object} updates - Tag updates to apply
 * @returns {Promise} - Promise resolving to updated media items
 */
export const batchUpdateTags = async (mediaIds, updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update tags', 503, 'service_unavailable');
  
  if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
    throw createError('No media items specified', 400, 'invalid_request');
  }
  
  const { addTags = [], removeTags = [] } = updates;
  
  // Validate all tags exist
  const nonExistentAddTags = addTags.filter(tagName => 
    !tagItems.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())
  );
  
  if (nonExistentAddTags.length > 0) {
    throw createError(
      `Some tags do not exist: ${nonExistentAddTags.join(', ')}`,
      400,
      'invalid_tags'
    );
  }
  
  try {
    const mediaModule = await import('../data/media');
    const mediaItems = mediaModule.default;
    
    // Update media items
    const updatedMediaItems = [];
    
    for (const mediaId of mediaIds) {
      const mediaIndex = mediaItems.findIndex(item => item.id === mediaId);
      
      if (mediaIndex !== -1) {
        const item = mediaItems[mediaIndex];
        
        // Get current tags or initialize empty array
        const currentTags = item.tags || [];
        
        // Add new tags (avoid duplicates)
        let newTags = [...currentTags];
        
        // Add tags that don't already exist
        addTags.forEach(tagName => {
          if (!newTags.includes(tagName)) {
            newTags.push(tagName);
            
            // Increment tag count
            const tagIndex = tagItems.findIndex(tag => tag.name === tagName);
            if (tagIndex !== -1) {
              tagItems[tagIndex].count++;
            }
          }
        });
        
        // Remove specified tags
        removeTags.forEach(tagName => {
          if (newTags.includes(tagName)) {
            newTags = newTags.filter(t => t !== tagName);
            
            // Decrement tag count
            const tagIndex = tagItems.findIndex(tag => tag.name === tagName);
            if (tagIndex !== -1 && tagItems[tagIndex].count > 0) {
              tagItems[tagIndex].count--;
            }
          }
        });
        
        // Update media item
        mediaItems[mediaIndex] = {
          ...item,
          tags: newTags
        };
        
        updatedMediaItems.push(mediaItems[mediaIndex]);
      }
    }
    
    return wrapResponse({
      updatedCount: updatedMediaItems.length,
      items: updatedMediaItems
    }, 'Tags updated successfully');
    
  } catch (error) {
    console.error('Error updating media items tags:', error);
    throw createError('Failed to update tags', 500, 'internal_error');
  }
};

/**
 * Get popular tags based on usage count
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to popular tags
 */
export const getPopularTags = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch popular tags', 503, 'service_unavailable');
  
  const { limit = 10, categoryId = null } = options;
  
  // Filter by category if specified
  let filteredTags = [...tagItems];
  if (categoryId) {
    filteredTags = filteredTags.filter(tag => tag.categoryId === categoryId);
  }
  
  // Sort by count descending and take top N
  const popularTags = filteredTags
    .sort((a, b) => b.count - a.count)
    .slice(0, parseInt(limit));
  
  return wrapResponse(popularTags);
};

/**
 * Get tag suggestions based on partial input
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to tag suggestions
 */
export const getTagSuggestions = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch tag suggestions', 503, 'service_unavailable');
  
  const { query = '', limit = 5, categoryId = null } = options;
  
  if (!query || query.length < 1) {
    return wrapResponse([]);
  }
  
  // Filter tags by query and optionally by category
  let suggestions = tagItems.filter(tag => {
    const matchesQuery = tag.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryId ? tag.categoryId === categoryId : true;
    return matchesQuery && matchesCategory;
  });
  
  // Prioritize tags starting with the query
  suggestions.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Secondary sort by usage count
    return b.count - a.count;
  });
  
  // Limit results
  suggestions = suggestions.slice(0, parseInt(limit));
  
  return wrapResponse(suggestions);
};

// Export all tag API functions
export default {
  getTags,
  getTagById,
  getTagCategories,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory,
  getMediaWithTag,
  createTag,
  updateTag,
  deleteTag,
  batchUpdateTags,
  getPopularTags,
  getTagSuggestions
};