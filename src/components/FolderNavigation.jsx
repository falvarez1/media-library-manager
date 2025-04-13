import { useState, useRef, useEffect } from 'react';
import { Folders, Clock, Star, Heart, Share, Plus, Tag, Settings, Terminal, Loader, FolderPlus } from 'lucide-react';
import FolderModal from './FolderModal';
import FolderContextMenu from './FolderContextMenu';
import ConfirmationDialog from './ConfirmationDialog';
import { useFolders, useCollections, useTags, useCreateFolder, useUpdateFolder, useDeleteFolder } from '../hooks/useApi';

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
  // Core state
  const [expandedFolders, setExpandedFolders] = useState(['1', '2', '3']); // Default expanded folders
  
  // Folder management state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedFolderForAction, setSelectedFolderForAction] = useState(null);
  const [parentFolderForCreate, setParentFolderForCreate] = useState(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    folderId: null
  });

  // Drag and drop state
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Fetch data using hooks
  const { data: folders, loading: foldersLoading, error: foldersError, refetch: refetchFolders } = useFolders();
  const { data: collections, loading: collectionsLoading, error: collectionsError } = useCollections();
  const { data: tags, loading: tagsLoading, error: tagsError } = useTags();
  
  // Folder operation hooks
  const { createFolder, loading: createLoading } = useCreateFolder();
  const { updateFolder, loading: updateLoading } = useUpdateFolder();
  const { deleteFolder, loading: deleteLoading } = useDeleteFolder();
  
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
  
  // Handle context menu
  const handleContextMenu = (e, folderId) => {
    e.preventDefault();
    
    // Find folder
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    // Set context menu position and folder
    setContextMenu({
      visible: true,
      position: { 
        x: e.clientX, 
        y: e.clientY 
      },
      folderId
    });
    
    // Store folder for action
    setSelectedFolderForAction(folder);
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      position: { x: 0, y: 0 },
      folderId: null
    });
  };
  
  // Handle new folder creation
  const handleCreateFolder = async (name) => {
    try {
      await createFolder({
        name,
        parent: parentFolderForCreate
      });
      
      // Refresh folder list
      refetchFolders();
      
      // Close modal and reset state
      setShowNewFolderModal(false);
      setParentFolderForCreate(null);
      
      // Auto expand parent folder if a subfolder was created
      if (parentFolderForCreate && !expandedFolders.includes(parentFolderForCreate)) {
        setExpandedFolders([...expandedFolders, parentFolderForCreate]);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };
  
  // Open new folder modal
  const openNewFolderModal = (parentId = null) => {
    setParentFolderForCreate(parentId);
    setShowNewFolderModal(true);
    closeContextMenu();
  };
  
  // Handle folder rename
  const handleRenameFolder = async (newName) => {
    if (!selectedFolderForAction) return;
    
    try {
      await updateFolder(selectedFolderForAction.id, { name: newName });
      
      // Refresh folder list
      refetchFolders();
      
      // Close modal and reset state
      setShowRenameFolderModal(false);
      setSelectedFolderForAction(null);
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };
  
  // Open rename folder modal
  const openRenameFolderModal = () => {
    setShowRenameFolderModal(true);
    closeContextMenu();
  };
  
  // Handle folder delete
  const handleDeleteFolder = async () => {
    if (!selectedFolderForAction) return;
    
    try {
      await deleteFolder(selectedFolderForAction.id, { force: true });
      
      // Refresh folder list
      refetchFolders();
      
      // Close modal and reset state
      setShowDeleteConfirmation(false);
      setSelectedFolderForAction(null);
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };
  
  // Open delete confirmation dialog
  const openDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
    closeContextMenu();
  };
  
  // Drag and drop handlers
  const handleDragStart = (e, folder) => {
    setDraggedFolder(folder);
    setIsDragging(true);
    
    // Required for Firefox
    e.dataTransfer.setData('text/plain', folder.id);
    
    // Custom drag ghost
    const ghostElement = document.createElement('div');
    ghostElement.classList.add('drag-ghost');
    ghostElement.textContent = folder.name;
    ghostElement.style.position = 'absolute';
    ghostElement.style.left = '-9999px';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    
    // Clean up ghost after drag operation
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };
  
  const handleDragOver = (e, folder) => {
    e.preventDefault();
    if (!draggedFolder || draggedFolder.id === folder.id) return;
    
    // Don't allow dropping into its own descendants
    const isDescendant = (parentId, potentialChildId) => {
      if (parentId === potentialChildId) return true;
      const children = folders.filter(f => f.parent === parentId);
      return children.some(child => isDescendant(child.id, potentialChildId));
    };
    
    if (isDescendant(draggedFolder.id, folder.id)) return;
    
    setDropTarget(folder.id);
  };
  
  const handleDragLeave = () => {
    setDropTarget(null);
  };
  
  const handleDrop = async (e, targetFolder) => {
    e.preventDefault();
    
    if (!draggedFolder || draggedFolder.id === targetFolder.id) {
      setIsDragging(false);
      setDraggedFolder(null);
      setDropTarget(null);
      return;
    }
    
    try {
      // Move folder to new parent
      const updates = {
        parent: targetFolder.id
      };
      
      await updateFolder(draggedFolder.id, updates);
      
      // Refresh folder list
      refetchFolders();
      
      // Auto expand the target folder
      if (!expandedFolders.includes(targetFolder.id)) {
        setExpandedFolders([...expandedFolders, targetFolder.id]);
      }
    } catch (error) {
      console.error('Failed to move folder:', error);
    } finally {
      setIsDragging(false);
      setDraggedFolder(null);
      setDropTarget(null);
    }
  };
  
  // Clean up function for dragging
  useEffect(() => {
    const handleDocumentDragEnd = () => {
      setIsDragging(false);
      setDraggedFolder(null);
      setDropTarget(null);
    };
    
    document.addEventListener('dragend', handleDocumentDragEnd);
    return () => {
      document.removeEventListener('dragend', handleDocumentDragEnd);
    };
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [contextMenu.visible]);
  
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
                <button
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => openNewFolderModal(null)}
                >
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
                      handleContextMenu={handleContextMenu}
                      handleDragStart={handleDragStart}
                      handleDragOver={handleDragOver}
                      handleDragLeave={handleDragLeave}
                      handleDrop={handleDrop}
                      draggedFolder={draggedFolder}
                      dropTarget={dropTarget}
                      isDragging={isDragging}
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
      
      {/* Folder management modals */}
      <FolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title={parentFolderForCreate ? "Create Subfolder" : "Create Folder"}
        onSubmit={handleCreateFolder}
        submitButtonText="Create"
      />
      
      <FolderModal
        isOpen={showRenameFolderModal}
        onClose={() => setShowRenameFolderModal(false)}
        title="Rename Folder"
        initialValue={selectedFolderForAction?.name || ''}
        onSubmit={handleRenameFolder}
        submitButtonText="Rename"
      />
      
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        message={`Are you sure you want to delete "${selectedFolderForAction?.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="red"
      />
      
      {/* Folder context menu */}
      <FolderContextMenu
        visible={contextMenu.visible}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onRename={openRenameFolderModal}
        onDelete={openDeleteConfirmation}
        onCreateSubfolder={() => openNewFolderModal(contextMenu.folderId)}
      />
    </div>
  );
};

// Nested component for folder items
const FolderItem = ({ 
  folder, 
  allFolders, 
  expandedFolders, 
  currentFolder, 
  currentView, 
  level, 
  onToggle, 
  onClick,
  handleContextMenu,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  draggedFolder,
  dropTarget,
  isDragging
}) => {
  const hasChildren = allFolders.some(f => f.parent === folder.id);
  const isExpanded = expandedFolders.includes(folder.id);
  const isActive = currentView === 'folder' && currentFolder === folder.id;
  
  const isDropTarget = dropTarget === folder.id;
  const isDragged = draggedFolder && draggedFolder.id === folder.id;
  
  return (
    <div>
      <div 
        className={`flex items-center px-2 py-1.5 rounded-md ${
          isActive ? 'bg-blue-50 text-blue-600' : 
          isDropTarget ? 'bg-blue-100' : 
          'hover:bg-gray-100'
        } ${isDragged ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${(level * 12) + 8}px` }}
        onContextMenu={(e) => handleContextMenu(e, folder.id)}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, folder)}
        onDragOver={(e) => handleDragOver(e, folder)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, folder)}
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
                handleContextMenu={handleContextMenu}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                draggedFolder={draggedFolder}
                dropTarget={dropTarget}
                isDragging={isDragging}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default FolderNavigation;
