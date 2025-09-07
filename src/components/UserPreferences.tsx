import React, { useState, useEffect } from 'react';
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
import {
  BaseComponentProps,
  ViewMode,
  GridSize,
  SortField,
  SortOrder,
  Theme,
  EventHandler,
  ChangeEvent,
  MouseEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

type ThumbnailSize = 'small' | 'medium' | 'large';
type DoubleClickAction = 'open' | 'preview' | 'edit' | 'download';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MMMM D, YYYY';

interface UserPreferencesData {
  defaultView: ViewMode;
  thumbnailSize: ThumbnailSize;
  autoPlayVideos: boolean;
  showFolderSize: boolean;
  showHiddenFiles: boolean;
  theme: Theme;
  dateFormat: DateFormat;
  enableAnimations: boolean;
  doubleClickAction: DoubleClickAction;
  confirmDeletion: boolean;
  defaultSortBy: SortField;
  defaultSortOrder: SortOrder;
  showTags: boolean;
  showMetadata: boolean;
  showFileExtensions: boolean;
  previewOnHover: boolean;
  previewDelay: number;
}

interface UserPreferencesProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreferences?: Partial<UserPreferencesData>;
  onSave?: (preferences: UserPreferencesData) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const UserPreferences: React.FC<UserPreferencesProps> = ({ 
  isOpen, 
  onClose, 
  initialPreferences = {}, 
  onSave,
  className,
  testId 
}) => {
  const [preferences, setPreferences] = useState<UserPreferencesData>({
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
  const [originalPreferences] = useState<UserPreferencesData>({...preferences});
  
  const handleChange = <K extends keyof UserPreferencesData>(key: K, value: UserPreferencesData[K]): void => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSave = (): void => {
    if (onSave) {
      onSave(preferences);
    }
    onClose();
  };
  
  const handleReset = (): void => {
    setPreferences({...originalPreferences});
  };
  
  // Set tabIndex for accessibility
  useEffect(() => {
    if (isOpen) {
      const firstInput = document.querySelector('.preferences-modal input, .preferences-modal select, .preferences-modal button') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);

  // Event handlers
  const handleDefaultViewChange = (view: ViewMode): void => {
    handleChange('defaultView', view);
  };

  const handleThumbnailSizeChange: EventHandler<ChangeEvent<HTMLSelectElement>> = (e) => {
    handleChange('thumbnailSize', e.target.value as ThumbnailSize);
  };

  const handleShowFileExtensionsChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    handleChange('showFileExtensions', e.target.checked);
  };

  const handleThemeChange = (theme: Theme): void => {
    handleChange('theme', theme);
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 ${className || ''}`}
      data-testid={testId}
    >
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
            type="button"
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
                    onClick={() => handleDefaultViewChange('grid')}
                    type="button"
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
                    onClick={() => handleDefaultViewChange('list')}
                    type="button"
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
                  onChange={handleThumbnailSizeChange}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Additional toggles would be implemented similarly */}
            </div>
            
            {/* Behavior preferences */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                <Sliders size={16} className="mr-2" />
                Behavior Settings
              </h3>
              
              {/* Implementation would continue with all preference options */}
            </div>
          </div>
          
          {/* Theme selection */}
          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2 flex items-center">
              <Monitor size={16} className="mr-2" />
              Theme
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              {(['light', 'dark', 'system'] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  className={`p-4 rounded-lg border text-center ${
                    preferences.theme === theme 
                      ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleThemeChange(theme)}
                  type="button"
                >
                  <span className="text-sm font-medium capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={handleReset}
            type="button"
          >
            Reset to Defaults
          </button>
          
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              onClick={handleSave}
              type="button"
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