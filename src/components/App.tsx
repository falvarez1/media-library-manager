import { useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { useUIState } from '../contexts/UIStateContext';
import { Menu, Upload, Folders, Search, Filter, Bell, User, KeyboardIcon, Settings } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import MediaErrorBoundary from './MediaErrorBoundary';
import SidebarErrorBoundary from './SidebarErrorBoundary';
import { useErrorRecovery } from '../hooks/useErrorRecovery';
import FolderModal from './FolderModal';
import FolderNavigation from './FolderNavigation';
import MediaContent from './MediaContent';
import DetailsSidebar from './DetailsSidebar';
import MediaEditor from './MediaEditor';
import MediaViewer from './MediaViewer/index';
import FileOperationsToolbar from './FileOperationsToolbar';
import AdvancedSearch from './AdvancedSearch';
import KeyboardShortcuts, { useKeyboardShortcuts, KeyboardShortcutsModal } from './KeyboardShortcuts';
import UserPreferences from './UserPreferences';
import DevToolsMenu from './DevToolsMenu';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationToast from './NotificationToast';
import NotificationDemo from './NotificationDemo';
import {
  useCreateFolder, useCollections, useCreateCollection,
  useUpdateCollection, useTags
} from '../hooks/useApi';
import FilterBar from './FilterBar';
import CollectionModal from './CollectionModal';
import UploadModal from './UploadModal';
import type {
  MediaId,
  FolderId,
  CollectionId,
  TagId,
  UserId,
  HexColor,
  MediaFilterOptions,
  Collection,
  ViewMode,
  SortField,
  SortOrder,
  MediaType,
  ChangeEvent
} from '../types';

interface UserPreferences {
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

interface SavedSearch {
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

interface AdvancedSearchParams {
  query?: string;
  types?: MediaType[];
  tags?: string[];
  dateStart?: string;
  dateEnd?: string;
}

interface CollectionFormData {
  name: string;
  description: string;
  color: string;
  isShared: boolean;
  parentId: CollectionId | null;
  sharedWith?: string[];
}

const App: React.FC = () => {
  // Error recovery and network monitoring
  const { isOnline, errorCount } = useErrorRecovery({
    enableOfflineDetection: true,
    enableRetryMechanism: true,
    enableNetworkMonitoring: true,
    enableErrorReporting: true,
    retryOptions: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  });

  // FORCING LOCAL STATE because context isn't working
  const [showDetailsLocal, setShowDetailsLocal] = useState<boolean>(false);
  
  // Get context values (but we'll ignore showDetails from context)
  const { 
    showSidebar,
    toggleSidebar
  } = useUIState();
  
  // Use local state instead of context
  const showDetails = showDetailsLocal;
  const setShowDetails = setShowDetailsLocal;
  
  
  // Local state (will be migrated to contexts)
  const [currentView, setCurrentView] = useState<'folder' | 'collection' | 'search'>('folder');
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [currentCollection, setCurrentCollection] = useState<CollectionId | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaId[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<MediaFilterOptions>({
    types: [],
    tags: [] as TagId[],
    status: [],
    dateFrom: undefined,
    dateTo: undefined,
    used: undefined
  });
  
  // UI state
  // showDetails is now managed by UIStateContext
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [quickViewItem, setQuickViewItem] = useState<MediaId | null>(null);
  const [visibleMediaIds] = useState<MediaId[]>([]);
  const [showImageEditor, setShowImageEditor] = useState<boolean>(false);
  
  // Track starred and favorited items locally
  const [, setStarredItems] = useState<Set<MediaId>>(new Set());
  const [, setFavoritedItems] = useState<Set<MediaId>>(new Set());
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState<boolean>(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [showUserPreferences, setShowUserPreferences] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [mediaSelectionMode, setMediaSelectionMode] = useState<boolean>(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    storage.get('userPreferences', {
      defaultView: 'grid' as ViewMode,
      thumbnailSize: 'medium',
      theme: 'light',
      confirmDeletion: true,
      defaultSortBy: 'name' as SortField,
      defaultSortOrder: 'asc' as SortOrder,
      showTags: true,
      showMetadata: true,
      previewOnHover: true
    })
  );
  
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showNotificationDemo, setShowNotificationDemo] = useState<boolean>(false);
  
  // Fetch collections data
  const { data: collectionsData, refetch: refetchCollections } = useCollections();
  
  // Fetch tags data
  const { data: tagsData } = useTags();
  
  // Collection operations
  const { mutate: createCollection } = useCreateCollection();
  const { mutate: updateCollection } = useUpdateCollection();
  
  // Monitor showDetails state changes
  // Removed debug logging

  // Update filters when tags are selected
  useEffect(() => {
    if (selectedTags.length > 0) {
      setFilters(prev => ({...prev, tags: selectedTags as TagId[]}));
      setFilterActive(true);
    } else if (selectedTags.length === 0 && (filters.tags?.length || 0) > 0) {
      setFilters(prev => ({...prev, tags: [] as TagId[]}));
      setFilterActive((filters.types?.length || 0) > 0 || (filters.status?.length || 0) > 0 || filters.used !== undefined);
    }
  }, [selectedTags, filters.tags?.length, filters.types?.length, filters.status?.length, filters.used]);
  
  // Handle folder navigation
  const handleFolderClick = (folderId: string): void => {
    // Debug: Folder clicked
    // Convert folder ID to string to ensure consistent type handling
    setCurrentFolder(folderId.toString());
    setCurrentView('folder');
    setSelectedMedia([]);
    setShowDetails(false);
    setShowQuickView(false);
    
    // Reset any active search or filters if navigating to a specific folder
    if (folderId !== 'all') {
      // We keep any existing filters to allow filtering within folders
      // But clear any search terms to show all content in the folder
      if (searchTerm) {
        setSearchTerm('');
      }
    }
  };
  
  // Folder operations
  const { mutate: createFolder } = useCreateFolder();
  
  const handleCreateFolder = async (name: string): Promise<void> => {
    try {
      await createFolder({
        name,
        parent: null, // Create at root level from top nav button
        color: '#6366f1' as HexColor, // Default blue color
        description: ''
      });
      
      // Close modal
      setShowNewFolderModal(false);
      
      // Force the folder navigation to refresh
      if (currentView !== 'folder') {
        setCurrentView('folder');
        setCurrentFolder('all');
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };
  
  // Handle collection navigation
  const handleCollectionClick = (collectionId: CollectionId): void => {
    setCurrentCollection(collectionId);
    setCurrentView('collection');
    setSelectedMedia([]);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // Collection operations
  const handleCreateCollection = async (collectionData: CollectionFormData): Promise<void> => {
    try {
      await createCollection({
        name: collectionData.name || 'Untitled Collection',
        description: collectionData.description || '',
        color: (collectionData.color || '#6366f1') as HexColor,
        parentId: collectionData.parentId || null,
        isShared: collectionData.isShared || false,
        sharedWith: (collectionData.sharedWith || []) as UserId[]
      });
      
      // Refresh collections
      refetchCollections();
      
      // Close modal
      setShowNewCollectionModal(false);
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };
  
  const handleUpdateCollection = async (id: CollectionId, updates: Partial<Collection>): Promise<void> => {
    try {
      await updateCollection({ id, updates });
      
      // Refresh collections
      refetchCollections();
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  // handleAddToCollection removed - unused
  
  
  // Handle search
  const handleSearch = (term: string): void => {
    setSearchTerm(term);
    if (term) setCurrentView('search');
  };
  
  // Handle tag filtering
  const handleTagFilter = (tags: string[]): void => {
    setSelectedTags(tags);
  };
  
  // Handle media selection
  const handleMediaSelect = (mediaIds: MediaId[] | MediaId): void => {
    const ids = Array.isArray(mediaIds) ? mediaIds : [mediaIds];
    setSelectedMedia(ids);
    if (ids.length === 1) {
      // setSelectedMediaId doesn't exist - just show details
      setShowDetails(true);
    } else if (ids.length === 0) {
      // setSelectedMediaId doesn't exist - just hide details
      setShowDetails(false);
    }
  };
  
  // Handle quick view
  const handleQuickView = (mediaId: MediaId): void => {
    setQuickViewItem(mediaId);
    setShowQuickView(true);
  };
  
  // Navigation handlers for QuickView
  const handleNavigateNext = useCallback(() => {
    if (!quickViewItem || visibleMediaIds.length === 0) return;
    
    const currentIndex = visibleMediaIds.indexOf(quickViewItem);
    if (currentIndex >= 0) {
      // Wrap around to the first item if at the end
      const nextIndex = currentIndex < visibleMediaIds.length - 1 ? currentIndex + 1 : 0;
      const nextId = visibleMediaIds[nextIndex];
      setQuickViewItem(nextId);
    }
  }, [quickViewItem, visibleMediaIds]);

  const handleNavigatePrevious = useCallback(() => {
    if (!quickViewItem || visibleMediaIds.length === 0) return;
    
    const currentIndex = visibleMediaIds.indexOf(quickViewItem);
    if (currentIndex >= 0) {
      // Wrap around to the last item if at the beginning
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleMediaIds.length - 1;
      const prevId = visibleMediaIds[prevIndex];
      setQuickViewItem(prevId);
    }
  }, [quickViewItem, visibleMediaIds]);
  
  // Save user preferences
  const handleSavePreferences = (preferences: UserPreferences): void => {
    setUserPreferences(preferences);
    
    // Apply preferences immediately
    setSortBy(preferences.defaultSortBy);
    setSortOrder(preferences.defaultSortOrder);
    
    // Save to localStorage
    try {
      storage.set('userPreferences', preferences);
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  };


  // Open image editor
  const openEditor = (): void => {
    setShowImageEditor(true);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // File operations
  
  const [allMediaItems] = useState<MediaId[]>([]);
  
  const handleSelectAll = (): void => {
    // Select all currently visible media items
    setMediaSelectionMode(true);
    if (allMediaItems.length > 0) {
      setSelectedMedia(allMediaItems);
    }
  };
  
  const handleDeselectAll = (): void => {
    setSelectedMedia([]);
  };
  
  const toggleSelectionMode = (): void => {
    setMediaSelectionMode(!mediaSelectionMode);
    if (mediaSelectionMode) {
      setSelectedMedia([]);
    }
  };
  
  // Handle sort change
  const handleSortChange = (newSortBy: SortField, newSortOrder: SortOrder): void => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  // Advanced search
  const handleAdvancedSearch = (searchParams: AdvancedSearchParams): void => {
    // Advanced search executed
    setSearchTerm(searchParams.query || '');
    setFilters(prev => ({
      ...prev,
      types: searchParams.types || [],
      tags: (searchParams.tags || []) as TagId[],
      dateFrom: searchParams.dateStart || undefined,
      dateTo: searchParams.dateEnd || undefined
    }));
    setFilterActive(true);
    setCurrentView('search');
    setShowAdvancedSearch(false);
  };
  
  // Save search
  const handleSaveSearch = (searchData: SavedSearch): void => {
    const newSavedSearches = [...savedSearches, searchData];
    setSavedSearches(newSavedSearches);
    
    // Save to localStorage for persistence
    try {
      storage.set('savedSearches', newSavedSearches);
    } catch (error) {
      console.error('Error saving searches to localStorage:', error);
    }
  };
  
  // Delete saved search
  const handleDeleteSavedSearch = (searchId: string): void => {
    const newSavedSearches = savedSearches.filter(search => search.id !== searchId);
    setSavedSearches(newSavedSearches);
    
    // Update localStorage
    try {
      storage.set('savedSearches', newSavedSearches);
    } catch (error) {
      console.error('Error saving searches to localStorage:', error);
    }
  };
  
  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const savedSearchesData = storage.get('savedSearches', []);
      setSavedSearches(savedSearchesData);
    } catch {
      // Error loading saved searches
    }
  }, []);
  
  // Handle star toggle
  const handleToggleStar = async (mediaId: MediaId): Promise<void> => {
    // Optimistic update
    setStarredItems((prev: Set<MediaId>) => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
    
    // In a real app, we would also make an API call here
    // The state update above handles the UI optimistically
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async (mediaId: MediaId): Promise<void> => {
    // Optimistic update
    setFavoritedItems((prev: Set<MediaId>) => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
    
    // In a real app, we would also make an API call here
    // The state update above handles the UI optimistically
  };
  
  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Escape',
      action: () => {
        if (showQuickView) setShowQuickView(false);
        else if (showImageEditor) setShowImageEditor(false);
        else if (showDetails) setShowDetails(false);
        else if (showAdvancedSearch) setShowAdvancedSearch(false);
        else setSelectedMedia([]);
      }
    },
    {
      key: 'a',
      ctrl: true,
      action: handleSelectAll
    },
    {
      key: 'f',
      ctrl: true,
      action: () => setShowAdvancedSearch(true)
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    },
    {
      key: '?',
      action: () => setShowKeyboardShortcuts(true)
    }
  ]);
  
  return (
    <ErrorBoundary level="page" name="App">
      <NotificationProvider position="top-right" maxNotifications={5}>
        <KeyboardShortcuts>
          {/* Offline indicator */}
          {!isOnline && (
            <div className="bg-red-600 text-white text-center py-2 text-sm">
              <span>You're currently offline. Some features may not be available.</span>
            </div>
          )}
          
          {/* Error count indicator (development only) */}
          {process.env.NODE_ENV === 'development' && errorCount > 0 && (
            <div className="bg-yellow-500 text-white text-center py-1 text-xs">
              <span>{errorCount} error(s) detected</span>
            </div>
          )}
          
          <div className="flex flex-col h-screen text-gray-800 bg-gray-50">
      {/* Top navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-1.5 mr-3 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={() => toggleSidebar()}
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 mr-6">Media Library</h1>
          
          <div className="hidden md:flex space-x-2">
            <button 
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md flex items-center space-x-1 hover:bg-blue-700"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={15} />
              <span>Upload</span>
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1"
              onClick={() => setShowNewFolderModal(true)}
            >
              <Folders size={15} />
              <span>New Folder</span>
            </button>
            <button 
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1"
              onClick={() => setShowNewCollectionModal(true)}
            >
              <Folders size={15} className="text-blue-500" />
              <span>New Collection</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="flex items-center bg-gray-100 rounded-md w-64">
              <input
                type="text"
                placeholder="Search media..."
                className="w-full px-3 py-1.5 bg-transparent border-none focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => handleSearch(e.target.value)}
              />
              <button className="p-1.5 text-gray-500 hover:text-gray-700">
                <Search size={18} />
              </button>
            </div>
            <button
              className="absolute right-0 top-0 h-full flex items-center pr-8 text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setShowAdvancedSearch(true)}
            >
              Advanced
            </button>
          </div>
          
          <button 
            className={`p-1.5 rounded-md ${filterActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </button>
          
          <button
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
          </button>
          
          <button
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard Shortcuts (Press ?)"
          >
            <KeyboardIcon size={18} />
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center rounded-full overflow-hidden hover:ring-2 hover:ring-gray-300"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
                <User size={18} />
              </div>
            </button>
            
            {/* User menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setShowUserPreferences(true);
                      setShowUserMenu(false);
                    }}
                  >
                    <div className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      Preferences
                    </div>
                  </button>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Help</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Filter bar */}
      {showFilters && (
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          setFilterActive={setFilterActive}
          onClose={() => setShowFilters(false)}
        />
      )}
      
      {/* File Operations Toolbar */}
      <FileOperationsToolbar
        selectedMedia={selectedMedia as MediaId[]}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onToggleSelectionMode={toggleSelectionMode}
        selectionMode={mediaSelectionMode}
        onSortChange={handleSortChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        currentFolder={currentFolder}
        currentView={currentView}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {showSidebar && (
          <SidebarErrorBoundary 
            sidebarSection="navigation"
            isCollapsible={true}
            onCollapse={toggleSidebar}
          >
            <FolderNavigation 
              onTagFilter={handleTagFilter}
              onFolderSelected={handleFolderClick}
              currentFolder={currentFolder}
            />
          </SidebarErrorBoundary>
        )}
        
        {/* Main content */}
        <ErrorBoundary level="section" name="MediaContent">
          <MediaContent
            currentView={currentView}
            currentFolder={currentFolder as FolderId}
            currentCollection={currentCollection}
            searchTerm={searchTerm}
            selectedMedia={selectedMedia as MediaId[]}
            onSelect={handleMediaSelect}
            onQuickView={handleQuickView}
            onToggleStar={handleToggleStar}
            onToggleFavorite={handleToggleFavorite}
            onFolderClick={handleFolderClick}
            onCollectionClick={handleCollectionClick}
            collections={collectionsData?.items as Collection[] || []}
            tags={tagsData || []}
          />
        </ErrorBoundary>
        
        {/* Details sidebar - FORCED TO WORK */}
        {showDetails && selectedMedia.length === 1 && (
          <SidebarErrorBoundary 
            sidebarSection="navigation"
            isCollapsible={true}
            onCollapse={() => setShowDetails(false)}
          >
            <DetailsSidebar 
              mediaId={selectedMedia[0]}
              onClose={() => setShowDetails(false)}
              onOpenEditor={openEditor}
              onToggleStar={handleToggleStar}
              onToggleFavorite={handleToggleFavorite}
            />
          </SidebarErrorBoundary>
        )}
      </div>
      
      {/* Modals */}
      {showQuickView && quickViewItem && (() => {
        const currentIndex = visibleMediaIds.indexOf(quickViewItem);
        // With wrap-around navigation, we can always navigate if there are multiple items
        const canNavigateNext = visibleMediaIds.length > 1;
        const canNavigatePrevious = visibleMediaIds.length > 1;
        
        return (
          <MediaErrorBoundary 
            mediaId={quickViewItem}
            onSkip={handleNavigateNext}
            showSkipOption={visibleMediaIds.length > 1}
            fallbackTitle="Unable to load media viewer"
          >
            <MediaViewer
              mediaId={quickViewItem}
              onClose={() => setShowQuickView(false)}
              onShowDetails={() => {
                setShowDetails(true);
                setShowQuickView(false);
              }}
              onOpenEditor={openEditor}
              onNavigateNext={handleNavigateNext}
              onNavigatePrevious={handleNavigatePrevious}
              onToggleStar={handleToggleStar}
              onToggleFavorite={handleToggleFavorite}
              canNavigateNext={canNavigateNext}
              canNavigatePrevious={canNavigatePrevious}
              currentIndex={currentIndex + 1} // 1-based index for display
              totalCount={visibleMediaIds.length}
            />
          </MediaErrorBoundary>
        );
      })()}
      
      {showImageEditor && selectedMedia.length === 1 && (
        <MediaErrorBoundary 
          mediaId={selectedMedia[0]}
          fallbackTitle="Unable to load media editor"
          showSkipOption={false}
        >
          <MediaEditor 
            mediaId={selectedMedia[0]}
            onClose={() => setShowImageEditor(false)}
          />
        </MediaErrorBoundary>
      )}
      
      {/* Folder management modals */}
      <FolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="Create Folder"
        onSubmit={handleCreateFolder}
        submitButtonText="Create"
      />
      
      {/* Collection management modals */}
      <CollectionModal
        isOpen={showNewCollectionModal}
        onClose={() => setShowNewCollectionModal(false)}
        title="Create Collection"
        onSubmit={handleCreateCollection}
        collections={collectionsData?.items as Collection[] || []}
        submitButtonText="Create"
      />
      
      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-75">
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
            initialSearchParams={{
              query: searchTerm,
              types: filters.types || [],
              tags: (filters.tags as string[]) || [],
              dateStart: filters.dateFrom || '',
              dateEnd: filters.dateTo || '',
              sizeMin: '',
              sizeMax: ''
            }}
            savedSearches={savedSearches as SavedSearch[]}
            onSaveSearch={handleSaveSearch}
            onDeleteSavedSearch={handleDeleteSavedSearch}
          />
        </div>
      )}
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
      
      {/* User preferences modal */}
      <UserPreferences
        isOpen={showUserPreferences}
        onClose={() => setShowUserPreferences(false)}
        initialPreferences={userPreferences}
        onSave={handleSavePreferences}
      />
      
      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        currentFolderId={currentFolder}
        onUploadComplete={(files) => {
          console.log('Files uploaded:', files);
          // Here you would typically refresh the media list
        }}
      />
      
        {/* Development Tools Menu - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <DevToolsMenu 
            showNotificationDemo={showNotificationDemo}
            onToggleNotificationDemo={setShowNotificationDemo}
          />
        )}
        </div>
        
        {/* Notification Toast Container */}
        <NotificationToast />
        
        {/* Notification Demo - Development only */}
        {process.env.NODE_ENV === 'development' && showNotificationDemo && <NotificationDemo />}
        </KeyboardShortcuts>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;