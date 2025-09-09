/**
 * Real API Service Implementation
 * Connects to the actual .NET backend
 */

import { API_CONFIG, apiRequest, buildApiUrl } from '../../config/api.config';
import type {
  MediaItem,
  Folder,
  Collection,
  Tag,
  MediaId,
  FolderId,
  CollectionId,
  TagId,
  User,
  UserPreferences
} from '../../types';

// Media API
export const mediaApi = {
  async list(params?: {
    folderId?: FolderId;
    collectionId?: CollectionId;
    tags?: TagId[];
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.folderId) queryParams.append('folderId', params.folderId);
    if (params?.collectionId) queryParams.append('collectionId', params.collectionId);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const query = queryParams.toString();
    const endpoint = query ? `${API_CONFIG.endpoints.media.list}?${query}` : API_CONFIG.endpoints.media.list;
    
    return apiRequest<{ items: MediaItem[]; totalCount: number }>(endpoint);
  },
  
  async get(id: MediaId) {
    return apiRequest<MediaItem>(API_CONFIG.endpoints.media.get(id));
  },
  
  async create(data: FormData) {
    const response = await fetch(buildApiUrl(API_CONFIG.endpoints.upload), {
      method: 'POST',
      body: data,
      headers: {
        ...getAuthHeaders()
        // Don't set Content-Type for FormData
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async update(id: MediaId, updates: Partial<MediaItem>) {
    return apiRequest<MediaItem>(API_CONFIG.endpoints.media.update(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },
  
  async delete(id: MediaId) {
    return apiRequest<void>(API_CONFIG.endpoints.media.delete(id), {
      method: 'DELETE'
    });
  },
  
  async toggleStar(id: MediaId) {
    return apiRequest<{ isStarred: boolean }>(API_CONFIG.endpoints.media.star(id), {
      method: 'PATCH'
    });
  },
  
  async toggleFavorite(id: MediaId) {
    return apiRequest<{ isFavorited: boolean }>(API_CONFIG.endpoints.media.favorite(id), {
      method: 'PATCH'
    });
  },
  
  async getUrl(id: MediaId) {
    return apiRequest<{ url: string; thumbnailUrl?: string; expirySeconds: number }>(
      API_CONFIG.endpoints.media.url(id)
    );
  },
  
  async search(params: {
    query?: string;
    types?: string[];
    tags?: string[];
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    isStarred?: boolean;
    isFavorited?: boolean;
    folderId?: FolderId;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return apiRequest<{ items: MediaItem[]; totalCount: number }>(
      API_CONFIG.endpoints.media.search,
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
  },
  
  async batchMove(mediaIds: MediaId[], targetFolderId: FolderId) {
    return apiRequest(API_CONFIG.endpoints.media.batch.move, {
      method: 'POST',
      body: JSON.stringify({ mediaIds, targetFolderId })
    });
  },
  
  async batchCopy(mediaIds: MediaId[], targetFolderId: FolderId) {
    return apiRequest(API_CONFIG.endpoints.media.batch.copy, {
      method: 'POST',
      body: JSON.stringify({ mediaIds, targetFolderId })
    });
  },
  
  async batchDelete(mediaIds: MediaId[]) {
    return apiRequest(API_CONFIG.endpoints.media.batch.delete, {
      method: 'POST',
      body: JSON.stringify({ mediaIds })
    });
  },
  
  async batchTag(mediaIds: MediaId[], tagsToAdd: string[], tagsToRemove?: string[]) {
    return apiRequest(API_CONFIG.endpoints.media.batch.tag, {
      method: 'POST',
      body: JSON.stringify({ mediaIds, tagsToAdd, tagsToRemove })
    });
  }
};

// Folder API
export const folderApi = {
  async list(parentId?: FolderId) {
    const query = parentId ? `?parentId=${parentId}` : '';
    return apiRequest<Folder[]>(`${API_CONFIG.endpoints.folders.list}${query}`);
  },
  
  async get(id: FolderId) {
    return apiRequest<Folder>(API_CONFIG.endpoints.folders.get(id));
  },
  
  async create(data: { name: string; parentId?: FolderId; color?: string }) {
    return apiRequest<Folder>(API_CONFIG.endpoints.folders.create, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async update(id: FolderId, updates: Partial<Folder>) {
    return apiRequest<Folder>(API_CONFIG.endpoints.folders.update(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },
  
  async delete(id: FolderId) {
    return apiRequest<void>(API_CONFIG.endpoints.folders.delete(id), {
      method: 'DELETE'
    });
  },
  
  async getTree() {
    return apiRequest<Folder[]>(API_CONFIG.endpoints.folders.tree);
  },
  
  async getContents(id: FolderId) {
    return apiRequest<{
      folders: Folder[];
      media: MediaItem[];
    }>(API_CONFIG.endpoints.folders.contents(id));
  }
};

// Collection API
export const collectionApi = {
  async list() {
    return apiRequest<Collection[]>(API_CONFIG.endpoints.collections.list);
  },
  
  async get(id: CollectionId) {
    return apiRequest<Collection>(API_CONFIG.endpoints.collections.get(id));
  },
  
  async create(data: { name: string; description?: string; items?: MediaId[] }) {
    return apiRequest<Collection>(API_CONFIG.endpoints.collections.create, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async update(id: CollectionId, updates: Partial<Collection>) {
    return apiRequest<Collection>(API_CONFIG.endpoints.collections.update(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },
  
  async delete(id: CollectionId) {
    return apiRequest<void>(API_CONFIG.endpoints.collections.delete(id), {
      method: 'DELETE'
    });
  },
  
  async addItems(id: CollectionId, mediaIds: MediaId[]) {
    return apiRequest<Collection>(API_CONFIG.endpoints.collections.addItems(id), {
      method: 'POST',
      body: JSON.stringify({ mediaIds })
    });
  },
  
  async removeItems(id: CollectionId, mediaIds: MediaId[]) {
    return apiRequest<Collection>(API_CONFIG.endpoints.collections.removeItems(id), {
      method: 'DELETE',
      body: JSON.stringify({ mediaIds })
    });
  }
};

// Tag API
export const tagApi = {
  async list() {
    return apiRequest<Tag[]>(API_CONFIG.endpoints.tags.list);
  },
  
  async get(id: TagId) {
    return apiRequest<Tag>(API_CONFIG.endpoints.tags.get(id));
  },
  
  async create(data: { name: string; color?: string }) {
    return apiRequest<Tag>(API_CONFIG.endpoints.tags.create, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async update(id: TagId, updates: Partial<Tag>) {
    return apiRequest<Tag>(API_CONFIG.endpoints.tags.update(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },
  
  async delete(id: TagId) {
    return apiRequest<void>(API_CONFIG.endpoints.tags.delete(id), {
      method: 'DELETE'
    });
  },
  
  async merge(sourceIds: TagId[], targetId: TagId) {
    return apiRequest<Tag>(API_CONFIG.endpoints.tags.merge, {
      method: 'POST',
      body: JSON.stringify({ sourceIds, targetId })
    });
  }
};

// User API
export const userApi = {
  async getCurrent() {
    return apiRequest<User>(API_CONFIG.endpoints.users.current);
  },
  
  async getPreferences() {
    return apiRequest<UserPreferences>(API_CONFIG.endpoints.users.preferences);
  },
  
  async updatePreferences(preferences: Partial<UserPreferences>) {
    return apiRequest<UserPreferences>(API_CONFIG.endpoints.users.preferences, {
      method: 'PATCH',
      body: JSON.stringify(preferences)
    });
  },
  
  async update(updates: Partial<User>) {
    return apiRequest<User>(API_CONFIG.endpoints.users.update, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }
};

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiRequest<{ token: string; user: User }>(
      API_CONFIG.endpoints.auth.login,
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    );
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('mlm-auth-token', response.token);
    }
    
    return response;
  },
  
  async logout() {
    await apiRequest<void>(API_CONFIG.endpoints.auth.logout, {
      method: 'POST'
    });
    
    // Clear token from localStorage
    localStorage.removeItem('mlm-auth-token');
  },
  
  async register(data: { email: string; password: string; name?: string }) {
    return apiRequest<{ token: string; user: User }>(
      API_CONFIG.endpoints.auth.register,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
  },
  
  async refresh() {
    const response = await apiRequest<{ token: string }>(
      API_CONFIG.endpoints.auth.refresh,
      {
        method: 'POST'
      }
    );
    
    // Update token in localStorage
    if (response.token) {
      localStorage.setItem('mlm-auth-token', response.token);
    }
    
    return response;
  },
  
  async verify() {
    return apiRequest<{ valid: boolean; user?: User }>(
      API_CONFIG.endpoints.auth.verify
    );
  }
};

// Helper to get auth headers (imported from config)
function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('mlm-auth-token') 
    : null;
    
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
}

// Export the complete API
export const realApi = {
  media: mediaApi,
  folders: folderApi,
  collections: collectionApi,
  tags: tagApi,
  users: userApi,
  auth: authApi
};

export default realApi;