/**
 * Refactored App Component
 * Main application component using smaller, focused sub-components
 */

import React, { useCallback, useState } from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import { useUIState } from '../contexts/UIStateContext';
import { useErrorRecovery } from '../hooks/useErrorRecovery';
import { useAppState } from '../hooks/useAppState';
import {
  useCreateFolder,
  useCollections,
  useCreateCollection
} from '../hooks/useApi';
import AppHeader from './AppHeader';
import AppLayout from './AppLayout';
import AppModals from './AppModals';
import NotificationToast from './NotificationToast';
import KeyboardShortcuts from './KeyboardShortcuts';
import type {
  MediaId,
  FolderId,
  CollectionId
} from '../types';

interface CollectionFormData {
  name: string;
  description: string;
  color: string;
  isShared: boolean;
  parentId: CollectionId | null;
  sharedWith?: string[];
}

const AppRefactored: React.FC = () => {
  // Error recovery and network monitoring
  const { isOnline, errorCount } = useErrorRecovery({
    enableOfflineDetection: true,
    enableRetryMechanism: true,
    enableNetworkMonitoring: true,
    enableErrorReporting: true,
    retryOptions: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  });

  // UI state from context
  const { showLeftSidebar, showDetails, toggleLeftSidebar, toggleDetails } = useUIState();

  // App state management
  const {
    // State
    currentView,
    currentFolder,
    currentCollection,
    selectedMedia,
    mediaSelectionMode,
    searchTerm,
    showFilters,
    filterActive,
    selectedTags,
    filters,
    savedSearches,
    showQuickView,
    quickViewItem,
    showImageEditor,
    showUserMenu,
    showNewFolderModal,
    showNewCollectionModal,
    showAdvancedSearch,
    showKeyboardShortcuts,
    showUserPreferences,
    showUploadModal,
    showNotifications,
    showNotificationDemo,
    sortBy,
    sortOrder,
    userPreferences,
    
    // Actions
    setCurrentView,
    setCurrentFolder,
    setCurrentCollection,
    setMediaSelectionMode,
    setSearchTerm,
    setShowFilters,
    setSelectedTags,
    setShowUserMenu,
    setShowNewFolderModal,
    setShowNewCollectionModal,
    setShowAdvancedSearch,
    setShowKeyboardShortcuts,
    setShowUserPreferences,
    setShowUploadModal,
    setShowNotifications,
    setShowNotificationDemo,
    setShowImageEditor,
    setSortBy,
    setSortOrder,
    
    // Helper functions
    handleMediaSelect,
    clearMediaSelection,
    handleSearch,
    saveSearch,
    deleteSavedSearch,
    updateFilters,
    clearFilters,
    openQuickView,
    closeQuickView,
    updateUserPreferences
  } = useAppState();

  // API hooks
  const { createFolder } = useCreateFolder();
  const { data: collections = [] } = useCollections();
  const { createCollection } = useCreateCollection();

  // Additional state for editing
  const [editingImageId, setEditingImageId] = useState<MediaId | null>(null);
  const [visibleMediaIds] = useState<MediaId[]>([]);

  // Handlers
  const handleFolderSelect = useCallback((folderId: FolderId) => {
    setCurrentFolder(folderId);
    setCurrentView('folder');
  }, [setCurrentFolder, setCurrentView]);

  const handleCollectionSelect = useCallback((collectionId: CollectionId) => {
    setCurrentCollection(collectionId);
    setCurrentView('collection');
  }, [setCurrentCollection, setCurrentView]);

  const handleMediaDoubleClick = useCallback((mediaId: MediaId) => {
    openQuickView(mediaId);
  }, [openQuickView]);

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, [searchTerm, handleSearch]);

  const handleCreateFolder = useCallback(async (name: string, parentId: FolderId | null) => {
    await createFolder({ name, parentId });
    setShowNewFolderModal(false);
  }, [createFolder, setShowNewFolderModal]);

  const handleCreateCollection = useCallback(async (data: CollectionFormData) => {
    await createCollection(data);
    setShowNewCollectionModal(false);
  }, [createCollection, setShowNewCollectionModal]);

  const handleBulkAction = useCallback((action: string) => {
    // Implement bulk actions
    switch (action) {
      case 'delete':
        // Handle bulk delete
        break;
      case 'move':
        // Handle bulk move
        break;
      case 'tag':
        // Handle bulk tag
        break;
      default:
        break;
    }
  }, []);

  const handleAdvancedSearch = useCallback((params: any) => {
    // Implement advanced search
    updateFilters(params);
    setCurrentView('search');
    setShowAdvancedSearch(false);
  }, [updateFilters, setCurrentView, setShowAdvancedSearch]);

  const handleLoadSavedSearch = useCallback((search: any) => {
    // Load saved search parameters
    updateFilters(search.params);
    setSearchTerm(search.params.query || '');
    setCurrentView('search');
  }, [updateFilters, setSearchTerm, setCurrentView]);

  return (
    <NotificationProvider>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <AppHeader
          currentView={currentView}
          searchTerm={searchTerm}
          showFilters={showFilters}
          filterActive={filterActive}
          showNotifications={showNotifications}
          showUserMenu={showUserMenu}
          isOnline={isOnline}
          errorCount={errorCount}
          showLeftSidebar={showLeftSidebar}
          showDetails={showDetails}
          onToggleLeftSidebar={toggleLeftSidebar}
          onToggleDetails={toggleDetails}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onToggleUserMenu={() => setShowUserMenu(!showUserMenu)}
          onOpenUploadModal={() => setShowUploadModal(true)}
          onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
          onOpenUserPreferences={() => setShowUserPreferences(true)}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Main Layout */}
        <AppLayout
          currentView={currentView}
          currentFolder={currentFolder}
          currentCollection={currentCollection}
          showLeftSidebar={showLeftSidebar}
          showDetails={showDetails}
          showFilters={showFilters}
          selectedMedia={selectedMedia}
          mediaSelectionMode={mediaSelectionMode}
          searchTerm={searchTerm}
          filters={filters}
          selectedTags={selectedTags}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFolderSelect={handleFolderSelect}
          onCollectionSelect={handleCollectionSelect}
          onMediaSelect={handleMediaSelect}
          onMediaDoubleClick={handleMediaDoubleClick}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
          onToggleSelectionMode={() => setMediaSelectionMode(!mediaSelectionMode)}
          onClearSelection={clearMediaSelection}
          onBulkAction={handleBulkAction}
          onSortChange={(field, order) => {
            setSortBy(field);
            setSortOrder(order);
          }}
          onCreateFolder={() => setShowNewFolderModal(true)}
          onCreateCollection={() => setShowNewCollectionModal(true)}
          onToggleDetails={toggleDetails}
          onSetSelectedTags={setSelectedTags}
        />

        {/* Modals */}
        <AppModals
          showNewFolderModal={showNewFolderModal}
          showNewCollectionModal={showNewCollectionModal}
          showUploadModal={showUploadModal}
          showAdvancedSearch={showAdvancedSearch}
          showKeyboardShortcuts={showKeyboardShortcuts}
          showUserPreferences={showUserPreferences}
          showImageEditor={showImageEditor}
          showQuickView={showQuickView}
          showNotificationDemo={showNotificationDemo}
          quickViewItem={quickViewItem}
          editingImageId={editingImageId}
          userPreferences={userPreferences}
          savedSearches={savedSearches}
          collections={collections}
          visibleMediaIds={visibleMediaIds}
          currentFolder={currentFolder}
          onCloseNewFolderModal={() => setShowNewFolderModal(false)}
          onCloseNewCollectionModal={() => setShowNewCollectionModal(false)}
          onCloseUploadModal={() => setShowUploadModal(false)}
          onCloseAdvancedSearch={() => setShowAdvancedSearch(false)}
          onCloseKeyboardShortcuts={() => setShowKeyboardShortcuts(false)}
          onCloseUserPreferences={() => setShowUserPreferences(false)}
          onCloseImageEditor={() => {
            setShowImageEditor(false);
            setEditingImageId(null);
          }}
          onCloseQuickView={closeQuickView}
          onCloseNotificationDemo={() => setShowNotificationDemo(false)}
          onCreateFolder={handleCreateFolder}
          onCreateCollection={handleCreateCollection}
          onUpdateUserPreferences={updateUserPreferences}
          onSaveSearch={saveSearch}
          onDeleteSavedSearch={deleteSavedSearch}
          onLoadSavedSearch={handleLoadSavedSearch}
          onSearch={handleAdvancedSearch}
        />

        {/* Keyboard shortcuts handler */}
        <KeyboardShortcuts
          onSearch={() => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus()}
          onUpload={() => setShowUploadModal(true)}
          onNewFolder={() => setShowNewFolderModal(true)}
          onNewCollection={() => setShowNewCollectionModal(true)}
          onToggleDetails={toggleDetails}
          onToggleSidebar={toggleLeftSidebar}
          onSelectAll={() => {/* Implement select all */}}
          onDelete={() => {/* Implement delete */}}
          onEscape={clearMediaSelection}
        />

        {/* Notification Toast */}
        <NotificationToast />
      </div>
    </NotificationProvider>
  );
};

export default AppRefactored;