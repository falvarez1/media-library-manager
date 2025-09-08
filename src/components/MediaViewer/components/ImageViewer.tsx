/**
 * ImageViewer Component
 * Handles image display with zoom, pan, and rotation capabilities
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize } from 'lucide-react';
import type { MediaItem } from '../../../types';
import type { ImageViewerState, ImageViewerAction } from '../reducers';

interface ImageViewerProps {
  item: MediaItem;
  state: ImageViewerState;
  dispatch: React.Dispatch<ImageViewerAction>;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ item, state, dispatch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      dispatch({ type: 'ZOOM_IN' });
    } else {
      dispatch({ type: 'ZOOM_OUT' });
    }
  }, [dispatch]);
  
  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state.zoom > 1) {
      e.preventDefault();
      dispatch({ 
        type: 'START_DRAG', 
        payload: { x: e.clientX, y: e.clientY } 
      });
    }
  }, [state.zoom, dispatch]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (state.isDragging) {
      dispatch({ 
        type: 'UPDATE_DRAG', 
        payload: { x: e.clientX, y: e.clientY } 
      });
    }
  }, [state.isDragging, dispatch]);
  
  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
  }, [dispatch]);
  
  // Handle touch events for mobile
  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && state.zoom > 1) {
      // Single touch for panning
      const touch = e.touches[0];
      dispatch({ 
        type: 'START_DRAG', 
        payload: { x: touch.clientX, y: touch.clientY } 
      });
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance
      };
    }
  }, [state.zoom, dispatch]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && state.isDragging) {
      const touch = e.touches[0];
      dispatch({ 
        type: 'UPDATE_DRAG', 
        payload: { x: touch.clientX, y: touch.clientY } 
      });
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / touchStartRef.current.distance;
      dispatch({ 
        type: 'SET_ZOOM', 
        payload: state.zoom * scale 
      });
      touchStartRef.current.distance = distance;
    }
  }, [state.isDragging, state.zoom, dispatch]);
  
  const handleTouchEnd = useCallback(() => {
    dispatch({ type: 'END_DRAG' });
    touchStartRef.current = null;
  }, [dispatch]);
  
  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Handle fullscreen state changes
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);
  
  // Dynamic styles for transform
  const imageStyle: React.CSSProperties = {
    transform: `translate(${state.position.x}px, ${state.position.y}px) scale(${state.zoom}) rotate(${state.rotation}deg)`,
    transition: state.isDragging ? 'none' : 'transform 100ms ease-out',
    transformOrigin: 'center',
    willChange: 'transform',
    cursor: state.isDragging ? 'grabbing' : state.zoom > 1 ? 'grab' : 'default',
    userSelect: 'none',
    maxWidth: '90vw',
    maxHeight: '85vh',
    objectFit: 'contain'
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-800 rounded w-96 h-96" />
        </div>
      )}
      
      {/* Error state */}
      {imageError && (
        <div className="text-white text-center">
          <p>Failed to load image</p>
          <button 
            onClick={() => setImageError(false)}
            className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Image */}
      <img
        ref={imageRef}
        src={item.url}
        alt={item.name}
        style={imageStyle}
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        className={imageLoaded ? 'opacity-100' : 'opacity-0'}
      />
      
      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-3">
        <button
          onClick={() => dispatch({ type: 'ZOOM_OUT' })}
          className="p-1.5 text-white hover:text-blue-400 transition-colors"
          title="Zoom out (-)"
        >
          <ZoomOut size={20} />
        </button>
        
        <span className="text-white text-sm min-w-[3rem] text-center">
          {Math.round(state.zoom * 100)}%
        </span>
        
        <button
          onClick={() => dispatch({ type: 'ZOOM_IN' })}
          className="p-1.5 text-white hover:text-blue-400 transition-colors"
          title="Zoom in (+)"
        >
          <ZoomIn size={20} />
        </button>
        
        <div className="w-px h-5 bg-white/30" />
        
        <button
          onClick={() => dispatch({ type: 'ROTATE' })}
          className="p-1.5 text-white hover:text-blue-400 transition-colors"
          title="Rotate (R)"
        >
          <RotateCw size={20} />
        </button>
        
        <div className="w-px h-5 bg-white/30" />
        
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="px-2 py-1 text-white text-sm hover:text-blue-400 transition-colors"
          title="Reset (0)"
        >
          Reset
        </button>
        
        <div className="w-px h-5 bg-white/30" />
        
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-white hover:text-blue-400 transition-colors"
          title="Fullscreen (F)"
        >
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ImageViewer);