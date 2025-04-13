/**
 * Mock Folders API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for folders,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import folders from '../data/folders';
import { delay, wrapResponse, createError, simulateRandomFailure, paginate } from '../utils/apiUtils';

// Deep clone folders array to avoid unintended side effects when modifying data
let folderItems = JSON.parse(JSON.stringify(folders));

/**
 * Get all folders with optional filtering
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to folders
 */
export const getFolders = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch folders', 503, 'service_unavailable');
  
  const { parent } = options;
  
  // Filter by parent if specified
  let filtered = [...folderItems];
  console.log(`[foldersApi] Fetching folders with parent:`, parent, typeof parent);
  
  // Convert parent to string for consistent comparison, safely handling null values
  const parentValue = parent !== undefined && parent !== null ? parent.toString() : null;
  console.log(`[foldersApi] Using parent value:`, parentValue, typeof parentValue);
  
  if (parentValue !== undefined && parentValue !== null) {
    filtered = filtered.filter(folder => {
      // Also convert folder parent to string for consistent comparison, safely handling null
      const folderParent = folder.parent !== null && folder.parent !== undefined ? folder.parent.toString() : null;
      const match = folderParent === parentValue;
      console.log(`[foldersApi] Checking folder ${folder.id} (${folder.name}): parent=${folderParent}, match=${match}`);
      return match;
    });
    console.log(`[foldersApi] Found ${filtered.length} folders with parent ${parentValue}`);
  } else {
    // When parent is undefined, default to null (root folders)
    filtered = filtered.filter(folder => folder.parent === null);
    console.log(`[foldersApi] Returning root folders (${filtered.length})`);
  }
  
  return wrapResponse(filtered);
};

/**
 * Get folder tree structure (hierarchical)
 * @returns {Promise} - Promise resolving to folder tree
 */
export const getFolderTree = async () => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch folder tree', 503, 'service_unavailable');
  
  // Create root array with null parent folders
  const rootFolders = folderItems.filter(folder => folder.parent === null);
  
  // Function to build tree recursively
  const buildTree = (parentId) => {
    const children = folderItems.filter(folder => folder.parent === parentId);
    if (children.length === 0) {
      return [];
    }
    
    return children.map(child => ({
      ...child,
      children: buildTree(child.id)
    }));
  };
  
  // Build tree starting from root folders
  const tree = rootFolders.map(root => ({
    ...root,
    children: buildTree(root.id)
  }));
  
  return wrapResponse(tree);
};

/**
 * Get a single folder by ID
 * @param {string} id - Folder ID
 * @returns {Promise} - Promise resolving to folder
 */
export const getFolderById = async (id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch folder', 503, 'service_unavailable');
  
  const folder = folderItems.find(folder => folder.id === id);
  if (!folder) {
    throw createError('Folder not found', 404, 'not_found');
  }
  
  return wrapResponse(folder);
};

/**
 * Get folder contents (media items within a folder)
 * @param {string} id - Folder ID
 * @param {Object} options - Query options for pagination
 * @returns {Promise} - Promise resolving to media items in folder
 */
export const getFolderContents = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch folder contents', 503, 'service_unavailable');
  
  const { page = 1, pageSize = 20 } = options;
  
  // Check if folder exists
  const folder = folderItems.find(folder => folder.id === id);
  if (!folder) {
    throw createError('Folder not found', 404, 'not_found');
  }
  
  // Get media items in folder
  const mediaItems = await import('../data/media')
    .then(module => module.default.filter(item => item.folder === id));
  
  // Return paginated results
  const paginatedItems = paginate(mediaItems, page, pageSize);
  return wrapResponse({
    folder,
    contents: paginatedItems
  });
};

/**
 * Create a new folder
 * @param {Object} folderData - Folder data
 * @returns {Promise} - Promise resolving to created folder
 */
