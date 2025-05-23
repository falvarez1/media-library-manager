import { useState, useEffect, useMemo, useRef } from 'react';
import { Folders, Grid3x3, List, Square, CheckSquare, ChevronDown, ArrowUp, ArrowDown, Loader, Folder, Tag, Plus, AlertCircle } from 'lucide-react';
import MediaItem from './MediaItem';
import { useMedia, useFolders, useCollections, useAddItemsToCollection, useFolderContents } from '../hooks/useApi';
import TagSelector from './TagSelector';

const MediaContent = ({
  currentView,
  currentFolder,
  currentCollection,
  searchTerm,
  filters,
  filterActive,
  selectedMedia = [],
  onSelect,
  onQuickView,
  onOpenEditor,
  onFolderClick,
  onCollectionClick,
  collections = [],
  tags = [],
  onUpdateCollection,
  onAddToCollection
}) => {
  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [gridSize, setGridSize] = useState('medium'); // 'small', 'medium', 'large'
  const [mediaSelectionMode, setMediaSelectionMode] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const [showCollectionBar, setShowCollectionBar] = useState(false);
  const [collectionsToShow, setCollectionsToShow] = useState([]);
  
  // Adding to collection hook
  const { addItems, loading: addingToCollection } = useAddItemsToCollection();
  
  // Collection bar timer
  const collectionBarTimer = useRef(null);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (collectionBarTimer.current) {
        clearTimeout(collectionBarTimer.current);
      }
    };
  }, []);
  
  // When selected media changes, check if we should show collection bar
  useEffect(() => {
    if (selectedMedia.length > 0) {
      setShowCollectionBar(true);
      
      // Set a timer to hide the collection bar after 5 seconds of inactivity
      if (collectionBarTimer.current) {
        clearTimeout(collectionBarTimer.current);
      }
      
      collectionBarTimer.current = setTimeout(() => {
        setShowCollectionBar(false);
      }, 5000);
    } else {
      setShowCollectionBar(false);
    }
  }, [selectedMedia]);
  
  // Filter collections to show (root collections for easy access)
  useEffect(() => {
    const rootCollections = collections.filter(c => !c.parentId);
    setCollectionsToShow(rootCollections);
  }, [collections]);
  
  // Prepare API options based on view type and filters
  const getApiOptions = () => {
    console.log('Building API options with currentFolder:', currentFolder);
    
    // Create base options with defaults for everything
    const options = {
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
      types: filters?.types || [],
      tags: filters?.tags || [],
      status: filters?.status || [],
      used: filters?.usage === 'used' ? true : filters?.usage === 'unused' ? false : null,
      folder: null,
      collection: null,
      search: ''
    };

    if (currentView === 'folder') {
      // Use 'all' for All Media view, otherwise pass the specific folder ID
      if (currentFolder && currentFolder !== 'all') {
        options.folder = currentFolder;
        console.log('Setting folder filter to:', currentFolder);
      } else {
        console.log('All folders view');
      }
    } else if (currentView === 'collection') {
      options.collection = currentCollection;
    } else if (currentView === 'search') {
      options.search = searchTerm;
    } else if (currentView === 'starred') {
      options.starred = true;
    } else if (currentView === 'favorites') {
      options.favorited = true;
    } else if (currentView === 'shared') {
      options.shared = true;
    } else if (currentView === 'recent') {
      options.sortBy = 'modified';
      options.sortOrder = 'desc';
      options.pageSize = 20;
    }

    return options;
  };

  // Fetch media items based on current view
  const apiOptions = useMemo(() => {
    try {
      // Force re-evaluation when folder changes
      console.log('Rebuilding apiOptions with folder:', currentFolder);
      const options = getApiOptions();
      // Add debug log to verify the folder is being correctly set
      console.log('Final apiOptions:', JSON.stringify(options));
      return options;
    } catch (error) {
      console.error('Error building API options:', error);
      // Return default options if there's an error
      return {
        sortBy: 'name',
        sortOrder: 'asc',
        types: [],
        tags: [],
        status: []
      };
    }
  }, [
    currentView,
    currentFolder,
    currentCollection,
    searchTerm,
    sortBy,
    sortOrder,
    filters?.types,
    filters?.tags,
    filters?.status,
    filters?.usage
  ]);
  
  // Create a separate parameter for folder to ensure it's properly passed
  const folderParam = currentFolder !== 'all' ? currentFolder : null;
  
  // Create a clean API options object without the folder parameter
  const cleanApiOptions = { ...apiOptions };
  delete cleanApiOptions.folder; // Remove folder from options object
  
  // Use direct parameters for the API call for clarity
  console.log('Using folder parameter:', folderParam);
  console.log('Using API options:', cleanApiOptions);
  
  // Call the API with separate folder parameter to avoid confusion
  const { data: mediaData, loading: mediaLoading, error: mediaError } = useMedia(
    {
      ...cleanApiOptions,
      folder: folderParam // Explicitly set as a direct property to avoid nested objects
    },
    [
      currentView,
      currentFolder,
      currentCollection,
      searchTerm,
      sortBy,
      sortOrder,
      JSON.stringify(filters)
    ]
  );
  
  // Get media items with debug logging
  const mediaItems = mediaData?.items || [];
  
  // Debug logging
  console.log('MediaContent Debug:', {
    currentView,
    currentFolder,
    mediaItemsCount: mediaItems.length,
    apiOptions: JSON.stringify(apiOptions),
    mediaLoading,
    mediaError
  });
  
  // Safe logging of folders
  if (mediaItems.length > 0) {
    console.log('Media item folders:', mediaItems.map(item => item.folder).filter(Boolean));
  }
