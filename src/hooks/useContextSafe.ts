import { useContext } from 'react';
import UIStateContext from '../contexts/UIStateContext';
import NavigationContext from '../contexts/NavigationContext';

/**
 * Safe wrapper for using UIState context
 * Returns default values if context is not available
 */
export function useUIStateSafe() {
  const context = useContext(UIStateContext);
  
  if (!context) {
    // Return default values when context is not available
    return {
      showSidebar: true,
      setSidebarVisible: () => {},
      showDetails: false,
      setDetailsVisible: () => {},
      sidebarTab: 'files' as const,
      setSidebarTab: () => {},
      showQuickView: () => {},
      hideQuickView: () => {},
      quickViewItem: null,
      openImageEditor: () => {},
      closeImageEditor: () => {},
      showImageEditor: false,
      editingMedia: null,
      closeAllModals: () => {},
      theme: 'system' as const,
      setTheme: () => {},
      viewMode: 'grid' as const,
      setViewMode: () => {},
      gridSize: 'medium' as const,
      setGridSize: () => {},
      toggleSidebar: () => {},
      toggleDetails: () => {}
    };
  }
  
  return context;
}

/**
 * Safe wrapper for using Navigation context
 * Returns default values if context is not available
 */
export function useNavigationSafe() {
  const context = useContext(NavigationContext);
  
  if (!context) {
    // Return default values when context is not available
    return {
      selectedMediaId: null,
      setSelectedMediaId: () => {},
      currentFolderId: 'all',
      setCurrentFolderId: () => {},
      currentCollectionId: null,
      setCurrentCollectionId: () => {},
      currentView: 'folder' as const,
      setCurrentView: () => {},
      selectedMediaIds: [],
      setSelectedMediaIds: () => {},
      expandedFolders: [],
      toggleFolderExpansion: () => {},
      history: [],
      historyIndex: -1,
      canGoBack: false,
      canGoForward: false,
      navigateBack: () => {},
      navigateForward: () => {},
      navigateTo: () => {},
      resetNavigation: () => {},
      clearHistory: () => {},
      isMediaSelected: () => false,
      selectMedia: () => {},
      deselectMedia: () => {},
      toggleMediaSelection: () => {},
      selectMultipleMedia: () => {},
      clearSelection: () => {},
      selectAll: () => {},
      expandFolder: () => {},
      collapseFolder: () => {},
      expandAllFolders: () => {},
      collapseAllFolders: () => {}
    };
  }
  
  return context;
}