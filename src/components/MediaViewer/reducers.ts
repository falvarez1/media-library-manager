/**
 * Reducers for MediaViewer state management
 */

export interface MediaPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  volume: number;
}

export type MediaPlayerAction = 
  | { type: 'TOGGLE_PLAY' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_MUTE'; payload: boolean }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SEEK_FORWARD'; payload?: number }
  | { type: 'SEEK_BACKWARD'; payload?: number };

export const mediaPlayerReducer = (
  state: MediaPlayerState, 
  action: MediaPlayerAction
): MediaPlayerState => {
  switch (action.type) {
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_MUTE':
      return { ...state, isMuted: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: Math.min(action.payload, state.duration) };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { 
        ...state, 
        volume: action.payload, 
        isMuted: action.payload === 0 
      };
    case 'SEEK_FORWARD':
      return { 
        ...state, 
        currentTime: Math.min(
          state.currentTime + (action.payload || 10), 
          state.duration
        ) 
      };
    case 'SEEK_BACKWARD':
      return { 
        ...state, 
        currentTime: Math.max(
          state.currentTime - (action.payload || 10), 
          0
        ) 
      };
    default:
      return state;
  }
};

export interface ImageViewerState {
  zoom: number;
  rotation: number;
  position: { x: number; y: number };
  isDragging: boolean;
  dragStart: { x: number; y: number };
}

export type ImageViewerAction =
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'ROTATE' }
  | { type: 'SET_ROTATION'; payload: number }
  | { type: 'START_DRAG'; payload: { x: number; y: number } }
  | { type: 'UPDATE_DRAG'; payload: { x: number; y: number } }
  | { type: 'END_DRAG' }
  | { type: 'SET_POSITION'; payload: { x: number; y: number } }
  | { type: 'RESET' };

export const imageViewerReducer = (
  state: ImageViewerState,
  action: ImageViewerAction
): ImageViewerState => {
  switch (action.type) {
    case 'ZOOM_IN':
      return { 
        ...state, 
        zoom: Math.min(state.zoom + 0.25, 5) 
      };
    case 'ZOOM_OUT':
      return { 
        ...state, 
        zoom: Math.max(state.zoom - 0.25, 0.5) 
      };
    case 'SET_ZOOM':
      return { 
        ...state, 
        zoom: Math.max(0.5, Math.min(action.payload, 5)) 
      };
    case 'ROTATE':
      return { 
        ...state, 
        rotation: (state.rotation + 90) % 360 
      };
    case 'SET_ROTATION':
      return { 
        ...state, 
        rotation: action.payload % 360 
      };
    case 'START_DRAG':
      if (state.zoom <= 1) return state;
      return {
        ...state,
        isDragging: true,
        dragStart: {
          x: action.payload.x - state.position.x,
          y: action.payload.y - state.position.y
        }
      };
    case 'UPDATE_DRAG':
      if (!state.isDragging) return state;
      return {
        ...state,
        position: {
          x: action.payload.x - state.dragStart.x,
          y: action.payload.y - state.dragStart.y
        }
      };
    case 'END_DRAG':
      return { 
        ...state, 
        isDragging: false 
      };
    case 'SET_POSITION':
      return { 
        ...state, 
        position: action.payload 
      };
    case 'RESET':
      return {
        zoom: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        isDragging: false,
        dragStart: { x: 0, y: 0 }
      };
    default:
      return state;
  }
};