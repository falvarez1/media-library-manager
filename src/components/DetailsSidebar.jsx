import { useState } from 'react';
import { X, History, Edit, Share, Download, Trash2, Star, Heart, CheckCircle, XCircle, Info, Zap, Plus, Eye, ExternalLink, BarChart2 } from 'lucide-react';

// Mock media data (in a real app, this would come from props or context)
const mockMediaItem = {
  id: '1', 
  type: 'image', 
  name: 'product-hero.jpg', 
  folder: '5', 
  path: 'Images/Products',
  size: '2.4 MB', 
  dimensions: '1920 x 1080',
  created: '2025-03-15',
  modified: '2025-04-02',
  used: true,
  usedIn: ['Homepage', 'Product Catalog'],
  tags: ['product', 'hero', 'featured'],
  url: '/api/placeholder/800/600',
  starred: true,
  favorited: true,
  versions: [
    { id: 'v1', date: '2025-03-15', size: '2.4 MB', author: 'Sarah Johnson' },
    { id: 'v2', date: '2025-04-02', size: '2.4 MB', author: 'Michael Chen' }
  ],
  comments: [
    { id: '1', author: 'Lisa Wong', date: '2025-04-01', text: 'Can we brighten this image a bit?' },
    { id: '2', author: 'Michael Chen', date: '2025-04-02', text: 'Updated with brightness adjustment' }
  ],
  metadata: {
    altText: 'Our flagship product displayed on a minimalist background',
    copyright: '© 2025 Our Company',
    caption: 'New Collection Spring 2025',
    photographer: 'James Wilson',
    location: 'Studio B'
  },
  analytics: {
    views: 243,
    downloads: 58,
    lastAccessed: '2025-04-09'
  },
  status: 'approved',
  ai_tags: ['product', 'minimalist', 'white background', 'luxury item']
};

// Mock tags data
const mockTags = [
  { id: '1', name: 'product', color: '#3B82F6' },
  { id: '2', name: 'hero', color: '#10B981' },
  { id: '7', name: 'featured', color: '#F43F5E' },
];