export const createFolder = async (folderData) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to create folder', 503, 'service_unavailable');
  
  // Validate required fields
  if (!folderData.name) {
    throw createError('Folder name is required', 400, 'invalid_request');
  }
  
  // Check if parent exists if specified
  if (folderData.parent) {
    const parentFolder = folderItems.find(folder => folder.id === folderData.parent);
    if (!parentFolder) {
      throw createError('Parent folder not found', 404, 'parent_not_found');
    }
  }
  
  // Generate path based on parent
  let path = folderData.name;
  if (folderData.parent) {
    const parentFolder = folderItems.find(folder => folder.id === folderData.parent);
    path = `${parentFolder.path}/${folderData.name}`;
  }
  
  // Generate random color if not specified
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', 
    '#14B8A6', '#8B5CF6', '#F43F5E', '#0EA5E9', '#F97316', '#EF4444'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Create new folder
  const newFolder = {
    id: `folder_${Date.now()}`,
    path,
    color: folderData.color || randomColor,
    ...folderData
  };
  
  folderItems.push(newFolder);
  return wrapResponse(newFolder, 'Folder created successfully');
};

/**
 * Update a folder
 * @param {string} id - Folder ID
 * @param {Object} updates - Fields to update
 * @returns {Promise} - Promise resolving to updated folder
 */
export const updateFolder = async (id, updates) => {
  await delay();
  console.log('Folder update requested:', { id, updates });
  simulateRandomFailure(0.03, 'Failed to update folder', 503, 'service_unavailable');
  
  const index = folderItems.findIndex(folder => folder.id === id);
  if (index === -1) {
    throw createError('Folder not found', 404, 'not_found');
  }
  
  // Create a copy of updates for modification
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  
  // Handle parent updates by updating the path as well
  if (updates.parent !== undefined) {
    console.log('Parent update detected:', updates.parent);
    const newParent = folderItems.find(f => f.id === updates.parent);
    if (newParent) {
      // Get current folder name
      const folderName = folderItems[index].name;
      // Generate new path based on parent path
      allowedUpdates.parent = updates.parent;
      allowedUpdates.path = newParent.path ? `${newParent.path}/${folderName}` : folderName;
      console.log('Updated path:', allowedUpdates.path);
    } else {
      console.log('Parent not found, ignoring parent update');
      delete allowedUpdates.parent;
    }
  } else {
    delete allowedUpdates.parent;
    delete allowedUpdates.path;
  }
  
  console.log('Applying updates:', allowedUpdates);
  
  // Update folder
  folderItems[index] = {
    ...folderItems[index],
    ...allowedUpdates
  };
  
  return wrapResponse(folderItems[index], 'Folder updated successfully');
};

/**
 * Delete a folder
 * @param {string} id - Folder ID
 * @param {Object} options - Delete options
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteFolder = async (id, options = {}) => {
  await delay();
  simulateRandomFailure(0.05, 'Failed to delete folder', 503, 'service_unavailable');
  
  const { force = false } = options;
  
  const index = folderItems.findIndex(folder => folder.id === id);
  if (index === -1) {
    throw createError('Folder not found', 404, 'not_found');
  }
  
  // Check if folder has children
  const hasChildren = folderItems.some(folder => folder.parent === id);
  if (hasChildren && !force) {
    throw createError(
      'Cannot delete folder with subfolders. Use force=true to delete anyway.',
      409,
      'folder_has_children'
    );
  }
  
  // Check if folder has media items
  const mediaItems = await import('../data/media')
    .then(module => module.default.filter(item => item.folder === id));
  
  if (mediaItems.length > 0 && !force) {
    throw createError(
      `Cannot delete folder containing ${mediaItems.length} media items. Use force=true to delete anyway.`,
      409,
      'folder_has_media'
    );
  }
  
  // Delete folder and all children recursively if force=true
  if (force) {
    // Get all descendant folder IDs
    const getDescendants = (parentId) => {
      const children = folderItems.filter(folder => folder.parent === parentId);
      const descendantIds = children.map(child => child.id);
      
      // Add grandchildren
      children.forEach(child => {
        descendantIds.push(...getDescendants(child.id));
      });
      
      return descendantIds;
    };
    
    const descendantIds = getDescendants(id);
    
    // Delete descendant folders
    folderItems = folderItems.filter(folder => !descendantIds.includes(folder.id));
  }
  
  // Delete the folder itself
  folderItems.splice(index, 1);
  
  return wrapResponse(null, 'Folder deleted successfully');
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