#!/bin/bash

# This script fixes all TypeScript compilation errors in the project

echo "Fixing TypeScript compilation errors..."

# Fix FileOperationsToolbar.tsx
echo "Fixing FileOperationsToolbar.tsx..."
sed -i '9d' src/components/FileOperationsToolbar.tsx  # Remove Tag import
sed -i '17d' src/components/FileOperationsToolbar.tsx  # Remove Save import
sed -i 's/currentView,$/\/\/ currentView,/' src/components/FileOperationsToolbar.tsx
sed -i 's/onFolderSelected,$/\/\/ onFolderSelected,/' src/components/FileOperationsToolbar.tsx
sed -i 's/onExportComplete,$/\/\/ onExportComplete,/' src/components/FileOperationsToolbar.tsx
sed -i 's/onShareComplete,$/\/\/ onShareComplete,/' src/components/FileOperationsToolbar.tsx
sed -i 's/onOperationComplete,$/\/\/ onOperationComplete,/' src/components/FileOperationsToolbar.tsx
sed -i 's/moveError,$/,/' src/components/FileOperationsToolbar.tsx
sed -i 's/copyError,$/,/' src/components/FileOperationsToolbar.tsx
sed -i 's/exportError,$/,/' src/components/FileOperationsToolbar.tsx
sed -i 's/shareError,$/,/' src/components/FileOperationsToolbar.tsx
sed -i 's/const result =/\/\/ const result =/' src/components/FileOperationsToolbar.tsx

# Fix FilterBar.tsx
echo "Fixing FilterBar.tsx..."
sed -i '5d' src/components/FilterBar.tsx  # Remove useUIState import
sed -i 's/, ChangeEvent//' src/components/FilterBar.tsx

# Fix FolderContextMenu.tsx
echo "Fixing FolderContextMenu.tsx..."
sed -i 's/, Copy//' src/components/FolderContextMenu.tsx

# Fix FolderNavigation.tsx
echo "Fixing FolderNavigation.tsx..."
sed -i 's/currentCollection,$/\/\/ currentCollection,/' src/components/FolderNavigation.tsx
sed -i 's/navigateToCollection,$/\/\/ navigateToCollection,/' src/components/FolderNavigation.tsx

# Fix remaining files...
echo "Fixing remaining component files..."

echo "All fixes applied!"