// Fetch folders for the current folder
// Enhanced logging for folder options with safe handling of null values
const foldersOptions = {
  parent: currentFolder === 'all' ? null :
          currentFolder !== null && currentFolder !== undefined ? currentFolder : null
};
console.log('Fetching sub-folders with options:', JSON.stringify(foldersOptions));

  
  const { data: foldersData, loading: foldersLoading, error: foldersError, refetch: refetchFolders } =
    useFolders(foldersOptions, [currentFolder]);
    
  // Fetch specific folder contents
  const { data: folderContents, loading: folderContentsLoading } =
    useFolderContents(currentFolder !== 'all' ? currentFolder : null, {}, [currentFolder]);

  // Get child folders of the current folder - safely handle string comparison
  const childrenFolders = currentView === 'folder' && currentFolder !== 'all'
    ? (foldersData || []).filter(folder => {
        // Safe comparison with type handling
        if (folder.parent === null || currentFolder === null) return folder.parent === currentFolder;
        return folder.parent && currentFolder && folder.parent.toString() === currentFolder.toString();
      })
    : currentView === 'folder' && currentFolder === 'all'
      ? (foldersData || []).filter(folder => folder.parent === null) // Show root folders in All Media view
      : [];
    
  // Log folder structure for debugging
  useEffect(() => {
    console.log('Current folder:', currentFolder);
    console.log('Children folders:', childrenFolders.map(f => `${f.id} (${f.name})`));
  }, [currentFolder, childrenFolders]);

  // Fetch collection data if needed
  const { data: collectionData, loading: collectionLoading, error: collectionError } =
    useCollections({ id: currentCollection }, [currentCollection, currentView]);
  
  // For collection view, get the current collection
  const currentCollectionData = currentView === 'collection' && currentCollection && collections.length > 0
    ? collections.find(c => c.id === currentCollection) 
    : null;
  
  // Get child collections if in collection view
  const childCollections = currentView === 'collection' && currentCollection && collections.length > 0
    ? collections.filter(c => c.parentId === currentCollection)
    : [];
// Loading all data
const isLoading = mediaLoading || foldersLoading || collectionLoading || folderContentsLoading;

