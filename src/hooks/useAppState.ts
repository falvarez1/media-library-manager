/**
 * App State Management Hook
 * Centralized state management for the main application
 */

import { useState, useCallback, useEffect } from 'react';
import storage from '../utils/storage';
import type {
  MediaId,
  FolderId,
  CollectionId,
  MediaFilterOptions,
  ViewMode,
  SortField,
  SortOrder,
  MediaType
} from '../types';

export interface UserPreferences {
  defaultView: ViewMode;
  thumbnailSize: 'small' | 'medium' | 'large';
  theme: 'light' | 'dark' | 'system';
  confirmDeletion: boolean;
  defaultSortBy: SortField;
  defaultSortOrder: SortOrder;
  showTags: boolean;
  showMetadata: boolean;
  previewOnHover: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  timestamp: string;
  params: {
    query: string;
    types: MediaType[];
    tags: string[];
    dateStart: string;
    dateEnd: string;
    sizeMin: string;
    sizeMax: string;
  };
}

interface AppState {
  // View state
  currentView: 'folder' | 'collection' | 'search';
  currentFolder: string;
  currentCollection: CollectionId | null;
  
  // Selection state
  selectedMedia: MediaId[];
  mediaSelectionMode: boolean;
  
  // Search and filter state
  searchTerm: string;
  showFilters: boolean;
  filterActive: boolean;
  selectedTags: string[];
  filters: MediaFilterOptions;
  savedSearches: SavedSearch[];
  
  // UI visibility state
  showQuickView: boolean;
  quickViewItem: MediaId | null;
  showImageEditor: boolean;
  showUserMenu: boolean;
  showNewFolderModal: boolean;
  showNewCollectionModal: boolean;
  showAdvancedSearch: boolean;
  showKeyboardShortcuts: boolean;
  showUserPreferences: boolean;
  showUploadModal: boolean;
  showNotifications: boolean;
  showNotificationDemo: boolean;
  showDetailsLocal: boolean;
  
  // Sorting state
  sortBy: SortField;
  sortOrder: SortOrder;
  
  // User preferences
  userPreferences: UserPreferences;
}

const defaultFilters: MediaFilterOptions = {
  types: [],
  tags: [],
  dateRange: { start: null, end: null },
  sizeRange: { min: 0, max: null },
  hasDescription: false,
  isStarred: false,
  isFavorited: false
};

const defaultUserPreferences: UserPreferences = {
  defaultView: 'grid',
  thumbnailSize: 'medium',
  theme: 'system',
  confirmDeletion: true,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  showTags: true,
  showMetadata: true,
  previewOnHover: false
};

