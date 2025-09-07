/**
 * Central Type Export for Media Library Manager
 * 
 * This file serves as the main entry point for all TypeScript types
 * used throughout the application. Import types from this file to
 * maintain consistency and ease of use.
 * 
 * Usage:
 * import { MediaItem, User, CollectionProps } from '@/types';
 */

// ============================================================================
// COMMON TYPES
// ============================================================================
export type {
  // Branded types for type safety
  Brand,
  MediaId,
  FolderId,
  CollectionId,
  UserId,
  TagId,
  TagCategoryId,

  // Temporal types
  ISO8601String,
  DateString,
  TimeString,

  // Status and enum types
  Status,
  UserRole,
  Theme,
  ViewMode,
  GridSize,
  SortField,
  SortOrder,
  MediaType,

  // File and media types
  FileSize,
  Dimensions,
  Duration,
  HexColor,

  // API response types
  ApiError,
  PaginationMeta,
  ApiResponse,
  PaginatedResponse,

  // Query and filter types
  BaseQuery,
  FilterOptions,
  SearchQuery,

  // Utility types
  PartialExcept,
  RequireFields,
  SelectFields,
  OmitFields,
  DeepPartial,
  NonEmptyArray,

  // Event and callback types
  EventHandler,
  AsyncEventHandler,
  EventWithTarget,

  // Form types
  FormField,
  FormErrors,
  FormState,

  // Component props helpers
  BaseComponentProps,
  LoadingState,
  AsyncState,

  // Configuration types
  AppConfig,

  // Audit and tracking
  AuditFields,
  TimestampFields,

  // Permission types
  Permission,
  PermissionSet
} from './common.types';

// Type guards from common types
export {
  isNonEmptyArray,
  isValidMediaType,
  isValidStatus,
  isValidUserRole
} from './common.types';

// ============================================================================
// MEDIA TYPES
// ============================================================================
export type {
  // Metadata types
  MediaAttribution,
  VideoMetadata,
  DocumentMetadata,
  ImageMetadata,
  AudioMetadata,
  MediaMetadata,

  // Main media interfaces
  MediaItem,
  MediaItemSummary,
  MediaItemDetail,
  CreateMediaItem,
  UpdateMediaItem,

  // Media operations
  BatchOperation,
  BatchOperationRequest,
  MediaUploadProgress,
  MediaUploadResult,

  // Media queries and filters
  MediaQuery,
  MediaFilterOptions,

  // Media statistics
  MediaStats,
  MediaUsage,

  // Media processing
  ProcessingStatus,
  MediaProcessingJob,

  // AI and search
  MediaAIAnalysis,
  SimilarMedia,
  MediaSearchQuery,

  // History and versions
  MediaVersion,
  MediaActivity
} from './media.types';

// Type guards from media types
export {
  isVideoMetadata,
  isDocumentMetadata,
  isImageMetadata,
  isAudioMetadata
} from './media.types';

// ============================================================================
// FOLDER TYPES
// ============================================================================
export type {
  // Main folder interfaces
  Folder,
  FolderPermissions,
  FolderMetadata,
  FolderSummary,
  FolderTree,
  CreateFolder,
  UpdateFolder,

  // Folder navigation
  BreadcrumbItem,
  FolderNavigation,
  RecentFolder,

  // Folder operations
  MoveFolderRequest,
  CopyFolderRequest,
  BulkFolderOperation,

  // Folder queries
  FolderQuery,
  FolderTreeQuery,

  // Folder statistics
  FolderStats,
  FolderUsage,

  // Sharing and collaboration
  ShareFolderRequest,
  FolderShare,
  FolderActivity,

  // Templates and presets
  FolderTemplate,
  SmartFolder,
  SmartFolderRule,

  // Import/export
  FolderExportOptions,
  FolderImportOptions
} from './folder.types';

// Utilities and constants from folder types
export {
  isRootFolder,
  isChildOfFolder,
  getFolderDepth,
  hasPermission,
  FOLDER_COLORS,
  DEFAULT_FOLDER_COLOR
} from './folder.types';

// ============================================================================
// COLLECTION TYPES
// ============================================================================
export type {
  // Main collection interfaces
  Collection,
  CollectionPermissions,
  CollectionMetadata,
  CollectionSummary,
  CollectionTree,
  CollectionWithItems,
  CreateCollection,
  UpdateCollection,

  // Collection operations
  AddItemsToCollectionRequest,
  RemoveItemsFromCollectionRequest,
  ReorderCollectionItemsRequest,
  BulkCollectionOperation,
  MergeCollectionsRequest,

  // Collection queries
  CollectionQuery,
  CollectionTreeQuery,

  // Collection statistics
  CollectionStats,
  CollectionUsage,

  // Sharing and collaboration
  ShareCollectionRequest,
  CollectionShare,
  CollectionInvitation,
  CollectionActivity,

  // Templates and smart collections
  CollectionTemplate,
  CollectionTemplateItem,
  SmartCollection,
  SmartCollectionRule,

  // Import/export
  CollectionExportOptions,
  CollectionImportOptions,

  // Presentation
  CollectionPresentation,
  CollectionSlide,
  PresentationSettings
} from './collection.types';

