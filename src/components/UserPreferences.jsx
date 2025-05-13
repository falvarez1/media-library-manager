import { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Monitor, 
  Grid3x3, 
  List, 
  Clock, 
  Eye, 
  Save, 
  Sliders, 
  FileText, 
  LayoutGrid, 
  Volume2
} from 'lucide-react';

const UserPreferences = ({ isOpen, onClose, initialPreferences = {}, onSave }) => {
  const [preferences, setPreferences] = useState({
    defaultView: initialPreferences.defaultView || 'grid',
    thumbnailSize: initialPreferences.thumbnailSize || 'medium',
    autoPlayVideos: initialPreferences.autoPlayVideos || false,
    showFolderSize: initialPreferences.showFolderSize || true,
    showHiddenFiles: initialPreferences.showHiddenFiles || false,
    theme: initialPreferences.theme || 'light',
    dateFormat: initialPreferences.dateFormat || 'MM/DD/YYYY',
    enableAnimations: initialPreferences.enableAnimations || true,
    doubleClickAction: initialPreferences.doubleClickAction || 'open',
    confirmDeletion: initialPreferences.confirmDeletion || true,
    defaultSortBy: initialPreferences.defaultSortBy || 'name',
    defaultSortOrder: initialPreferences.defaultSortOrder || 'asc',
    showTags: initialPreferences.showTags || true,
    showMetadata: initialPreferences.showMetadata || true,
    showFileExtensions: initialPreferences.showFileExtensions || true,
    previewOnHover: initialPreferences.previewOnHover || true,
    previewDelay: initialPreferences.previewDelay || 500,
    ...(initialPreferences || {})
  });
  
  // For reset functionality
  const [originalPreferences] = useState({...preferences});
  
  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(preferences);
    }
    onClose();
  };
  
  const handleReset = () => {
    setPreferences({...originalPreferences});
  };
  
  // Set tabIndex for accessibility
  useEffect(() => {
    if (isOpen) {
      const firstInput = document.querySelector('.preferences-modal input, .preferences-modal select, .preferences-modal button');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col preferences-modal">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center">
            <Settings size={20} className="mr-2" />
            User Preferences
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Preferences content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* View preferences */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Eye size={16} className="mr-2" />
                View Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default View</label>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-2 text-sm border rounded-md flex items-center ${
                      preferences.defaultView === 'grid' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChange('defaultView', 'grid')}
                  >
                    <Grid3x3 size={16} className="mr-2" />
                    Grid
                  </button>
                  
                  <button
                    className={`px-3 py-2 text-sm border rounded-md flex items-center ${
                      preferences.defaultView === 'list' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChange('defaultView', 'list')}
                  >
                    <List size={16} className="mr-2" />
                    List
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Size</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.thumbnailSize}
                  onChange={(e) => handleChange('thumbnailSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show file extensions</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="show-extensions"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.showFileExtensions}
                      onChange={(e) => handleChange('showFileExtensions', e.target.checked)}
                      style={{
                        right: preferences.showFileExtensions ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.showFileExtensions ? '#3b82f6' : 'white',
                        borderColor: preferences.showFileExtensions ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="show-extensions"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.showFileExtensions ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show metadata</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="show-metadata"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.showMetadata}
                      onChange={(e) => handleChange('showMetadata', e.target.checked)}
                      style={{
                        right: preferences.showMetadata ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.showMetadata ? '#3b82f6' : 'white',
                        borderColor: preferences.showMetadata ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="show-metadata"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.showMetadata ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show tags</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="show-tags"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.showTags}
                      onChange={(e) => handleChange('showTags', e.target.checked)}
                      style={{
                        right: preferences.showTags ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.showTags ? '#3b82f6' : 'white',
                        borderColor: preferences.showTags ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="show-tags"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.showTags ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Preview on hover</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="preview-hover"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.previewOnHover}
                      onChange={(e) => handleChange('previewOnHover', e.target.checked)}
                      style={{
                        right: preferences.previewOnHover ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.previewOnHover ? '#3b82f6' : 'white',
                        borderColor: preferences.previewOnHover ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="preview-hover"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.previewOnHover ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Behavior preferences */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Sliders size={16} className="mr-2" />
                Behavior Settings
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default sort by</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.defaultSortBy}
                  onChange={(e) => handleChange('defaultSortBy', e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                  <option value="type">Type</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-2 text-sm border rounded-md flex items-center ${
                      preferences.defaultSortOrder === 'asc' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChange('defaultSortOrder', 'asc')}
                  >
                    Ascending
                  </button>
                  
                  <button
                    className={`px-3 py-2 text-sm border rounded-md flex items-center ${
                      preferences.defaultSortOrder === 'desc' 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleChange('defaultSortOrder', 'desc')}
                  >
                    Descending
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date format</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MMMM D, YYYY">Month D, Year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Double click action</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={preferences.doubleClickAction}
                  onChange={(e) => handleChange('doubleClickAction', e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="preview">Preview</option>
                  <option value="edit">Edit</option>
                  <option value="download">Download</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Auto-play videos</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="auto-play"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.autoPlayVideos}
                      onChange={(e) => handleChange('autoPlayVideos', e.target.checked)}
                      style={{
                        right: preferences.autoPlayVideos ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.autoPlayVideos ? '#3b82f6' : 'white',
                        borderColor: preferences.autoPlayVideos ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="auto-play"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.autoPlayVideos ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Confirm before deletion</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="confirm-deletion"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.confirmDeletion}
                      onChange={(e) => handleChange('confirmDeletion', e.target.checked)}
                      style={{
                        right: preferences.confirmDeletion ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.confirmDeletion ? '#3b82f6' : 'white',
                        borderColor: preferences.confirmDeletion ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="confirm-deletion"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.confirmDeletion ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Enable animations</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="enable-animations"
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      checked={preferences.enableAnimations}
                      onChange={(e) => handleChange('enableAnimations', e.target.checked)}
                      style={{
                        right: preferences.enableAnimations ? '0' : '4px',
                        transition: 'right 0.2s ease',
                        backgroundColor: preferences.enableAnimations ? '#3b82f6' : 'white',
                        borderColor: preferences.enableAnimations ? '#3b82f6' : '#d1d5db'
                      }}
                    />
                    <label 
                      htmlFor="enable-animations"
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                      style={{
                        backgroundColor: preferences.enableAnimations ? '#bfdbfe' : '#d1d5db'
                      }}
                    ></label>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Theme selection */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2 flex items-center">
              <Monitor size={16} className="mr-2" />
              Theme
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <button
                className={`p-4 rounded-lg border text-center ${
                  preferences.theme === 'light' 
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleChange('theme', 'light')}
              >
                <div className="w-full h-20 bg-white border border-gray-200 rounded-md mb-2 overflow-hidden">
                  <div className="h-6 bg-gray-100 border-b border-gray-200"></div>
                  <div className="p-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Light</span>
              </button>
              
              <button
                className={`p-4 rounded-lg border text-center ${
                  preferences.theme === 'dark' 
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleChange('theme', 'dark')}
              >
                <div className="w-full h-20 bg-gray-800 border border-gray-700 rounded-md mb-2 overflow-hidden">
                  <div className="h-6 bg-gray-900 border-b border-gray-700"></div>
                  <div className="p-2">
                    <div className="h-2 bg-gray-600 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">Dark</span>
              </button>
              
              <button
                className={`p-4 rounded-lg border text-center ${
                  preferences.theme === 'system' 
                    ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleChange('theme', 'system')}
              >
                <div className="w-full h-20 bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-md mb-2 overflow-hidden">
                  <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-900 border-b border-gray-300"></div>
                  <div className="p-2">
                    <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-600 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
          
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              onClick={handleSave}
            >
              <Save size={16} className="mr-1.5" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferences;