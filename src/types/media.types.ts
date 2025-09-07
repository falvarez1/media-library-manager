/**
 * Media types for the Media Library Manager
 * 
 * This file contains all types related to media items, including
 * images, videos, documents, and other file types.
 */

import {
  MediaId,
  FolderId,
  TagId,
  ISO8601String,
  DateString,
  Status,
  MediaType,
  HexColor,
  TimestampFields,
  BaseQuery,
  FilterOptions
} from './common.types';

// ============================================================================
// MEDIA ITEM CORE TYPES
// ============================================================================

/**
 * Attribution information for media items
 */
export interface MediaAttribution {
  photographer?: string;
  creator?: string;
  profile?: string;
  source: string;
}

/**
 * Metadata for video files
 */
export interface VideoMetadata {
  duration_seconds: number;
  format: string;
  codec: string;
  fps?: number;
  bitrate?: number;
}

/**
 * Metadata for document files
 */
export interface DocumentMetadata {
  pages: number;
  author: string;
  lastReviewed?: DateString;
  wordCount?: number;
  version?: string;
}

/**
 * Metadata for image files
 */
export interface ImageMetadata {
  format: string;
  colorSpace?: string;
  dpi?: number;
  hasAlpha?: boolean;
  compression?: string;
}

/**
 * Metadata for audio files
 */
export interface AudioMetadata {
  duration_seconds: number;
  format: string;
  codec: string;
  bitrate: number;
  sampleRate: number;
  channels: number;
  artist?: string;
  album?: string;
  year?: number;
}

/**
 * Union type for all metadata types
 */
export type MediaMetadata = 
  | VideoMetadata 
  | DocumentMetadata 
  | ImageMetadata 
  | AudioMetadata;

// ============================================================================
// MAIN MEDIA ITEM INTERFACE
// ============================================================================

/**
 * Complete media item interface
 */
export interface MediaItem extends TimestampFields {
  id: MediaId;
  type: MediaType;
  name: string;
  folder: FolderId;
  path: string;
  size: string; // Formatted size (e.g., "2.4 MB")
  sizeBytes?: number; // Size in bytes
  dimensions?: string; // Formatted dimensions (e.g., "1920 x 1080")
  duration?: string; // Formatted duration for videos (e.g., "2:45")
  used: boolean;
  usedIn: string[]; // Array of locations where the media is used
  tags: string[]; // User-assigned tags
  ai_tags: string[]; // AI-generated tags
  url: string; // URL to access the media
  thumbnail: string; // URL to thumbnail image
  starred: boolean;
  favorited: boolean;
  status: Status;
  attribution?: MediaAttribution;
  metadata?: MediaMetadata;
  rejectionReason?: string; // Present when status is 'rejected'
  downloadCount?: number;
  viewCount?: number;
  lastViewed?: ISO8601String;
  hash?: string; // File hash for duplicate detection
  analytics?: {
    views?: number;
    downloads?: number;
    shares?: number;
  };
  comments?: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: ISO8601String;
  }>;
}

// ============================================================================
// MEDIA ITEM VARIANTS AND SUBSETS
// ============================================================================

/**
 * Minimal media item for lists and previews
 */
export type MediaItemSummary = Pick<MediaItem, 
  | 'id' 
  | 'name' 
  | 'type' 
  | 'thumbnail' 
  | 'size' 
  | 'starred' 
  | 'favorited' 
  | 'status'
>;

/**
 * Media item for detailed view
 */
export type MediaItemDetail = MediaItem;

/**
 * Media item creation payload
 */
export type CreateMediaItem = Omit<MediaItem, 
  | 'id' 
  | 'created' 
  | 'modified'
  | 'used' 
  | 'usedIn'
  | 'downloadCount'
  | 'viewCount'
  | 'lastViewed'
> & {
  file?: File; // File object for upload
  folderId: FolderId; // Required for creation
};

/**
 * Media item update payload
 */
export type UpdateMediaItem = Partial<Pick<MediaItem,
  | 'name'
  | 'folder'
  | 'tags'
  | 'starred'
  | 'favorited'
  | 'status'
  | 'rejectionReason'
  | 'attribution'
  | 'metadata'
>>;

// ============================================================================
// MEDIA OPERATIONS
// ============================================================================

/**
 * Batch operation types
 */
export type BatchOperation = 
  | 'move'
  | 'copy'
  | 'delete'
  | 'star'
  | 'unstar'
  | 'favorite'
  | 'unfavorite'
  | 'approve'
  | 'reject'
  | 'tag'
  | 'untag';

/**
 * Batch operation request
 */
export interface BatchOperationRequest {
  operation: BatchOperation;
  mediaIds: MediaId[];
  params?: {
    folderId?: FolderId;
    tags?: string[];
    rejectionReason?: string;
    status?: Status;
  };
}

/**
 * Media upload progress
 */
export interface MediaUploadProgress {
  mediaId: MediaId;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  estimatedTimeRemaining?: number; // seconds
}

