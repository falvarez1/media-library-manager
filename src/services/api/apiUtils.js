/**
 * API utility functions for real API implementation
 */
import config from '../config';

/**
 * Handles HTTP response
 * @param {Response} response - Fetch response object
 * @returns {Promise} - Promise resolving to parsed response data
 * @throws {Error} - Throws error for non-2xx responses
 */
export const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    error.code = data.code || 'api_error';
    error.timestamp = new Date().toISOString();
    error.requestId = data.requestId || 'unknown';
    throw error;
  }
  
  return data;
};

/**
 * Create request options for fetch
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} body - Optional request body
 * @returns {Object} - Fetch request options
 */
export const createRequestOptions = (method, body = null) => {
  const options = {
    method,
    headers: { ...config.api.defaultHeaders },
    timeout: config.api.timeout,
    credentials: config.api.withCredentials ? 'include' : 'same-origin'
  };
  
  // Add authentication token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add body for non-GET requests
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

/**
 * Make API request
 * @param {string} endpoint - API endpoint to call
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} body - Optional request body
 * @returns {Promise} - Promise resolving to response data
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const options = createRequestOptions(method, body);
  
  try {
    const response = await fetch(url, options);
    return handleResponse(response);
  } catch (error) {
    // Add additional context to the error
    if (!error.status) {
      error.status = 0;
      error.code = 'network_error';
      error.timestamp = new Date().toISOString();
    }
    throw error;
  }
};

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} - URL query string
 */
export const buildQueryString = (params) => {
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
    } else {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};