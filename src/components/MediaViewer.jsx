import { useState, useRef, useEffect } from 'react';
import { 
  X, ArrowLeft, ArrowRight, Info, Edit, Download, Share, 
  Star, Heart, Play, Pause, Volume2, VolumeX, Maximize, 
  RotateCw, ZoomIn, ZoomOut, Printer, 
  ChevronUp, ChevronDown, Loader, SkipBack, SkipForward
} from 'lucide-react';
import { useMediaItem } from '../hooks/useApi';

const MediaViewer = ({
  mediaId,
  onClose,
  onShowDetails,
  onOpenEditor,
  onToggleStar,
  onToggleFavorite,
  onNavigateNext,
  onNavigatePrevious
}) => {
  // Fetch media item data
  const { data: item, loading, error } = useMediaItem(mediaId);
  
  // Media player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Image viewer states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  
  // Handle star toggle
  const handleToggleStar = () => {
    if (onToggleStar) onToggleStar(mediaId);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (onToggleFavorite) onToggleFavorite(mediaId);
  };
  
  // Navigate to previous item
  const goToPrevious = () => {
    if (onNavigatePrevious) {
      onNavigatePrevious(mediaId);
    }
  };
  
  // Navigate to next item
  const goToNext = () => {
    if (onNavigateNext) {
      onNavigateNext(mediaId);
    }
  };
  
  // Reset zoom and position
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };
  
  // Handle zoom in
  const zoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 5));
  };
  
  // Handle zoom out
  const zoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };
  
  // Handle rotation
  const rotateClockwise = () => {
    setRotation((rotation + 90) % 360);
  };
  
  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
    e.preventDefault();
  };
  
  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };
  
  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  // Handle mouse up for panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle key presses for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default behavior for these keys
      const preventDefaultKeys = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Escape'
      ];
      
      if (preventDefaultKeys.includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'r':
          rotateClockwise();
          break;
        case '0':
          resetView();
          break;
        case ' ':
          if (item?.type === 'video' || item?.type === 'audio') {
            togglePlayPause();
          }
          break;
        case 'm':
          if (item?.type === 'video' || item?.type === 'audio') {
            toggleMute();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mediaId, item, zoom, position, rotation, isPlaying, isMuted]);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  // Add event listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Media player controls
  const togglePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (mediaRef.current) {
      mediaRef.current.volume = value;
    }
    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };
  
  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    setCurrentTime(value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = value;
    }
  };
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-90">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="animate-spin text-blue-500" size={40} />
          <p className="text-white">Loading media...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-90">
        <div className="bg-white rounded-lg p-8 max-w-lg">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-3 bg-red-100 text-red-500 rounded-full">
              <X size={28} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Error Loading Media</h3>
            <p className="text-gray-600">{error.message || 'Failed to load media. Please try again later.'}</p>
            <button
              className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no item found
  if (!item) return null;
  
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-90">
      <div 
        ref={containerRef}
        className="relative flex flex-col w-full h-full max-w-full max-h-full"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent">
          <h3 className="font-medium text-white truncate max-w-2xl">{item.name}</h3>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <button
                className={`p-1.5 text-white/80 hover:text-white rounded ${!onNavigatePrevious ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={goToPrevious}
                disabled={!onNavigatePrevious}
                title="Previous (Left Arrow)"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                className={`p-1.5 text-white/80 hover:text-white rounded ${!onNavigateNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={goToNext}
                disabled={!onNavigateNext}
                title="Next (Right Arrow)"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <button 
              className="p-1.5 text-white/80 hover:text-white rounded"
              onClick={onShowDetails}
              title="Show details (i)"
            >
              <Info size={20} />
            </button>
            <button 
              className="p-1.5 text-white/80 hover:text-white rounded"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden"
          onMouseDown={item.type === 'image' ? handleMouseDown : undefined}
          onMouseMove={item.type === 'image' ? handleMouseMove : undefined}
          onMouseUp={item.type === 'image' ? handleMouseUp : undefined}
          onMouseLeave={item.type === 'image' ? handleMouseUp : undefined}
          onWheel={item.type === 'image' ? handleWheel : undefined}
          style={{ cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        >
          {/* Image viewer */}
          {item.type === 'image' && (
            <div 
              className="relative transition-transform duration-100 ease-out"
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              <img 
                src={item.url} 
                alt={item.name} 
                className="max-h-[85vh] max-w-[85vw] object-contain pointer-events-none"
                draggable="false"
              />
            </div>
          )}
          
          {/* Video player */}
          {item.type === 'video' && (
            <div className="relative max-w-full max-h-[85vh] w-auto h-auto">
              <video
                ref={mediaRef}
                src={item.url}
                className="max-h-[85vh] max-w-full"
                onClick={togglePlayPause}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controls={false}
              />
            </div>
          )}
          
          {/* Audio player */}
          {item.type === 'audio' && (
            <div className="relative bg-gray-800 rounded-lg p-8 w-96 max-w-full">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center">
                  <Volume2 size={48} className="text-gray-400" />
                </div>
                <div className="text-white font-medium truncate w-full text-center">
                  {item.name}
                </div>
                <audio
                  ref={mediaRef}
                  src={item.url}
                  className="hidden"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            </div>
          )}
          
          {/* Document viewer */}
          {item.type === 'document' && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full max-h-[85vh] overflow-auto">
              <div className="flex justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-gray-400">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-500 mb-4">{item.size} • {item.metadata?.pages || '?'} pages</p>
                <div className="flex justify-center space-x-3">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center">
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 inline-flex items-center">
                    <Printer size={16} className="mr-2" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Other file types */}
          {!['image', 'video', 'audio', 'document'].includes(item.type) && (
            <div className="flex flex-col items-center justify-center bg-white rounded-lg p-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file text-gray-400">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-lg mt-4">{item.name}</span>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center">
                <Download size={16} className="mr-2" />
                Download
              </button>
            </div>
          )}
        </div>
        
        {/* Image controls */}
        {item.type === 'image' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center space-x-3">
            <button 
              className="p-1 hover:text-blue-400" 
              onClick={zoomOut}
              title="Zoom out (-)"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <button 
              className="p-1 hover:text-blue-400" 
              onClick={zoomIn}
              title="Zoom in (+)"
            >
              <ZoomIn size={20} />
            </button>
            <div className="h-5 border-l border-white/30 mx-1"></div>
            <button 
              className="p-1 hover:text-blue-400" 
              onClick={rotateClockwise}
              title="Rotate (r)"
            >
              <RotateCw size={20} />
            </button>
            <div className="h-5 border-l border-white/30 mx-1"></div>
            <button 
              className="p-1 hover:text-blue-400" 
              onClick={resetView}
              title="Reset view (0)"
            >
              <span className="text-sm">Reset</span>
            </button>
          </div>
        )}
        
        {/* Video and audio controls */}
        {(item.type === 'video' || item.type === 'audio') && (
          <div className="absolute bottom-4 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 text-white">
            <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
              {/* Progress bar */}
              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 appearance-none bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to right, #3B82F6 ${(currentTime / (duration || 1)) * 100}%, transparent 0)`,
                  }}
                />
                <span className="text-sm">{formatTime(duration)}</span>
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    className="p-1 hover:text-blue-400"
                    onClick={() => {
                      if (mediaRef.current) {
                        mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10);
                      }
                    }}
                    title="Rewind 10 seconds"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    className="p-2 hover:text-blue-400 bg-white/10 rounded-full"
                    onClick={togglePlayPause}
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button
                    className="p-1 hover:text-blue-400"
                    onClick={() => {
                      if (mediaRef.current) {
                        mediaRef.current.currentTime = Math.min(
                          duration || 0,
                          mediaRef.current.currentTime + 10
                        );
                      }
                    }}
                    title="Forward 10 seconds"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-1 ${isMuted ? 'text-blue-400' : 'hover:text-blue-400'}`}
                      onClick={toggleMute}
                      title="Toggle mute (m)"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1.5 appearance-none bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                      style={{
                        backgroundImage: `linear-gradient(to right, #3B82F6 ${volume * 100}%, transparent 0)`,
                      }}
                    />
                  </div>
                  
                  <button
                    className="p-1 hover:text-blue-400"
                    onClick={toggleFullscreen}
                    title="Toggle fullscreen (f)"
                  >
                    <Maximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer actions */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex space-x-2">
            {item.type === 'image' && (
              <button 
                className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/60"
                onClick={onOpenEditor}
                title="Edit image"
              >
                <Edit size={18} />
              </button>
            )}
            
            <button 
              className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/60"
              title="Download"
            >
              <Download size={18} />
            </button>
            
            <button 
              className="p-2 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/60"
              title="Share"
            >
              <Share size={18} />
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/60 ${
                item.starred ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
              onClick={handleToggleStar}
              title="Star"
            >
              <Star size={18} />
            </button>
            
            <button 
              className={`p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/60 ${
                item.favorited ? 'text-red-500' : 'text-white hover:text-red-500'
              }`}
              onClick={handleToggleFavorite}
              title="Favorite"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;