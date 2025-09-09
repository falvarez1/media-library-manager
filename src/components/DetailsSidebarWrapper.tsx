'use client';

import React, { useEffect } from 'react';
import { useUIState } from '../contexts/UIStateContext';
import { useNavigation } from '../contexts/NavigationContext';
import DetailsSidebar from './DetailsSidebar';
import { MediaId } from '../types';

/**
 * Wrapper component that bridges context values to DetailsSidebar props
 * This allows DetailsSidebar to work with both context and prop-based approaches
 */
export const DetailsSidebarWrapper: React.FC = () => {
  const { showDetails, setDetailsVisible } = useUIState();
  const { selectedMediaId } = useNavigation();

  // Track state changes
  useEffect(() => {
    // State change: showDetails and selectedMediaId
  }, [showDetails, selectedMediaId]);

  if (!showDetails || !selectedMediaId) {
    return null;
  }

  return (
    <DetailsSidebar
      mediaId={selectedMediaId as MediaId}
      onClose={() => setDetailsVisible(false)}
      onOpenEditor={() => {
        // TODO: Implement editor opening
        console.log('Open editor for media:', selectedMediaId);
      }}
      onToggleStar={async () => {
        // TODO: Implement star toggle
        console.log('Toggle star for media:', selectedMediaId);
      }}
      onToggleFavorite={async () => {
        // TODO: Implement favorite toggle
        console.log('Toggle favorite for media:', selectedMediaId);
      }}
    />
  );
};

export default DetailsSidebarWrapper;