/**
 * Collection types for the Media Library Manager
 * 
 * This file contains all types related to collections, which are
 * user-defined groupings of media items for organization and sharing.
 */

import {
  CollectionId,
  MediaId,
  UserId,
  HexColor,
  ISO8601String,
  TimestampFields,
  BaseQuery,
  Permission
} from './common.types';

// ============================================================================
// COLLECTION CORE TYPES
// ============================================================================

/**
 * Main collection interface
 */
export interface Collection extends TimestampFields {
  id: CollectionId;
  name: string;
  description: string;
  items: MediaId[]; // Media items in this collection
  color: HexColor;
  createdBy: UserId;
  parentId: CollectionId | null; // For nested collections
  isShared: boolean;
  sharedWith: UserId[];
  permissions?: CollectionPermissions;
  metadata?: CollectionMetadata;
  thumbnail?: MediaId; // Representative image for the collection
  isPublic?: boolean;
  tags?: string[];
  sortOrder?: number; // Custom sort order
  itemCount?: number; // Calculated field
  totalSize?: number; // Total size of all items in bytes
}

/**
 * Collection permissions for sharing and collaboration
 */
export interface CollectionPermissions {
  owner: UserId;
  editors: UserId[]; // Users who can add/remove items
  viewers: UserId[]; // Users who can only view
  permissions: Record<UserId, Permission[]>;
  allowPublicView: boolean;
  allowPublicContribute: boolean; // Allow anyone to suggest items
  inheritFromParent: boolean;
}

/**
 * Collection metadata for additional information
 */
export interface CollectionMetadata {
  purpose?: string; // Collection purpose or project
  deadline?: ISO8601String; // Project deadline
  status?: 'active' | 'archived' | 'completed' | 'draft';
  guidelines?: string; // Usage guidelines
  externalId?: string; // Reference to external system
  template?: string; // Template used to create collection
  isTemplate?: boolean; // Can be used as template
  templateUsageCount?: number;
  averageRating?: number; // User rating
  downloadCount?: number;
  viewCount?: number;
  lastViewed?: ISO8601String;
  isArchived?: boolean;
  archivedAt?: ISO8601String;
  archivedBy?: UserId;
}

// ============================================================================
// COLLECTION VARIANTS AND SUBSETS
// ============================================================================

/**
 * Minimal collection info for lists and previews
 */
export type CollectionSummary = Pick<Collection, 
  | 'id' 
  | 'name' 
  | 'description'
  | 'color'
  | 'thumbnail'
  | 'itemCount'
  | 'isShared'
  | 'createdBy'
  | 'created'
  | 'modified'
>;

/**
 * Collection with nested children for tree display
 */
export interface CollectionTree extends CollectionSummary {
  children?: CollectionTree[];
  expanded?: boolean; // UI state for tree view
  level?: number; // Nesting level
}

/**
 * Collection with populated media items
 */
export interface CollectionWithItems extends Collection {
  mediaItems?: Array<{
    id: MediaId;
    name: string;
    type: string;
    thumbnail: string;
    addedAt: ISO8601String;
    addedBy: UserId;
    position?: number; // Custom ordering within collection
  }>;
}

/**
 * Collection creation payload
 */
export type CreateCollection = Pick<Collection,
  | 'name'
  | 'description'
  | 'color'
  | 'parentId'
  | 'isShared'
  | 'sharedWith'
> & {
  items?: MediaId[];
  permissions?: Partial<CollectionPermissions>;
  metadata?: Partial<CollectionMetadata>;
  tags?: string[];
};

/**
 * Collection update payload
 */
export type UpdateCollection = Partial<Pick<Collection,
  | 'name'
  | 'description'
  | 'color'
  | 'parentId'
  | 'isShared'
  | 'sharedWith'
  | 'thumbnail'
  | 'tags'
  | 'metadata'
  | 'permissions'
>>;

// ============================================================================
// COLLECTION OPERATIONS
// ============================================================================

/**
 * Add items to collection request
 */
export interface AddItemsToCollectionRequest {
  collectionId: CollectionId;
  mediaIds: MediaId[];
  position?: 'start' | 'end' | number; // Where to insert items
  skipDuplicates?: boolean;
}

/**
 * Remove items from collection request
 */
export interface RemoveItemsFromCollectionRequest {
  collectionId: CollectionId;
  mediaIds: MediaId[];
}

/**
 * Reorder items in collection request
 */
export interface ReorderCollectionItemsRequest {
  collectionId: CollectionId;
  itemOrder: Array<{
    mediaId: MediaId;
    position: number;
  }>;
}

/**
 * Bulk collection operation
 */
export interface BulkCollectionOperation {
  operation: 'move' | 'copy' | 'delete' | 'archive' | 'share' | 'merge';
  collectionIds: CollectionId[];
  params?: {
    targetParentId?: CollectionId;
    shareWith?: UserId[];
    permissions?: Permission[];
    targetCollectionId?: CollectionId; // For merge operation
  };
}

