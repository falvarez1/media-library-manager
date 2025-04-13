import { useState } from 'react';
import { Eye, Heart, Star, CheckCircle, Zap, Check } from 'lucide-react';

// Get file icon based on type
const getFileIcon = (type) => {
  switch(type) {
    case 'image':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
    case 'document':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>;
    case 'video':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
    case 'audio':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'archive':
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-archive"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>;
    default:
      return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
  }
};

// Get status color based on status
const getStatusColor = (status) => {
  switch(status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'in_review': return 'bg-yellow-100 text-yellow-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const MediaItem = ({ 
  item, 
  isSelected = false, 
  selectionMode = false,
  onClick,
  onQuickView,
  onToggleStar,
  onToggleFavorite
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle quick view button click
  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(item.id);
  };
  
  // Handle star toggle
  const handleToggleStar = (e) => {
    e.stopPropagation();
    if (onToggleStar) onToggleStar(item.id);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(item.id);
  };
  
  return (
    <div 
      className={`group relative border rounded-lg overflow-hidden transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media preview */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.type === 'image' ? (
          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 h-full">
            {getFileIcon(item.type)}
            <span className="text-xs text-gray-500 mt-2">{item.type}</span>
          </div>
        )}
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
        <div className="flex space-x-1">
          <button
            className="p-1.5 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-600"
            onClick={handleQuickView}
          >
            <Eye size={16} />
          </button>
          <button
            className="p-1.5 bg-white rounded-full shadow-lg text-gray-600 hover:text-red-600"
            onClick={handleToggleFavorite}
          >
            <Heart size={16} className={item.favorited ? 'text-red-500' : ''} />
          </button>
          <button
            className="p-1.5 bg-white rounded-full shadow-lg text-gray-600 hover:text-yellow-500"
            onClick={handleToggleStar}
          >
            <Star size={16} className={item.starred ? 'text-yellow-500' : ''} />
          </button>
        </div>
      </div>
      
      {/* Bottom info */}
      <div className="p-2 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-sm truncate flex-1" title={item.name}>{item.name}</span>
          {item.starred && <Star size={16} className="flex-shrink-0 text-yellow-500" />}
          {item.favorited && <Heart size={16} className="flex-shrink-0 text-red-500 ml-1" />}
        </div>
        <div className="flex text-xs text-gray-500 mt-1 justify-between items-center">
          <div className="truncate">
            {item.dimensions && <span>{item.dimensions.split(' x ')[0]}×...</span>}
            {item.size && <span className="ml-2">{item.size}</span>}
          </div>
          {/* Status indicator */}
          {item.status && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
              {item.status === 'in_review' ? 'Review' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          )}
        </div>
      </div>
      
      {/* Usage and selection indicators */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1 items-end">
        {item.used && (
          <div className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
            <CheckCircle size={10} className="mr-1" />
            Used
          </div>
        )}
        
        {selectionMode && (
          <div 
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300'
            }`}
          >
            {isSelected && <Check size={12} />}
          </div>
        )}
      </div>
      
      {/* AI Tags indicator */}
      {item.ai_tags && item.ai_tags.length > 0 && (
        <div className="absolute bottom-12 left-2">
          <div className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded flex items-center">
            <Zap size={10} className="mr-1" />
            AI Tagged
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaItem;