/**
 * Media upload result
 */
export interface MediaUploadResult {
  success: boolean;
  mediaItem?: MediaItem;
  error?: string;
  warnings?: string[];
}

// ============================================================================
// MEDIA QUERIES AND FILTERS
// ============================================================================

/**
 * Media-specific query options
 */
export interface MediaQuery extends BaseQuery {
  folderId?: FolderId;
  type?: MediaType | MediaType[];
  status?: Status | Status[];
  starred?: boolean;
  favorited?: boolean;
  used?: boolean;
  tags?: string[];
  ai_tags?: string[];
  dateFrom?: DateString;
  dateTo?: DateString;
  sizeMin?: number; // bytes
  sizeMax?: number; // bytes
  dimensions?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  duration?: {
    min?: number; // seconds
    max?: number; // seconds
  };
}

/**
 * Extended filter options for media
 */
export interface MediaFilterOptions extends FilterOptions {
  formats?: string[]; // File formats (jpg, png, mp4, etc.)
  hasAttribution?: boolean;
  hasMetadata?: boolean;
  duplicates?: 'include' | 'exclude' | 'only';
}

// ============================================================================
// MEDIA STATISTICS
// ============================================================================

/**
 * Media usage statistics
 */
export interface MediaStats {
  totalItems: number;
  totalSize: number; // bytes
  totalSizeFormatted: string;
  byType: Record<MediaType, number>;
  byStatus: Record<Status, number>;
  byFolder: Record<string, number>; // folder name -> count
  recentUploads: number; // last 7 days
  mostUsedTags: Array<{
    tag: string;
    count: number;
  }>;
  storageDistribution: {
    images: number;
    videos: number;
    documents: number;
    other: number;
  };
}

/**
 * Media usage details
 */
export interface MediaUsage {
  mediaId: MediaId;
  locations: Array<{
    type: 'page' | 'template' | 'email' | 'social' | 'print';
    name: string;
    url?: string;
    lastUsed: ISO8601String;
  }>;
  totalUsageCount: number;
}

// ============================================================================
// MEDIA PROCESSING
// ============================================================================

/**
 * Media processing job status
 */
export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Media processing job
 */
export interface MediaProcessingJob {
  id: string;
  mediaId: MediaId;
  type: 'thumbnail' | 'resize' | 'convert' | 'ai_analysis' | 'compression';
  status: ProcessingStatus;
  progress: number; // 0-100
  startedAt?: ISO8601String;
  completedAt?: ISO8601String;
  error?: string;
  result?: any;
}

// ============================================================================
// MEDIA SEARCH AND AI
// ============================================================================

/**
 * AI-powered search capabilities
 */
export interface MediaAIAnalysis {
  mediaId: MediaId;
  tags: string[]; // AI-generated tags
  description: string; // AI-generated description
  faces?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  objects?: Array<{
    name: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  colors?: Array<{
    color: HexColor;
    percentage: number;
  }>;
  text?: string; // OCR extracted text
}

/**
 * Visual similarity search
 */
export interface SimilarMedia {
  mediaId: MediaId;
  similarity: number; // 0-1
  thumbnail: string;
  name: string;
}

/**
 * Media search with AI features
 */
export interface MediaSearchQuery extends MediaQuery {
  visualSimilarity?: {
    mediaId: MediaId;
    threshold?: number; // 0-1
  };
  textInImage?: string; // OCR search
  containsFaces?: boolean;
  colorDominance?: HexColor;
}

// ============================================================================
// MEDIA HISTORY AND VERSIONS
// ============================================================================

/**
 * Media version for version control
 */
export interface MediaVersion {
  id: string;
  mediaId: MediaId;
  version: number;
  name: string;
  size: string;
  url: string;
  thumbnail: string;
  created: ISO8601String;
  createdBy: string;
  comment?: string;
  isActive: boolean;
}

/**
 * Media activity log entry
 */
export interface MediaActivity {
  id: string;
  mediaId: MediaId;
  action: 'created' | 'updated' | 'deleted' | 'moved' | 'renamed' | 'tagged' | 'shared';
  details: string;
  timestamp: ISO8601String;
  userId: string;
  userDisplayName: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isVideoMetadata = (metadata: MediaMetadata): metadata is VideoMetadata =>
  'duration_seconds' in metadata && 'format' in metadata && 'codec' in metadata;

export const isDocumentMetadata = (metadata: MediaMetadata): metadata is DocumentMetadata =>
  'pages' in metadata && 'author' in metadata;

export const isImageMetadata = (metadata: MediaMetadata): metadata is ImageMetadata =>
  'format' in metadata && !('duration_seconds' in metadata) && !('pages' in metadata);

export const isAudioMetadata = (metadata: MediaMetadata): metadata is AudioMetadata =>
  'duration_seconds' in metadata && 'sampleRate' in metadata && 'channels' in metadata;