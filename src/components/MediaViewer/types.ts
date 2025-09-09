/**
 * Type definitions for MediaViewer components
 */

import type { MediaId, MediaItem } from '../../types';

export interface MediaViewerProps {
  mediaId: MediaId;
  onClose: () => void;
  onShowDetails?: () => void;
  onOpenEditor?: (mediaId: MediaId) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onToggleStar?: (mediaId: MediaId) => void;
  onToggleFavorite?: (mediaId: MediaId) => void;
  canNavigateNext?: boolean;
  canNavigatePrevious?: boolean;
}

export interface MediaViewerHeaderProps {
  item: MediaItem;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  onShowDetails?: () => void;
  canNavigateNext?: boolean;
  canNavigatePrevious?: boolean;
}

export interface MediaViewerFooterProps {
  item: MediaItem;
  onToggleStar: () => void;
  onToggleFavorite: () => void;
  onOpenEditor: () => void;
  playerState?: any;
  imageState?: any;
  onPlayerDispatch?: React.Dispatch<any>;
  onImageDispatch?: React.Dispatch<any>;
}

export interface Position {
  x: number;
  y: number;
}

export interface MediaControlsProps {
  type: 'image' | 'video' | 'audio';
  onAction: (action: string) => void;
}