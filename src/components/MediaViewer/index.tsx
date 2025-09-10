/**
 * Enhanced MediaViewer Component
 * 
 * A performant, accessible media viewer with support for images, videos, audio, and documents.
 * Features include zoom, pan, playback controls, and keyboard shortcuts.
 */

import React, { useReducer, useCallback, useMemo, Suspense, lazy } from 'react';
import { useMediaItem } from '../../hooks/useApi';
import { useMediaKeyboardShortcuts } from './hooks/useMediaKeyboardShortcuts';
import { usePreloadAdjacentMedia } from './hooks/usePreloadAdjacentMedia';
import { mediaPlayerReducer, imageViewerReducer } from './reducers';
import MediaViewerHeader from './components/MediaViewerHeader';
import MediaViewerFooter from './components/MediaViewerFooter';
import MediaViewerSkeleton from './components/MediaViewerSkeleton';
import MediaViewerError from './components/MediaViewerError';
import type { MediaViewerProps } from './types';

// Lazy load media type components for better performance
const ImageViewer = lazy(() => import('./components/ImageViewer'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer'));
const DocumentViewer = lazy(() => import('./components/DocumentViewer'));

const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaId,
  onClose,
  onShowDetails,
  onOpenEditor,
  onNavigateNext,
  onNavigatePrevious,
  onToggleStar,
  onToggleFavorite,
  canNavigateNext = true,
  canNavigatePrevious = true,
  currentIndex,
  totalCount
}) => {
  // Fetch media item data
  const { data: item, loading, error } = useMediaItem(mediaId);
  const retry = () => window.location.reload(); // Simple retry for now
  
  // Use reducers for complex state management
  const [playerState, playerDispatch] = useReducer(mediaPlayerReducer, {
    isPlaying: false,
    isMuted: false,
    duration: 0,
    currentTime: 0,
    volume: 1
  });
  
  const [imageState, imageDispatch] = useReducer(imageViewerReducer, {
    zoom: 1,
    rotation: 0,
    position: { x: 0, y: 0 },
    isDragging: false,
    dragStart: { x: 0, y: 0 }
  });
  
  // Preload adjacent media for smooth navigation
  usePreloadAdjacentMedia(mediaId);
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  
  const handleNavigate = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && onNavigateNext && canNavigateNext) {
      onNavigateNext();
    } else if (direction === 'prev' && onNavigatePrevious && canNavigatePrevious) {
      onNavigatePrevious();
    }
  }, [onNavigateNext, onNavigatePrevious, canNavigateNext, canNavigatePrevious]);
  
  // Setup keyboard shortcuts
  const keyboardHandlers = useMemo(() => ({
    Escape: handleClose,
    ArrowLeft: () => canNavigatePrevious && handleNavigate('prev'),
    ArrowRight: () => canNavigateNext && handleNavigate('next'),
    '+': () => imageDispatch({ type: 'ZOOM_IN' }),
    '-': () => imageDispatch({ type: 'ZOOM_OUT' }),
    'r': () => imageDispatch({ type: 'ROTATE' }),
    '0': () => imageDispatch({ type: 'RESET' }),
    ' ': () => {
      if (item?.type === 'video' || item?.type === 'audio') {
        playerDispatch({ type: 'TOGGLE_PLAY' });
      }
    },
    'm': () => {
      if (item?.type === 'video' || item?.type === 'audio') {
        playerDispatch({ type: 'TOGGLE_MUTE' });
      }
    }
  }), [handleClose, handleNavigate, item?.type, canNavigatePrevious, canNavigateNext]);
  
  useMediaKeyboardShortcuts(keyboardHandlers);
  
  // Show loading state
  if (loading) {
    return <MediaViewerSkeleton />;
  }
  
  // Show error state
  if (error || !item) {
    return (
      <MediaViewerError 
        error={error} 
        onClose={handleClose}
        onRetry={retry}
      />
    );
  }
  
  // Render the appropriate viewer based on media type
  const renderMediaContent = () => {
    switch (item.type) {
      case 'image':
        return (
          <ImageViewer
            item={item}
            state={imageState}
            dispatch={imageDispatch}
          />
        );
      case 'video':
        return (
          <VideoPlayer
            item={item}
            state={playerState}
            dispatch={playerDispatch}
          />
        );
      case 'audio':
        return (
          <AudioPlayer
            item={item}
            state={playerState}
            dispatch={playerDispatch}
          />
        );
      case 'document':
        return (
          <DocumentViewer
            item={item}
            onDownload={() => window.open(item.url, '_blank')}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Unsupported media type</p>
          </div>
        );
    }
  };
  
  // Render the viewer
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-black/95 backdrop-blur-sm">
      <MediaViewerHeader
        item={item}
        onClose={handleClose}
        onNavigate={handleNavigate}
        onShowDetails={onShowDetails}
        canNavigateNext={canNavigateNext}
        canNavigatePrevious={canNavigatePrevious}
        currentIndex={currentIndex}
        totalCount={totalCount}
      />
      
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<MediaViewerSkeleton />}>
          {renderMediaContent()}
        </Suspense>
      </div>
      
      <MediaViewerFooter
        item={item}
        onToggleStar={() => onToggleStar?.(mediaId)}
        onToggleFavorite={() => onToggleFavorite?.(mediaId)}
        onOpenEditor={() => onOpenEditor?.(mediaId)}
        playerState={item.type === 'video' || item.type === 'audio' ? playerState : undefined}
        imageState={item.type === 'image' ? imageState : undefined}
        onPlayerDispatch={playerDispatch}
        onImageDispatch={imageDispatch}
      />
    </div>
  );
};

// Export with error boundary wrapper
export default React.memo(MediaViewer);