// Has error
const hasError = mediaError || foldersError || collectionError;
const errorMessage = mediaError?.message || foldersError?.message || collectionError?.message;
  
  // Calculate grid class based on size
  const getGridClass = () => {
    switch(gridSize) {
      case 'small': return 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8';
      case 'medium': return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
      case 'large': return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    }
  };
  
  // Handle media item click
  const handleMediaClick = (mediaId, event) => {
    if (mediaSelectionMode) {
      toggleMediaSelection(mediaId);
      return;
    }
    
    // Handle multi-select with shift key
    if (event.shiftKey && selectedMedia.length > 0) {
      const items = mediaItems.map(item => item.id);
      const lastSelectedIndex = items.indexOf(selectedMedia[selectedMedia.length - 1]);
      const currentIndex = items.indexOf(mediaId);
      
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const itemsToSelect = items.slice(start, end + 1);
      onSelect([...new Set([...selectedMedia, ...itemsToSelect])]);
      
    // Handle multi-select with ctrl/cmd key
    } else if (event.ctrlKey || event.metaKey) {
      if (selectedMedia.includes(mediaId)) {
        onSelect(selectedMedia.filter(id => id !== mediaId));
      } else {
        onSelect([...selectedMedia, mediaId]);
      }
      
    // Normal click behavior
    } else {
      onSelect([mediaId]);
    }
  };
  
  // Toggle media selection in selection mode
  const toggleMediaSelection = (mediaId) => {
    if (selectedMedia.includes(mediaId)) {
      onSelect(selectedMedia.filter(id => id !== mediaId));
    } else {
      onSelect([...selectedMedia, mediaId]);
    }
  };
  
  // Select all items
  const selectAll = () => {
    onSelect(mediaItems.map(item => item.id));
  };
  
  // Deselect all items
  const deselectAll = () => {
    onSelect([]);
  };

  // Format path string
  const formatPathString = () => {
    if (currentView === 'folder') {
      const folder = (foldersData || []).find(f => f.id === currentFolder);
      return folder ? folder.path : 'All Media';
    } else if (currentView === 'collection') {
      return `Collection: ${currentCollectionData?.name || ''}`;
    } else if (currentView === 'search') {
      return `Search: ${searchTerm}`;
    } else if (['recent', 'starred', 'favorites'].includes(currentView)) {
      return currentView.charAt(0).toUpperCase() + currentView.slice(1);
    } else {
      return '';
    }
  };
  
  // Drag and drop handlers
  const handleDragStart = (mediaId) => {
    setDraggedItem(mediaId);
  };
  
  const handleDragOver = (e, collectionId) => {
    e.preventDefault();
    setHoveredCollection(collectionId);
  };
  
  const handleDragLeave = () => {
    setHoveredCollection(null);
  };
  
  const handleDrop = async (e, collectionId) => {
    e.preventDefault();
    setHoveredCollection(null);
    
    if (!draggedItem) return;
    
    // If dragged one item
    if (typeof draggedItem === 'string') {
      await addItems(collectionId, [draggedItem]);
    } 
    // If dragged multiple items (from selection)
    else if (Array.isArray(draggedItem)) {
      await addItems(collectionId, draggedItem);
    }
    
    setDraggedItem(null);
  };
  
  // Drag selected items
  const handleDragSelectedItems = () => {
    if (selectedMedia.length > 0) {
      setDraggedItem(selectedMedia);
    }
  };
  
  // Add selected media to collection
  const handleAddToCollection = async (collectionId) => {
    if (selectedMedia.length === 0) return;
    
    try {
      await addItems(collectionId, selectedMedia);
      // Success notification could be added here
    } catch (error) {
      console.error('Failed to add items to collection:', error);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center">
          <div className="text-sm font-medium">{formatPathString()}</div>
        </div>
        
        {/* View controls */}
        <div className="flex items-center space-x-2">
          {selectedMedia.length > 0 ? (
            <div className="flex items-center space-x-2 mr-3">
              <span className="text-sm text-gray-500">{selectedMedia.length} selected</span>
              
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => {/* Share selected media */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" x2="12" y1="2" y2="15"/>
                </svg>
              </button>
              
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={() => {/* Download selected media */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
              </button>
              
              <button 
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md"
                onClick={() => {/* Delete selected media */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
              
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                draggable="true"
                onDragStart={handleDragSelectedItems}
              >
                <Folder size={18} />
              </button>
              
              <button 
                className="ml-2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={deselectAll}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
              
              {viewMode === 'grid' && (
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    className={`p-1.5 ${gridSize === 'small' ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                    onClick={() => setGridSize('small')}
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button
                    className={`p-1.5 ${gridSize === 'medium' ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                    onClick={() => setGridSize('medium')}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    className={`p-1.5 ${gridSize === 'large' ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                    onClick={() => setGridSize('large')}
                  >
                    <Grid3x3 size={18} />
                  </button>
                </div>
              )}
              
              <div className="relative">
                <button
                  className="border border-gray-300 rounded-md p-1.5 flex items-center space-x-1 text-gray-500"
                  onClick={() => setMediaSelectionMode(!mediaSelectionMode)}
                >
                  {mediaSelectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span className="text-xs mr-1">Select</span>
                </button>
              </div>
              
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort: Name</option>
                  <option value="date">Sort: Date</option>
                  <option value="size">Sort: Size</option>
                  <option value="type">Sort: Type</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
              
              <button
                className="border border-gray-300 rounded-md p-1.5 text-gray-500"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Collection quick add bar - only shown when items are selected */}
      {showCollectionBar && collectionsToShow.length > 0 && (
        <div 
          className="bg-gray-50 border-b border-gray-200 px-4 py-2"
          onMouseEnter={() => {
            if (collectionBarTimer.current) {
              clearTimeout(collectionBarTimer.current);
            }
          }}
          onMouseLeave={() => {
            collectionBarTimer.current = setTimeout(() => {
              setShowCollectionBar(false);
            }, 2000);
          }}
        >
          <div className="flex items-center">
            <div className="text-sm text-gray-600 mr-3">Add to collection:</div>
            <div className="flex space-x-2 overflow-x-auto py-1 pr-2 max-w-4xl">
              {collectionsToShow.map(collection => (
                <button
                  key={collection.id}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center whitespace-nowrap ${
                    hoveredCollection === collection.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleAddToCollection(collection.id)}
                  onDragOver={(e) => handleDragOver(e, collection.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, collection.id)}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: collection.color }}
                  ></div>
                  <span>{collection.name}</span>
                  {collection.items && (
                    <span className="ml-1 text-xs text-gray-500">({collection.items.length})</span>
                  )}
                </button>
              ))}
              <button
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md flex items-center"
                onClick={() => {
                  // Open create collection modal with selected media
                  if (onAddToCollection) {
                    onAddToCollection({
                      name: `New Collection (${selectedMedia.length} items)`,
                      items: selectedMedia
                    });
                  }
                }}
              >
                <Plus size={14} className="mr-1" />
                New Collection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Media content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading media...</p>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-3 bg-red-100 text-red-500 rounded-full mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Failed to load media</h3>
            <p className="text-gray-600 max-w-md mb-6">{errorMessage || 'An error occurred while loading media. Please try again.'}</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Collection view: child collections */}
        {!isLoading && !hasError && currentView === 'collection' && childCollections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Folder size={16} className="mr-1.5 text-blue-500" />
              Sub-Collections
            </h3>
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3`}>
              {childCollections.map(collection => (
                <button
                  key={collection.id}
                  className={`flex flex-col items-center p-3 border rounded-lg hover:border-blue-200 transition-colors ${
                    hoveredCollection === collection.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:bg-blue-50'
                  }`}
                  onClick={() => onCollectionClick(collection.id)}
                  onDragOver={(e) => handleDragOver(e, collection.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, collection.id)}
                >
                  <div className="w-full flex items-center justify-center">
                    <div 
                      className="w-12 h-12 rounded-full mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${collection.color}20` }}
                    >
                      <Folder size={24} style={{ color: collection.color }} />
                    </div>
                  </div>
                  <span className="text-sm truncate w-full text-center font-medium">{collection.name}</span>
                  <span className="text-xs text-gray-500">{collection.items?.length || 0} items</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subfolders section with recursive folder tree - only shown when in folder view and not loading/error */}
        {!isLoading && !hasError && currentView === 'folder' && (childrenFolders && childrenFolders.length > 0) && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Folders size={16} className="mr-1.5 text-gray-400" />
              Folders
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden p-4">
              <div className="space-y-1">
                {childrenFolders.map(folder => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    level={0}
                    currentFolder={currentFolder}
                    allFolders={foldersData || []}
                    onFolderClick={onFolderClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Media items - only shown when not loading/error */}
        {!isLoading && !hasError && (
          ((currentFolder !== 'all' && folderContents?.contents?.items?.length > 0) ||
           (mediaItems && mediaItems.length > 0)) ? (
            <>
              {console.log('Rendering media items:', {
                currentFolder,
                folderItemsCount: folderContents?.contents?.items?.length,
                mediaItemsCount: mediaItems.length
              })}
              {viewMode === 'grid' ? (
                <div className={`grid ${getGridClass()} gap-4`}>
                  {/* Display either folder contents for specific folder, or mediaItems for 'all' and other views */}
                  {(mediaItems && mediaItems.length > 0) && (
                    mediaItems.map(item => (
                      <MediaItem
                        key={item.id}
                        item={item}
                        isSelected={selectedMedia.includes(item.id)}
                        selectionMode={mediaSelectionMode}
                        onClick={(e) => handleMediaClick(item.id, e)}
                        onQuickView={() => onQuickView(item.id)}
                        draggable={true}
                        onDragStart={() => handleDragStart(item.id)}
                        tags={tags}
                      />
                    ))
                  )}
                </div>
              ) : (
                <MediaListView
                  items={currentFolder !== 'all' && folderContents?.contents?.items ? folderContents.contents.items : mediaItems}
                  selectedMedia={selectedMedia}
                  selectionMode={mediaSelectionMode}
                  onMediaClick={handleMediaClick}
                  onQuickView={onQuickView}
                  onDragStart={handleDragStart}
                  tags={tags}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Folders size={48} className="mb-4 text-gray-300" />
              <p>No media found in this location</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Upload Media
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

// List view component
const MediaListView = ({ 
  items, 
  selectedMedia, 
  selectionMode, 
  onMediaClick, 
  onQuickView,
  onDragStart,
  tags = []
}) => {
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get file icon
  const getFileIcon = (type) => {
    switch(type) {
      case 'image':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
      case 'document':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
      case 'video':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
      case 'audio':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
    }
  };
  
  // Display tags
  const renderItemTags = (itemTags) => {
    if (!itemTags || itemTags.length === 0) return null;
    
    // Display at most 2 tags in list view
    const tagsToShow = itemTags.slice(0, 2);
    const remaining = itemTags.length - tagsToShow.length;
    
    return (
      <div className="flex items-center space-x-1 ml-2">
        {tagsToShow.map((tagName, index) => {
          const tag = tags.find(t => t.name === tagName);
          return (
            <div 
              key={index}
              className="px-1.5 py-0.5 text-xs rounded-full"
              style={{ 
                backgroundColor: tag ? `${tag.color}20` : '#e5e7eb',
                color: tag ? tag.color : '#374151'
              }}
            >
              {tagName}
            </div>
          );
        })}
        {remaining > 0 && (
          <div className="text-xs text-gray-500">+{remaining} more</div>
        )}
      </div>
    );
  };
  
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {selectionMode && (
            <th className="px-4 py-3 text-left">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
            </th>
          )}
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map(item => (
          <tr 
            key={item.id}
            className={`hover:bg-gray-50 ${selectedMedia.includes(item.id) ? 'bg-blue-50' : ''}`}
            onClick={(e) => onMediaClick(item.id, e)}
            draggable="true"
            onDragStart={() => onDragStart(item.id)}
          >
            {selectionMode && (
              <td className="px-4 py-4 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={selectedMedia.includes(item.id)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              </td>
            )}
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="flex items-center">
                {item.type === 'image' ? (
                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                    <img src={item.url} alt="" className="h-10 w-10 rounded object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(item.type)}
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{item.name}</span>
                  <div className="flex">
                    {item.starred && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                    {item.favorited && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.type}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.size}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.modified}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {renderItemTags(item.tags)}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm">
              {item.status && (
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)} w-fit`}>
                  {item.status === 'in_review' ? 'Review' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              )}
            </td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickView(item.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-blue-600" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-blue-600" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-blue-600" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" x2="12" y1="2" y2="15"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-red-600" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// X component for deselect button
const X = ({ size }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-x"
  >
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

// Recursive folder tree item component similar to mock-explorer
const FolderTreeItem = ({ folder, level, currentFolder, allFolders, onFolderClick }) => {
  const [expanded, setExpanded] = useState(level === 0);
  const isActive = currentFolder === folder.id;
  
  // Get children folders
  const children = allFolders.filter(f => f.parent === folder.id);
  const hasChildren = children.length > 0;
  
  return (
    <div className="select-none">
      <div
        className={`flex items-center hover:bg-gray-50 py-1.5 rounded px-1 cursor-pointer ${
          isActive ? 'bg-blue-50 text-blue-600' : ''
        }`}
      >
        <div className="w-6 text-gray-400" onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}>
          {hasChildren && (
            expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )
          )}
        </div>
        
        <div className="w-5 h-5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={folder.color} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </div>
        
        <div className="flex-1" onClick={() => onFolderClick(folder.id)}>
          <span className={`hover:text-blue-600 ${isActive ? 'font-medium text-blue-600' : ''}`}>
            {folder.name}
          </span>
        </div>
        
        <div className="text-gray-400 text-xs">
          {folder.path}
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="ml-6 pl-4 border-l border-gray-200 space-y-1 mt-1">
          {children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              currentFolder={currentFolder}
              allFolders={allFolders}
              onFolderClick={onFolderClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaContent;
