/**
 * MediaViewerSkeleton Component
 * Loading skeleton for media viewer
 */

import React from 'react';
import { Loader } from 'lucide-react';

const MediaViewerSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader className="animate-spin text-blue-500" size={48} />
        <div className="space-y-2 text-center">
          <p className="text-white text-lg">Loading media...</p>
          <p className="text-white/60 text-sm">Please wait</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaViewerSkeleton);