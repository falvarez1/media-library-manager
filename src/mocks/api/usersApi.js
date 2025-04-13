/**
 * Mock Users API for the Media Library Manager
 * 
 * This module simulates API calls to a backend service for user operations,
 * implementing proper error handling, loading states, and realistic response structures.
 */

import users from '../data/users';
import { delay, wrapResponse, createError, simulateRandomFailure } from '../utils/apiUtils';

// Deep clone users array to avoid unintended side effects when modifying data
let userItems = JSON.parse(JSON.stringify(users));

/**
 * Get all users
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to users
 */
export const getUsers = async (options = {}) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch users', 503, 'service_unavailable');
  
  // Apply filtering if role is specified
  let filtered = [...userItems];
  if (options.role) {
    filtered = filtered.filter(user => user.role === options.role);
  }
  
  // Remove sensitive information
  const sanitizedUsers = filtered.map(user => {
    // Create a copy without sensitive information
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
  });
  
  return wrapResponse(sanitizedUsers);
};

/**
 * Get the current logged-in user
 * @returns {Promise} - Promise resolving to current user
 */
export const getCurrentUser = async () => {
  await delay();
  simulateRandomFailure(0.01, 'Failed to fetch current user', 503, 'service_unavailable');
  
  // In a real implementation, this would be based on authentication token
  // Here we're just returning the user with id 'current'
  const currentUser = userItems.find(user => user.id === 'current');
  if (!currentUser) {
    throw createError('Current user not found', 404, 'not_found');
  }
  
  // Remove sensitive information
  const sanitizedUser = { ...currentUser };
  delete sanitizedUser.password;
  
  return wrapResponse(sanitizedUser);
};

/**
 * Get a user by ID
 * @param {string} id - User ID
 * @returns {Promise} - Promise resolving to user
 */
export const getUserById = async (id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to fetch user', 503, 'service_unavailable');
  
  const user = userItems.find(user => user.id === id);
  if (!user) {
    throw createError('User not found', 404, 'not_found');
  }
  
  // Remove sensitive information
  const sanitizedUser = { ...user };
  delete sanitizedUser.password;
  
  return wrapResponse(sanitizedUser);
};

/**
 * Update current user's profile
 * @param {Object} updates - Profile updates
 * @returns {Promise} - Promise resolving to updated user
 */
export const updateProfile = async (updates) => {
  await delay();
  simulateRandomFailure(0.03, 'Failed to update profile', 503, 'service_unavailable');
  
  // Find current user
  const index = userItems.findIndex(user => user.id === 'current');
  if (index === -1) {
    throw createError('Current user not found', 404, 'not_found');
  }
  
  // Create a copy of updates and exclude protected/sensitive fields
  const allowedUpdates = { ...updates };
  delete allowedUpdates.id;
  delete allowedUpdates.role;
  delete allowedUpdates.created;
  delete allowedUpdates.password;
  
  // Update user
  userItems[index] = {
    ...userItems[index],
    ...allowedUpdates,
    lastActive: new Date().toISOString()
  };
  
  // Remove sensitive information from response
  const sanitizedUser = { ...userItems[index] };
  delete sanitizedUser.password;
  
  return wrapResponse(sanitizedUser, 'Profile updated successfully');
};

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise} - Promise resolving to updated preferences
 */
export const updatePreferences = async (preferences) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to update preferences', 503, 'service_unavailable');
  
  // Find current user
  const index = userItems.findIndex(user => user.id === 'current');
  if (index === -1) {
    throw createError('Current user not found', 404, 'not_found');
  }
  
  // Update preferences
  userItems[index].preferences = {
    ...userItems[index].preferences,
    ...preferences
  };
  
  return wrapResponse(userItems[index].preferences, 'Preferences updated successfully');
};

/**
 * Update recent folders and files
 * @param {string} type - 'folders' or 'files'
 * @param {string} id - ID of folder or file
 * @returns {Promise} - Promise resolving to updated recent items
 */
export const updateRecent = async (type, id) => {
  await delay();
  simulateRandomFailure(0.02, 'Failed to update recent items', 503, 'service_unavailable');
  
  if (type !== 'folders' && type !== 'files') {
    throw createError('Invalid type. Must be "folders" or "files"', 400, 'invalid_request');
  }
  
  // Find current user
  const index = userItems.findIndex(user => user.id === 'current');
  if (index === -1) {
    throw createError('Current user not found', 404, 'not_found');
  }
  
  // Update recent items
  const propertyName = type === 'folders' ? 'recentFolders' : 'recentFiles';
  
  // Remove the item if it already exists in the array
  let recentItems = userItems[index][propertyName] || [];
  recentItems = recentItems.filter(itemId => itemId !== id);
  
  // Add the item at the beginning of the array
  recentItems.unshift(id);
  
  // Keep only the most recent 10 items
  recentItems = recentItems.slice(0, 10);
  
  userItems[index][propertyName] = recentItems;
  userItems[index].lastActive = new Date().toISOString();
  
  return wrapResponse({
    [propertyName]: recentItems
  }, 'Recent items updated successfully');
};

/**
 * Simulate user login
 * @param {Object} credentials - Login credentials
 * @returns {Promise} - Promise resolving to user and token
 */
export const login = async (credentials) => {
  await delay(1000); // Longer delay for login
  simulateRandomFailure(0.05, 'Login failed', 401, 'authentication_failed');
  
  const { email, password } = credentials;
  
  if (!email || !password) {
    throw createError('Email and password are required', 400, 'invalid_request');
  }
  
  // In a real implementation, this would check against hashed passwords
  // Here we're just simulating a successful login for the demo user
  if (email === 'jamie.smith@example.com' && password === 'password') {
    // Find current user
    const user = userItems.find(user => user.id === 'current');
    if (!user) {
      throw createError('User not found', 404, 'not_found');
    }
    
    // Update last active timestamp
    user.lastActive = new Date().toISOString();
    
    // Remove sensitive information from response
    const sanitizedUser = { ...user };
    delete sanitizedUser.password;
    
    // Generate mock JWT token
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }))}.mock_signature`;
    
    return wrapResponse({
      user: sanitizedUser,
      token,
      expiresIn: 86400 // 24 hours in seconds
    }, 'Login successful');
  }
  
  throw createError('Invalid email or password', 401, 'authentication_failed');
};

/**
 * Simulate user logout
 * @returns {Promise} - Promise resolving to success message
 */
export const logout = async () => {
  await delay(500);
  
  return wrapResponse(null, 'Logout successful');
};

// Export all user API functions
export default {
  getUsers,
  getCurrentUser,
  getUserById,
  updateProfile,
  updatePreferences,
  updateRecent,
  login,
  logout
};