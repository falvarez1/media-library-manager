/**
 * App Modals Container
 * Manages all application modals in one place
 */

import React from 'react';
import FolderModal from './FolderModal';
import CollectionModal from './CollectionModal';
import UploadModal from './UploadModal';
import AdvancedSearch from './AdvancedSearch';
import UserPreferences from './UserPreferences';
import MediaEditor from './MediaEditor';
import MediaViewer from './MediaViewer/index';
import NotificationDemo from './NotificationDemo';
import { KeyboardShortcutsModal } from './KeyboardShortcuts';
import type {
  MediaId,
  FolderId,
  CollectionId,
  Collection,
  MediaType
} from '../types';
import type { UserPreferences as UserPrefs, SavedSearch } from '../hooks/useAppState';

interface CollectionFormData {
  name: string;
  description: string;
  color: string;
  isShared: boolean;
  parentId: CollectionId | null;
  sharedWith?: string[];
}

interface AppModalsProps {
  // Modal visibility states
  showNewFolderModal: boolean;
  showNewCollectionModal: boolean;
  showUploadModal: boolean;
  showAdvancedSearch: boolean;
  showKeyboardShortcuts: boolean;
  showUserPreferences: boolean;
  showImageEditor: boolean;
  showQuickView: boolean;
  showNotificationDemo: boolean;
  
  // Modal data
  quickViewItem: MediaId | null;
  editingImageId: MediaId | null;
  userPreferences: UserPrefs;
  savedSearches: SavedSearch[];
  collections: Collection[];
  visibleMediaIds: MediaId[];
  
  // Current state
  currentFolder: string;
  
  // Actions
  onCloseNewFolderModal: () => void;
  onCloseNewCollectionModal: () => void;
  onCloseUploadModal: () => void;
  onCloseAdvancedSearch: () => void;
  onCloseKeyboardShortcuts: () => void;
  onCloseUserPreferences: () => void;
  onCloseImageEditor: () => void;
  onCloseQuickView: () => void;
  onCloseNotificationDemo: () => void;
  onCreateFolder: (name: string, parentId: FolderId | null) => Promise<void>;
  onCreateCollection: (data: CollectionFormData) => Promise<void>;
  onUpdateUserPreferences: (prefs: Partial<UserPrefs>) => void;
  onSaveSearch: (search: SavedSearch) => void;
  onDeleteSavedSearch: (id: string) => void;
  onLoadSavedSearch: (search: SavedSearch) => void;
  onSearch: (params: any) => void;
  onNavigateToMedia?: (mediaId: MediaId) => void;
  onUpdateMedia?: (mediaId: MediaId, updates: any) => Promise<void>;
  onDeleteMedia?: (mediaId: MediaId) => Promise<void>;
}

const AppModals: React.FC<AppModalsProps> = ({
  showNewFolderModal,
  showNewCollectionModal,
  showUploadModal,
  showAdvancedSearch,
  showKeyboardShortcuts,
  showUserPreferences,
  showImageEditor,
  showQuickView,
  showNotificationDemo,
  quickViewItem,
  editingImageId,
  userPreferences,
  savedSearches,
  collections,
  visibleMediaIds,
  currentFolder,
  onCloseNewFolderModal,
  onCloseNewCollectionModal,
  onCloseUploadModal,
  onCloseAdvancedSearch,
  onCloseKeyboardShortcuts,
  onCloseUserPreferences,
  onCloseImageEditor,
  onCloseQuickView,
  onCloseNotificationDemo,
  onCreateFolder,
  onCreateCollection,
  onUpdateUserPreferences,
  onSaveSearch,
  onDeleteSavedSearch,
  onLoadSavedSearch,
  onSearch,
  onNavigateToMedia,
  onUpdateMedia,
  onDeleteMedia
}) => {
  return (
    <>
      {/* Folder Modal */}
      {showNewFolderModal && (
        <FolderModal
          onClose={onCloseNewFolderModal}
          onCreateFolder={onCreateFolder}
          parentId={currentFolder !== 'all' ? currentFolder as FolderId : null}
        />
      )}

      {/* Collection Modal */}
      {showNewCollectionModal && (
        <CollectionModal
          onClose={onCloseNewCollectionModal}
          onCreateCollection={onCreateCollection}
          collections={collections}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={onCloseUploadModal}
          currentFolderId={currentFolder !== 'all' ? currentFolder as FolderId : null}
        />
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onClose={onCloseAdvancedSearch}
          onSearch={onSearch}
          savedSearches={savedSearches}
          onSaveSearch={onSaveSearch}
          onDeleteSavedSearch={onDeleteSavedSearch}
          onLoadSavedSearch={onLoadSavedSearch}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal onClose={onCloseKeyboardShortcuts} />
      )}

      {/* User Preferences Modal */}
      {showUserPreferences && (
        <UserPreferences
          preferences={userPreferences}
          onUpdatePreferences={onUpdateUserPreferences}
          onClose={onCloseUserPreferences}
        />
      )}

      {/* Image Editor Modal */}
      {showImageEditor && editingImageId && (
        <MediaEditor
          mediaId={editingImageId}
          onClose={onCloseImageEditor}
        />
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewItem && (
        <MediaViewer
          mediaId={quickViewItem}
          allMediaIds={visibleMediaIds}
          onClose={onCloseQuickView}
          onNavigateToMedia={onNavigateToMedia}
          onUpdateMedia={onUpdateMedia}
          onDeleteMedia={onDeleteMedia}
        />
      )}

      {/* Notification Demo Modal */}
      {showNotificationDemo && (
        <NotificationDemo onClose={onCloseNotificationDemo} />
      )}
    </>
  );
};

export default AppModals;