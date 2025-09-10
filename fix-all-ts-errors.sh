#!/bin/bash

cd /d/ai_coding/MediaManager/media-library-manager

echo "Fixing all TypeScript errors..."

# Fix MediaContent.tsx
echo "Fixing MediaContent.tsx..."
sed -i '/^import TagSelector/d' src/components/MediaContent.tsx
sed -i 's/ViewMode,//' src/components/MediaContent.tsx
sed -i 's/GridSize,//' src/components/MediaContent.tsx
sed -i 's/SortOrder,//' src/components/MediaContent.tsx
sed -i 's/MediaType//' src/components/MediaContent.tsx
sed -i '/FilterOptions/d' src/components/MediaContent.tsx
sed -i '/interface XIconProps/,+2d' src/components/MediaContent.tsx
sed -i 's/onOpenEditor,//' src/components/MediaContent.tsx
sed -i 's/onUpdateCollection,//' src/components/MediaContent.tsx
sed -i 's/, filterActive//' src/components/MediaContent.tsx
sed -i 's/, setSortOrder//' src/components/MediaContent.tsx
sed -i 's/, addingToCollection//' src/components/MediaContent.tsx
sed -i 's/, refetchFolders//' src/components/MediaContent.tsx
sed -i 's/, collectionData//' src/components/MediaContent.tsx
sed -i 's/const selectAll/const _selectAll/' src/components/MediaContent.tsx
# Add Plus import to MediaContent
sed -i 's/import { Folders/import { Folders, Plus/' src/components/MediaContent.tsx

# Fix MediaViewer
echo "Fixing MediaViewer..."
sed -i 's/new Image(img.src, img.width, img.height)/{ src: img.src, width: img.width, height: img.height }/' src/components/MediaViewer/index.tsx

# Fix NotificationToast
echo "Fixing NotificationToast..."
sed -i 's/const ANIMATION_DURATION/const _ANIMATION_DURATION/' src/components/NotificationToast.tsx
sed -i 's/const ANIMATION_CLASSES/const _ANIMATION_CLASSES/' src/components/NotificationToast.tsx
sed -i 's/notification.duration/notification.duration || 0/' src/components/NotificationToast.tsx

# Fix ProgressiveImage
echo "Fixing ProgressiveImage..."
sed -i 's/new Image()/document.createElement("img")/' src/components/ProgressiveImage.tsx

# Fix SkeletonLoader
echo "Fixing SkeletonLoader..."
sed -i 's/export default SkeletonLoader;/export default Skeleton;/' src/components/SkeletonLoader.tsx
sed -i 's/export type { SkeletonLoaderProps };/export type { SkeletonProps };/' src/components/SkeletonLoader.tsx
sed -i '/role: .status.,/d' src/components/SkeletonLoader.tsx
sed -i '/"aria-label": /d' src/components/SkeletonLoader.tsx
sed -i 's/lastLineWidth: .75%.//' src/components/SkeletonLoader.tsx

# Fix TagManager
echo "Fixing TagManager..."
sed -i 's/, useRef//' src/components/TagManager.tsx
sed -i 's/, Check//' src/components/TagManager.tsx
sed -i '/MouseEvent,/d' src/components/TagManager.tsx

# Fix TagSelector
echo "Fixing TagSelector..."
sed -i 's/, Check//' src/components/TagSelector.tsx
sed -i 's/, Tag//' src/components/TagSelector.tsx
sed -i '/MouseEvent,/d' src/components/TagSelector.tsx

# Fix UploadModal
echo "Fixing UploadModal..."
sed -i 's/const getMediaType/const _getMediaType/' src/components/UploadModal.tsx

# Fix UserPreferences
echo "Fixing UserPreferences..."
sed -i 's/, Clock//' src/components/UserPreferences.tsx
sed -i 's/, FileText//' src/components/UserPreferences.tsx
sed -i 's/, LayoutGrid//' src/components/UserPreferences.tsx
sed -i 's/, Volume2//' src/components/UserPreferences.tsx
sed -i 's/, GridSize//' src/components/UserPreferences.tsx
sed -i '/MouseEvent,/d' src/components/UserPreferences.tsx
sed -i 's/const handleShowFileExtensionsChange/const _handleShowFileExtensionsChange/' src/components/UserPreferences.tsx

# Fix FilterContext
echo "Fixing FilterContext..."
sed -i '/^import React/d' src/contexts/FilterContext.tsx
sed -i 's/, MediaType//' src/contexts/FilterContext.tsx
sed -i 's/, FolderId//' src/contexts/FilterContext.tsx
sed -i 's/, Status//' src/contexts/FilterContext.tsx

# Fix MediaOperationsContext
echo "Fixing MediaOperationsContext..."
sed -i '/^import React/d' src/contexts/MediaOperationsContext.tsx
sed -i 's/, FolderId//' src/contexts/MediaOperationsContext.tsx
# Remove duplicate export
sed -i '/^export type { MediaOperationsProviderProps };/d' src/contexts/MediaOperationsContext.tsx

# Fix NavigationContext
echo "Fixing NavigationContext..."
sed -i '/^import React/d' src/contexts/NavigationContext.tsx
# Remove duplicate exports
sed -i '/^export type { NavigationContextValue, NavigationState, NavigationView };/d' src/contexts/NavigationContext.tsx

# Fix NotificationContext
echo "Fixing NotificationContext..."
sed -i '/^import React/d' src/contexts/NotificationContext.tsx
sed -i 's/notification.duration/notification.duration || 0/' src/contexts/NotificationContext.tsx
# Remove duplicate exports
sed -i '/^export type {$/,/^};$/d' src/contexts/NotificationContext.tsx

# Fix UIStateContext
echo "Fixing UIStateContext..."
sed -i '/^import React/d' src/contexts/UIStateContext.tsx
# Remove duplicate exports
sed -i '/^export type { UIState, UIAction, SidebarTab, UIStateContextValue, UIStateProviderProps };/d' src/contexts/UIStateContext.tsx

# Fix UserContext
echo "Fixing UserContext..."
sed -i 's/, MediaId//' src/contexts/UserContext.tsx
sed -i "s/'loginTime'/'timestamp'/" src/contexts/UserContext.tsx
# Remove duplicate exports
sed -i '/^export type { SavedSearch, RecentActivity, UserContextType, UserProviderProps };/d' src/contexts/UserContext.tsx

# Fix useApi
echo "Fixing useApi..."
sed -i 's/, useMemo//' src/hooks/useApi.ts
sed -i '/ApiError,/d' src/hooks/useApi.ts
sed -i '/MediaFilterOptions,/d' src/hooks/useApi.ts
sed -i '/UserId,/d' src/hooks/useApi.ts
sed -i '/BatchOperationRequest,/d' src/hooks/useApi.ts
sed -i '/UpdateTag,/d' src/hooks/useApi.ts

# Fix DataSourceConfig
echo "Fixing DataSourceConfig..."
sed -i 's/currentConfig.mock/currentConfig.mock || {}/' src/components/DataSourceConfig.tsx

# Fix FileOperationsToolbar
echo "Fixing FileOperationsToolbar..."
sed -i 's/selectedTagIds: tag ? tag : \[\]/selectedTagIds: tag ? \[tag\] : \[\]/' src/components/FileOperationsToolbar.tsx

echo "Running TypeScript check..."
npx tsc --noEmit 2>&1 | tail -20