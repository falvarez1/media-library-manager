/**
 * Service Layer for the Media Library Manager
 * 
 * This file serves as the main entry point for the service layer.
 * It exports the appropriate API services based on configuration,
 * allowing runtime toggling between real API calls and mock data.
 */

import config from './config';

// Import real API services
import mediaService from './api/mediaService';
import foldersService from './api/foldersService';
import collectionsService from './api/collectionsService';
import tagsService from './api/tagsService';
import usersService from './api/usersService';

// Import mock API services
import mockMediaApi from '../mocks/api/mediaApi';
import mockFoldersApi from '../mocks/api/foldersApi';
import mockCollectionsApi from '../mocks/api/collectionsApi';
import mockTagsApi from '../mocks/api/tagsApi';
import mockUsersApi from '../mocks/api/usersApi';

/**
 * Selects the appropriate API implementation based on configuration
 * @param {Object} realApi - Real API implementation
 * @param {Object} mockApi - Mock API implementation
 * @returns {Object} - Selected API implementation
 */
const selectService = (realApi, mockApi) => {
  return config.useRealApi ? realApi : mockApi;
};

// Export individual services based on configuration
export const mediaApi = selectService(mediaService, mockMediaApi);
export const foldersApi = selectService(foldersService, mockFoldersApi);
export const collectionsApi = selectService(collectionsService, mockCollectionsApi);
export const tagsApi = selectService(tagsService, mockTagsApi);
export const usersApi = selectService(usersService, mockUsersApi);

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