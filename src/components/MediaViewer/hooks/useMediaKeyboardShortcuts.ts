/**
 * Custom hook for handling keyboard shortcuts in MediaViewer
 */

import { useEffect, useRef } from 'react';

export type KeyboardHandlers = {
  [key: string]: () => void;
};

export const useMediaKeyboardShortcuts = (handlers: KeyboardHandlers) => {
  const handlersRef = useRef(handlers);
  
  // Update handlers ref to avoid stale closures
  useEffect(() => {
    handlersRef.current = handlers;
  });
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Check for modifier keys
      const key = event.key;
      const withCtrl = event.ctrlKey || event.metaKey;
      const withShift = event.shiftKey;
      const withAlt = event.altKey;
      
      // Build the key combination string
      let keyCombo = '';
      if (withCtrl) keyCombo += 'Ctrl+';
      if (withShift) keyCombo += 'Shift+';
      if (withAlt) keyCombo += 'Alt+';
      keyCombo += key;
      
      // Try to find a handler for the key combination
      const handler = handlersRef.current[keyCombo] || handlersRef.current[key];
      
      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        handler();
      }
    };
    
    // Use capture phase to ensure we get the event first
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []); // Empty deps array since we use ref for handlers
};