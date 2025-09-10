/**
 * MediaViewerFooter Component
 * Footer bar with actions for star, favorite, and edit
 */

import React from 'react';
import { Star, Heart, Edit, Share } from 'lucide-react';
import type { MediaViewerFooterProps } from '../types';

const MediaViewerFooter: React.FC<MediaViewerFooterProps> = ({
  item,
  onToggleStar,
  onToggleFavorite,
  onOpenEditor
}) => {
  // Don't show footer for video/audio as they have their own controls
  if (item.type === 'video' || item.type === 'audio') {
    return null;
  }
  
  return (
    <div className="absolute bottom-4 left-4 right-4 z-10">
      <div className="flex items-center justify-between">
        {/* Left Actions */}
        <div className="flex items-center space-x-2">
          {item.type === 'image' && (
            <button
              onClick={onOpenEditor}
              className="px-3 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors flex items-center"
              title="Edit image"
              aria-label="Edit image"
            >
              <Edit size={18} className="mr-2" />
              Edit
            </button>
          )}
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleStar}
            className={`p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors ${
              item.starred ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
            }`}
            title={item.starred ? 'Remove star' : 'Add star'}
            aria-label={item.starred ? 'Remove star' : 'Add star'}
            aria-pressed={item.starred}
          >
            <Star size={20} fill={item.starred ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={onToggleFavorite}
            className={`p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors ${
              item.favorited ? 'text-red-500' : 'text-white hover:text-red-500'
            }`}
            title={item.favorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={item.favorited ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={item.favorited}
          >
            <Heart size={20} fill={item.favorited ? 'currentColor' : 'none'} />
          </button>
          
          <button
            className="p-2 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors"
            title="Share"
            aria-label="Share"
          >
            <Share size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaViewerFooter);