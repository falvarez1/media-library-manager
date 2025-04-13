import { useState, useEffect, useMemo } from 'react';
import { Folders, Grid3x3, List, Square, CheckSquare, ChevronDown, ArrowUp, ArrowDown, Loader } from 'lucide-react';
import MediaItem from './MediaItem';
import { useMedia, useFolders, useCollections } from '../hooks/useApi';

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
  onOpenEditor
}) => {
  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [gridSize, setGridSize] = useState('medium'); // 'small', 'medium', 'large'
  const [mediaSelectionMode, setMediaSelectionMode] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Prepare API options based on view type and filters
  const getApiOptions = () => {
    const options = {
      sortBy,
      sortOrder,
      types: filters.types,
      tags: filters.tags,
      status: filters.status,
      used: filters.usage === 'used' ? true : filters.usage === 'unused' ? false : null,
    };

    if (currentView === 'folder') {
      // Use 'all' for All Media view, otherwise pass the specific folder ID
      if (currentFolder !== 'all') {
        options.folder = currentFolder;
      }
    } else if (currentView === 'collection') {
      options.collection = currentCollection;
    } else if (currentView === 'search') {
      options.search = searchTerm;
    } else if (currentView === 'starred') {
      options.starred = true;
    } else if (currentView === 'favorites') {
      options.favorited = true;
    } else if (currentView === 'recent') {
      options.sortBy = 'modified';
      options.sortOrder = 'desc';
      options.pageSize = 20;
    }

    return options;
  };

  // Fetch media items based on current view
  const apiOptions = useMemo(() => getApiOptions(), [
    currentView, 
    currentFolder, 
    currentCollection, 
    searchTerm, 
    filters, 
    sortBy, 
    sortOrder
  ]);
  
  const { data: mediaData, loading: mediaLoading, error: mediaError } = useMedia(apiOptions, [
    currentView,
    currentFolder,
    currentCollection,
    searchTerm,
    sortBy,
    sortOrder,
    JSON.stringify(filters)
  ]);
  // Get media items with debug logging
  const mediaItems = mediaData?.items || [];
  
  // Debug logging
  console.log('MediaContent Debug:', {
    currentView,
    currentFolder,
    mediaItemsCount: mediaItems.length,
    mediaLoading,
    mediaError
  });

  // Fetch folders for the current folder
  const foldersOptions = { parent: currentFolder === 'all' ? null : currentFolder };
  const { data: foldersData, loading: foldersLoading, error: foldersError } =
    useFolders(foldersOptions, [currentFolder, JSON.stringify(foldersOptions)]);

  // Get child folders of the current folder
  const childrenFolders = currentView === 'folder' && currentFolder !== 'all' 
    ? (foldersData || []).filter(folder => folder.parent === currentFolder)
    : [];

  // Fetch collection data if needed
  const { data: collectionsData, loading: collectionsLoading, error: collectionsError } =
    useCollections({}, [currentCollection, currentView]);

  // Get the current collection if relevant
  const currentCollectionData = currentView === 'collection' && currentCollection 
    ? (collectionsData?.items || []).find(c => c.id === currentCollection) 
    : null;

  // Loading all data
  const isLoading = mediaLoading || foldersLoading || collectionsLoading;
  
  // Has error
  const hasError = mediaError || foldersError || collectionsError;
  const errorMessage = mediaError?.message || foldersError?.message || collectionsError?.message;
  
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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" x2="12" y1="9" y2="13"></line>
                <line x1="12" x2="12.01" y1="17" y2="17"></line>
              </svg>
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

        {/* Subfolders section - only shown when in folder view and not loading/error */}
        {!isLoading && !hasError && currentView === 'folder' && childrenFolders && childrenFolders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Folders size={16} className="mr-1.5 text-gray-400" />
              Folders
            </h3>
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3`}>
              {childrenFolders.map(folder => (
                <button
                  key={folder.id}
                  className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => onFolderClick ? onFolderClick(folder.id) : null}
                >
                  <Folders size={32} style={{ color: folder.color }} className="mb-2" />
                  <span className="text-sm truncate w-full text-center">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Media items - only shown when not loading/error */}
        {!isLoading && !hasError && (
          mediaItems && mediaItems.length > 0 ? (
            <>
              {console.log('Rendering media items:', { currentFolder, itemsCount: mediaItems.length })}
              {viewMode === 'grid' ? (
                <div className={`grid ${getGridClass()} gap-4`}>
                  {mediaItems.map(item => (
                    <MediaItem 
                      key={item.id}
                      item={item}
                      isSelected={selectedMedia.includes(item.id)}
                      selectionMode={mediaSelectionMode}
                      onClick={(e) => handleMediaClick(item.id, e)}
                      onQuickView={() => onQuickView(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <MediaListView 
                  items={mediaItems}
                  selectedMedia={selectedMedia}
                  selectionMode={mediaSelectionMode}
                  onMediaClick={handleMediaClick}
                  onQuickView={onQuickView}
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
const MediaListView = ({ items, selectedMedia, selectionMode, onMediaClick, onQuickView }) => {
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
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
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
            <td className="px-4 py-4 whitespace-nowrap text-sm">
              {item.used ? (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle mr-1">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Used
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 w-fit">
                  Unused
                </span>
              )}
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

export default MediaContent;