/**
 * Collection merge operation
 */
export interface MergeCollectionsRequest {
  sourceCollectionIds: CollectionId[];
  targetCollectionId: CollectionId;
  strategy: 'append' | 'replace' | 'merge_duplicates';
  deleteSource?: boolean;
}

// ============================================================================
// COLLECTION QUERIES AND FILTERS
// ============================================================================

/**
 * Collection query options
 */
export interface CollectionQuery extends BaseQuery {
  createdBy?: UserId;
  sharedWith?: UserId;
  parentId?: CollectionId | 'root' | 'all';
  isShared?: boolean;
  isPublic?: boolean;
  hasItems?: boolean; // Only collections with items
  itemCount?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  status?: string[]; // From metadata.status
  includeArchived?: boolean;
  template?: boolean; // Only templates or non-templates
  containsMediaId?: MediaId; // Collections containing specific media
  color?: HexColor[];
  dateRange?: {
    field: 'created' | 'modified' | 'deadline';
    from?: ISO8601String;
    to?: ISO8601String;
  };
}

/**
 * Collection tree query options
 */
export interface CollectionTreeQuery {
  rootId?: CollectionId; // Start from specific collection
  maxDepth?: number; // Limit tree depth
  includeItemCount?: boolean;
  includePermissions?: boolean;
  expandedIds?: CollectionId[]; // Pre-expanded collections
  userId?: UserId; // Filter by user permissions
  includeShared?: boolean;
}

// ============================================================================
// COLLECTION STATISTICS
// ============================================================================

/**
 * Collection statistics
 */
export interface CollectionStats {
  id: CollectionId;
  name: string;
  itemCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  mediaTypes: Record<string, number>;
  subCollectionCount: number;
  depth: number; // How deep in the hierarchy
  lastActivity: ISO8601String;
  contributors: Array<{
    userId: UserId;
    displayName: string;
    itemsAdded: number;
    lastContribution: ISO8601String;
  }>;
  recentAdditions: number; // Last 7 days
  popularityScore: number; // Based on views, shares, etc.
}

/**
 * Collection usage analytics
 */
export interface CollectionUsage {
  collectionId: CollectionId;
  views: number;
  shares: number;
  downloads: number;
  contributions: number;
  period: 'day' | 'week' | 'month' | 'year';
  data: Array<{
    date: string;
    views: number;
    shares: number;
    downloads: number;
    contributions: number;
  }>;
}

// ============================================================================
// COLLECTION SHARING AND COLLABORATION
// ============================================================================

/**
 * Collection sharing request
 */
export interface ShareCollectionRequest {
  collectionId: CollectionId;
  shareWith: UserId[];
  permissions: Permission[];
  message?: string;
  expiresAt?: ISO8601String;
  allowReshare?: boolean;
  allowContributions?: boolean;
}

/**
 * Collection sharing info
 */
export interface CollectionShare {
  id: string;
  collectionId: CollectionId;
  sharedBy: UserId;
  sharedWith: UserId;
  permissions: Permission[];
  sharedAt: ISO8601String;
  expiresAt?: ISO8601String;
  message?: string;
  isActive: boolean;
  lastAccessed?: ISO8601String;
  contributionsCount?: number;
}

/**
 * Collection invitation for collaboration
 */
export interface CollectionInvitation {
  id: string;
  collectionId: CollectionId;
  invitedBy: UserId;
  invitedUser: UserId;
  invitedEmail?: string; // For external users
  permissions: Permission[];
  message?: string;
  invitedAt: ISO8601String;
  expiresAt?: ISO8601String;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  respondedAt?: ISO8601String;
}

/**
 * Collection activity for collaboration tracking
 */
export interface CollectionActivity {
  id: string;
  collectionId: CollectionId;
  userId: UserId;
  userDisplayName: string;
  action: 'created' | 'renamed' | 'item_added' | 'item_removed' | 'shared' | 'accessed' | 'modified';
  details?: string;
  timestamp: ISO8601String;
  affectedItems?: MediaId[]; // Items involved in the action
  previousValue?: any; // For tracking changes
  newValue?: any;
}

// ============================================================================
// COLLECTION TEMPLATES AND PRESETS
// ============================================================================

/**
 * Collection template for quick creation
 */
export interface CollectionTemplate {
  id: string;
  name: string;
  description: string;
  color: HexColor;
  structure?: CollectionTemplateItem[];
  defaultPermissions?: Partial<CollectionPermissions>;
  defaultMetadata?: Partial<CollectionMetadata>;
  tags: string[];
  category: string; // Template category
  isPublic: boolean;
  createdBy: UserId;
  usageCount: number;
  rating: number;
  thumbnail?: string;
}

