/**
 * Folder types for the Media Library Manager
 * 
 * This file contains all types related to folder structure,
 * navigation, and organization.
 */

import {
  FolderId,
  UserId,
  MediaId,
  HexColor,
  ISO8601String,
  TimestampFields,
  BaseQuery,
  Permission
} from './common.types';

// ============================================================================
// FOLDER CORE TYPES
// ============================================================================

/**
 * Main folder interface
 */
export interface Folder extends TimestampFields {
  id: FolderId;
  name: string;
  parent: FolderId | null; // null for root folders
  path: string; // Full path from root (e.g., "Images/Products")
  color: HexColor;
  description?: string;
  mediaCount?: number; // Number of media items in this folder
  totalSize?: number; // Total size in bytes
  subfolderCount?: number; // Number of direct child folders
  isShared?: boolean;
  sharedWith?: UserId[];
  permissions?: FolderPermissions;
  metadata?: FolderMetadata;
}

/**
 * Folder permissions
 */
export interface FolderPermissions {
  owner: UserId;
  permissions: Record<UserId, Permission[]>;
  inheritFromParent: boolean;
  public: boolean;
  publicPermissions?: Permission[];
}

/**
 * Folder metadata for additional information
 */
export interface FolderMetadata {
  tags?: string[];
  purpose?: string; // Brief description of folder purpose
  guidelines?: string; // Usage guidelines
  thumbnail?: MediaId; // Representative image for the folder
  sortOrder?: number; // Custom sort order
  isArchived?: boolean;
  archivedAt?: ISO8601String;
  archivedBy?: UserId;
}

// ============================================================================
// FOLDER VARIANTS AND SUBSETS
// ============================================================================

/**
 * Minimal folder info for navigation
 */
export type FolderSummary = Pick<Folder, 
  | 'id' 
  | 'name' 
  | 'parent' 
  | 'path'
  | 'color'
  | 'mediaCount'
  | 'subfolderCount'
>;

/**
 * Folder with children for tree display
 */
export interface FolderTree extends FolderSummary {
  children?: FolderTree[];
  expanded?: boolean; // UI state for tree view
  level?: number; // Nesting level
}

/**
 * Folder creation payload
 */
export type CreateFolder = Pick<Folder,
  | 'name'
  | 'parent'
  | 'color'
  | 'description'
> & {
  permissions?: Partial<FolderPermissions>;
  metadata?: Partial<FolderMetadata>;
};

/**
 * Folder update payload
 */
export type UpdateFolder = Partial<Pick<Folder,
  | 'name'
  | 'color'
  | 'description'
  | 'permissions'
  | 'metadata'
>>;

// ============================================================================
// FOLDER NAVIGATION
// ============================================================================

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  id: FolderId;
  name: string;
  path: string;
  isRoot?: boolean;
}

/**
 * Folder navigation state
 */
export interface FolderNavigation {
  currentFolder: FolderId | null;
  breadcrumbs: BreadcrumbItem[];
  parentFolder: FolderId | null;
  childFolders: FolderSummary[];
  canGoUp: boolean;
  canCreateFolder: boolean;
}

/**
 * Recent folder access
 */
export interface RecentFolder {
  folder: FolderSummary;
  lastAccessed: ISO8601String;
  accessCount: number;
}

// ============================================================================
// FOLDER OPERATIONS
// ============================================================================

/**
 * Folder move operation
 */
export interface MoveFolderRequest {
  folderId: FolderId;
  newParentId: FolderId | null;
  position?: number; // Position among siblings
}

/**
 * Folder copy operation
 */
export interface CopyFolderRequest {
  folderId: FolderId;
  newParentId: FolderId | null;
  newName?: string;
  copyContents: boolean; // Whether to copy media items
  copyPermissions: boolean;
}

/**
 * Bulk folder operation
 */
export interface BulkFolderOperation {
  operation: 'move' | 'copy' | 'delete' | 'archive' | 'share';
  folderIds: FolderId[];
  params?: {
    targetParentId?: FolderId;
    shareWith?: UserId[];
    permissions?: Permission[];
  };
}

// ============================================================================
// FOLDER QUERIES AND FILTERS
// ============================================================================

/**
 * Folder query options
 */
export interface FolderQuery extends BaseQuery {
  parentId?: FolderId | 'root' | 'all';
  includeEmpty?: boolean; // Include folders with no media
  includeArchived?: boolean;
  hasPermission?: Permission;
  sharedOnly?: boolean;
  searchInPath?: boolean; // Search in folder paths, not just names
  createdBy?: UserId;
  tags?: string[];
  minMediaCount?: number;
  maxMediaCount?: number;
}

/**
 * Folder tree query options
 */
export interface FolderTreeQuery {
  rootId?: FolderId; // Start from specific folder
  maxDepth?: number; // Limit tree depth
  includeMediaCount?: boolean;
  includePermissions?: boolean;
  expandedIds?: FolderId[]; // Pre-expanded folders
  userId?: UserId; // Filter by user permissions
}

// ============================================================================
// FOLDER STATISTICS
// ============================================================================

/**
 * Folder statistics
 */
