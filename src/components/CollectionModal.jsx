import { useState, useEffect } from 'react';
import { X, Folder, Plus } from 'lucide-react';

const CollectionModal = ({ 
  isOpen, 
  onClose, 
  title = 'Create Collection', 
  initialValues = {}, 
  onSubmit,
  collections = [],
  submitButtonText = 'Create'
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [isShared, setIsShared] = useState(false);
  const [parentId, setParentId] = useState(null);
  const [formError, setFormError] = useState('');

  // Initialize form fields from initialValues
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setDescription(initialValues.description || '');
      setColor(initialValues.color || '#8B5CF6');
      setIsShared(initialValues.isShared || false);
      setParentId(initialValues.parentId || null);
    }
  }, [initialValues, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormError('');
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setFormError('Collection name is required');
      return;
    }
    
    // Call onSubmit with form data
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
      isShared,
      parentId
    });
  };

  // Predefined colors
  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F43F5E', // Red
    '#0EA5E9', // Light Blue
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#EF4444'  // Red
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden max-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
          {/* Form error */}
          {formError && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
              {formError}
            </div>
          )}
          
          {/* Name field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Collection Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              required
              autoFocus
            />
          </div>
          
          {/* Description field */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter collection description"
              rows={3}
            />
          </div>
          
          {/* Parent collection dropdown */}
          <div className="mb-4">
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
              Parent Collection
            </label>
            <div className="relative">
              <select
                id="parentId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value === '' ? null : e.target.value)}
              >
                <option value="">None (Top Level)</option>
                {collections
                  .filter(collection => collection.id !== initialValues.id) // Prevent circular references
                  .map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))
                }
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Color selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map(colorOption => (
                <button
                  key={colorOption}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
              <label className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer">
                <Plus size={16} className="text-gray-500" />
                <input
                  type="color"
                  className="sr-only"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </label>
            </div>
          </div>
          
          {/* Sharing options */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isShared"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
              />
              <label htmlFor="isShared" className="ml-2 block text-sm text-gray-700">
                Share this collection
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Shared collections can be accessed by other users you invite.
            </p>
          </div>
        </form>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;