/**
 * AudioPlayer Component
 * Handles audio playback with controls
 */

import React, { useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Music } from 'lucide-react';
import type { MediaItem } from '../../../types';
import type { MediaPlayerState, MediaPlayerAction } from '../reducers';

interface AudioPlayerProps {
  item: MediaItem;
  state: MediaPlayerState;
  dispatch: React.Dispatch<MediaPlayerAction>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ item, state, dispatch }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (state.isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
    
    audio.muted = state.isMuted;
    audio.volume = state.volume;
    
    if (Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [state.isPlaying, state.isMuted, state.volume, state.currentTime]);
  
  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    };
    
    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
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
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [dispatch]);
  
  // Format time for display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
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
    <div className="flex items-center justify-center w-full h-full">
      <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={item.url}
          className="hidden"
        />
        
        {/* Album Art Placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
            <Music size={64} className="text-gray-600" />
          </div>
        </div>
        
        {/* Track Info */}
        <div className="text-center mb-6">
          <h3 className="text-white text-lg font-medium truncate">{item.name}</h3>
          <p className="text-gray-400 text-sm mt-1">{item.size}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={state.duration || 0}
            value={state.currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 ${(state.currentTime / (state.duration || 1)) * 100}%, #374151 0%)`
            }}
          />
          <div className="flex justify-between text-gray-400 text-xs mt-1">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {/* Skip Back */}
          <button
            onClick={() => dispatch({ type: 'SEEK_BACKWARD' })}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Rewind 10s"
          >
            <SkipBack size={24} />
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
            className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
            title={state.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {state.isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          
          {/* Skip Forward */}
          <button
            onClick={() => dispatch({ type: 'SEEK_FORWARD' })}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Forward 10s"
          >
            <SkipForward size={24} />
          </button>
        </div>
        
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
            className="p-1 text-gray-400 hover:text-white transition-colors"
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
            className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 ${(state.isMuted ? 0 : state.volume) * 100}%, #374151 0%)`
            }}
          />
          
          <span className="text-gray-400 text-xs w-10 text-right">
            {Math.round((state.isMuted ? 0 : state.volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AudioPlayer);