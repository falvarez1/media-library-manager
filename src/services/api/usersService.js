/**
 * Real Users API Service
 * 
 * Implements the same interface as the mock usersApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';

/**
 * Get all users
 * @param {Object} options - Query options
 * @returns {Promise} - Promise resolving to users
 */
export const getUsers = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiRequest(`/users${queryString}`);
};

/**
 * Get the current logged-in user
 * @returns {Promise} - Promise resolving to current user
 */
export const getCurrentUser = async () => {
  return apiRequest('/users/me');
};

/**
 * Get a user by ID
 * @param {string} id - User ID
 * @returns {Promise} - Promise resolving to user
 */
export const getUserById = async (id) => {
  return apiRequest(`/users/${id}`);
};

/**
 * Update current user's profile
 * @param {Object} updates - Profile updates
 * @returns {Promise} - Promise resolving to updated user
 */
export const updateProfile = async (updates) => {
  return apiRequest('/users/me/profile', 'PUT', updates);
};

/**
 * Update user preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise} - Promise resolving to updated preferences
 */
export const updatePreferences = async (preferences) => {
  return apiRequest('/users/me/preferences', 'PUT', preferences);
};

/**
 * Update recent folders and files
 * @param {string} type - 'folders' or 'files'
 * @param {string} id - ID of folder or file
 * @returns {Promise} - Promise resolving to updated recent items
 */
export const updateRecent = async (type, id) => {
  return apiRequest('/users/me/recent', 'POST', { type, id });
};

/**
 * User login
 * @param {Object} credentials - Login credentials
 * @returns {Promise} - Promise resolving to user and token
 */
export const login = async (credentials) => {
  return apiRequest('/auth/login', 'POST', credentials);
};

/**
 * User logout
 * @returns {Promise} - Promise resolving to success message
 */
export const logout = async () => {
  return apiRequest('/auth/logout', 'POST');
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