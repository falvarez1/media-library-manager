/**
 * Component Props types for the Media Library Manager
 * 
 * This file contains all types related to React component props,
 * including common component interfaces and event handlers.
 */

import { ReactNode, MouseEvent, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import {
  MediaId,
  FolderId,
  CollectionId,
  UserId,
  ViewMode,
  GridSize,
  SortField,
  SortOrder,
  Theme,
  BaseComponentProps,
  LoadingState,
  AsyncState,
  EventHandler,
  AsyncEventHandler
} from './common.types';

import { MediaItem, MediaQuery, MediaFilterOptions } from './media.types';
import { Folder, FolderTree, FolderNavigation } from './folder.types';
import { Collection, CollectionTree } from './collection.types';
import { User, UserPreferences } from './auth.types';

// ============================================================================
// COMMON COMPONENT PROPS
// ============================================================================

/**
 * Standard button props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: EventHandler<MouseEvent<HTMLButtonElement>>;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Standard input props
 */
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  helperText?: string;
  onChange?: EventHandler<ChangeEvent<HTMLInputElement>>;
  onBlur?: EventHandler<ChangeEvent<HTMLInputElement>>;
  onFocus?: EventHandler<ChangeEvent<HTMLInputElement>>;
  onKeyDown?: EventHandler<KeyboardEvent<HTMLInputElement>>;
}

/**
 * Standard modal props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  closeButton?: boolean;
  footer?: ReactNode;
}

/**
 * Standard dropdown/select props
 */
export interface SelectProps<T = string> extends BaseComponentProps {
  value?: T;
  defaultValue?: T;
  options: Array<{
    label: string;
    value: T;
    disabled?: boolean;
    icon?: ReactNode;
  }>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (value: T | T[]) => void;
}

// ============================================================================
// MEDIA COMPONENT PROPS
// ============================================================================

/**
 * Media grid/list view props
 */
export interface MediaViewProps extends BaseComponentProps {
  media: MediaItem[];
  viewMode: ViewMode;
  gridSize: GridSize;
  loading?: boolean;
  error?: string;
  selectedItems?: MediaId[];
  onSelectItem?: (id: MediaId) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onItemClick?: (item: MediaItem) => void;
  onItemDoubleClick?: (item: MediaItem) => void;
  onContextMenu?: (item: MediaItem, event: MouseEvent) => void;
  showDetails?: boolean;
  showCheckboxes?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField, order: SortOrder) => void;
}

/**
 * Media item card props
 */
export interface MediaItemProps extends BaseComponentProps {
  item: MediaItem;
  selected?: boolean;
  viewMode: ViewMode;
  gridSize: GridSize;
  showCheckbox?: boolean;
  showDetails?: boolean;
  onSelect?: (id: MediaId) => void;
  onClick?: (item: MediaItem) => void;
  onDoubleClick?: (item: MediaItem) => void;
  onContextMenu?: (item: MediaItem, event: MouseEvent) => void;
  onStar?: (id: MediaId) => void;
  onFavorite?: (id: MediaId) => void;
}

/**
 * Media upload props
 */
export interface MediaUploadProps extends BaseComponentProps {
  folderId: FolderId;
  multiple?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number; // bytes
  maxFiles?: number;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadSuccess?: (media: MediaItem[]) => void;
  onUploadError?: (error: string) => void;
  onUploadComplete?: () => void;
  dragAndDrop?: boolean;
  showProgress?: boolean;
  autoUpload?: boolean;
}

/**
 * Media detail sidebar props
 */
export interface MediaDetailProps extends BaseComponentProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: MediaId, updates: Partial<MediaItem>) => void;
  onDelete?: (id: MediaId) => void;
  onStar?: (id: MediaId) => void;
  onFavorite?: (id: MediaId) => void;
  onShare?: (id: MediaId) => void;
  onDownload?: (id: MediaId) => void;
  showUsageInfo?: boolean;
  showMetadata?: boolean;
  allowEdit?: boolean;
}

/**
 * Media filter bar props
 */
export interface MediaFilterProps extends BaseComponentProps {
  filters: MediaFilterOptions;
  folders: Folder[];
  onFilterChange: (filters: MediaFilterOptions) => void;
  onClearFilters: () => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  totalCount?: number;
  filteredCount?: number;
}

// ============================================================================
// FOLDER COMPONENT PROPS
// ============================================================================

/**
 * Folder tree props
 */
