/**
 * App Layout Component
 * Main layout structure for the application
 */

import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import MediaErrorBoundary from './MediaErrorBoundary';
import SidebarErrorBoundary from './SidebarErrorBoundary';
import FolderNavigation from './FolderNavigation';
import MediaContent from './MediaContent';
import DetailsSidebar from './DetailsSidebar';
import FilterBar from './FilterBar';
import FileOperationsToolbar from './FileOperationsToolbar';
import CollectionNavigation from './CollectionNavigation';
import type {
  MediaId,
  FolderId,
  CollectionId,
  MediaFilterOptions,
  SortField,
  SortOrder
} from '../types';

interface AppLayoutProps {
  // Navigation state
  currentView: 'folder' | 'collection' | 'search';
  currentFolder: string;
  currentCollection: CollectionId | null;
  
  // UI visibility
  showLeftSidebar: boolean;
  showDetails: boolean;
  showFilters: boolean;
  
  // Selection state
  selectedMedia: MediaId[];
  mediaSelectionMode: boolean;
  
  // Filter and search state
  searchTerm: string;
  filters: MediaFilterOptions;
  selectedTags: string[];
  
  // Sort state
  sortBy: SortField;
  sortOrder: SortOrder;
  
  // Actions
  onFolderSelect: (folderId: FolderId) => void;
  onCollectionSelect: (collectionId: CollectionId) => void;
  onMediaSelect: (mediaId: MediaId, multiSelect?: boolean) => void;
  onMediaDoubleClick: (mediaId: MediaId) => void;
  onUpdateFilters: (filters: Partial<MediaFilterOptions>) => void;
  onClearFilters: () => void;
  onToggleSelectionMode: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onCreateFolder: () => void;
  onCreateCollection: () => void;
  onToggleDetails: () => void;
  onSetSelectedTags: (tags: string[]) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  currentFolder,
  currentCollection,
  showLeftSidebar,
  showDetails,
  showFilters,
  selectedMedia,
  mediaSelectionMode,
  searchTerm,
  filters,
  selectedTags,
  sortBy,
  sortOrder,
  onFolderSelect,
  onCollectionSelect,
  onMediaSelect,
  onMediaDoubleClick,
  onUpdateFilters,
  onClearFilters,
  onToggleSelectionMode,
  onClearSelection,
  onBulkAction,
  onSortChange,
  onCreateFolder,
  onCreateCollection,
  onToggleDetails,
  onSetSelectedTags
}) => {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      {showLeftSidebar && (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <SidebarErrorBoundary>
            {currentView === 'folder' ? (
              <FolderNavigation
                selectedFolderId={currentFolder as FolderId}
                onFolderSelect={onFolderSelect}
                onCreateFolder={onCreateFolder}
              />
            ) : currentView === 'collection' ? (
              <CollectionNavigation
                selectedCollectionId={currentCollection}
                onCollectionSelect={onCollectionSelect}
                onCreateCollection={onCreateCollection}
              />
            ) : null}
          </SidebarErrorBoundary>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Filter Bar */}
        {showFilters && (
          <FilterBar
            filters={filters}
            selectedTags={selectedTags}
            onUpdateFilters={onUpdateFilters}
            onClearFilters={onClearFilters}
            onSetSelectedTags={onSetSelectedTags}
          />
        )}

        {/* File Operations Toolbar */}
        {mediaSelectionMode && selectedMedia.length > 0 && (
          <FileOperationsToolbar
            selectedCount={selectedMedia.length}
            onClearSelection={onClearSelection}
            onBulkAction={onBulkAction}
          />
        )}

        {/* Media Content */}
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            <MediaErrorBoundary>
              <MediaContent
                currentView={currentView}
                currentFolder={currentFolder}
                currentCollection={currentCollection}
                searchTerm={searchTerm}
                filters={filters}
                selectedMedia={selectedMedia}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onMediaSelect={onMediaSelect}
                onMediaDoubleClick={onMediaDoubleClick}
                onSortChange={onSortChange}
                onToggleSelectionMode={onToggleSelectionMode}
              />
            </MediaErrorBoundary>
          </ErrorBoundary>
        </div>
      </main>

      {/* Right Sidebar - Details Panel */}
      {showDetails && (
        <aside className="w-80 bg-gray-50 border-l border-gray-200">
          <ErrorBoundary>
            <DetailsSidebar
              selectedMediaIds={selectedMedia}
              onClose={onToggleDetails}
            />
          </ErrorBoundary>
        </aside>
      )}
    </div>
  );
};

export default AppLayout;