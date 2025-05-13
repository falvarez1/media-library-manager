import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

// Keyboard shortcuts modal - shows available shortcuts
export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const shortcutCategories = [
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center">
            <Keyboard size={20} className="mr-2" />
            Keyboard Shortcuts
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
                        <td className="py-2 pr-4">
                          {shortcut.key.split('+').map((key, keyIdx) => (
                            <span key={keyIdx}>
                              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono">
                                {key.trim()}
                              </kbd>
                              {keyIdx < shortcut.key.split('+').length - 1 && (
                                <span className="mx-1 text-gray-400">+</span>
                              )}
                            </span>
                          ))}
                        </td>
                        <td className="py-2 text-gray-600 text-sm">
                          {shortcut.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono">?</kbd> anytime to show this shortcuts reference
        </div>
      </div>
    </div>
  );
};

// Hook for implementing keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if input elements are focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      
      // Check if the key combo matches any of our shortcuts
      for (const shortcut of shortcuts) {
        if (
          shortcut.key.toLowerCase() === key &&
          Boolean(shortcut.ctrl) === ctrl &&
          Boolean(shortcut.shift) === shift &&
          Boolean(shortcut.alt) === alt
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Main component that can be added to the app to enable keyboard shortcuts
const KeyboardShortcuts = ({ children }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Register global shortcut for showing the shortcuts dialog
  useKeyboardShortcuts([
    {
      key: '?',
      action: () => setShowShortcuts(true)
    }
  ]);
  
  return (
    <>
      {children}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </>
  );
};

export default KeyboardShortcuts;