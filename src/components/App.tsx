import React, { useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { Menu, Upload, Folders, Search, Filter, Bell, User, X, KeyboardIcon, Settings, HelpCircle } from 'lucide-react';
import FolderModal from './FolderModal';
import FolderNavigation from './FolderNavigation';
import MediaContent from './MediaContent';
import DetailsSidebar from './DetailsSidebar';
import MediaEditor from './MediaEditor';
import MediaViewer from './MediaViewer';
import FileOperationsToolbar from './FileOperationsToolbar';
import AdvancedSearch from './AdvancedSearch';
import KeyboardShortcuts, { useKeyboardShortcuts, KeyboardShortcutsModal } from './KeyboardShortcuts';
import UserPreferences from './UserPreferences';
import {
  useCreateFolder, useMedia, useCollections, useCreateCollection,
  useUpdateCollection, useDeleteCollection, useTags, useMoveMedia,
  useCopyMedia, useExportMedia, useShareMedia, useBatchUpdateTags
} from '../hooks/useApi';
import FilterBar from './FilterBar';
import CollectionModal from './CollectionModal';
import type {
  MediaId,
  FolderId,
  CollectionId,
  TagId,
  HexColor,
  MediaFilterOptions,
  Collection,
  ViewMode,
  SortField,
  SortOrder,
  MediaType,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent
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

interface ExportOptions {
  format?: string;
  quality?: number;
  includeMetadata?: boolean;
}

interface ShareOptions {
  permissions?: string[];
  expiry?: string;
  password?: string;
}

interface OperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

const App: React.FC = () => {
  // Core state
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'files' | 'collections' | 'tags'>('files');
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
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showQuickView, setShowQuickView] = useState<boolean>(false);
  const [quickViewItem, setQuickViewItem] = useState<MediaId | null>(null);
  const [showImageEditor, setShowImageEditor] = useState<boolean>(false);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState<boolean>(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);
  const [showUserPreferences, setShowUserPreferences] = useState<boolean>(false);
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
  
  // Fetch collections data
  const { data: collectionsData, loading: collectionsLoading, error: collectionsError, refetch: refetchCollections } = useCollections();
  
  // Fetch tags data
  const { data: tagsData, loading: tagsLoading, error: tagsError } = useTags();
  
  // Collection operations
  const { mutate: createCollection, loading: createCollectionLoading } = useCreateCollection();
  const { mutate: updateCollection, loading: updateCollectionLoading } = useUpdateCollection();
  const { mutate: deleteCollection, loading: deleteCollectionLoading } = useDeleteCollection();
  
  // Media operations
  const { mutate: moveMedia, loading: moveLoading } = useMoveMedia();
  const { mutate: copyMedia, loading: copyLoading } = useCopyMedia();
  const { mutate: exportMedia, loading: exportLoading } = useExportMedia();
  const { mutate: shareMedia, loading: shareLoading } = useShareMedia();
  const { mutate: batchUpdateMedia, loading: batchUpdateLoading } = useBatchUpdateTags();
  
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
  const { mutate: createFolder, loading: createFolderLoading } = useCreateFolder();
  
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
  const handleCreateCollection = async (collectionData: any): Promise<void> => {
    try {
      await createCollection({
        name: collectionData.name || 'Untitled Collection',
        description: collectionData.description || '',
        color: (collectionData.color || '#6366f1') as HexColor,
        parentId: collectionData.parentId || null,
        isShared: collectionData.isShared || false,
        sharedWith: collectionData.sharedWith || []
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
  
  const handleDeleteCollection = async (id: CollectionId): Promise<void> => {
    try {
      await deleteCollection({ id, options: { deleteChildren: true } });
      
      // Refresh collections
      refetchCollections();
      
      // If the deleted collection was the current one, go back to all media
      if (currentCollection === id) {
        setCurrentView('folder');
        setCurrentFolder('all');
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    }
  };
  
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
    setSelectedMedia(Array.isArray(mediaIds) ? mediaIds : [mediaIds]);
    if ((Array.isArray(mediaIds) ? mediaIds : [mediaIds]).length === 1) setShowDetails(true);
  };
  
  // Handle quick view
  const handleQuickView = (mediaId: MediaId): void => {
    setQuickViewItem(mediaId);
    setShowQuickView(true);
  };
  
  // Navigation handlers for QuickView
  const handleNavigateNext = useCallback((currentId: MediaId) => {
    // We'll implement the actual media fetching logic here when needed
    // For now, we'll keep the navigation behavior working with a callback
    // that will be filled in when we implement the actual navigation
    const nextId = getNextMediaId(currentId);
    if (nextId) {
      setQuickViewItem(nextId);
    }
  }, []);

  const handleNavigatePrevious = useCallback((currentId: MediaId) => {
    // Similar to handleNavigateNext, we'll implement the actual logic later
    const prevId = getPreviousMediaId(currentId);
    if (prevId) {
      setQuickViewItem(prevId);
    }
  }, []);

  // Helper functions to get next/previous media IDs
  // In a real implementation, these would use our hook system to get the actual media items
  const getNextMediaId = (currentId: MediaId): MediaId | null => {
    return null;
  };
  
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

  const getPreviousMediaId = (currentId: MediaId): MediaId | null => {
    return null;
  };

  // Open image editor
  const openEditor = (): void => {
    setShowImageEditor(true);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // File operations
  const handleMoveMedia = async (mediaIds: MediaId[], targetFolderId: FolderId): Promise<void> => {
    try {
      await moveMedia({ mediaIds, targetFolderId });
      // Clear selection and refresh view
      setSelectedMedia([]);
    } catch (error) {
      console.error('Error moving media:', error);
    }
  };
  
  const handleCopyMedia = async (mediaIds: MediaId[], targetFolderId: FolderId): Promise<void> => {
    try {
      await copyMedia({ mediaIds, targetFolderId });
      // Keep selection but refresh view
    } catch (error) {
      console.error('Error copying media:', error);
    }
  };
  
  const handleExportMedia = async (mediaIds: MediaId[], options: ExportOptions = {}): Promise<OperationResult | undefined> => {
    try {
      const result = await exportMedia({ mediaIds, options });
      // Export complete
      return result;
    } catch (error) {
      console.error('Error exporting media:', error);
    }
  };
  
  const handleShareMedia = async (mediaIds: MediaId[], options: ShareOptions = {}): Promise<OperationResult | undefined> => {
    try {
      const result = await shareMedia({ mediaIds, shareOptions: options });
      // Share link created
      return result;
    } catch (error) {
      console.error('Error sharing media:', error);
    }
  };
  
  const handleSelectAll = (): void => {
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
    } catch (error) {
      // Error loading saved searches
    }
  }, []);
  
  // Handle star toggle
  const handleToggleStar = async (mediaId: MediaId): Promise<void> => {
    // Toggle star for media item
    // We would implement the actual API call here
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = async (mediaId: MediaId): Promise<void> => {
    // Toggle favorite for media item
    // We would implement the actual API call here
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
    <KeyboardShortcuts>
      <div className="flex flex-col h-screen text-gray-800 bg-gray-50">
      {/* Top navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-1.5 mr-3 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={() => uiState.toggleSidebar()}
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 mr-6">Media Library</h1>
          
          <div className="hidden md:flex space-x-2">
            <button 
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md flex items-center space-x-1 hover:bg-blue-700"
              onClick={() => setShowUploader(true)}
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
        onFolderSelected={handleFolderClick}
        onOperationComplete={() => {
          // Refresh the view after operations
          setSelectedMedia([]);
        }}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {showSidebar && (
          <FolderNavigation 
            onTagFilter={handleTagFilter}
          />
        )}
        
        {/* Main content */}
        <MediaContent
          currentView={currentView}
          currentFolder={currentFolder as FolderId}
          currentCollection={currentCollection}
          searchTerm={searchTerm}
          filters={filters}
          filterActive={filterActive}
          selectedMedia={selectedMedia as MediaId[]}
          onSelect={handleMediaSelect}
          onQuickView={handleQuickView}
          onOpenEditor={openEditor}
          onFolderClick={handleFolderClick}
          onCollectionClick={handleCollectionClick}
          collections={collectionsData?.items as Collection[] || []}
          tags={tagsData || []}
          onUpdateCollection={handleUpdateCollection}
          onAddToCollection={handleCreateCollection}
        />
        
        {/* Details sidebar */}
        {showDetails && selectedMedia.length === 1 && (
          <DetailsSidebar 
            mediaId={selectedMedia[0]}
            onClose={() => setShowDetails(false)}
            onOpenEditor={openEditor}
            onToggleStar={handleToggleStar}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>
      
      {/* Modals */}
      {showQuickView && quickViewItem && (
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
        />
      )}
      
      {showImageEditor && selectedMedia.length === 1 && (
        <MediaEditor 
          mediaId={selectedMedia[0]}
          onClose={() => setShowImageEditor(false)}
        />
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
    </div>
    </KeyboardShortcuts>
  );
};

export default App;