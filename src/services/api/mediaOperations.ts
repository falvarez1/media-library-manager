/**
 * Media Operations API Service
 * 
 * Provides functionality for media file operations like move, copy, and batch operations
 */

import { apiRequest } from './apiUtils';
import type {
  MediaId,
  FolderId,
  UserId,
  ISO8601String
} from '../../types/common.types';
import type {
  MediaItem,
  BatchOperationRequest
} from '../../types/media.types';
import type {
  ApiResponse
} from '../../types/common.types';

// ============================================================================
// MEDIA OPERATION TYPES
// ============================================================================

/**
 * Move media request
 */
export interface MoveMediaRequest {
  mediaIds: MediaId[];
  targetFolderId: FolderId;
  preserveMetadata?: boolean;
  skipDuplicates?: boolean;
}

/**
 * Copy media request
 */
export interface CopyMediaRequest {
  mediaIds: MediaId[];
  targetFolderId: FolderId;
  preserveMetadata?: boolean;
  copyNames?: { [key: string]: string }; // Optional new names for copied items
  skipDuplicates?: boolean;
}

/**
 * Export media options
 */
export interface ExportMediaOptions {
  format?: 'zip' | 'tar' | 'folder';
  quality?: 'original' | 'high' | 'medium' | 'low';
  includeMetadata?: boolean;
  includeOriginals?: boolean;
  compression?: 'none' | 'fast' | 'best';
  maxSize?: number; // Max file size in MB
  watermark?: {
    enabled: boolean;
    text?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number; // 0-1
  };
}

/**
 * Export media request
 */
export interface ExportMediaRequest {
  mediaIds: MediaId[];
  options: ExportMediaOptions;
  deliveryMethod?: 'download' | 'email' | 'cloud';
  recipientEmail?: string;
}

/**
 * Share media options
 */
export interface ShareMediaOptions {
  recipients: Array<{
    type: 'user' | 'email' | 'public';
    value: string; // UserId for users, email for emails, 'public' for public sharing
  }>;
  permissions: Array<'view' | 'download' | 'comment' | 'share'>;
  expiresAt?: ISO8601String;
  message?: string;
  requirePassword?: boolean;
  password?: string;
  trackViews?: boolean;
  allowComments?: boolean;
  branding?: {
    logo?: string;
    customDomain?: string;
  };
}

/**
 * Share media request
 */
export interface ShareMediaRequest {
  mediaIds: MediaId[];
  shareOptions: ShareMediaOptions;
}

/**
 * Bulk import options
 */
export interface BulkImportOptions {
  source: 'url' | 'cloud' | 'ftp' | 'api';
  sourceConfig: {
    urls?: string[];
    cloudProvider?: 'dropbox' | 'google-drive' | 'onedrive' | 'box';
    cloudPath?: string;
    ftpHost?: string;
    ftpPath?: string;
    credentials?: Record<string, string>;
  };
  targetFolderId: FolderId;
  filters?: {
    fileTypes?: string[];
    maxSize?: number; // MB
    minSize?: number; // MB
    dateFrom?: ISO8601String;
    dateTo?: ISO8601String;
    namePattern?: string; // regex pattern
  };
  options: {
    overwriteExisting?: boolean;
    preserveStructure?: boolean;
    generateThumbnails?: boolean;
    extractMetadata?: boolean;
    runAiAnalysis?: boolean;
    skipDuplicates?: boolean;
  };
  notifications?: {
    onComplete?: boolean;
    onError?: boolean;
    email?: string;
  };
}

/**
 * Operation result
 */
export interface OperationResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  skipped?: number;
  errors?: Array<{
    mediaId: MediaId;
    error: string;
    code?: string;
  }>;
  warnings?: string[];
  jobId?: string; // For async operations
}

/**
 * Share result
 */
export interface ShareResult {
  success: boolean;
  shareId: string;
  shareUrl: string;
  expiresAt?: ISO8601String;
  accessCount: number;
  sharedWith: Array<{
    type: 'user' | 'email' | 'public';
    value: string;
    notified: boolean;
  }>;
}

/**
 * Export result
 */
export interface ExportResult {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: ISO8601String;
  jobId?: string; // For large exports processed in background
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  imported: number;
  failed: number;
  total: number;
  errors?: Array<{
    source: string;
    error: string;
  }>;
}

/**
 * Job status for async operations
 */
export interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startedAt: ISO8601String;
  completedAt?: ISO8601String;
  result?: OperationResult | ExportResult | ImportResult;
  error?: string;
  estimatedCompletion?: ISO8601String;
}

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

/**
 * Move media items to a different folder
 * @param request - Move media request
 * @returns Promise resolving to operation result
 */
export const moveMedia = async (request: MoveMediaRequest): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/move', 'POST', request);
};

/**
 * Copy media items to a different folder
 * @param request - Copy media request
 * @returns Promise resolving to operation result
 */
export const copyMedia = async (request: CopyMediaRequest): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/copy', 'POST', request);
};

/**
 * Export media items
 * @param request - Export media request
 * @returns Promise resolving to export result
 */
export const exportMedia = async (request: ExportMediaRequest): Promise<ApiResponse<ExportResult>> => {
  return apiRequest<ApiResponse<ExportResult>>('/media/export', 'POST', request);
};

/**
 * Share media items
 * @param request - Share media request
 * @returns Promise resolving to share result
 */
export const shareMedia = async (request: ShareMediaRequest): Promise<ApiResponse<ShareResult>> => {
  return apiRequest<ApiResponse<ShareResult>>('/media/share', 'POST', request);
};

