import { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  FolderInput, 
  Trash2, 
  Download, 
  Share, 
  Tag, 
  CheckSquare, 
  Square, 
  Folder, 
  ChevronDown, 
  ArrowDownWideNarrow, 
  ArrowUpWideNarrow,
  Filter,
  Save,
  FileUp,
  Loader
} from 'lucide-react';
import { 
  useMoveMedia, 
  useCopyMedia, 
  useExportMedia, 
  useShareMedia,
  useFolders
} from '../hooks/useApi';

const FileOperationsToolbar = ({
  selectedMedia = [],
  onSelectAll,
  onDeselectAll,
  onToggleSelectionMode,
  selectionMode,
  onSortChange,
  sortBy,
  sortOrder,
  currentFolder,
  currentView,
  onFolderSelected,
  onExportComplete,
  onShareComplete,
  onOperationComplete
}) => {
  // Hooks for media operations
  const { moveMedia, loading: moveLoading, error: moveError } = useMoveMedia();
  const { copyMedia, loading: copyLoading, error: copyError } = useCopyMedia();
  const { exportMedia, loading: exportLoading, error: exportError } = useExportMedia();
  const { shareMedia, loading: shareLoading, error: shareError } = useShareMedia();
  
  // State for folder selector
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [operationType, setOperationType] = useState(null); // 'move' or 'copy'
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [operationResult, setOperationResult] = useState(null);
  
  // Folder selection
  const { data: folders, loading: foldersLoading } = useFolders({}, []);
  
  // Refs
  const folderSelectorRef = useRef(null);
  
  // Handle document clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (folderSelectorRef.current && !folderSelectorRef.current.contains(event.target)) {
        setShowFolderSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialize move operation
  const handleMoveClick = () => {
    if (selectedMedia.length === 0) {
      showOperationMessage('Please select media items to move');
      return;
    }
    setOperationType('move');
    setShowFolderSelector(true);
  };
  
  // Initialize copy operation
  const handleCopyClick = () => {
    if (selectedMedia.length === 0) {
      showOperationMessage('Please select media items to copy');
      return;
    }
    setOperationType('copy');
    setShowFolderSelector(true);
  };
  
  // Handle folder selection for move/copy
  const handleFolderSelect = async (folderId) => {
    setShowFolderSelector(false);
    
    if (folderId === currentFolder) {
      showOperationMessage(`Cannot ${operationType} to the same folder`);
      return;
    }
    
    try {
      if (operationType === 'move') {
        await moveMedia(selectedMedia, folderId);
        showOperationMessage(`${selectedMedia.length} item(s) moved successfully`);
      } else if (operationType === 'copy') {
        await copyMedia(selectedMedia, folderId);
        showOperationMessage(`${selectedMedia.length} item(s) copied successfully`);
      }
      
      // Notify parent component that operation is complete
      if (onOperationComplete) {
        onOperationComplete(operationType, selectedMedia, folderId);
      }
    } catch (error) {
      showOperationMessage(`Error: ${error.message || 'Failed to perform operation'}`);
    }
  };
  
  // Handle export operation
  const handleExport = async () => {
    if (selectedMedia.length === 0) {
      showOperationMessage('Please select media items to export');
      return;
    }
    
    try {
      const result = await exportMedia(selectedMedia, {
        format: 'zip',
        includeMetadata: true
      });
      
      if (onExportComplete) {
        onExportComplete(result);
      }
      
      showOperationMessage('Export complete. Download started.');
    } catch (error) {
      showOperationMessage(`Error: ${error.message || 'Failed to export media'}`);
    }
  };
  
  // Handle share operation
  const handleShare = async () => {
    if (selectedMedia.length === 0) {
      showOperationMessage('Please select media items to share');
      return;
    }
    
    try {
      const result = await shareMedia(selectedMedia, {
        permissionLevel: 'view',
        expiryDays: 7
      });
      
      if (onShareComplete) {
        onShareComplete(result);
      }
      
      showOperationMessage('Share link created and copied to clipboard');
    } catch (error) {
      showOperationMessage(`Error: ${error.message || 'Failed to share media'}`);
    }
  };
  
  // Display operation messages/confirmations
  const showOperationMessage = (message) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };
  
  // Handle sort by change
  const handleSortByChange = (event) => {
    if (onSortChange) {
      onSortChange(event.target.value, sortOrder);
    }
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    if (onSortChange) {
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };
  
  // Loading state for any operation
  const isLoading = moveLoading || copyLoading || exportLoading || shareLoading || foldersLoading;
  
  // Render folder tree recursively
  const renderFolderTree = (folders, depth = 0) => {
    if (!folders || folders.length === 0) return null;
    
    return folders
      .filter(folder => !folder.parent) // Root folders
      .map(folder => (
        <div key={folder.id} className="folder-tree-item">
          <button
            className={`w-full text-left py-1.5 px-4 hover:bg-gray-100 flex items-center ${
              depth > 0 ? 'pl-' + (depth * 6 + 4) + 'px' : ''
            }`}
            onClick={() => handleFolderSelect(folder.id)}
          >
            <Folder size={16} className="mr-2 text-blue-500" />
            <span className="truncate">{folder.name}</span>
          </button>
          {renderFolderTree(
            folders.filter(f => f.parent === folder.id),
            depth + 1
          )}
        </div>
      ));
  };
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side - Selection tools */}
        <div className="flex items-center space-x-2">
          <button
            className={`p-1.5 border border-gray-300 rounded-md flex items-center space-x-1 text-gray-700 hover:bg-gray-50 ${
              selectionMode ? 'bg-blue-50 border-blue-300' : ''
            }`}
            onClick={onToggleSelectionMode}
          >
            {selectionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            <span className="text-xs mr-1">Select</span>
          </button>
          
          {selectedMedia.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedMedia.length} selected
            </span>
          )}
          
          {selectionMode && (
            <div className="flex space-x-1">
              <button
                className="p-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                onClick={onSelectAll}
              >
                Select All
              </button>
              <button
                className="p-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
                onClick={onDeselectAll}
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
        
        {/* Middle - File operations */}
        {selectedMedia.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              className="p-1.5 border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
              onClick={handleMoveClick}
              disabled={isLoading}
            >
              <FolderInput size={16} className="mr-1" />
              <span className="text-xs">Move</span>
            </button>
            
            <button
              className="p-1.5 border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
              onClick={handleCopyClick}
              disabled={isLoading}
            >
              <Copy size={16} className="mr-1" />
              <span className="text-xs">Copy</span>
            </button>
            
            <button
              className="p-1.5 border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
              onClick={handleExport}
              disabled={isLoading}
            >
              <Download size={16} className="mr-1" />
              <span className="text-xs">Export</span>
            </button>
            
            <button
              className="p-1.5 border border-gray-300 rounded-md flex items-center text-gray-700 hover:bg-gray-50"
              onClick={handleShare}
              disabled={isLoading}
            >
              <Share size={16} className="mr-1" />
              <span className="text-xs">Share</span>
            </button>
            
            <button
              className="p-1.5 border border-gray-300 rounded-md flex items-center text-red-500 hover:bg-red-50"
              disabled={isLoading}
            >
              <Trash2 size={16} className="mr-1" />
              <span className="text-xs">Delete</span>
            </button>
          </div>
        )}
        
        {/* Right side - Sorting */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              className="appearance-none border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={sortBy}
              onChange={handleSortByChange}
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
            className="border border-gray-300 rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'asc' ? <ArrowUpWideNarrow size={16} /> : <ArrowDownWideNarrow size={16} />}
          </button>
          
          <button
            className="border border-gray-300 rounded-md p-1.5 text-gray-500 hover:bg-gray-50"
          >
            <Filter size={16} />
          </button>
          
          <button
            className="border border-gray-300 rounded-md p-1.5 flex items-center text-gray-700 hover:bg-gray-50"
          >
            <FileUp size={16} className="mr-1" />
            <span className="text-xs">Import</span>
          </button>
        </div>
      </div>
      
      {/* Folder selector dropdown */}
      {showFolderSelector && (
        <div 
          ref={folderSelectorRef}
          className="absolute mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-20 w-64 max-h-72 overflow-y-auto"
          style={{ top: '6rem', left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium">
              {operationType === 'move' ? 'Move to folder' : 'Copy to folder'}
            </h3>
          </div>
          <div className="py-1">
            {foldersLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader size={20} className="text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                <button
                  className="w-full text-left py-1.5 px-4 hover:bg-gray-100 flex items-center"
                  onClick={() => handleFolderSelect('all')}
                >
                  <Folder size={16} className="mr-2 text-blue-500" />
                  <span>All Media</span>
                </button>
                {renderFolderTree(folders)}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Confirmation/notification */}
      {showConfirmation && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-center">
          {isLoading ? (
            <Loader size={18} className="text-blue-400 animate-spin mr-2" />
          ) : operationResult === 'success' ? (
            <CheckSquare size={18} className="text-green-400 mr-2" />
          ) : operationResult === 'error' ? (
            <AlertCircle size={18} className="text-red-400 mr-2" />
          ) : null}
          <span>{confirmationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileOperationsToolbar;