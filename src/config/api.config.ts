/**
 * API Configuration
 * Manages backend API endpoints and configuration
 */

// Determine if we're using mock data or real backend
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || 
                      (typeof window !== 'undefined' && 
                       localStorage.getItem('mlm-use-mock-data') === 'true');

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? '/api'  // In production, use relative path
                       : 'http://localhost:5000/api'); // In development, use local backend

// API endpoints configuration
export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  baseUrl: API_BASE_URL,
  
  endpoints: {
    // Media endpoints
    media: {
      list: '/media',
      get: (id: string) => `/media/${id}`,
      create: '/media',
      update: (id: string) => `/media/${id}`,
      delete: (id: string) => `/media/${id}`,
      star: (id: string) => `/media/${id}/star`,
      favorite: (id: string) => `/media/${id}/favorite`,
      url: (id: string) => `/media/${id}/url`,
      search: '/media/search',
      batch: {
        move: '/media/batch/move',
        copy: '/media/batch/copy',
        delete: '/media/batch/delete',
        tag: '/media/batch/tag'
      }
    },
    
    // Folder endpoints
    folders: {
      list: '/folders',
      get: (id: string) => `/folders/${id}`,
      create: '/folders',
      update: (id: string) => `/folders/${id}`,
      delete: (id: string) => `/folders/${id}`,
      tree: '/folders/tree',
      contents: (id: string) => `/folders/${id}/contents`
    },
    
    // Collection endpoints
    collections: {
      list: '/collections',
      get: (id: string) => `/collections/${id}`,
      create: '/collections',
      update: (id: string) => `/collections/${id}`,
      delete: (id: string) => `/collections/${id}`,
      addItems: (id: string) => `/collections/${id}/items`,
      removeItems: (id: string) => `/collections/${id}/items`
    },
    
    // Tag endpoints
    tags: {
      list: '/tags',
      get: (id: string) => `/tags/${id}`,
      create: '/tags',
      update: (id: string) => `/tags/${id}`,
      delete: (id: string) => `/tags/${id}`,
      merge: '/tags/merge'
    },
    
    // User endpoints
    users: {
      current: '/users/current',
      preferences: '/users/preferences',
      update: '/users/update'
    },
    
    // Auth endpoints
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      register: '/auth/register',
      refresh: '/auth/refresh',
      verify: '/auth/verify'
    },
    
    // Upload endpoint
    upload: '/media/upload'
  }
};

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  if (USE_MOCK_DATA) {
    // Return mock endpoint (handled by mock service)
    return endpoint;
  }
  return `${API_BASE_URL}${endpoint}`;
}

// Helper function to get auth headers
export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('mlm-auth-token') 
    : null;
    
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
}

// Helper function for API requests with auth
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API request failed: ${response.status}`);
  }
  
  return response.json();
}

export default API_CONFIG;