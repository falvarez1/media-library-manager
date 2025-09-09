/**
 * Common types for the Media Library Manager
 * 
 * This file contains base types, utility types, and common interfaces
 * used throughout the application.
 */

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

export type Brand<K, T> = K & { __brand: T };

// ID types to prevent mixing different entity IDs
export type MediaId = Brand<string, 'MediaId'>;
export type FolderId = Brand<string, 'FolderId'>;
export type CollectionId = Brand<string, 'CollectionId'>;
export type UserId = Brand<string, 'UserId'>;
export type TagId = Brand<string, 'TagId'>;
export type TagCategoryId = Brand<string, 'TagCategoryId'>;

// ============================================================================
// TEMPORAL TYPES
// ============================================================================

export type ISO8601String = string;
export type DateString = string; // YYYY-MM-DD format
export type TimeString = string; // HH:mm:ss format

// ============================================================================
// STATUS ENUMS
// ============================================================================

export type Status = 'approved' | 'in_review' | 'rejected' | 'draft' | 'pending';

export type UserRole = 'admin' | 'editor' | 'viewer';

export type Theme = 'light' | 'dark' | 'system';

export type ViewMode = 'grid' | 'list';

export type GridSize = 'small' | 'medium' | 'large';

export type SortField = 
  | 'name' 
  | 'created' 
  | 'modified' 
  | 'size' 
  | 'type' 
  | 'date'
  | 'relevance';

export type SortOrder = 'asc' | 'desc';

export type MediaType = 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'audio' 
  | 'archive' 
  | 'other';

// ============================================================================
// FILE AND MEDIA TYPES
// ============================================================================

export interface FileSize {
  bytes: number;
  formatted: string; // e.g., "2.4 MB", "1.2 GB"
}

export interface Dimensions {
  width: number;
  height: number;
  formatted: string; // e.g., "1920 x 1080"
}

export interface Duration {
  seconds: number;
  formatted: string; // e.g., "2:45", "1:30:25"
}

// ============================================================================
// COLOR TYPES
// ============================================================================

export type HexColor = Brand<string, 'HexColor'>; // #RRGGBB format

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  message: string;
  code: string;
  status: number;
  timestamp: ISO8601String;
  requestId: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: ISO8601String;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// Alias for compatibility - some components expect PaginatedData
export type PaginatedData<T> = PaginatedResponse<T>;

// ============================================================================
// QUERY AND FILTER TYPES
// ============================================================================

export interface BaseQuery {
  page?: number;
  limit?: number;
  sort?: SortField;
  order?: SortOrder;
  search?: string;
}

export interface FilterOptions {
  types?: MediaType[];
  folders?: FolderId[];
  tags?: TagId[];
  status?: Status[];
  dateFrom?: DateString;
  dateTo?: DateString;
  starred?: boolean;
  favorited?: boolean;
  used?: boolean;
}

export interface SearchQuery extends BaseQuery {
  filters?: FilterOptions;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Make all properties optional except specified ones
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Make specified properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Create a type with only the specified fields
export type SelectFields<T, K extends keyof T> = Pick<T, K>;

// Create a type without specified fields
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Non-empty array type
export type NonEmptyArray<T> = [T, ...T[]];

// ============================================================================
// EVENT AND CALLBACK TYPES
// ============================================================================

export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

export interface EventWithTarget<T = Element> {
  target: T;
  currentTarget: T;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  valid: boolean;
  submitting: boolean;
}

// ============================================================================
// COMPONENT PROPS HELPERS
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface LoadingState {
  loading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T | null;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    [key: string]: boolean;
  };
}

// ============================================================================
// AUDIT AND TRACKING
// ============================================================================

export interface AuditFields {
  created: ISO8601String;
  modified: ISO8601String;
  createdBy: UserId;
  modifiedBy: UserId;
}

export interface TimestampFields {
  created: ISO8601String;
  modified: ISO8601String;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export type Permission = 
  | 'read' 
  | 'write' 
  | 'delete' 
  | 'share' 
  | 'admin';

export interface PermissionSet {
  [key: string]: Permission[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isNonEmptyArray = <T>(arr: T[]): arr is NonEmptyArray<T> => 
  Array.isArray(arr) && arr.length > 0;

export const isValidMediaType = (type: string): type is MediaType =>
  ['image', 'video', 'document', 'audio', 'archive', 'other'].includes(type);

export const isValidStatus = (status: string): status is Status =>
  ['approved', 'in_review', 'rejected', 'draft', 'pending'].includes(status);

export const isValidUserRole = (role: string): role is UserRole =>
  ['admin', 'editor', 'viewer'].includes(role);