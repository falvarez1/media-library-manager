/**
 * DocumentViewer Component
 * Handles document preview and download
 */

import React from 'react';
import { FileText, Download, Printer, ExternalLink } from 'lucide-react';
import type { MediaItem } from '../../../types';

interface DocumentViewerProps {
  item: MediaItem;
  onDownload?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ item, onDownload }) => {
  const isPDF = item.name.toLowerCase().endsWith('.pdf');
  const isText = /\.(txt|md|json|xml|html|css|js|ts|tsx|jsx)$/i.test(item.name);
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Create a download link
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handlePrint = () => {
    window.open(item.url, '_blank')?.print();
  };
  
  const handleOpenInNewTab = () => {
    window.open(item.url, '_blank');
  };
  
  // Get file extension
  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };
  
  const extension = getFileExtension(item.name);
  
  return (
    <div className="flex items-center justify-center w-full h-full p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {/* Document Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
            <FileText size={48} className="text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">{extension}</span>
          </div>
        </div>
        
        {/* Document Info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>{item.size}</span>
            {item.metadata?.pages && (
              <>
                <span>•</span>
                <span>{item.metadata.pages} pages</span>
              </>
            )}
            {item.metadata?.modifiedAt && (
              <>
                <span>•</span>
                <span>Modified: {new Date(item.metadata.modifiedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Preview Area */}
        {isPDF && (
          <div className="mb-6 border rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <iframe
              src={`${item.url}#toolbar=0`}
              className="w-full h-full"
              title={item.name}
            />
          </div>
        )}
        
        {isText && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
            <p className="text-sm text-gray-600 font-mono">
              {/* In a real app, you'd fetch and display the text content */}
              Preview not available. Click "Open" to view the full document.
            </p>
          </div>
        )}
        
        {!isPDF && !isText && (
          <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Preview not available for this file type.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              You can download or open the file to view it.
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            Download
          </button>
          
          <button
            onClick={handleOpenInNewTab}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
          >
            <ExternalLink size={18} className="mr-2" />
            Open
          </button>
          
          {isPDF && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            >
              <Printer size={18} className="mr-2" />
              Print
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DocumentViewer);