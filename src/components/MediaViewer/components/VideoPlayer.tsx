/**
 * VideoPlayer Component
 * Handles video playback with controls
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import type { MediaItem } from '../../../types';
import type { MediaPlayerState, MediaPlayerAction } from '../reducers';

interface VideoPlayerProps {
  item: MediaItem;
  state: MediaPlayerState;
  dispatch: React.Dispatch<MediaPlayerAction>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ item, state, dispatch }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sync video element with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (state.isPlaying) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
    
    video.muted = state.isMuted;
    video.volume = state.volume;
    
    if (Math.abs(video.currentTime - state.currentTime) > 1) {
      video.currentTime = state.currentTime;
    }
  }, [state.isPlaying, state.isMuted, state.volume, state.currentTime]);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_TIME', payload: video.currentTime });
    };
    
    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration });
    };
    
    const handlePlay = () => {
      dispatch({ type: 'PLAY' });
    };
    
    const handlePause = () => {
      dispatch({ type: 'PAUSE' });
    };
    
    const handleEnded = () => {
      dispatch({ type: 'PAUSE' });
      dispatch({ type: 'SET_TIME', payload: 0 });
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [dispatch]);
  
  // Format time for display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);
  
  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    dispatch({ type: 'SET_TIME', payload: time });
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-black"
    >
      {/* Video Element */}
      <div className="flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={item.url}
          className="max-w-full max-h-full"
          onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
        />
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="flex items-center space-x-2 text-white text-sm">
            <span>{formatTime(state.currentTime)}</span>
            <input
              type="range"
              min="0"
              max={state.duration || 0}
              value={state.currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3B82F6 ${(state.currentTime / (state.duration || 1)) * 100}%, #4B5563 0%)`
              }}
            />
            <span>{formatTime(state.duration)}</span>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Skip Back */}
              <button
                onClick={() => dispatch({ type: 'SEEK_BACKWARD' })}
                className="p-2 text-white hover:text-blue-400 transition-colors"
                title="Rewind 10s"
              >
                <SkipBack size={20} />
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                title={state.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {state.isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              {/* Skip Forward */}
              <button
                onClick={() => dispatch({ type: 'SEEK_FORWARD' })}
                className="p-2 text-white hover:text-blue-400 transition-colors"
                title="Forward 10s"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Volume */}
              <button
                onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
                className="p-2 text-white hover:text-blue-400 transition-colors"
                title="Toggle Mute (M)"
              >
                {state.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={state.isMuted ? 0 : state.volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 ${(state.isMuted ? 0 : state.volume) * 100}%, #4B5563 0%)`
                }}
              />
              
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-blue-400 transition-colors"
                title="Fullscreen (F)"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoPlayer);