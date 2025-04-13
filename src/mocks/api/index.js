/**
 * Mock API services for the Media Library Manager
 * 
 * This file exports all the mock API services for use in the application.
 * In a production environment, these would be replaced with real API calls.
 */

import mediaApi from './mediaApi';
import foldersApi from './foldersApi';
import collectionsApi from './collectionsApi';
import tagsApi from './tagsApi';
import usersApi from './usersApi';

// Export all APIs
export { 
  mediaApi,
  foldersApi,
  collectionsApi,
  tagsApi,
  usersApi
};

/**
 * Combined API object that includes all services
 */
const api = {
  media: mediaApi,
  folders: foldersApi,
  collections: collectionsApi,
  tags: tagsApi,
  users: usersApi
};

export default api;