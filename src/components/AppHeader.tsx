/**
 * App Header Component
 * Main application header with navigation and actions
 */

import React from 'react';
import { Menu, Upload, Folders, Search, Filter, Bell, User, KeyboardIcon, Settings } from 'lucide-react';
import DevToolsMenu from './DevToolsMenu';

interface AppHeaderProps {
  // Navigation state
  currentView: 'folder' | 'collection' | 'search';
  searchTerm: string;
  showFilters: boolean;
  filterActive: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  isOnline: boolean;
  errorCount: number;
  
  // Sidebar state
  showLeftSidebar: boolean;
  showDetails: boolean;
  
  // Actions
  onToggleLeftSidebar: () => void;
  onToggleDetails: () => void;
  onToggleFilters: () => void;
  onToggleNotifications: () => void;
  onToggleUserMenu: () => void;
  onOpenUploadModal: () => void;
  onOpenKeyboardShortcuts: () => void;
  onOpenUserPreferences: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  searchTerm,
  showFilters,
  filterActive,
  showNotifications,
  showUserMenu,
  isOnline,
  errorCount,
  showLeftSidebar,
  showDetails,
  onToggleLeftSidebar,
  onToggleDetails,
  onToggleFilters,
  onToggleNotifications,
  onToggleUserMenu,
  onOpenUploadModal,
  onOpenKeyboardShortcuts,
  onOpenUserPreferences,
  onSearchChange,
  onSearchSubmit
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleLeftSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800">
            Media Library
          </h1>

          {/* Network status indicator */}
          {!isOnline && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs text-yellow-700">Offline</span>
            </div>
          )}

          {/* Error indicator */}
          {errorCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 rounded-lg">
              <span className="text-xs text-red-700">{errorCount} errors</span>
            </div>
          )}
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              placeholder="Search media..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={onToggleFilters}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                filterActive ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>

          <button
            onClick={onToggleDetails}
            className={`p-2 rounded-lg transition-colors ${
              showDetails ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Toggle details panel"
          >
            <Folders className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleNotifications}
            className={`p-2 rounded-lg transition-colors relative ${
              showNotifications ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={onOpenKeyboardShortcuts}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Keyboard shortcuts"
          >
            <KeyboardIcon className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenUserPreferences}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={onToggleUserMenu}
              className={`p-2 rounded-lg transition-colors ${
                showUserMenu ? 'bg-gray-100 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="User menu"
            >
              <User className="w-5 h-5" />
            </button>
            
            {/* User menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm">
                  Account Settings
                </button>
                <hr className="my-2" />
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-red-600">
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Dev tools menu */}
          {process.env.NODE_ENV === 'development' && <DevToolsMenu />}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;