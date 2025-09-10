/**
 * Type declarations for the mocks module
 */

import type { 
  MediaItem, 
  Folder, 
  Collection, 
  Tag, 
  User
} from '../types';

export interface MockData {
  folders: Folder[];
  media: MediaItem[];
  collections: Collection[];
  tags: Tag[];
  users: User[];
  currentUser: User;
}

export const mockData: MockData;
export { default as api } from './api';

declare const mocks: {
  data: MockData;
  api: typeof import('./api').default;
};

export default mocks;