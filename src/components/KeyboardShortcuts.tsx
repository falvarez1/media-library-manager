import React, { useEffect, ReactNode } from 'react';
import { X, Keyboard } from 'lucide-react';
import { BaseComponentProps } from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface Shortcut {
  key: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: Shortcut[];
}

interface KeyboardShortcutsModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
}

interface KeyboardShortcutsProps {
  children: ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

// Keyboard shortcuts modal - shows available shortcuts
const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ 
  isOpen, 
  onClose,
  className,
  testId
}) => {
  if (!isOpen) return null;
  
  const shortcutCategories: ShortcutCategory[] = [
    {
      title: "Navigation",
      shortcuts: [
        { key: "←", description: "Navigate to previous item" },
        { key: "→", description: "Navigate to next item" },
        { key: "Home", description: "Go to first item" },
        { key: "End", description: "Go to last item" },
        { key: "Esc", description: "Close modal or cancel operation" }
      ]
    },
    {
      title: "Selection",
      shortcuts: [
        { key: "Space", description: "Select/deselect item" },
        { key: "Shift + Click", description: "Select range of items" },
        { key: "Ctrl/⌘ + Click", description: "Toggle item selection" },
        { key: "Ctrl/⌘ + A", description: "Select all items" },
        { key: "Esc", description: "Cancel selection" }
      ]
    },
    {
      title: "File Operations",
      shortcuts: [
        { key: "Ctrl/⌘ + C", description: "Copy selected items" },
        { key: "Ctrl/⌘ + X", description: "Cut selected items" },
        { key: "Ctrl/⌘ + V", description: "Paste items" },
        { key: "Delete / Backspace", description: "Delete selected items" },
        { key: "Ctrl/⌘ + Z", description: "Undo last operation" },
        { key: "F2", description: "Rename selected item" }
      ]
    },
    {
      title: "Media Viewer",
      shortcuts: [
        { key: "Space", description: "Play/pause media" },
        { key: "+", description: "Zoom in" },
        { key: "-", description: "Zoom out" },
        { key: "0", description: "Reset zoom" },
        { key: "R", description: "Rotate image" },
        { key: "M", description: "Mute/unmute" },
        { key: "F", description: "Toggle fullscreen" }
      ]
    },
    {
      title: "Organization",
      shortcuts: [
        { key: "T", description: "Add tags to selected items" },
        { key: "Ctrl/⌘ + S", description: "Save changes" },
        { key: "Ctrl/⌘ + F", description: "Search" },
        { key: "Alt + N", description: "Create new folder" },
        { key: "Alt + C", description: "Create new collection" }
      ]
    },
    {
      title: "View",
      shortcuts: [
        { key: "Ctrl/⌘ + 1", description: "Grid view" },
        { key: "Ctrl/⌘ + 2", description: "List view" },
        { key: "Ctrl/⌘ + +", description: "Increase thumbnail size" },
        { key: "Ctrl/⌘ + -", description: "Decrease thumbnail size" },
        { key: "Ctrl/⌘ + 0", description: "Reset thumbnail size" }
      ]
    }
  ];
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 ${className || ''}`}
      data-testid={testId}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center">
            <Keyboard size={20} className="mr-2" />
            Keyboard Shortcuts
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortcutCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-md font-medium text-gray-800 border-b border-gray-200 pb-2">
                  {category.title}
                </h3>
                <table className="w-full">
                  <tbody>
                    {category.shortcuts.map((shortcut, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2 pr-4 text-sm font-mono bg-gray-100 rounded px-2 mr-2 whitespace-nowrap">
                          {shortcut.key}
                        </td>
                        <td className="py-2 text-sm text-gray-700">
                          {shortcut.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Notes:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use Ctrl on Windows/Linux, ⌘ (Cmd) on Mac</li>
              <li>• Some shortcuts may vary depending on the current context</li>
              <li>• Press ? or F1 to open this shortcuts dialog anytime</li>
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            type="button"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { key, ctrlKey, altKey, shiftKey } = event;
      
      // Validate shortcuts array exists
      if (!shortcuts || !Array.isArray(shortcuts)) return;
      
      for (const shortcut of shortcuts) {
        // Skip if shortcut or shortcut.key is undefined, null, or empty
        if (!shortcut || !shortcut.key || typeof shortcut.key !== 'string') continue;
        
        const keyMatch = shortcut.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === ctrlKey;
        const altMatch = !!shortcut.alt === altKey;
        const shiftMatch = !!shortcut.shift === shiftKey;
        
        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// ============================================================================
// MAIN KEYBOARD SHORTCUTS COMPONENT
// ============================================================================

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ children }) => {
  return <>{children}</>;
};

export { KeyboardShortcutsModal };
export default KeyboardShortcuts;