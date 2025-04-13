import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Pencil, Trash2, Share } from 'lucide-react';
import { useCollections, useChildCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } from '../hooks/useApi';
import CollectionModal from './CollectionModal';
import ConfirmationDialog from './ConfirmationDialog';

const CollectionNavigation = ({ 
  collections = [], 
  currentCollection,
  onCollectionClick,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  editable = true
}) => {
  const [expandedCollections, setExpandedCollections] = useState([]);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [showEditCollectionModal, setShowEditCollectionModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [parentIdForNew, setParentIdForNew] = useState(null);

  // Get root collections (those with no parent)
  const rootCollections = collections.filter(collection => !collection.parentId);

  // Toggle collection expansion
  const toggleCollection = (collectionId) => {
    if (expandedCollections.includes(collectionId)) {
      setExpandedCollections(expandedCollections.filter(id => id !== collectionId));
    } else {
      setExpandedCollections([...expandedCollections, collectionId]);
    }
  };

  // Handle collection click
  const handleCollectionClick = (collectionId) => {
    if (onCollectionClick) {
      onCollectionClick(collectionId);
    }
  };

  // Create new collection
  const handleCreateCollection = (collectionData) => {
    if (onCreateCollection) {
      const dataWithParent = {
        ...collectionData,
        parentId: parentIdForNew
      };
      onCreateCollection(dataWithParent);
    }
    setShowNewCollectionModal(false);
    setParentIdForNew(null);
  };

  // Update collection
  const handleUpdateCollection = (collectionData) => {
    if (onUpdateCollection && selectedCollectionId) {
      onUpdateCollection(selectedCollectionId, collectionData);
    }
    setShowEditCollectionModal(false);
    setSelectedCollectionId(null);
  };

  // Delete collection
  const handleDeleteCollection = () => {
    if (onDeleteCollection && selectedCollectionId) {
      onDeleteCollection(selectedCollectionId);
    }
    setShowDeleteConfirmation(false);
    setSelectedCollectionId(null);
  };

  // Open new collection modal
  const openNewCollectionModal = (parentId = null) => {
    setParentIdForNew(parentId);
    setShowNewCollectionModal(true);
  };

  // Open edit collection modal
  const openEditCollectionModal = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setShowEditCollectionModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirmation = (collectionId) => {
    setSelectedCollectionId(collectionId);
    setShowDeleteConfirmation(true);
  };

  // Helper function to find a collection by ID
  const findCollectionById = (id) => {
    return collections.find(c => c.id === id);
  };

  // Render collection items recursively
  const renderCollectionItems = (parentId = null, level = 0) => {
    const filteredCollections = collections.filter(collection => collection.parentId === parentId);

    if (filteredCollections.length === 0) {
      return null;
    }

    return (
      <div className={level > 0 ? "pl-4" : ""}>
        {filteredCollections.map(collection => {
          const hasChildren = collections.some(c => c.parentId === collection.id);
          const isExpanded = expandedCollections.includes(collection.id);
          const isActive = currentCollection === collection.id;

          return (
            <div key={collection.id} className="mb-0.5">
              <div className={`flex items-center py-1 px-2 rounded-md ${
                isActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}>
                {hasChildren ? (
                  <button 
                    className="mr-1 text-gray-400 hover:text-gray-700"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <div className="w-4 mr-1"></div>
                )}
                
                <div 
                  className="flex-1 flex items-center cursor-pointer"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: collection.color }}></div>
                  <span className="truncate text-sm">{collection.name}</span>
                  <span className="ml-1 text-xs text-gray-500">({collection.items.length})</span>
                </div>
                
                {editable && (
                  <div className="flex items-center space-x-1">
                    <button 
                      className="p-1 text-gray-400 hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCollectionModal(collection.id);
                      }}
                      title="Edit collection"
                    >
                      <Pencil size={12} />
                    </button>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(collection.id);
                      }}
                      title="Delete collection"
                    >
                      <Trash2 size={12} />
                    </button>
                    {collection.isShared && (
                      <Share size={12} className="text-blue-500" title="Shared collection" />
                    )}
                  </div>
                )}
              </div>
              
              {isExpanded && hasChildren && renderCollectionItems(collection.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Collections header with add button */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</h3>
        {editable && (
          <button
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={() => openNewCollectionModal()}
            title="Create new collection"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      
      {/* Collection tree */}
      {collections.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-2">No collections found</div>
      ) : (
        <div className="overflow-y-auto max-h-64">
          {renderCollectionItems()}
        </div>
      )}
      
      {/* Create new collection button at bottom */}
      {editable && (
        <button 
          className="mt-2 w-full text-left px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center"
          onClick={() => openNewCollectionModal()}
        >
          <Plus size={14} className="mr-1" />
          <span>New Collection</span>
        </button>
      )}
      
      {/* Modals */}
      <CollectionModal
        isOpen={showNewCollectionModal}
        onClose={() => setShowNewCollectionModal(false)}
        title="Create Collection"
        onSubmit={handleCreateCollection}
        collections={collections}
        submitButtonText="Create"
      />
      
      <CollectionModal
        isOpen={showEditCollectionModal}
        onClose={() => setShowEditCollectionModal(false)}
        title="Edit Collection"
        initialValues={selectedCollectionId ? findCollectionById(selectedCollectionId) : {}}
        onSubmit={handleUpdateCollection}
        collections={collections}
        submitButtonText="Update"
      />
      
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteCollection}
        title="Delete Collection"
        message={`Are you sure you want to delete this collection${
          selectedCollectionId && collections.some(c => c.parentId === selectedCollectionId)
            ? ' and all its subcollections'
            : ''
        }? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonColor="red"
      />
    </div>
  );
};

export default CollectionNavigation;