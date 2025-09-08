/**
 * MediaViewerError Component
 * Error state for media viewer
 */

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface MediaViewerErrorProps {
  error?: { message?: string } | null;
  onClose: () => void;
  onRetry?: () => void;
}

const MediaViewerError: React.FC<MediaViewerErrorProps> = ({ error, onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          
          {/* Error Title */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Media
          </h3>
          
          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {error?.message || 'An error occurred while loading the media. Please try again.'}
          </p>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                aria-label="Retry loading"
              >
                <RefreshCw size={18} className="mr-2" />
                Retry
              </button>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
              aria-label="Close viewer"
            >
              <X size={18} className="mr-2" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MediaViewerError);