export interface FolderTreeProps extends BaseComponentProps {
  folders: FolderTree[];
  selectedFolder?: FolderId;
  expandedFolders?: FolderId[];
  onFolderSelect?: (id: FolderId) => void;
  onFolderExpand?: (id: FolderId) => void;
  onFolderCollapse?: (id: FolderId) => void;
  onFolderCreate?: (parentId: FolderId | null) => void;
  onFolderRename?: (id: FolderId, newName: string) => void;
  onFolderMove?: (id: FolderId, newParentId: FolderId | null) => void;
  onFolderDelete?: (id: FolderId) => void;
  onContextMenu?: (folder: Folder, event: MouseEvent) => void;
  showMediaCount?: boolean;
  allowDragDrop?: boolean;
  allowEdit?: boolean;
}

/**
 * Folder breadcrumb props
 */
export interface FolderBreadcrumbProps extends BaseComponentProps {
  navigation: FolderNavigation;
  onNavigate: (folderId: FolderId | null) => void;
  showHome?: boolean;
  maxItems?: number;
}

/**
 * Folder creation modal props
 */
export interface FolderModalProps extends ModalProps {
  parentFolder?: Folder | null;
  initialValues?: Partial<Folder>;
  onSubmit: (folder: Partial<Folder>) => void;
  submitButtonText?: string;
  folders?: Folder[]; // For parent selection
}

// ============================================================================
// COLLECTION COMPONENT PROPS
// ============================================================================

/**
 * Collection grid props
 */
export interface CollectionGridProps extends BaseComponentProps {
  collections: Collection[];
  loading?: boolean;
  error?: string;
  selectedCollection?: CollectionId;
  onCollectionSelect?: (id: CollectionId) => void;
  onCollectionCreate?: () => void;
  onCollectionEdit?: (id: CollectionId) => void;
  onCollectionDelete?: (id: CollectionId) => void;
  onCollectionShare?: (id: CollectionId) => void;
  viewMode?: ViewMode;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField, order: SortOrder) => void;
}

/**
 * Collection modal props
 */
export interface CollectionModalProps extends ModalProps {
  initialValues?: Partial<Collection>;
  collections?: Collection[]; // For parent selection
  onSubmit: (collection: Partial<Collection>) => void;
  submitButtonText?: string;
}

/**
 * Collection item list props
 */
export interface CollectionItemsProps extends BaseComponentProps {
  collection: Collection;
  items: MediaItem[];
  loading?: boolean;
  onItemRemove?: (mediaId: MediaId) => void;
  onItemReorder?: (fromIndex: number, toIndex: number) => void;
  allowEdit?: boolean;
  allowReorder?: boolean;
  viewMode?: ViewMode;
  gridSize?: GridSize;
}

// ============================================================================
// NAVIGATION COMPONENT PROPS
// ============================================================================

/**
 * Header/navbar props
 */
export interface HeaderProps extends BaseComponentProps {
  user: User;
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  onNotificationClick?: (id: string) => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

/**
 * Sidebar navigation props
 */
export interface SidebarProps extends BaseComponentProps {
  currentView: 'media' | 'collections' | 'folders' | 'analytics';
  onViewChange: (view: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  folders: Folder[];
  collections: Collection[];
  onFolderSelect?: (id: FolderId) => void;
  onCollectionSelect?: (id: CollectionId) => void;
  selectedFolderId?: FolderId;
  selectedCollectionId?: CollectionId;
}

/**
 * Toolbar props
 */
export interface ToolbarProps extends BaseComponentProps {
  selectedItems: MediaId[];
  onBulkAction: (action: string, items: MediaId[]) => void;
  onUpload?: () => void;
  onCreateFolder?: () => void;
  onCreateCollection?: () => void;
  viewMode: ViewMode;
  gridSize: GridSize;
  onViewModeChange: (mode: ViewMode) => void;
  onGridSizeChange: (size: GridSize) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  showBulkActions?: boolean;
  showViewControls?: boolean;
  showSortControls?: boolean;
}

// ============================================================================
// FORM COMPONENT PROPS
// ============================================================================

/**
 * Search input props
 */
export interface SearchInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  showSuggestions?: boolean;
  debounceMs?: number;
}

/**
 * Tag input props
 */
export interface TagInputProps extends BaseComponentProps {
  tags: string[];
  availableTags?: string[];
  onChange: (tags: string[]) => void;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  placeholder?: string;
  allowCustomTags?: boolean;
  maxTags?: number;
  readonly?: boolean;
}

/**
 * Color picker props
 */
export interface ColorPickerProps extends BaseComponentProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[]; // Predefined colors
  allowCustom?: boolean;
  showInput?: boolean;
  disabled?: boolean;
}

