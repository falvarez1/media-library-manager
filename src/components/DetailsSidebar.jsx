import { useState, useEffect } from 'react';
import { X, History, Edit, Share, Download, Trash2, Star, Heart, CheckCircle, XCircle, Info, Zap, Plus, Eye, ExternalLink, BarChart2, Loader, Folder, Tag } from 'lucide-react';
import { useMediaItem, useTags, useCollections, useTagSuggestions, useAddItemsToCollection, useRemoveItemsFromCollection, useBatchUpdateTags } from '../hooks/useApi';
import TagSelector from './TagSelector';
import CollectionModal from './CollectionModal';

const DetailsSidebar = ({ 
  mediaId, 
  onClose, 
  onOpenEditor,
  onToggleStar,
  onToggleFavorite
}) => {
  // Fetch media item by ID using our hook
  const { data: item, loading: itemLoading, error: itemError, refetch: refetchMediaItem } = useMediaItem(mediaId);
  
  // Fetch all tags data
  const { data: tags, loading: tagsLoading, error: tagsError } = useTags();
  
  // Fetch all collections data
  const { data: collections, loading: collectionsLoading, error: collectionsError } = useCollections();
  
  // Details tab state
  const [detailsTab, setDetailsTab] = useState('info'); // 'info', 'metadata', 'usage', 'comments'
  
  // Tag editing state
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  
  // Collection state
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [mediaCollections, setMediaCollections] = useState([]);
  
  // Batch update tags hook
  const { batchUpdate: updateTags, loading: updateTagsLoading } = useBatchUpdateTags();
  
  // Collection operations hooks
  const { addItems, loading: addToCollectionLoading } = useAddItemsToCollection();
  const { removeItems, loading: removeFromCollectionLoading } = useRemoveItemsFromCollection();
  
  // Initialize tags when item loads
  useEffect(() => {
    if (item && item.tags) {
      setSelectedTags(item.tags);
    }
  }, [item]);
  
  // Initialize collections when item and collections load
  useEffect(() => {
    if (item && collections) {
      // Find collections that contain this item
      const itemCollections = collections.items.filter(collection => 
        collection.items.includes(mediaId)
      );
      setMediaCollections(itemCollections);
    }
  }, [item, collections, mediaId]);
  
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
  
  // Handle tag updates
  const handleTagsChange = async (tags) => {
    setSelectedTags(tags);
    
    if (!isEditingTags) return;
    
    try {
      // Calculate tags to add and remove
      const currentTags = item.tags || [];
      const tagsToAdd = tags.filter(tag => !currentTags.includes(tag));
      const tagsToRemove = currentTags.filter(tag => !tags.includes(tag));
      
      if (tagsToAdd.length === 0 && tagsToRemove.length === 0) return;
      
      // Update tags via API
      await updateTags([mediaId], { 
        addTags: tagsToAdd, 
        removeTags: tagsToRemove 
      });
      
      // Refresh media item to get updated data
      refetchMediaItem();
      
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };
  
  // Handle adding to collection
  const handleAddToCollection = async (collectionId) => {
    try {
      await addItems(collectionId, [mediaId]);
      
      // Update local state
      if (collections) {
        const collection = collections.items.find(c => c.id === collectionId);
        if (collection && !mediaCollections.includes(collection)) {
          setMediaCollections([...mediaCollections, collection]);
        }
      }
    } catch (error) {
      console.error('Failed to add to collection:', error);
    }
  };
  
  // Handle removing from collection
  const handleRemoveFromCollection = async (collectionId) => {
    try {
      await removeItems(collectionId, [mediaId]);
      
      // Update local state
      setMediaCollections(mediaCollections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error('Failed to remove from collection:', error);
    }
  };
  
  // Loading state
  if (itemLoading || tagsLoading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex items-center justify-center">
        <div className="flex flex-col items-center p-8">
          <Loader className="animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (itemError || tagsError) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="font-medium">Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-500" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
          <p className="text-gray-600 mb-4">
            {itemError?.message || tagsError?.message || "Failed to load media details. Please try again."}
          </p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
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
              
              {/* Collections */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Folder size={14} className="mr-1.5 text-gray-400" />
                    Collections
                  </h4>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => setShowCollectionSelector(true)}
                  >
                    Add to Collection
                  </button>
                </div>
                
                {mediaCollections.length > 0 ? (
                  <div className="space-y-1">
                    {mediaCollections.map(collection => (
                      <div 
                        key={collection.id} 
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-md group"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: collection.color }}
                          ></div>
                          <span className="text-sm">{collection.name}</span>
                        </div>
                        <button 
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                          onClick={() => handleRemoveFromCollection(collection.id)}
                          title="Remove from collection"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-md text-center">
                    Not in any collections
                  </div>
                )}
              </div>
              
              {/* Tags */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Tag size={14} className="mr-1.5 text-gray-400" />
                    Tags
                  </h4>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      setIsEditingTags(!isEditingTags);
                      if (!isEditingTags) {
                        setSelectedTags(item.tags || []);
                      }
                    }}
                  >
                    {isEditingTags ? 'Done' : 'Edit Tags'}
                  </button>
                </div>
                
                {isEditingTags ? (
                  <div className="mb-2">
                    <TagSelector
                      selectedTags={selectedTags}
                      onTagsChange={handleTagsChange}
                      autoFocus={true}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tagName, index) => {
                        const tag = tags ? tags.find(t => t.name === tagName) : null;
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
                      })
                    ) : (
                      <div className="text-sm text-gray-500">No tags</div>
                    )}
                  </div>
                )}
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
                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
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
      
      {/* Collection Selector Modal */}
      {showCollectionSelector && collections && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add to Collection</h3>
              <button 
                onClick={() => setShowCollectionSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {collections.items.length > 0 ? (
                <div className="space-y-2">
                  {collections.items.map(collection => {
                    const isInCollection = mediaCollections.some(c => c.id === collection.id);
                    
                    return (
                      <div 
                        key={collection.id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: collection.color }}
                          ></div>
                          <span>{collection.name}</span>
                        </div>
                        <button
                          className={`px-2 py-1 text-xs rounded-md ${
                            isInCollection 
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                          onClick={() => {
                            if (isInCollection) {
                              handleRemoveFromCollection(collection.id);
                            } else {
                              handleAddToCollection(collection.id);
                            }
                          }}
                        >
                          {isInCollection ? 'Remove' : 'Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No collections found</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCollectionSelector(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsSidebar;
