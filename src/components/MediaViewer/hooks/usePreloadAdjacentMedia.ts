/**
 * Custom hook for preloading adjacent media items for smooth navigation
 */

import { useEffect, useRef } from 'react';
import type { MediaId } from '../../../types';

export const usePreloadAdjacentMedia = (
  currentId: MediaId,
  onNavigateNext?: () => void,
  onNavigatePrevious?: () => void
) => {
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map());
  
  useEffect(() => {
    // This is a simplified version - in a real implementation,
    // you would need to get the actual next/prev media IDs
    // from the parent component or context
    
    const preloadImage = (url: string): HTMLImageElement => {
      if (preloadedImages.current.has(url)) {
        return preloadedImages.current.get(url)!;
      }
      
      const img = new Image();
      img.src = url;
      preloadedImages.current.set(url, img);
      
      // Clean up old preloaded images if we have too many
      if (preloadedImages.current.size > 10) {
        const firstKey = preloadedImages.current.keys().next().value;
        if (firstKey) {
          preloadedImages.current.delete(firstKey);
        }
      }
      
      return img;
    };
    
    // In a real implementation, you would:
    // 1. Get the list of media items from context
    // 2. Find the current item's index
    // 3. Preload the next and previous items
    
    // Cleanup function
    return () => {
      // Optionally clear preloaded images on unmount
      // preloadedImages.current.clear();
    };
  }, [currentId]);
  
  return preloadedImages.current;
};