export interface FolderStats {
  id: FolderId;
  name: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  subfolderCount: number;
  depth: number; // How deep in the hierarchy
  lastActivity: ISO8601String;
  topMediaTypes: Array<{
    type: string;
    count: number;
  }>;
  recentUploads: number; // Last 7 days
  averageFileSize: number;
}

/**
 * Folder usage analytics
 */
export interface FolderUsage {
  folderId: FolderId;
  views: number;
  downloads: number;
  uploads: number;
  period: 'day' | 'week' | 'month' | 'year';
  data: Array<{
    date: string;
    views: number;
    downloads: number;
    uploads: number;
  }>;
}

// ============================================================================
// FOLDER SHARING AND COLLABORATION
// ============================================================================

/**
 * Folder sharing request
 */
export interface ShareFolderRequest {
  folderId: FolderId;
  shareWith: UserId[];
  permissions: Permission[];
  message?: string;
  expiresAt?: ISO8601String;
  allowReshare?: boolean;
}

/**
 * Folder sharing info
 */
export interface FolderShare {
  id: string;
  folderId: FolderId;
  sharedBy: UserId;
  sharedWith: UserId;
  permissions: Permission[];
  sharedAt: ISO8601String;
  expiresAt?: ISO8601String;
  message?: string;
  isActive: boolean;
  lastAccessed?: ISO8601String;
}

/**
 * Folder collaboration activity
 */
export interface FolderActivity {
  id: string;
  folderId: FolderId;
  userId: UserId;
  userDisplayName: string;
  action: 'created' | 'renamed' | 'moved' | 'deleted' | 'shared' | 'accessed' | 'modified';
  details?: string;
  timestamp: ISO8601String;
  affectedItems?: MediaId[]; // If action affected media items
}

// ============================================================================
// FOLDER TEMPLATES AND PRESETS
// ============================================================================

/**
 * Folder template for quick creation
 */
export interface FolderTemplate {
  id: string;
  name: string;
  description: string;
  structure: Array<{
    name: string;
    color: HexColor;
    children?: Array<{
      name: string;
      color: HexColor;
    }>;
  }>;
  tags: string[];
  isPublic: boolean;
  createdBy: UserId;
  usageCount: number;
}

/**
 * Smart folder based on rules
 */
export interface SmartFolder {
  id: FolderId;
  name: string;
  description: string;
  rules: SmartFolderRule[];
  autoUpdate: boolean;
  color: HexColor;
  created: ISO8601String;
  modified: ISO8601String;
  mediaCount: number; // Calculated count based on rules
}

/**
 * Smart folder rule
 */
export interface SmartFolderRule {
  id: string;
  field: 'type' | 'name' | 'tags' | 'size' | 'date' | 'folder' | 'status';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  caseSensitive?: boolean;
}

// ============================================================================
// FOLDER IMPORT/EXPORT
// ============================================================================

/**
 * Folder export options
 */
export interface FolderExportOptions {
  folderId: FolderId;
  includeSubfolders: boolean;
  includeMedia: boolean;
  format: 'zip' | 'tar' | 'folder';
  preserveStructure: boolean;
  includeMetadata: boolean;
  mediaQuality?: 'original' | 'high' | 'medium' | 'low';
}

/**
 * Folder import options
 */
export interface FolderImportOptions {
  targetFolderId: FolderId | null;
  preserveStructure: boolean;
  skipDuplicates: boolean;
  overwriteExisting: boolean;
  createMissingFolders: boolean;
  importPermissions: boolean;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Check if folder is root folder
 */
export const isRootFolder = (folder: Folder): boolean => 
  folder.parent === null;

/**
 * Check if folder is child of another folder
 */
export const isChildOfFolder = (child: Folder, parent: Folder): boolean =>
  child.path.startsWith(parent.path + '/');

/**
 * Get folder depth in hierarchy
 */
export const getFolderDepth = (folder: Folder): number =>
  folder.path.split('/').length - 1;

/**
 * Check if user has permission on folder
 */
export const hasPermission = (
  folder: Folder, 
  userId: UserId, 
  permission: Permission
): boolean => {
  if (!folder.permissions) return false;
  
  const userPermissions = folder.permissions.permissions[userId];
  return userPermissions ? userPermissions.includes(permission) : false;
};

// ============================================================================
// FOLDER CONSTANTS
// ============================================================================

export const FOLDER_COLORS: HexColor[] = [
  '#3B82F6' as HexColor, // Blue
  '#10B981' as HexColor, // Emerald
  '#F59E0B' as HexColor, // Amber
  '#8B5CF6' as HexColor, // Violet
  '#EC4899' as HexColor, // Pink
  '#14B8A6' as HexColor, // Teal
  '#F43F5E' as HexColor, // Rose
  '#0EA5E9' as HexColor, // Sky
  '#F97316' as HexColor, // Orange
  '#6366F1' as HexColor, // Indigo
  '#EF4444' as HexColor, // Red
  '#22C55E' as HexColor  // Green
];

export const DEFAULT_FOLDER_COLOR = '#8B5CF6' as HexColor;