const DetailsSidebar = ({ 
  mediaId, 
  onClose, 
  onOpenEditor,
  onToggleStar,
  onToggleFavorite
}) => {
  // In a real app, we would fetch the media item by ID
  const item = mockMediaItem;
  
  // Details tab state
  const [detailsTab, setDetailsTab] = useState('info'); // 'info', 'metadata', 'usage', 'comments'
  
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
  
  // Handle star toggle
  const handleToggleStar = () => {
    if (onToggleStar) onToggleStar(mediaId);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (onToggleFavorite) onToggleFavorite(mediaId);
  };
  
  // If no item found
  if (!item) return null;
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h3 className="font-medium">Details</h3>
        <div className="flex">
          <button 
            className="p-1 mr-2 text-gray-400 hover:text-gray-600"
            title="Version History"
          >
            <History size={18} />
          </button>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="p-0">
        {/* Detail tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-2 text-xs font-medium ${detailsTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setDetailsTab('info')}
          >
            Info
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-medium ${detailsTab === 'metadata' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setDetailsTab('metadata')}
          >
            Metadata
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-medium ${detailsTab === 'usage' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setDetailsTab('usage')}
          >
            Usage
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-medium ${detailsTab === 'comments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setDetailsTab('comments')}
          >
            Comments
          </button>
        </div>
        
        {/* Preview */}
        <div className="p-4">
          <div className="mb-4">
            {item.type === 'image' ? (
              <div className="relative group">
                <img src={item.url} alt={item.name} className="w-full rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-2 bg-white rounded-full shadow-lg"
                    onClick={onOpenEditor}
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                {item.type === 'video' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video text-gray-400">
                    <path d="m22 8-6 4 6 4V8Z"/>
                    <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                  </svg>
                ) : item.type === 'document' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text text-gray-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" x2="8" y1="13" y2="13"/>
                    <line x1="16" x2="8" y1="17" y2="17"/>
                    <line x1="10" x2="8" y1="9" y2="9"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file text-gray-400">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Tab content */}
        <div className="p-4 pt-0">
          {/* Info tab */}
          {detailsTab === 'info' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-medium truncate flex-1" title={item.name}>{item.name}</h4>
                <div className="flex space-x-1">
                  <button 
                    className={`p-1 text-gray-400 hover:text-yellow-500 ${item.starred ? 'text-yellow-500' : ''}`}
                    onClick={handleToggleStar}
                    title="Star"
                  >
                    <Star size={16} />
                  </button>
                  <button 
                    className={`p-1 text-gray-400 hover:text-red-500 ${item.favorited ? 'text-red-500' : ''}`}
                    onClick={handleToggleFavorite}
                    title="Favorite"
                  >
                    <Heart size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium capitalize">{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span>{item.size}</span>
                </div>
                {item.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimensions:</span>
                    <span>{item.dimensions}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{item.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modified:</span>
                  <span>{item.modified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status === 'in_review' ? 'In Review' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Path:</span>
                  <span className="text-right">{item.path}</span>
                </div>
              </div>
              
              {/* Analytics summary */}
              {item.analytics && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Analytics</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-gray-500 text-xs mb-1">Views</div>
                      <div className="text-lg font-semibold">{item.analytics.views}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-gray-500 text-xs mb-1">Downloads</div>
                      <div className="text-lg font-semibold">{item.analytics.downloads}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="text-gray-500 text-xs mb-1">Last Access</div>
                      <div className="text-xs font-medium">{new Date(item.analytics.lastAccessed).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Tags</h4>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    Edit Tags
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tagName, index) => {
                    const tag = mockTags.find(t => t.name === tagName);
                    return (
                      <div 
                        key={index} 
                        className="px-2 py-1 text-xs rounded-full flex items-center"
                        style={{ 
                          backgroundColor: tag ? `${tag.color}20` : '#e5e7eb',
                          color: tag ? tag.color : '#374151'
                        }}
                      >
                        <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag ? tag.color : '#374151' }}></span>
                        {tagName}
                      </div>
                    );
                  })}
                  <button className="px-2 py-1 text-xs rounded-full border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50">
                    + Add
                  </button>
                </div>
              </div>
              
              {/* AI Tags */}
              {item.ai_tags && item.ai_tags.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Zap size={14} className="mr-1 text-blue-500" />
                      AI-Generated Tags
                    </h4>
                    <div className="ml-2 text-xs text-gray-500">
                      <Info size={12} className="inline mr-1" />
                      Auto-detected
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.ai_tags.map((tag, index) => (
                      <div key={index} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="pt-4 flex space-x-2">
                <button 
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  onClick={onOpenEditor}
                >
                  {item.type === 'image' ? 'Edit Image' : 'Edit'}
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  <Share size={16} />
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                  <Download size={16} />
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50 hover:border-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Metadata tab */}
          {detailsTab === 'metadata' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Metadata</h4>
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  <Plus size={14} className="inline mr-1" />
                  Add Field
                </button>
              </div>
              <div className="space-y-3">
                {item.metadata && Object.entries(item.metadata).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <div className="text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</div>
                    <input 
                      type="text" 
                      value={value} 
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      onChange={() => {}}
                    />
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                  Save Metadata
                </button>
              </div>
            </div>
          )}
          
          {/* Usage tab */}
          {detailsTab === 'usage' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Usage</h4>
              {item.used ? (
                <div>
                  <div className="flex items-center text-green-600 mb-3">
                    <CheckCircle size={16} className="mr-1.5" />
                    <span className="text-sm">Used in {item.usedIn.length} places</span>
                  </div>
                  
                  <div className="space-y-2">
                    {item.usedIn.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2.5"></div>
                          <span className="text-sm">{location}</span>
                        </div>
                        <button className="text-xs text-blue-600 hover:text-blue-800">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Analytics</h4>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Detailed Report
                      </button>
                    </div>
                    
                    {item.analytics && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Views</span>
                          <span className="text-sm font-medium">{item.analytics.views}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(item.analytics.views / 10, 100)}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1 mt-3">
                          <span className="text-xs text-gray-500">Downloads</span>
                          <span className="text-sm font-medium">{item.analytics.downloads}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(item.analytics.downloads / 5, 100)}%` }}></div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Last accessed on {new Date(item.analytics.lastAccessed).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-gray-500 mb-3">
                    <XCircle size={16} className="mr-1.5" />
                    <span className="text-sm">Not currently used</span>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-3">This asset is not currently used in any content.</p>
                    <button className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                      Add to Content
                    </button>
                  </div>
                  
                  {item.analytics && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium mb-3">Analytics</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-gray-500 text-xs mb-1">Views</div>
                          <div className="text-lg font-semibold">{item.analytics.views}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-gray-500 text-xs mb-1">Downloads</div>
                          <div className="text-lg font-semibold">{item.analytics.downloads}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-gray-500 text-xs mb-1">Last Access</div>
                          <div className="text-xs font-medium">{new Date(item.analytics.lastAccessed).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Comments tab */}
          {detailsTab === 'comments' && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Comments</h4>
              
              {item.comments && item.comments.length > 0 ? (
                <div className="space-y-3">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{comment.author}</div>
                            <div className="text-xs text-gray-500">{comment.date}</div>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-horizontal">
                            <circle cx="12" cy="12" r="1"/>
                            <circle cx="19" cy="12" r="1"/>
                            <circle cx="5" cy="12" r="1"/>
                          </svg>
                        </button>
                      </div>
                      <div className="mt-2 text-sm">
                        {comment.text}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square mx-auto mb-2 text-gray-300">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p className="text-sm">No comments yet</p>
                </div>
              )}
              
              <div className="pt-2">
                <div className="flex">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 flex items-center justify-center rounded-full mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsSidebar;