export const useAppState = () => {
  // View state
  const [currentView, setCurrentView] = useState<'folder' | 'collection' | 'search'>('folder');
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [currentCollection, setCurrentCollection] = useState<CollectionId | null>(null);
  
  // Selection state
  const [selectedMedia, setSelectedMedia] = useState<MediaId[]>([]);
  const [mediaSelectionMode, setMediaSelectionMode] = useState<boolean>(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<MediaFilterOptions>(defaultFilters);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  
  // UI visibility state
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [quickViewItem, setQuickViewItem] = useState<MediaId | null>(null);
  const [showImageEditor, setShowImageEditor] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState<boolean>(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [showUserPreferences, setShowUserPreferences] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showNotificationDemo, setShowNotificationDemo] = useState<boolean>(false);
  const [showDetailsLocal, setShowDetailsLocal] = useState<boolean>(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultUserPreferences);

  // Load saved searches from storage
  useEffect(() => {
    const saved = storage.get<SavedSearch[]>('savedSearches', []);
    setSavedSearches(saved);
  }, []);

  // Load user preferences from storage
  useEffect(() => {
    const saved = storage.get<UserPreferences>('userPreferences', defaultUserPreferences);
    setUserPreferences(saved);
    setSortBy(saved.defaultSortBy);
    setSortOrder(saved.defaultSortOrder);
  }, []);

  // Save user preferences to storage
  const updateUserPreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...newPrefs };
    setUserPreferences(updated);
    storage.set('userPreferences', updated);
  }, [userPreferences]);

  // Handle media selection
  const handleMediaSelect = useCallback((mediaId: MediaId, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedMedia(prev => 
        prev.includes(mediaId) 
          ? prev.filter(id => id !== mediaId)
          : [...prev, mediaId]
      );
    } else {
      setSelectedMedia([mediaId]);
    }
  }, []);

  const clearMediaSelection = useCallback(() => {
    setSelectedMedia([]);
    setMediaSelectionMode(false);
  }, []);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term) {
      setCurrentView('search');
    }
  }, []);

  // Handle saved searches
  const saveSearch = useCallback((search: SavedSearch) => {
    const updated = [...savedSearches, search];
    setSavedSearches(updated);
    storage.set('savedSearches', updated);
  }, [savedSearches]);

  const deleteSavedSearch = useCallback((id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    storage.set('savedSearches', updated);
  }, [savedSearches]);

  // Handle filters
  const updateFilters = useCallback((newFilters: Partial<MediaFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setFilterActive(Object.values(newFilters).some(v => 
      Array.isArray(v) ? v.length > 0 : v !== null && v !== false
    ));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setFilterActive(false);
    setSelectedTags([]);
  }, []);

  // Handle quick view
  const openQuickView = useCallback((mediaId: MediaId) => {
    setQuickViewItem(mediaId);
    setShowQuickView(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setShowQuickView(false);
    setQuickViewItem(null);
  }, []);

  // Handle modals
  const toggleModal = useCallback((modalName: keyof AppState) => {
    switch (modalName) {
      case 'showNewFolderModal':
        setShowNewFolderModal(prev => !prev);
        break;
      case 'showNewCollectionModal':
        setShowNewCollectionModal(prev => !prev);
        break;
      case 'showAdvancedSearch':
        setShowAdvancedSearch(prev => !prev);
        break;
      case 'showKeyboardShortcuts':
        setShowKeyboardShortcuts(prev => !prev);
        break;
      case 'showUserPreferences':
        setShowUserPreferences(prev => !prev);
        break;
      case 'showUploadModal':
        setShowUploadModal(prev => !prev);
        break;
      case 'showNotifications':
        setShowNotifications(prev => !prev);
        break;
      case 'showImageEditor':
        setShowImageEditor(prev => !prev);
        break;
      case 'showUserMenu':
        setShowUserMenu(prev => !prev);
        break;
    }
  }, []);

  return {
    // State
    currentView,
    currentFolder,
    currentCollection,
    selectedMedia,
    mediaSelectionMode,
    searchTerm,
    showFilters,
    filterActive,
    selectedTags,
    filters,
    savedSearches,
    showQuickView,
    quickViewItem,
    showImageEditor,
    showUserMenu,
    showNewFolderModal,
    showNewCollectionModal,
    showAdvancedSearch,
    showKeyboardShortcuts,
    showUserPreferences,
    showUploadModal,
    showNotifications,
    showNotificationDemo,
    showDetailsLocal,
    sortBy,
    sortOrder,
    userPreferences,
    
    // Actions
    setCurrentView,
    setCurrentFolder,
    setCurrentCollection,
    setSelectedMedia,
    setMediaSelectionMode,
    setSearchTerm,
    setShowFilters,
    setFilterActive,
    setSelectedTags,
    setFilters,
    setSavedSearches,
    setShowQuickView,
    setQuickViewItem,
    setShowImageEditor,
    setShowUserMenu,
    setShowNewFolderModal,
    setShowNewCollectionModal,
    setShowAdvancedSearch,
    setShowKeyboardShortcuts,
    setShowUserPreferences,
    setShowUploadModal,
    setShowNotifications,
    setShowNotificationDemo,
    setShowDetailsLocal,
    setSortBy,
    setSortOrder,
    setUserPreferences,
    
    // Helper functions
    handleMediaSelect,
    clearMediaSelection,
    handleSearch,
    saveSearch,
    deleteSavedSearch,
    updateFilters,
    clearFilters,
    openQuickView,
    closeQuickView,
    toggleModal,
    updateUserPreferences
  };
};