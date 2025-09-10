import React from 'react';
import { Folder, Edit, Trash2 } from 'lucide-react';
import {
  BaseComponentProps,
  EventHandler,
  MouseEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface Position {
  x: number;
  y: number;
}

interface FolderContextMenuProps extends BaseComponentProps {
  visible: boolean;
  position: Position;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreateSubfolder: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({ 
  visible, 
  position, 
  onClose, 
  onRename, 
  onDelete, 
  onCreateSubfolder,
  className,
  testId
}) => {
  const handleBackdropClick: EventHandler<MouseEvent<HTMLDivElement>> = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleCreateSubfolderClick = (): void => {
    onCreateSubfolder();
    onClose();
  };

  const handleRenameClick = (): void => {
    onRename();
    onClose();
  };

  const handleDeleteClick = (): void => {
    onDelete();
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={handleBackdropClick}
      ></div>
      <div 
        className={`absolute z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 ${className || ''}`}
        style={{ 
          top: `${position.y}px`, 
          left: `${position.x}px` 
        }}
        data-testid={testId}
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={handleCreateSubfolderClick}
          type="button"
        >
          <Folder size={16} />
          <span>New Subfolder</span>
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={handleRenameClick}
          type="button"
        >
          <Edit size={16} />
          <span>Rename</span>
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={handleDeleteClick}
          type="button"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </>
  );
};

export default FolderContextMenu;