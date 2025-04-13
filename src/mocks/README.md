# Media Library Manager Mock System

This directory contains a comprehensive mock data and API system for the Media Library Manager application. The mock system is designed to simulate real API calls, with proper error handling, loading states, and realistic response structures.

## Directory Structure

```
src/mocks/
├── api/              # Mock API implementation
│   ├── mediaApi.js   # Media-related API calls
│   ├── foldersApi.js # Folder-related API calls
│   ├── collectionsApi.js # Collection-related API calls 
│   ├── tagsApi.js    # Tag-related API calls
│   ├── usersApi.js   # User-related API calls
│   └── index.js      # Combined API exports
├── data/             # Mock data files
│   ├── media.js      # Media items data
│   ├── folders.js    # Folder structure data
│   ├── collections.js # Collections data
│   ├── tags.js       # Tags data
│   └── users.js      # User data
├── images/           # Image placeholders
└── utils/            # Utility functions
    └── apiUtils.js   # API helper utilities
```

## Usage

### Using the Mock APIs

Import the API modules from the mocks directory:

```javascript
import api from '../mocks/api';

// Media API example
async function fetchMedia() {
  try {
    const response = await api.media.getMedia({
      page: 1,
      pageSize: 20,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching media:', error);
  }
}

// Folders API example
async function createFolder() {
  try {
    const response = await api.folders.createFolder({
      name: 'New Folder',
      parent: '1'
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error creating folder:', error);
  }
}
```

### Handling Loading States

All API calls include a simulated network delay to replicate real-world conditions. Use this to implement loading states in your UI:

```javascript
import { useState, useEffect } from 'react';
import api from '../mocks/api';

function MediaList() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMedia() {
      setLoading(true);
      try {
        const response = await api.media.getMedia();
        setMedia(response.data.items);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {media.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Error Handling

The mock API simulates random failures to help test error handling. Each API call can throw an error with status codes and error messages:

```javascript
try {
  const response = await api.media.getMediaById('nonexistent-id');
} catch (error) {
  console.error(`Error ${error.status}: ${error.message}`);
  
  // Check for specific error types
  if (error.status === 404) {
    // Handle not found error
  } else if (error.status === 503) {
    // Handle service unavailable
  }
}
```

## Migrating to Real APIs

When transitioning from mock data to real API endpoints, follow these steps:

### 1. Create Real API Service Modules

Create corresponding real API service modules that match the same interface as the mock APIs. For example:

```javascript
// src/services/api/mediaApi.js
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

export const getMedia = async (options = {}) => {
  const response = await axios.get(`${BASE_URL}/media`, { params: options });
  return response.data;
};

export const getMediaById = async (id) => {
  const response = await axios.get(`${BASE_URL}/media/${id}`);
  return response.data;
};

// etc...

export default {
  getMedia,
  getMediaById,
  // etc...
};
```

### 2. API Interface Consistency

Ensure that your real API implementation follows the same interface as the mock API:

- Use the same function names and parameters
- Return data in the same structure
- Handle errors in a similar way

### 3. Data Schema Validation

Use a schema validation library like Zod, Yup, or Joi to validate the response data from your real API:

```javascript
import { z } from 'zod';

// Define the media item schema
const MediaItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  folder: z.string(),
  path: z.string(),
  size: z.string(),
  dimensions: z.string().optional(),
  created: z.string(),
  modified: z.string(),
  used: z.boolean(),
  usedIn: z.array(z.string()),
  tags: z.array(z.string()),
  url: z.string(),
  thumbnail: z.string(),
  starred: z.boolean(),
  favorited: z.boolean(),
  status: z.string()
});

// Validate the response
const validateMediaResponse = (data) => {
  try {
    MediaItemSchema.parse(data);
    return true;
  } catch (error) {
    console.error('Media validation error:', error);
    return false;
  }
};
```

### 4. Environment-Based API Selection

Use environment variables or configuration to switch between mock and real APIs:

```javascript
// src/services/api/index.js
import mockApi from '../../mocks/api';
import realMediaApi from './mediaApi';
import realFoldersApi from './foldersApi';
// ... import other real API modules

const isUseMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

const api = isUseMockApi 
  ? mockApi 
  : {
      media: realMediaApi,
      folders: realFoldersApi,
      // ... other real API modules
    };

export default api;
```

### 5. Expected API Endpoints

The real backend should implement the following API endpoints:

#### Media Endpoints

- `GET /api/media` - List media items with filtering and pagination
- `GET /api/media/:id` - Get a single media item
- `POST /api/media` - Create a new media item
- `PUT /api/media/:id` - Update a media item
- `DELETE /api/media/:id` - Delete a media item
- `POST /api/media/batch-update` - Batch update media items
- `POST /api/media/batch-delete` - Batch delete media items
- `GET /api/media/stats` - Get media usage statistics

#### Folders Endpoints

- `GET /api/folders` - List folders
- `GET /api/folders/tree` - Get folder tree structure
- `GET /api/folders/:id` - Get a single folder
- `GET /api/folders/:id/contents` - Get folder contents
- `POST /api/folders` - Create a new folder
- `PUT /api/folders/:id` - Update a folder
- `DELETE /api/folders/:id` - Delete a folder

#### Collections Endpoints

- `GET /api/collections` - List collections
- `GET /api/collections/:id` - Get a single collection
- `GET /api/collections/:id/contents` - Get collection contents
- `POST /api/collections` - Create a new collection
- `PUT /api/collections/:id` - Update a collection
- `DELETE /api/collections/:id` - Delete a collection
- `POST /api/collections/:id/add-items` - Add items to a collection
- `POST /api/collections/:id/remove-items` - Remove items from a collection
- `POST /api/collections/:id/share` - Share a collection with users

#### Tags Endpoints

- `GET /api/tags` - List tags
- `GET /api/tags/:id` - Get a single tag
- `GET /api/tags/:id/media` - Get media items with a specific tag
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag
- `GET /api/tags/popular` - Get popular tags

#### Users Endpoints

- `GET /api/users` - List users
- `GET /api/users/current` - Get current user
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/profile` - Update current user's profile
- `PUT /api/users/preferences` - Update user preferences
- `PUT /api/users/recent/:type/:id` - Update recent folders or files
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Response Structure

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Success message",
  "timestamp": "2025-04-12T21:45:32.123Z",
  "requestId": "req_abc123"
}
```

For error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "error_code",
    "status": 404
  },
  "timestamp": "2025-04-12T21:45:32.123Z",
  "requestId": "req_abc123"
}
```

## Edge Cases and Error States

The mock API includes simulations of various edge cases and error states:

1. **Not Found Errors**: When requested resources don't exist
2. **Validation Errors**: When request data is invalid
3. **Conflict Errors**: When operations conflict with existing data
4. **Service Unavailable**: Random failures to simulate network issues
5. **Authentication Errors**: For unauthorized access

These simulations help ensure the frontend gracefully handles error conditions before connecting to a real backend.