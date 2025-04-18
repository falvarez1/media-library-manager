import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Info, Edit, Download, Share, Star, Heart, Play } from 'lucide-react';

// Mock data (in a real app, this would come from props or context)
const mockMedia = [
  { 
    id: '1', 
    type: 'image', 
    name: 'product-hero.jpg', 
    url: '/api/placeholder/800/600',
    starred: true,
    favorited: true
  },
  { 
    id: '2', 
    type: 'image', 
    name: 'team-photo.jpg', 
    url: '/api/placeholder/800/600',
    starred: false,
    favorited: false
  },
  { 
    id: '3', 
    type: 'video', 
    name: 'product-tutorial.mp4', 
    url: '#',
    starred: false,
    favorited: false
  },
  { 
    id: '4', 
    type: 'document', 
    name: 'annual-report-2024.pdf', 
    url: '#',
    starred: true,
    favorited: false
  }
];

const QuickView = ({ 
  mediaId, 
  onClose, 
  onShowDetails,
  onOpenEditor,
  onToggleStar,
  onToggleFavorite
}) => {
  // In a real app, we would fetch the media item by ID
  const item = mockMedia.find(m => m.id === mediaId);
  
  // Find previous and next items in the collection for navigation
  const currentIndex = mockMedia.findIndex(m => m.id === mediaId);
  const previousItem = currentIndex > 0 ? mockMedia[currentIndex - 1] : null;
  const nextItem = currentIndex < mockMedia.length - 1 ? mockMedia[currentIndex + 1] : null;
  
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
    if (previousItem) {
      // In a real app, you would use a callback to change the current item
      console.log('Navigate to previous item:', previousItem.id);
    }
  };
  
  // Navigate to next item
  const goToNext = () => {
    if (nextItem) {
      // In a real app, you would use a callback to change the current item
      console.log('Navigate to next item:', nextItem.id);
    }
  };
  
  // If no item found
  if (!item) return null;
  
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] flex flex-col w-full mx-4">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="font-medium truncate max-w-lg">{item.name}</h3>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <button 
                className={`p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded ${!previousItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={goToPrevious}
                disabled={!previousItem}
              >
                <ArrowLeft size={18} />
              </button>
              <button 
                className={`p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded ${!nextItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={goToNext}
                disabled={!nextItem}
              >
                <ArrowRight size={18} />
              </button>
            </div>
            <button 
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              onClick={onShowDetails}
              title="Show details"
            >
              <Info size={18} />
            </button>
            <button 
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
          {(() => {
            if (item.type === 'image') {
              return (
                <div className="relative">
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="max-h-[70vh] object-contain"
                  />
                </div>
              );
            } else if (item.type === 'video') {
              return (
                <div className="relative flex items-center justify-center">
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center" style={{ width: '800px', maxWidth: '100%' }}>
                    <button className="p-4 bg-white bg-opacity-75 rounded-full shadow">
                      <Play size={32} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              );
            } else if (item.type === 'document') {
              return (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
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
                    <p className="text-gray-500 mb-4">{item.size} • {item.metadata?.pages} pages</p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center">
                      <Download size={16} className="mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="flex flex-col items-center justify-center">
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
              );
            }
          })()}
        </div>
        
        <div className="border-t border-gray-200 p-3 flex justify-between items-center">
          <div className="flex space-x-4">
            {item.type === 'image' && (
              <button 
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                onClick={onOpenEditor}
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
            )}
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <Download size={16} className="mr-2" />
              Download
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-1.5 text-gray-500 hover:text-gray-700">
              <Share size={18} />
            </button>
            <button 
              className={`p-1.5 ${
                item.starred ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
              }`}
              onClick={handleToggleStar}
            >
              <Star size={18} />
            </button>
            <button 
              className={`p-1.5 ${
                item.favorited ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
