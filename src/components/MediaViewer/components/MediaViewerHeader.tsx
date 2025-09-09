/**
 * MediaViewerHeader Component
 * Header bar for the media viewer with title and navigation
 */

import React from 'react';
import { X, ArrowLeft, ArrowRight, Info, Download, Share } from 'lucide-react';
import type { MediaItem } from '../../../types';
import type { MediaViewerHeaderProps } from '../types';

const MediaViewerHeader: React.FC<MediaViewerHeaderProps> = ({
  item,
  onClose,
  onNavigate,
  onShowDetails,
  canNavigateNext = true,
  canNavigatePrevious = true,
  currentIndex,
  totalCount
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Title */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <h2 className="text-white text-lg font-medium truncate max-w-md">
            {item.name}
          </h2>
          <span className="text-white/60 text-sm">
            {item.size}
          </span>
        </div>
        
        {/* Center Section - Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => canNavigatePrevious && onNavigate('prev')}
            className={`p-2 rounded transition-colors ${
              canNavigatePrevious 
                ? 'text-white/80 hover:text-white hover:bg-white/10 cursor-pointer' 
                : 'text-white/30 cursor-not-allowed'
            }`}
            title="Previous (←)"
            aria-label="Previous item"
            disabled={!canNavigatePrevious}
          >
            <ArrowLeft size={20} />
          </button>
          
          {/* Position Counter */}
          {currentIndex !== undefined && totalCount !== undefined && totalCount > 1 && (
            <div className="text-white/80 text-sm font-medium px-2 py-1 rounded bg-white/10 backdrop-blur-sm">
              {currentIndex} of {totalCount}
            </div>
          )}
          
          <button
            onClick={() => canNavigateNext && onNavigate('next')}
            className={`p-2 rounded transition-colors ${
              canNavigateNext 
                ? 'text-white/80 hover:text-white hover:bg-white/10 cursor-pointer' 
                : 'text-white/30 cursor-not-allowed'
            }`}
            title="Next (→)"
            aria-label="Next item"
            disabled={!canNavigateNext}
          >
            <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1">
          {onShowDetails && (
            <button
              onClick={onShowDetails}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Show details (I)"
              aria-label="Show details"
            >
              <Info size={20} />
            </button>
          )}
          
          <button
            onClick={() => window.open(item.url, '_blank')}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Download"
            aria-label="Download"
          >
            <Download size={20} />
          </button>
          
          <button
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Share"
            aria-label="Share"
          >
            <Share size={20} />
          </button>
          
          <div className="w-px h-6 bg-white/20 mx-1" />
          
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Close (Esc)"
            aria-label="Close viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaViewerHeader);