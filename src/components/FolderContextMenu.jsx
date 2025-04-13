import { Folder, Edit, Trash2, Copy } from 'lucide-react';

const FolderContextMenu = ({ 
  visible, 
  position, 
  onClose, 
  onRename, 
  onDelete, 
  onCreateSubfolder 
}) => {
  if (!visible) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      ></div>
      <div 
        className="absolute z-50 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1"
        style={{ 
          top: `${position.y}px`, 
          left: `${position.x}px` 
        }}
      >
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={onCreateSubfolder}
        >
          <Folder size={16} />
          <span>New Subfolder</span>
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={onRename}
        >
          <Edit size={16} />
          <span>Rename</span>
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </>
  );
};

export default FolderContextMenu;