/**
 * Import media items in bulk
 * @param options - Import options
 * @returns Promise resolving to import result
 */
export const bulkImport = async (options: BulkImportOptions): Promise<ApiResponse<ImportResult>> => {
  return apiRequest<ApiResponse<ImportResult>>('/media/import', 'POST', options);
};

/**
 * Get job status for async operations
 * @param jobId - Job ID
 * @returns Promise resolving to job status
 */
export const getJobStatus = async (jobId: string): Promise<ApiResponse<JobStatus>> => {
  return apiRequest<ApiResponse<JobStatus>>(`/jobs/${jobId}`);
};

/**
 * Cancel a running job
 * @param jobId - Job ID
 * @returns Promise resolving to cancellation result
 */
export const cancelJob = async (jobId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/jobs/${jobId}/cancel`, 'POST');
};

/**
 * Duplicate media items within the same folder
 * @param mediaIds - Media IDs to duplicate
 * @param options - Duplication options
 * @returns Promise resolving to operation result
 */
export const duplicateMedia = async (
  mediaIds: MediaId[],
  options: {
    namePrefix?: string;
    nameSuffix?: string;
    preserveMetadata?: boolean;
  } = {}
): Promise<ApiResponse<OperationResult & { newItems: MediaItem[] }>> => {
  return apiRequest<ApiResponse<OperationResult & { newItems: MediaItem[] }>>(
    '/media/duplicate',
    'POST',
    { mediaIds, options }
  );
};

/**
 * Rename media items
 * @param renames - Array of rename operations
 * @returns Promise resolving to operation result
 */
export const renameMedia = async (
  renames: Array<{ mediaId: MediaId; newName: string }>
): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/rename', 'POST', { renames });
};

/**
 * Convert media items to different formats
 * @param conversions - Array of conversion operations
 * @returns Promise resolving to conversion result
 */
export const convertMedia = async (
  conversions: Array<{
    mediaId: MediaId;
    targetFormat: string;
    quality?: 'low' | 'medium' | 'high' | 'lossless';
    options?: Record<string, any>;
  }>
): Promise<ApiResponse<ImportResult>> => {
  return apiRequest<ApiResponse<ImportResult>>('/media/convert', 'POST', { conversions });
};

/**
 * Compress media items
 * @param compressions - Array of compression operations
 * @returns Promise resolving to compression result
 */
export const compressMedia = async (
  compressions: Array<{
    mediaId: MediaId;
    quality?: number; // 0-100
    maxSize?: number; // MB
    preserveMetadata?: boolean;
  }>
): Promise<ApiResponse<ImportResult>> => {
  return apiRequest<ApiResponse<ImportResult>>('/media/compress', 'POST', { compressions });
};

/**
 * Generate thumbnails for media items
 * @param mediaIds - Media IDs to generate thumbnails for
 * @param options - Thumbnail options
 * @returns Promise resolving to operation result
 */
export const generateThumbnails = async (
  mediaIds: MediaId[],
  options: {
    sizes?: Array<'small' | 'medium' | 'large'>;
    quality?: number; // 0-100
    format?: 'jpg' | 'png' | 'webp';
    overwrite?: boolean;
  } = {}
): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/thumbnails', 'POST', { mediaIds, options });
};

/**
 * Extract metadata from media items
 * @param mediaIds - Media IDs to extract metadata from
 * @param options - Extraction options
 * @returns Promise resolving to operation result
 */
export const extractMetadata = async (
  mediaIds: MediaId[],
  options: {
    overwrite?: boolean;
    includeExif?: boolean;
    includeAI?: boolean;
  } = {}
): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/metadata/extract', 'POST', { mediaIds, options });
};

/**
 * Validate media files
 * @param mediaIds - Media IDs to validate
 * @returns Promise resolving to validation result
 */
export const validateMedia = async (
  mediaIds: MediaId[]
): Promise<ApiResponse<{
  valid: MediaId[];
  invalid: Array<{ mediaId: MediaId; reason: string }>;
  corrupted: Array<{ mediaId: MediaId; error: string }>;
}>> => {
  return apiRequest<ApiResponse<{
    valid: MediaId[];
    invalid: Array<{ mediaId: MediaId; reason: string }>;
    corrupted: Array<{ mediaId: MediaId; error: string }>;
  }>>('/media/validate', 'POST', { mediaIds });
};

/**
 * Restore media items from trash
 * @param mediaIds - Media IDs to restore
 * @returns Promise resolving to operation result
 */
export const restoreMedia = async (mediaIds: MediaId[]): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/restore', 'POST', { mediaIds });
};

/**
 * Permanently delete media items
 * @param mediaIds - Media IDs to permanently delete
 * @returns Promise resolving to operation result
 */
export const permanentlyDeleteMedia = async (mediaIds: MediaId[]): Promise<ApiResponse<OperationResult>> => {
  return apiRequest<ApiResponse<OperationResult>>('/media/delete-permanent', 'POST', { mediaIds });
};

// Export all media operations
const mediaOperations = {
  moveMedia,
  copyMedia,
  exportMedia,
  shareMedia,
  bulkImport,
  getJobStatus,
  cancelJob,
  duplicateMedia,
  renameMedia,
  convertMedia,
  compressMedia,
  generateThumbnails,
  extractMetadata,
  validateMedia,
  restoreMedia,
  permanentlyDeleteMedia
};

export default mediaOperations;