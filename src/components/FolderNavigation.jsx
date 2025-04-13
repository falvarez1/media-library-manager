import { useState } from 'react';
import { Folders, Clock, Star, Heart, Share, Plus, Tag, Settings, Terminal, Loader } from 'lucide-react';
import { useFolders, useCollections, useTags } from '../hooks/useApi';

const FolderNavigation = ({
  currentFolder,
  currentView,
  currentCollection,
  sidebarTab = 'files',
  setSidebarTab,
  onFolderClick,
  onCollectionClick,
  onViewChange
}) => {
  const [expandedFolders, setExpandedFolders] = useState(['1', '2', '3']); // Default expanded folders
  
  // Fetch data using hooks
  const { data: folders, loading: foldersLoading, error: foldersError } = useFolders();
  const { data: collections, loading: collectionsLoading, error: collectionsError } = useCollections();
  const { data: tags, loading: tagsLoading, error: tagsError } = useTags();
  
  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };
  
  // Set view and folder
  const handleSmartFolderClick = (view) => {
    onViewChange(view);
  };
  
  // Render loading state
  const renderLoading = () => (
    <div className="flex items-center justify-center h-32">
      <Loader className="animate-spin text-blue-500" size={24} />
    </div>
  );
  
  // Render error state
  const renderError = (message) => (
    <div className="p-4 text-center">
      <div className="text-red-500 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" x2="12" y1="8" y2="12"/>
          <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
      </div>
      <p className="text-sm text-gray-600">{message || 'Error loading data'}</p>
      <button 
        className="mt-2 text-xs text-blue-600 hover:underline"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Sidebar tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`flex-1 py-2 text-xs font-medium ${sidebarTab === 'files' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setSidebarTab('files')}
        >
          Files
        </button>
        <button 
          className={`flex-1 py-2 text-xs font-medium ${sidebarTab === 'collections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setSidebarTab('collections')}
        >
          Collections
        </button>
        <button 
          className={`flex-1 py-2 text-xs font-medium ${sidebarTab === 'tags' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setSidebarTab('tags')}
        >
          Tags
        </button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {/* Files tab */}
        {sidebarTab === 'files' && (
          <div className="p-2">
            <div className="space-y-0.5 mb-4">
              <button 
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                  currentView === 'folder' && currentFolder === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  onViewChange('folder');
                  onFolderClick('all');
                }}
              >
                <Folders size={16} />
                <span>All Media</span>
              </button>
              <button 
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                  currentView === 'recent' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSmartFolderClick('recent')}
              >
                <Clock size={16} />
                <span>Recent</span>
              </button>
              <button 
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                  currentView === 'starred' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSmartFolderClick('starred')}
              >
                <Star size={16} />
                <span>Starred</span>
              </button>
              <button 
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                  currentView === 'favorites' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSmartFolderClick('favorites')}
              >
                <Heart size={16} />
                <span>Favorites</span>
              </button>
              <button 
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                  currentView === 'shared' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSmartFolderClick('shared')}
              >
                <Share size={16} />
                <span>Shared with me</span>
              </button>
            </div>
            
            <div className="mt-4 mb-2 px-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h3>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            
            {foldersLoading ? (
              renderLoading()
            ) : foldersError ? (
              renderError(foldersError.message)
            ) : (
              <div className="space-y-0.5">
                {/* Render root folders */}
                {(folders || [])
                  .filter(folder => folder.parent === null)
                  .map(folder => (
                    <FolderItem 
                      key={folder.id}
                      folder={folder}
                      allFolders={folders || []}
                      expandedFolders={expandedFolders}
                      currentFolder={currentFolder}
                      currentView={currentView}
                      level={0}
                      onToggle={toggleFolder}
                      onClick={onFolderClick}
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}
        
        {/* Collections tab */}
        {sidebarTab === 'collections' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</h3>
              <button className="text-xs text-gray-500 hover:text-gray-700">
                <Plus size={14} />
              </button>
            </div>
            
            {collectionsLoading ? (
              renderLoading()
            ) : collectionsError ? (
              renderError(collectionsError.message)
            ) : (
              <div className="space-y-1">
                {(collections?.items || []).map(collection => (
                  <button
                    key={collection.id}
                    className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 text-sm ${
                      currentView === 'collection' && currentCollection === collection.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => onCollectionClick(collection.id)}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: collection.color }}></div>
                    <span className="truncate">{collection.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{collection.items.length}</span>
                  </button>
                ))}
              </div>
            )}
            
            <button className="mt-3 w-full text-left px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center space-x-2">
              <Plus size={14} />
              <span>New Collection</span>
            </button>
          </div>
        )}
        
        {/* Tags tab */}
        {sidebarTab === 'tags' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</h3>
              <button className="text-xs text-gray-500 hover:text-gray-700">
                <Plus size={14} />
              </button>
            </div>
            
            {tagsLoading ? (
              renderLoading()
            ) : tagsError ? (
              renderError(tagsError.message)
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {(tags || []).map(tag => (
                  <button 
                    key={tag.id}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 flex items-center"
                    onClick={() => {/* Handle tag filter */}}
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }}></span>
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
            
            <button className="mt-3 text-sm text-blue-600 hover:underline">
              Manage Tags
            </button>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="border-t border-gray-200 p-3 flex justify-between">
        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
          <Settings size={14} className="mr-1" />
          <span>Settings</span>
        </button>
        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
          <Terminal size={14} className="mr-1" />
          <span>Shortcuts</span>
        </button>
      </div>
    </div>
  );
};

// Nested component for folder items
const FolderItem = ({ folder, allFolders, expandedFolders, currentFolder, currentView, level, onToggle, onClick }) => {
  const hasChildren = allFolders.some(f => f.parent === folder.id);
  const isExpanded = expandedFolders.includes(folder.id);
  const isActive = currentView === 'folder' && currentFolder === folder.id;
  
  return (
    <div>
      <div 
        className={`flex items-center px-2 py-1.5 rounded-md ${
          isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
      >
        {hasChildren ? (
          <button 
            className="mr-1 text-gray-400 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(folder.id);
            }}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                <path d="m9 6 6 6-6 6"/>
              </svg>
            )}
          </button>
        ) : (
          <div className="w-5"></div>
        )}
        <button 
          className="flex-1 flex items-center space-x-2 text-left truncate"
          onClick={() => onClick(folder.id)}
        >
          <Folders size={16} style={{ color: folder.color }} />
          <span className="truncate">{folder.name}</span>
        </button>
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {allFolders
            .filter(f => f.parent === folder.id)
            .map(childFolder => (
              <FolderItem 
                key={childFolder.id}
                folder={childFolder}
                allFolders={allFolders}
                expandedFolders={expandedFolders}
                currentFolder={currentFolder}
                currentView={currentView}
                level={level + 1}
                onToggle={onToggle}
                onClick={onClick}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default FolderNavigation;