// ============================================================================
// DATA DISPLAY COMPONENT PROPS
// ============================================================================

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  compact?: boolean;
}

/**
 * Loading spinner props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

/**
 * Empty state props
 */
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  image?: string;
}

/**
 * Stats card props
 */
export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: boolean;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

// ============================================================================
// CONTEXT PROPS
// ============================================================================

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  onAuthStateChange?: (user: User | null) => void;
}

/**
 * Media provider props
 */
export interface MediaProviderProps {
  children: ReactNode;
  initialData?: {
    media?: MediaItem[];
    folders?: Folder[];
    collections?: Collection[];
  };
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Media hook return type
 */
export interface UseMediaReturn extends AsyncState<MediaItem[]> {
  query: MediaQuery;
  setQuery: (query: MediaQuery) => void;
  selectedItems: MediaId[];
  selectItem: (id: MediaId) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelection: (id: MediaId) => void;
  refresh: () => void;
  uploadMedia: (files: File[], folderId: FolderId) => Promise<void>;
  deleteMedia: (ids: MediaId[]) => Promise<void>;
  updateMedia: (id: MediaId, updates: Partial<MediaItem>) => Promise<void>;
}

/**
 * Folder hook return type
 */
export interface UseFoldersReturn extends AsyncState<Folder[]> {
  navigation: FolderNavigation;
  navigateToFolder: (id: FolderId | null) => void;
  createFolder: (folder: Partial<Folder>) => Promise<void>;
  updateFolder: (id: FolderId, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: FolderId) => Promise<void>;
  refresh: () => void;
}

/**
 * Collection hook return type
 */
export interface UseCollectionsReturn extends AsyncState<Collection[]> {
  selectedCollection: CollectionId | null;
  selectCollection: (id: CollectionId | null) => void;
  createCollection: (collection: Partial<Collection>) => Promise<void>;
  updateCollection: (id: CollectionId, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: CollectionId) => Promise<void>;
  addItemsToCollection: (collectionId: CollectionId, mediaIds: MediaId[]) => Promise<void>;
  removeItemsFromCollection: (collectionId: CollectionId, mediaIds: MediaId[]) => Promise<void>;
  refresh: () => void;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

/**
 * Media event handlers
 */
export interface MediaEventHandlers {
  onItemSelect?: (id: MediaId) => void;
  onItemClick?: (item: MediaItem) => void;
  onItemDoubleClick?: (item: MediaItem) => void;
  onItemContextMenu?: (item: MediaItem, event: MouseEvent) => void;
  onBulkAction?: (action: string, items: MediaId[]) => void;
  onUpload?: (files: File[]) => void;
  onDelete?: (ids: MediaId[]) => void;
  onShare?: (ids: MediaId[]) => void;
  onMove?: (ids: MediaId[], folderId: FolderId) => void;
}

/**
 * Folder event handlers
 */
export interface FolderEventHandlers {
  onFolderSelect?: (id: FolderId) => void;
  onFolderCreate?: (parentId: FolderId | null) => void;
  onFolderRename?: (id: FolderId, name: string) => void;
  onFolderMove?: (id: FolderId, parentId: FolderId | null) => void;
  onFolderDelete?: (id: FolderId) => void;
  onFolderShare?: (id: FolderId) => void;
}

/**
 * Collection event handlers
 */
export interface CollectionEventHandlers {
  onCollectionSelect?: (id: CollectionId) => void;
  onCollectionCreate?: () => void;
  onCollectionEdit?: (id: CollectionId) => void;
  onCollectionDelete?: (id: CollectionId) => void;
  onCollectionShare?: (id: CollectionId) => void;
  onItemAdd?: (collectionId: CollectionId, mediaIds: MediaId[]) => void;
  onItemRemove?: (collectionId: CollectionId, mediaIds: MediaId[]) => void;
}

// ============================================================================
// FORM PROP TYPES
// ============================================================================

/**
 * Generic form props
 */
export interface FormProps<T = any> extends BaseComponentProps {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Field props for form fields
 */
export interface FieldProps<T = any> {
  name: string;
  label?: string;
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

// ============================================================================
// UTILITY PROPS
// ============================================================================

/**
 * Conditional props based on boolean
 */
export type ConditionalProps<T, K> = K extends true ? T : {};

/**
 * Props with required fields
 */
export type PropsWithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Props with optional fields
 */
export type PropsWithOptional<T, K extends keyof T> = T & Partial<Pick<T, K>>;