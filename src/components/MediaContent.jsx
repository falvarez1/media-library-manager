import { useState } from 'react';
import { Folders, Grid3x3, List, Square, CheckSquare, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import MediaItem from './MediaItem';

// Mock data for media items and folders (in a real app, this would come from props or context)
const mockMedia = [
  { 
    id: '1', 
    type: 'image', 
    name: 'product-hero.jpg', 
    folder: '5', 
    path: 'Images/Products',
    size: '2.4 MB', 
    dimensions: '1920 x 1080',
    created: '2025-03-15',
    modified: '2025-04-02',
    used: true,
    usedIn: ['Homepage', 'Product Catalog'],
    tags: ['product', 'hero', 'featured'],
    url: '/api/placeholder/800/600',
    starred: true,
    favorited: true,
    status: 'approved',
    ai_tags: ['product', 'minimalist', 'white background', 'luxury item']
  },
  { 
    id: '2', 
    type: 'image', 
    name: 'team-photo.jpg', 
    folder: '6', 
    path: 'Images/Team',
    size: '3.1 MB', 
    dimensions: '2400 x 1600',
    created: '2025-02-20',
    modified: '2025-02-20',
    used: true,
    usedIn: ['About Page', 'Team Page'],
    tags: ['team', 'people', 'corporate'],
    url: '/api/placeholder/800/600',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['people', 'group', 'outdoor', 'corporate', 'team building']
  },
  { 
    id: '3', 
    type: 'image', 
    name: 'banner-spring.jpg', 
    folder: '4', 
    path: 'Images/Marketing',
    size: '1.8 MB', 
    dimensions: '1500 x 500',
    created: '2025-03-01',
    modified: '2025-03-15',
    used: true,
    usedIn: ['Homepage'],
    tags: ['banner', 'spring', 'seasonal'],
    url: '/api/placeholder/800/300',
    starred: false,
    favorited: true,
    status: 'approved',
    ai_tags: ['banner', 'colorful', 'spring', 'promotion', 'seasonal']
  },
  { 
    id: '4', 
    type: 'document', 
    name: 'annual-report-2024.pdf', 
    folder: '7', 
    path: 'Documents/Reports',
    size: '4.2 MB', 
    created: '2025-01-15',
    modified: '2025-01-15',
    used: false,
    usedIn: [],
    tags: ['report', 'annual', 'financial'],
    url: '#',
    starred: true,
    favorited: false,
    status: 'approved',
    ai_tags: ['financial', 'report', 'corporate', 'annual']
  },
  { 
    id: '5', 
    type: 'video', 
    name: 'product-tutorial.mp4', 
    folder: '9', 
    path: 'Videos/Tutorials',
    size: '28.4 MB', 
    dimensions: '1920 x 1080',
    duration: '2:45',
    created: '2025-02-10',
    modified: '2025-02-12',
    used: true,
    usedIn: ['Product Page', 'Help Center'],
    tags: ['tutorial', 'product', 'how-to'],
    url: '#',
    starred: false,
    favorited: false,
    status: 'approved',
    ai_tags: ['tutorial', 'instructional', 'product demo', 'how-to']
  }
];

const mockFolders = [
  { id: '4', name: 'Marketing', parent: '1', path: 'Images/Marketing', color: '#6366F1' },
  { id: '5', name: 'Products', parent: '1', path: 'Images/Products', color: '#EC4899' },
  { id: '6', name: 'Team', parent: '1', path: 'Images/Team', color: '#14B8A6' },
];

const mockCollections = [
  { 
    id: '1', 
    name: 'Homepage Redesign', 
    items: ['1', '3', '8']
  },
  { 
    id: '2', 
    name: 'Spring Campaign', 
    items: ['3', '5', '6']
  },
  { 
    id: '3', 
    name: 'Legal Documents', 
    items: ['4', '7']
  }
];

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
  
  // Get current items based on view
  const getCurrentItems = () => {
    if (currentView === 'folder') {
      return mockMedia.filter(item => item.folder === currentFolder || currentFolder === 'all');
    } else if (currentView === 'collection') {
      const collection = mockCollections.find(c => c.id === currentCollection);
      return mockMedia.filter(item => collection?.items.includes(item.id));
    } else if (currentView === 'search') {
      return mockMedia.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (currentView === 'starred') {
      return mockMedia.filter(item => item.starred);
    } else if (currentView === 'favorites') {
      return mockMedia.filter(item => item.favorited);
    } else if (currentView === 'recent') {
      // Sort by modified date and take the most recent
      return [...mockMedia].sort((a, b) => new Date(b.modified) - new Date(a.modified)).slice(0, 20);
    } else {
      return [];
    }
  };
  
  // Apply filters
  const filterItems = (items) => {
    if (!filterActive) return items;
    
    return items.filter(item => {
      // Filter by type
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false;
      
      // Filter by tags
      if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) return false;
      
      // Filter by usage
      if (filters.usage === 'used' && !item.used) return false;
      if (filters.usage === 'unused' && item.used) return false;
      
      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
      
      return true;
    });
  };
  
  // Get filtered items
  const filteredItems = filterItems(getCurrentItems());
  
  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    switch(sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        comparison = sizeA - sizeB;
        break;
      case 'date':
        comparison = new Date(a.modified) - new Date(b.modified);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Get child folders of the current folder
  const childrenFolders = currentView === 'folder' && currentFolder !== 'all' 
    ? mockFolders.filter(folder => folder.parent === currentFolder)
    : [];
  
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
      const items = sortedItems.map(item => item.id);
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
    onSelect(sortedItems.map(item => item.id));
  };
  
  // Deselect all items
  const deselectAll = () => {
    onSelect([]);
  };

  // Format path string
  const formatPathString = () => {
    if (currentView === 'folder') {
      const folder = mockFolders.find(f => f.id === currentFolder);
      return folder ? folder.path : 'All Media';
    } else if (currentView === 'collection') {
      const collection = mockCollections.find(c => c.id === currentCollection);
      return `Collection: ${collection?.name || ''}`;
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
        {/* Subfolders section - only shown when in folder view */}
        {currentView === 'folder' && childrenFolders.length > 0 && (
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
                  onClick={() => {/* Handle folder click */}}
                >
                  <Folders size={32} style={{ color: folder.color }} className="mb-2" />
                  <span className="text-sm truncate w-full text-center">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Media items */}
        {sortedItems.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className={`grid ${getGridClass()} gap-4`}>
                {sortedItems.map(item => (
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
                items={sortedItems}
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
