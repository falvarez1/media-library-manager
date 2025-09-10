#!/bin/bash

# Fix unused imports and other TypeScript errors

cd /d/ai_coding/MediaManager/media-library-manager

# Fix MediaContent.tsx - Remove unused destructured elements
sed -i '90s/.*/    const { setNotifications } = useNotificationContext();/' src/components/MediaContent.tsx

# Fix MediaViewer/index.tsx - Remove unused Loader import and fix Image constructor
sed -i '/^import.*Loader.*from.*lucide-react/d' src/components/MediaViewer/index.tsx
sed -i '62s/new Image(img.src, img.width, img.height)/new Image()/' src/components/MediaViewer/index.tsx

# Fix NotificationDemo.tsx - Remove unused React import
sed -i '/^import React/d' src/components/NotificationDemo.tsx

# Fix NotificationToast.tsx - Remove unused constants
sed -i '/^const ANIMATION_DURATION/d' src/components/NotificationToast.tsx
sed -i '/^const ANIMATION_CLASSES/d' src/components/NotificationToast.tsx

# Fix ProgressiveImage.tsx - Fix Image constructor
sed -i '83s/new Image()/new Image()/' src/components/ProgressiveImage.tsx

# Fix SkeletonLoader.tsx - Remove unused variables and fix props
sed -i '148d' src/components/SkeletonLoader.tsx
sed -i '230d' src/components/SkeletonLoader.tsx
sed -i 's/lastLineWidth:[^}]*}//g' src/components/SkeletonLoader.tsx

# Fix TagManager.tsx - Remove unused imports
sed -i 's/, useRef//g' src/components/TagManager.tsx
sed -i 's/, Check//g' src/components/TagManager.tsx
sed -i '/^  MouseEvent,$/d' src/components/TagManager.tsx

# Fix TagSelector.tsx - Remove unused imports
sed -i 's/, Check//g' src/components/TagSelector.tsx
sed -i 's/, Tag//g' src/components/TagSelector.tsx
sed -i '/^  MouseEvent,$/d' src/components/TagSelector.tsx

# Fix UploadModal.tsx - Remove unused import
sed -i '/getMediaType/d' src/components/UploadModal.tsx

# Fix UserPreferences.tsx - Remove unused imports
sed -i 's/, Clock//g' src/components/UserPreferences.tsx
sed -i 's/, FileText//g' src/components/UserPreferences.tsx
sed -i 's/, LayoutGrid//g' src/components/UserPreferences.tsx
sed -i 's/, Volume2//g' src/components/UserPreferences.tsx
sed -i 's/, GridSize//g' src/components/UserPreferences.tsx
sed -i '/^  MouseEvent,$/d' src/components/UserPreferences.tsx
sed -i '/handleShowFileExtensionsChange/d' src/components/UserPreferences.tsx

# Fix FilterContext.tsx - Remove unused imports
sed -i '/^import React/d' src/contexts/FilterContext.tsx
sed -i 's/, MediaType//g' src/contexts/FilterContext.tsx
sed -i 's/, FolderId//g' src/contexts/FilterContext.tsx
sed -i 's/, Status//g' src/contexts/FilterContext.tsx

# Fix MediaOperationsContext.tsx - Remove unused imports
sed -i '/^import React/d' src/contexts/MediaOperationsContext.tsx
sed -i 's/, FolderId//g' src/contexts/MediaOperationsContext.tsx

# Fix NavigationContext.tsx - Remove unused React import
sed -i '/^import React/d' src/contexts/NavigationContext.tsx

# Fix NotificationContext.tsx - Remove unused React import and fix possibly undefined
sed -i '/^import React/d' src/contexts/NotificationContext.tsx

# Fix UIStateContext.tsx - Remove unused React import
sed -i '/^import React/d' src/contexts/UIStateContext.tsx

# Fix UserContext.tsx - Remove unused imports
sed -i 's/, MediaId//g' src/contexts/UserContext.tsx

# Fix useApi.ts - Remove unused useMemo import
sed -i 's/, useMemo//g' src/hooks/useApi.ts

echo "Fixes applied. Running TypeScript check..."
npx tsc --noEmit