// Utilities and constants from collection types
export {
  isRootCollection,
  isChildOfCollection,
  hasCollectionPermission,
  isCollectionSharedWith,
  getCollectionDepth,
  COLLECTION_COLORS,
  DEFAULT_COLLECTION_COLOR,
  MAX_COLLECTION_ITEMS,
  MAX_COLLECTION_DEPTH,
  MAX_COLLECTION_NAME_LENGTH
} from './collection.types';

// ============================================================================
// AUTH & USER TYPES
// ============================================================================
export type {
  // Main user interfaces
  User,
  UserPreferences,
  UserProfile,
  UserSettings,
  UserStatus,
  UserPermissions,

  // Notification types
  NotificationPreferences,
  EmailNotificationSettings,
  PushNotificationSettings,
  InAppNotificationSettings,
  DigestSettings,

  // Privacy and accessibility
  PrivacySettings,
  AccessibilitySettings,

  // Authentication types
  AuthCredentials,
  AuthResponse,
  JWTPayload,
  UserSession,
  DeviceInfo,

  // User variants
  UserSummary,
  PublicUserProfile,
  CreateUser,
  UpdateUser,

  // Password and security
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmation,
  TwoFactorSetup,
  TwoFactorVerification,
  SecurityAuditLog,
  SecurityAction,

  // User queries and management
  UserQuery,
  UserInvitation,
  UserActivity,

  // Organization types
  Organization,
  OrganizationSettings,
  SSOConfig,
  ExternalStorageConfig,
  AnalyticsConfig,
  SubscriptionPlan
} from './auth.types';

// Utilities and constants from auth types
export {
  hasRole,
  isAdmin,
  canEdit,
  isActiveUser,
  hasUserPermission,
  getUserDisplayName,
  isValidSession,
  USER_ROLES,
  USER_STATUSES,
  THEMES,
  VIEW_MODES,
  GRID_SIZES,
  DEFAULT_USER_PREFERENCES,
  SESSION_DURATION,
  REFRESH_TOKEN_DURATION
} from './auth.types';

// ============================================================================
// API TYPES
// ============================================================================
export type {
  // Base API types
  ApiConfig,
  RequestOptions,
  ApiEndpoint,

  // API request types
  MediaApiRequests,
  FolderApiRequests,
  CollectionApiRequests,
  AuthApiRequests,
  UserApiRequests,
  SearchApiRequests,
  AnalyticsApiRequests,

  // Upload types
  MediaUploadOptions,

  // Error handling
  ApiErrorCode,
  ExtendedApiError,
  ValidationError,
  ApiErrorResponse,

  // Webhook types
  WebhookEvent,
  WebhookPayload,

  // Batch operations
  BatchOperationRequest as ApiBatchOperationRequest,
  BatchOperationResponse,
  BatchOperationStatus,

  // Rate limiting
  RateLimitInfo,
  RateLimitHeaders,

  // Caching
  CacheConfig,
  CacheEntry,

  // Type utilities
  ApiRequestType,
  ApiResponseType,
  ApiClient,

  // Complete API client
  MediaLibraryApiClient,
  ApiServiceConfig
} from './api.types';

// Constants from API types
export {
  DEFAULT_API_CONFIG,
  HTTP_STATUS_CODES,
  RETRYABLE_STATUS_CODES
} from './api.types';

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================
export type {
  // Common component props
  ButtonProps,
  InputProps,
  ModalProps,
  SelectProps,

  // Media component props
  MediaViewProps,
  MediaItemProps,
  MediaUploadProps,
  MediaDetailProps,
  MediaFilterProps,

  // Folder component props
  FolderTreeProps,
  FolderBreadcrumbProps,
  FolderModalProps,

  // Collection component props
  CollectionGridProps,
  CollectionModalProps,
  CollectionItemsProps,

  // Navigation component props
  HeaderProps,
  SidebarProps,
  ToolbarProps,

  // Form component props
  SearchInputProps,
  TagInputProps,
  ColorPickerProps,

  // Data display component props
  PaginationProps,
  LoadingProps,
  EmptyStateProps,
  StatsCardProps,

  // Context props
  ThemeProviderProps,
  AuthProviderProps,
  MediaProviderProps,

  // Hook return types
  UseMediaReturn,
  UseFoldersReturn,
  UseCollectionsReturn,

  // Event handler types
  MediaEventHandlers,
  FolderEventHandlers,
  CollectionEventHandlers,

  // Form prop types
  FormProps,
  FieldProps,

  // Utility props
  ConditionalProps,
  PropsWithRequired,
  PropsWithOptional
} from './props.types';

// ============================================================================
// RE-EXPORTED REACT TYPES
// ============================================================================
export type {
  ReactNode,
  MouseEvent,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  FocusEvent
} from 'react';

// ============================================================================
// TYPE UTILITIES AND HELPERS (placed after all type exports)
// ============================================================================

// These utility types will be defined after all the type exports above

// ============================================================================
// MODULE AUGMENTATION (if needed)
// ============================================================================

// Global type augmentations can be added here if needed

// ============================================================================
// TYPE UTILITIES
// ============================================================================

// ============================================================================
// UTILITY FUNCTIONS (working with string-based IDs)
// ============================================================================

/**
 * Utility functions for validation and type checking
 */
export const TypeUtils = {
  /**
   * Type checking utilities
   */
  isValidId: (id: string) => typeof id === 'string' && id.length > 0,
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};