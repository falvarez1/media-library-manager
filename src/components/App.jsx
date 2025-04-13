import { useState, useEffect, useCallback } from 'react';
import { Menu, Upload, Folders, Search, Filter, Bell, User, X } from 'lucide-react';
import FolderNavigation from './FolderNavigation';
import MediaContent from './MediaContent';
import DetailsSidebar from './DetailsSidebar';
import MediaEditor from './MediaEditor';
import QuickView from './QuickView';
import FilterBar from './FilterBar';
import { useMedia } from '../hooks/useMockApi';

const App = () => {
  // Core state
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('files');
  const [currentView, setCurrentView] = useState('folder');
  const [currentFolder, setCurrentFolder] = useState('1');
  const [currentCollection, setCurrentCollection] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    tags: [],
    dateRange: null,
    usage: null,
    status: []
  });
  
  // UI state
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Handle folder navigation
  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
    setCurrentView('folder');
    setSelectedMedia([]);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // Handle collection navigation
  const handleCollectionClick = (collectionId) => {
    setCurrentCollection(collectionId);
    setCurrentView('collection');
    setSelectedMedia([]);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term) setCurrentView('search');
  };
  
  // Handle media selection
  const handleMediaSelect = (mediaIds) => {
    setSelectedMedia(Array.isArray(mediaIds) ? mediaIds : [mediaIds]);
    if (mediaIds.length === 1) setShowDetails(true);
  };
  
  // Handle quick view
  const handleQuickView = (mediaId) => {
    setQuickViewItem(mediaId);
    setShowQuickView(true);
  };
  
  // Navigation handlers for QuickView
  const handleNavigateNext = useCallback((currentId) => {
    // We'll implement the actual media fetching logic here when needed
    // For now, we'll keep the navigation behavior working with a callback
    // that will be filled in when we implement the actual navigation
    const nextId = getNextMediaId(currentId);
    if (nextId) {
      setQuickViewItem(nextId);
    }
  }, []);

  const handleNavigatePrevious = useCallback((currentId) => {
    // Similar to handleNavigateNext, we'll implement the actual logic later
    const prevId = getPreviousMediaId(currentId);
    if (prevId) {
      setQuickViewItem(prevId);
    }
  }, []);

  // Helper functions to get next/previous media IDs
  // In a real implementation, these would use our hook system to get the actual media items
  const getNextMediaId = (currentId) => {
    // This is a placeholder function until we implement the actual navigation
    // when we refactor other components to use the hook system
    console.log('Navigate to next item from:', currentId);
    return null; // Currently returns null, will be implemented properly later
  };

  const getPreviousMediaId = (currentId) => {
    // This is a placeholder function until we implement the actual navigation
    // when we refactor other components to use the hook system
    console.log('Navigate to previous item from:', currentId);
    return null; // Currently returns null, will be implemented properly later
  };

  // Open image editor
  const openEditor = () => {
    setShowImageEditor(true);
    setShowDetails(false);
    setShowQuickView(false);
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Shortcut: Escape to close modals
      if (e.key === 'Escape') {
        if (showQuickView) setShowQuickView(false);
        else if (showImageEditor) setShowImageEditor(false);
        else if (showDetails) setShowDetails(false);
        else setSelectedMedia([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuickView, showImageEditor, showDetails, selectedMedia]);
  
  return (
    <div className="flex flex-col h-screen text-gray-800 bg-gray-50">
      {/* Top navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-1.5 mr-3 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
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
              onClick={() => {/* Show new folder modal */}}
            >
              <Folders size={15} />
              <span>New Folder</span>
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
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button className="p-1.5 text-gray-500">
                <Search size={18} />
              </button>
            </div>
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
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
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

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {showSidebar && (
          <FolderNavigation 
            currentFolder={currentFolder}
            currentView={currentView}
            currentCollection={currentCollection}
            sidebarTab={sidebarTab}
            setSidebarTab={setSidebarTab}
            onFolderClick={handleFolderClick}
            onCollectionClick={handleCollectionClick}
            onViewChange={setCurrentView}
          />
        )}
        
        {/* Main content */}
        <MediaContent 
          currentView={currentView}
          currentFolder={currentFolder}
          currentCollection={currentCollection}
          searchTerm={searchTerm}
          filters={filters}
          filterActive={filterActive}
          selectedMedia={selectedMedia}
          onSelect={handleMediaSelect}
          onQuickView={handleQuickView}
          onOpenEditor={openEditor}
        />
        
        {/* Details sidebar */}
        {showDetails && selectedMedia.length === 1 && (
          <DetailsSidebar 
            mediaId={selectedMedia[0]}
            onClose={() => setShowDetails(false)}
            onOpenEditor={openEditor}
          />
        )}
      </div>
      
      {/* Modals */}
      {showQuickView && quickViewItem && (
        <QuickView
          mediaId={quickViewItem}
          onClose={() => setShowQuickView(false)}
          onShowDetails={() => {
            setShowDetails(true);
            setShowQuickView(false);
          }}
          onOpenEditor={openEditor}
          onNavigateNext={handleNavigateNext}
          onNavigatePrevious={handleNavigatePrevious}
          onToggleStar={(id) => console.log('Toggle star for', id)}
          onToggleFavorite={(id) => console.log('Toggle favorite for', id)}
        />
      )}
      
      {showImageEditor && selectedMedia.length === 1 && (
        <MediaEditor 
          mediaId={selectedMedia[0]}
          onClose={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
};

export default App;
