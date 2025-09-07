/**
 * API utility functions for real API implementation
 */
import config from '../config';
import storage from '../../utils/storage';
import { ExtendedApiError, RequestOptions, ApiErrorCode } from '../../types/api.types';

/**
 * Extended error with API context
 */
class ApiError extends Error implements ExtendedApiError {
  status: number;
  code: ApiErrorCode;
  timestamp: string;
  requestId: string;
  field?: string;
  retryable: boolean;
  retryAfter?: number;
  context?: Record<string, any>;

  constructor(
    message: string,
    status: number = 0,
    code: ApiErrorCode = 'UNKNOWN_ERROR',
    requestId: string = 'unknown'
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
    this.retryable = this.isRetryable(status);
  }

  private isRetryable(status: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }
}

/**
 * Handles HTTP response
 * @param response - Fetch response object
 * @returns Promise resolving to parsed response data
 * @throws ApiError for non-2xx responses
 */
export const handleResponse = async <T = any>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new ApiError(
      data.message || 'An error occurred',
      response.status,
      (data.code as ApiErrorCode) || 'SERVER_ERROR',
      data.requestId || 'unknown'
    );
    
    if (data.field) {
      error.field = data.field;
    }
    
    if (response.headers.get('Retry-After')) {
      error.retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10);
    }
    
    error.context = {
      url: response.url,
      status: response.status,
      statusText: response.statusText
    };
    
    throw error;
  }
  
  return data as T;
};

/**
 * Create request options for fetch
 * @param method - HTTP method
 * @param body - Optional request body
 * @param customHeaders - Optional custom headers
 * @returns Fetch request options
 */
export const createRequestOptions = (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: any = null,
  customHeaders: Record<string, string> = {}
): RequestInit => {
  const options: RequestInit = {
    method,
    headers: { 
      ...config.api.defaultHeaders,
      ...customHeaders
    },
    credentials: config.api.withCredentials ? 'include' : 'same-origin'
  };
  
  // Add authentication token if available
  const token = storage.get('auth_token', null);
  if (token) {
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Handle different body types
  if (body && method !== 'GET') {
    if (body instanceof FormData) {
      // Don't set Content-Type for FormData, let browser set it with boundary
      delete (options.headers as Record<string, string>)['Content-Type'];
      options.body = body;
    } else if (typeof body === 'object') {
      options.body = JSON.stringify(body);
    } else {
      options.body = body;
    }
  }
  
  return options;
};

/**
 * Make API request
 * @param endpoint - API endpoint to call
 * @param method - HTTP method
 * @param body - Optional request body
 * @param customHeaders - Optional custom headers
 * @returns Promise resolving to response data
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body: any = null,
  customHeaders: Record<string, string> = {}
): Promise<T> => {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const options = createRequestOptions(method, body, customHeaders);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return handleResponse<T>(response);
  } catch (error) {
    // Handle abort/timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new ApiError(
        'Request timeout',
        408,
        'TIMEOUT',
        'timeout'
      );
      throw timeoutError;
    }
    
    // Handle network errors
    if (error instanceof TypeError) {
      const networkError = new ApiError(
        'Network error',
        0,
        'NETWORK_ERROR',
        'network'
      );
      throw networkError;
    }
    
    // Re-throw API errors as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap unknown errors
    const unknownError = new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'UNKNOWN_ERROR',
      'unknown'
    );
    throw unknownError;
  }
};

/**
 * Build query string from params object
 * @param params - Query parameters
 * @returns URL query string
 */
export const buildQueryString = (params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== null && item !== undefined) {
          queryParams.append(`${key}[]`, item.toString());
        }
      });
    } else if (typeof value === 'object') {
      // Handle nested objects by stringifying them
      queryParams.append(key, JSON.stringify(value));
    } else {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Create GET request helper
 * @param endpoint - API endpoint
 * @param params - Query parameters
 * @returns Promise resolving to response data
 */
export const get = async <T = any>(
  endpoint: string,
  params?: Record<string, any>
): Promise<T> => {
  const queryString = buildQueryString(params);
  return apiRequest<T>(`${endpoint}${queryString}`, 'GET');
};

/**
 * Create POST request helper
 * @param endpoint - API endpoint
 * @param body - Request body
 * @returns Promise resolving to response data
 */
export const post = async <T = any>(
  endpoint: string,
  body: any
): Promise<T> => {
  return apiRequest<T>(endpoint, 'POST', body);
};

/**
 * Create PUT request helper
 * @param endpoint - API endpoint
 * @param body - Request body
 * @returns Promise resolving to response data
 */
export const put = async <T = any>(
  endpoint: string,
  body: any
): Promise<T> => {
  return apiRequest<T>(endpoint, 'PUT', body);
};

/**
 * Create PATCH request helper
 * @param endpoint - API endpoint
 * @param body - Request body
 * @returns Promise resolving to response data
 */
export const patch = async <T = any>(
  endpoint: string,
  body: any
): Promise<T> => {
  return apiRequest<T>(endpoint, 'PATCH', body);
};

/**
 * Create DELETE request helper
 * @param endpoint - API endpoint
 * @returns Promise resolving to response data
 */
export const del = async <T = any>(
  endpoint: string
): Promise<T> => {
  return apiRequest<T>(endpoint, 'DELETE');
};

/**
 * Upload file helper
 * @param endpoint - API endpoint
 * @param formData - FormData containing file and other data
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to response data
 */
export const upload = async <T = any>(
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
): Promise<T> => {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const token = storage.get('auth_token', null);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage
        });
      }
    });
    
    xhr.addEventListener('load', async () => {
      try {
        const response = new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: new Headers()
        });
        const result = await handleResponse<T>(response);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new ApiError('Upload failed', 0, 'SERVER_ERROR'));
    });
    
    xhr.addEventListener('timeout', () => {
      reject(new ApiError('Upload timeout', 408, 'TIMEOUT'));
    });
    
    xhr.open('POST', url);
    xhr.timeout = config.api.timeout;
    
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
};