/**
 * Media Library Manager Mocks Entry Point
 * 
 * This file exports all mock data and API services for convenient importing.
 * See README.md in this directory for detailed documentation.
 */

// Mock Data
import folders from './data/folders';
import media from './data/media';
import collections from './data/collections';
import tags from './data/tags';
import users, { currentUser } from './data/users';

// Mock API Services
import api from './api';

// Export all data
export const mockData = {
  folders,
  media,
  collections,
  tags,
  users,
  currentUser
};

// Export API services
export { api };

// Export default object with all mocks
export default {
  data: mockData,
  api
};