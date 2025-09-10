#!/usr/bin/env python3
import re
import os

def fix_file(filepath, replacements):
    """Apply replacements to a file"""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

# Fix FileOperationsToolbar.tsx
fix_file('src/components/FileOperationsToolbar.tsx', [
    (r'  Tag,\s*\n', ''),
    (r'  Save,\s*\n', ''),
    (r'  currentView,', '  // currentView,'),
    (r'  onFolderSelected,', '  // onFolderSelected,'),
    (r'  onExportComplete,', '  // onExportComplete,'),
    (r'  onShareComplete,', '  // onShareComplete,'),
    (r'  onOperationComplete\n\}\) =>', '  // onOperationComplete\n}) =>'),
    (r', error: moveError', ''),
    (r', error: copyError', ''),
    (r', error: exportError', ''),
    (r', error: shareError', ''),
    (r'const result = await exportMedia', 'await exportMedia'),
    (r'const result = await shareMedia', 'await shareMedia'),
    (r'recipients: shareRecipients\n', 'recipients: shareRecipients as string[]\n'),
])

# Fix FilterBar.tsx
fix_file('src/components/FilterBar.tsx', [
    (r"import { useUIState } from '../contexts/UIStateContext';\n", ''),
    (r', ChangeEvent', ''),
])

# Fix FolderContextMenu.tsx
fix_file('src/components/FolderContextMenu.tsx', [
    (r', Copy', ''),
])

# Fix FolderNavigation.tsx
fix_file('src/components/FolderNavigation.tsx', [
    (r'    currentCollection,', '    // currentCollection,'),
    (r'    navigateToCollection,', '    // navigateToCollection,'),
    (r'  const handleUpdateCollection[^;]+;', '  // const handleUpdateCollection = ...'),
    (r'  const handleDeleteCollection[^;]+;', '  // const handleDeleteCollection = ...'),
])

# Fix KeyboardShortcuts.tsx
fix_file('src/components/KeyboardShortcuts.tsx', [
    (r"import React, { useState, useEffect } from 'react';", "import React, { useEffect } from 'react';"),
])

# Fix MediaContent.tsx
fix_file('src/components/MediaContent.tsx', [
    (r"import TagSelector from './TagSelector';\n", ''),
    (r'  ViewMode,\s*\n', ''),
    (r'  GridSize,\s*\n', ''),
    (r'  SortOrder,\s*\n', ''),
    (r'  MediaType,\s*\n', ''),
    (r'interface FilterOptions {[^}]+}\n\n', ''),
    (r'interface XIconProps {[^}]+}\n\n', ''),
    (r'  onOpenEditor,', '  // onOpenEditor,'),
    (r'  onUpdateCollection,', '  // onUpdateCollection,'),
    (r'const { visibleMediaIds[^}]+}[^;]+;', 'const { } = useNavigation();'),
    (r'    filterActive,', '    // filterActive,'),
    (r'    setSortOrder,', '    // setSortOrder,'),
    (r', addingToCollection', ''),
    (r', refetchFolders', ''),
    (r'      const collectionData[^;]+;', '      // const collectionData = ...'),
    (r'  const selectAll[^;]+;', '  // const selectAll = ...'),
])

print("Python script created to fix TypeScript errors")
