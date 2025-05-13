/**
 * API utility functions for mocking network conditions
 */

/**
 * Simulates network delay
 * @param {number} ms - Time to delay in milliseconds (default: random between 200-800ms)
 * @returns {Promise} - Promise that resolves after the delay
 */
export const delay = (ms = Math.floor(Math.random() * 600) + 200) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Wraps response in a standard format with metadata
 * @param {any} data - The data to wrap
 * @param {string} message - Optional success message
 * @returns {Object} - Standardized response object
 */
export const wrapResponse = (data, message = 'Success') => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: `req_${Math.random().toString(36).substring(2, 12)}`
  };
};

/**
 * Simulates an API error
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @returns {Object} - Error object
 */
export const createError = (
  message = 'An unexpected error occurred',
  status = 500,
  code = 'server_error'
) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.timestamp = new Date().toISOString();
  error.requestId = `req_${Math.random().toString(36).substring(2, 12)}`;
  return error;
};

/**
 * Simulates a random failure based on probability
 * @param {number} probability - Failure probability (0-1)
 * @param {string} message - Error message if failure occurs
 * @param {number} status - HTTP status code if failure occurs
 * @param {string} code - Error code if failure occurs
 * @throws {Error} - Throws error if random failure occurs
 */
export const simulateRandomFailure = (
  probability = 0.05,
  message = 'Request failed',
  status = 500,
  code = 'server_error'
) => {
  // For debugging, we can optionally force failures or disable them
  const debugMode = false;
  const forceFailure = false;
  const disableFailures = true;
  
  // In debug mode, log potential failures
  if (debugMode) {
    console.log(`Simulating potential failure (${probability * 100}% chance): ${message}`);
  }
  
  // Skip failures if disabled
  if (disableFailures) return;
  
  // Force failure if needed
  if (forceFailure || Math.random() < probability) {
    // Create a more detailed error message
    const detailedMessage = `${message} (This is a simulated error with ${probability * 100}% probability)`;
    const error = createError(detailedMessage, status, code);
    
    // Add debug info to the error
    error.debug = {
      simulatedFailure: true,
      timestamp: new Date().toISOString(),
      probability
    };
    
    if (debugMode) {
      console.error('Simulated API failure:', error);
    }
    
    throw error;
  }
};

/**
 * Simulates pagination
 * @param {Array} items - Full array of items
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Object} - Paginated result with metadata
 */
export const paginate = (items, page = 1, pageSize = 20) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    meta: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      hasNextPage: endIndex < items.length,
      hasPreviousPage: page > 1
    }
  };
};
