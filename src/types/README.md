# TypeScript Types for Media Library Manager

This directory contains comprehensive TypeScript type definitions for the entire Media Library Manager application. The types are organized into specialized files for different domains and features.

## File Structure

- **`common.types.ts`** - Base types, utility types, and common interfaces
- **`media.types.ts`** - Media item types, metadata, operations, and queries
- **`folder.types.ts`** - Folder structure, navigation, and permissions
- **`collection.types.ts`** - Collection management, sharing, and templates
- **`auth.types.ts`** - User authentication, permissions, and preferences
- **`api.types.ts`** - API requests, responses, and error handling
- **`props.types.ts`** - React component props and event handlers
- **`index.ts`** - Central export point for all types

## Usage Examples

### Importing Types

```typescript
// Import specific types
import { MediaItem, Folder, Collection, User } from '@/types';

// Import common utility types
import { MediaId, FolderId, Status, ViewMode } from '@/types';

// Import component prop types
import { MediaViewProps, FolderTreeProps } from '@/types';

// Import API types
import { ApiResponse, PaginatedResponse } from '@/types';
```

### Working with Branded Types

The types system uses branded types for IDs to prevent mixing different entity IDs:

```typescript
import { MediaId, FolderId, TypeUtils } from '@/types';

// Type-safe ID creation
const mediaId: MediaId = 'media_123' as MediaId;
const folderId: FolderId = 'folder_456' as FolderId;

// This would cause a TypeScript error:
// const wrongAssignment: MediaId = folderId; // Error!

// Utility functions for validation
TypeUtils.isValidId('some-id'); // boolean
TypeUtils.isValidEmail('user@example.com'); // boolean
TypeUtils.isValidUrl('https://example.com'); // boolean
```

### Component Props Example

```typescript
import { MediaViewProps, MediaItem } from '@/types';

const MediaView: React.FC<MediaViewProps> = ({ 
  media, 
  viewMode, 
  gridSize, 
  onItemClick 
}) => {
  const handleClick = (item: MediaItem) => {
    onItemClick?.(item);
  };

  return (
    <div className={`media-view ${viewMode}`}>
      {media.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

### API Service Example

```typescript
import { 
  MediaItem, 
  CreateMediaItem, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

class MediaService {
  async getMedia(): Promise<PaginatedResponse<MediaItem>> {
    const response = await fetch('/api/media');
    return response.json();
  }

  async createMedia(data: CreateMediaItem): Promise<ApiResponse<MediaItem>> {
    const response = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

### Hook Usage Example

```typescript
import { UseMediaReturn, MediaQuery, MediaId } from '@/types';
import { useState, useCallback } from 'react';

export const useMedia = (): UseMediaReturn => {
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<MediaQuery>({});
  const [selectedItems, setSelectedItems] = useState<MediaId[]>([]);

  const selectItem = useCallback((id: MediaId) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  // ... other methods

  return {
    data,
    loading,
    error,
    query,
    setQuery,
    selectedItems,
    selectItem,
    // ... other methods
  };
};
```

## Type Safety Features

### 1. Branded Types
Prevent mixing different entity IDs:
```typescript
type MediaId = Brand<string, 'MediaId'>;
type FolderId = Brand<string, 'FolderId'>;
```

### 2. Union Types and Enums
```typescript
type Status = 'approved' | 'in_review' | 'rejected' | 'draft' | 'pending';
type MediaType = 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
```

### 3. Generic Types
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

### 4. Utility Types
```typescript
type CreateMediaItem = Omit<MediaItem, 'id' | 'created' | 'modified'>;
type UpdateMediaItem = Partial<Pick<MediaItem, 'name' | 'tags' | 'starred'>>;
```

### 5. Type Guards
```typescript
export const isVideoMetadata = (metadata: MediaMetadata): metadata is VideoMetadata =>
  'duration_seconds' in metadata && 'format' in metadata;
```

## Best Practices

1. **Always import types from the main index**: `import { MediaItem } from '@/types'`
2. **Use branded types for IDs** to prevent mixing different entity types
3. **Leverage utility types** like `Partial`, `Pick`, `Omit` for variations
4. **Use type guards** for runtime type checking
5. **Prefer union types** over string literals for better type safety
6. **Use generic types** for reusable components and functions

## Modern TypeScript Features Used

- **Branded Types** for ID type safety
- **Union Types** for enumeration values  
- **Intersection Types** for combining interfaces
- **Generic Types** with constraints
- **Utility Types** (Partial, Required, Pick, Omit, etc.)
- **Template Literal Types** for string manipulation
- **Conditional Types** for complex type logic
- **Mapped Types** for transformations
- **Type Guards** for runtime type checking

This comprehensive type system ensures type safety across the entire application while providing excellent developer experience with IntelliSense and error catching during development.