/**
 * Collection template item structure
 */
export interface CollectionTemplateItem {
  name: string;
  description?: string;
  color: HexColor;
  children?: CollectionTemplateItem[];
}

/**
 * Smart collection based on rules
 */
export interface SmartCollection {
  id: CollectionId;
  name: string;
  description: string;
  rules: SmartCollectionRule[];
  autoUpdate: boolean;
  color: HexColor;
  created: ISO8601String;
  modified: ISO8601String;
  itemCount: number; // Calculated count based on rules
  lastSync: ISO8601String;
}

/**
 * Smart collection rule
 */
export interface SmartCollectionRule {
  id: string;
  field: 'type' | 'name' | 'tags' | 'folder' | 'size' | 'date' | 'status' | 'used';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  caseSensitive?: boolean;
  weight?: number; // For scoring relevance
}

// ============================================================================
// COLLECTION IMPORT/EXPORT
// ============================================================================

/**
 * Collection export options
 */
export interface CollectionExportOptions {
  collectionId: CollectionId;
  includeSubCollections: boolean;
  includeMedia: boolean;
  format: 'zip' | 'json' | 'csv' | 'pdf';
  preserveStructure: boolean;
  includeMetadata: boolean;
  includePermissions: boolean;
  mediaQuality?: 'original' | 'high' | 'medium' | 'low';
}

/**
 * Collection import options
 */
export interface CollectionImportOptions {
  file: File;
  targetParentId?: CollectionId;
  preserveStructure: boolean;
  skipDuplicates: boolean;
  overwriteExisting: boolean;
  importPermissions: boolean;
  createMissingUsers: boolean;
}

// ============================================================================
// COLLECTION PRESENTATION
// ============================================================================

/**
 * Collection presentation/slideshow
 */
export interface CollectionPresentation {
  id: string;
  collectionId: CollectionId;
  name: string;
  slides: CollectionSlide[];
  settings: PresentationSettings;
  created: ISO8601String;
  createdBy: UserId;
  isPublic: boolean;
}

/**
 * Collection slide for presentations
 */
export interface CollectionSlide {
  id: string;
  mediaId: MediaId;
  title?: string;
  description?: string;
  duration?: number; // seconds
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  order: number;
}

/**
 * Presentation settings
 */
export interface PresentationSettings {
  autoPlay: boolean;
  loop: boolean;
  defaultDuration: number; // seconds per slide
  showTitles: boolean;
  showDescriptions: boolean;
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  backgroundColor: HexColor;
  music?: MediaId; // Background music
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Check if collection is root collection
 */
export const isRootCollection = (collection: Collection): boolean => 
  collection.parentId === null;

/**
 * Check if collection is nested under another collection
 */
export const isChildOfCollection = (child: Collection, parent: Collection): boolean =>
  child.parentId === parent.id;

/**
 * Check if user has permission on collection
 */
export const hasCollectionPermission = (
  collection: Collection, 
  userId: UserId, 
  permission: Permission
): boolean => {
  if (collection.createdBy === userId) return true;
  if (!collection.permissions) return false;
  
  const userPermissions = collection.permissions.permissions[userId];
  return userPermissions ? userPermissions.includes(permission) : false;
};

/**
 * Check if collection is shared with user
 */
export const isCollectionSharedWith = (
  collection: Collection, 
  userId: UserId
): boolean => {
  return collection.isShared && collection.sharedWith.includes(userId);
};

/**
 * Get collection depth in hierarchy
 */
export const getCollectionDepth = (collection: Collection, allCollections: Collection[]): number => {
  let depth = 0;
  let current = collection;
  
  while (current.parentId) {
    const parent = allCollections.find(c => c.id === current.parentId);
    if (!parent) break;
    current = parent;
    depth++;
  }
  
  return depth;
};

// ============================================================================
// COLLECTION CONSTANTS
// ============================================================================

export const COLLECTION_COLORS: HexColor[] = [
  '#8B5CF6' as HexColor, // Violet (default)
  '#10B981' as HexColor, // Emerald
  '#F59E0B' as HexColor, // Amber
  '#3B82F6' as HexColor, // Blue
  '#EC4899' as HexColor, // Pink
  '#14B8A6' as HexColor, // Teal
  '#F43F5E' as HexColor, // Rose
  '#0EA5E9' as HexColor, // Sky
  '#F97316' as HexColor, // Orange
  '#6366F1' as HexColor, // Indigo
  '#EF4444' as HexColor, // Red
  '#22C55E' as HexColor  // Green
];

export const DEFAULT_COLLECTION_COLOR = '#8B5CF6' as HexColor;

export const MAX_COLLECTION_ITEMS = 10000;
export const MAX_COLLECTION_DEPTH = 10;
export const MAX_COLLECTION_NAME_LENGTH = 100;