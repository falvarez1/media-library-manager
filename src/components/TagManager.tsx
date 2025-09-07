import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Edit, Trash2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useTags, useTagCategories, useCreateTag, useUpdateTag, useDeleteTag, useCreateTagCategory, useUpdateTagCategory } from '../hooks/useApi';
import {
  TagId,
  TagCategoryId,
  HexColor,
  BaseComponentProps,
  EventHandler,
  ChangeEvent,
  FormEvent,
  MouseEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface Tag {
  id: TagId;
  name: string;
  color: string;
  categoryId?: TagCategoryId | null;
  count: number;
}

interface TagCategory {
  id: TagCategoryId;
  name: string;
  description?: string;
}

interface TagManagerProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsChange?: () => void;
}

type ActiveTab = 'all' | 'uncategorized' | 'category';

interface CreateTagData {
  name: string;
  color: HexColor;
  categoryId?: TagCategoryId | null;
}

interface UpdateTagData {
  name: string;
  color: HexColor;
  categoryId?: TagCategoryId | null;
}

interface CreateCategoryData {
  name: string;
  description?: string;
  color: HexColor;
  icon: string;
  sortOrder: number;
}

interface UpdateCategoryData {
  name: string;
  description?: string;
  color?: HexColor;
}

// ============================================================================
// COMPONENT
// ============================================================================

const TagManager: React.FC<TagManagerProps> = ({ 
  isOpen, 
  onClose, 
  onTagsChange,
  className,
  testId
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTagId, setSelectedTagId] = useState<TagId | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<TagCategoryId | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<TagCategoryId[]>([]);
  const [showNewTagForm, setShowNewTagForm] = useState<boolean>(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null);

  // New tag form state
  const [newTagName, setNewTagName] = useState<string>('');
  const [newTagColor, setNewTagColor] = useState<string>('#3B82F6');
  const [newTagCategoryId, setNewTagCategoryId] = useState<TagCategoryId | null>(null);
  const [tagFormError, setTagFormError] = useState<string>('');

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDescription, setNewCategoryDescription] = useState<string>('');
  const [categoryFormError, setCategoryFormError] = useState<string>('');

  // Fetch tags and categories
  const { data: tagsRaw, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useTags();
  const { data: categoriesRaw, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useTagCategories();

  // Map service types to component types
  const tags: Tag[] = (tagsRaw || []).map(serviceTag => ({
    id: serviceTag.id,
    name: serviceTag.name,
    color: serviceTag.color,
    categoryId: serviceTag.category,
    count: serviceTag.usageCount || 0
  }));
  const categories = (categoriesRaw as TagCategory[]) || [];

  // Mutation hooks
  const { mutate: createTag, loading: createTagLoading } = useCreateTag();
  const { mutate: updateTag, loading: updateTagLoading } = useUpdateTag();
  const { mutate: deleteTag, loading: deleteTagLoading } = useDeleteTag();
  const { mutate: createCategory, loading: createCategoryLoading } = useCreateTagCategory();
  const { mutate: updateCategory, loading: updateCategoryLoading } = useUpdateTagCategory();

  // Predefined colors
  const predefinedColors: string[] = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F43F5E', // Red
    '#0EA5E9', // Light Blue
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#EF4444'  // Red
  ];

  // Filter tags based on search term and active tab
  const filteredTags = tags.filter(tag => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by active tab
    if (activeTab === 'all') {
      return matchesSearch;
    } else if (activeTab === 'uncategorized') {
      return !tag.categoryId && matchesSearch;
    } else if (activeTab === 'category' && selectedCategoryId) {
      return tag.categoryId === selectedCategoryId && matchesSearch;
    }
    
    return matchesSearch;
  });

  // Toggle category expansion
  const toggleCategory = (categoryId: TagCategoryId): void => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  // Select category for filtering
  const selectCategory = (categoryId: TagCategoryId): void => {
    setSelectedCategoryId(categoryId);
    setActiveTab('category');
  };

  // Reset forms
  const resetTagForm = (): void => {
    setNewTagName('');
    setNewTagColor('#3B82F6');
    setNewTagCategoryId(activeTab === 'category' ? selectedCategoryId : null);
    setTagFormError('');
    setEditingTag(null);
  };

  const resetCategoryForm = (): void => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setCategoryFormError('');
    setEditingCategory(null);
  };

  // Handle tag form submission
  const handleTagSubmit: EventHandler<FormEvent<HTMLFormElement>> = async (e) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setTagFormError('Tag name is required');
      return;
    }
    
    try {
      if (editingTag) {
        // Update existing tag
        const updateData: UpdateTagData = {
          name: newTagName.trim(),
          color: newTagColor as HexColor,
          categoryId: newTagCategoryId
        };
        await updateTag({ id: editingTag.id, updates: updateData });
      } else {
        // Create new tag
        const createData: CreateTagData = {
          name: newTagName.trim(),
          color: newTagColor as HexColor,
          categoryId: newTagCategoryId
        };
        await createTag(createData);
      }
      
      // Refresh tags
      refetchTags();
      
      // Reset form
      resetTagForm();
      setShowNewTagForm(false);
      
      // Notify parent
      if (onTagsChange) onTagsChange();
      
    } catch (error) {
      setTagFormError((error as Error).message || 'Failed to save tag');
    }
  };

  // Handle category form submission
  const handleCategorySubmit: EventHandler<FormEvent<HTMLFormElement>> = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setCategoryFormError('Category name is required');
      return;
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          color: '#3B82F6' as HexColor // Default color for category
        };
        await updateCategory({ id: editingCategory.id, updates: updateData });
      } else {
        // Create new category
        const createData: CreateCategoryData = {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
          color: '#3B82F6' as HexColor, // Default color for category
          icon: 'tag', // Default icon
          sortOrder: 0 // Default sort order
        };
        await createCategory(createData);
      }
      
      // Refresh categories
      refetchCategories();
      
      // Reset form
      resetCategoryForm();
      setShowNewCategoryForm(false);
      
      // Notify parent
      if (onTagsChange) onTagsChange();
      
    } catch (error) {
      setCategoryFormError((error as Error).message || 'Failed to save category');
    }
  };

  // Edit tag
  const handleEditTag = (tag: Tag): void => {
    setEditingTag(tag);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setNewTagCategoryId(tag.categoryId || null);
    setShowNewTagForm(true);
  };

  // Delete tag
  const handleDeleteTag = async (tagId: TagId): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      try {
        await deleteTag(tagId);
        refetchTags();
        
        // Notify parent
        if (onTagsChange) onTagsChange();
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  // Edit category
  const handleEditCategory = (category: TagCategory): void => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setShowNewCategoryForm(true);
  };

  // Event handlers
  const handleSearchChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTagNameChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setNewTagName(e.target.value);
  };

  const handleNewCategoryNameChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setNewCategoryName(e.target.value);
  };

  const handleNewCategoryDescriptionChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setNewCategoryDescription(e.target.value);
  };

  const handleColorChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setNewTagColor(e.target.value);
  };

  const handleCategorySelectChange: EventHandler<ChangeEvent<HTMLSelectElement>> = (e) => {
    setNewTagCategoryId(e.target.value === '' ? null : e.target.value as TagCategoryId);
  };

  const handleTagClick = (tagId: TagId): void => {
    setSelectedTagId(tagId);
  };

  // Initialize forms when tab changes
  useEffect(() => {
    if (activeTab === 'category' && selectedCategoryId) {
      setNewTagCategoryId(selectedCategoryId);
    } else if (activeTab === 'uncategorized') {
      setNewTagCategoryId(null);
    }
  }, [activeTab, selectedCategoryId]);

  if (!isOpen) return null;

  const isLoading = tagsLoading || categoriesLoading;
  const hasError = tagsError || categoriesError;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 ${className || ''}`}
      data-testid={testId}
    >
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Tag Manager</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-64 border-r border-gray-200 p-4 flex flex-col overflow-hidden">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Categories</h4>
                <button 
                  onClick={() => {
                    resetCategoryForm();
                    setShowNewCategoryForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  type="button"
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </button>
              </div>
              
              {/* Category list */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                <button
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${activeTab === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedCategoryId(null);
                  }}
                  type="button"
                >
                  All Tags
                </button>
                <button
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${activeTab === 'uncategorized' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setActiveTab('uncategorized');
                    setSelectedCategoryId(null);
                  }}
                  type="button"
                >
                  Uncategorized
                </button>
                
                {categories.map(category => (
                  <div key={category.id} className="space-y-0.5">
                    <div className="flex items-center">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => toggleCategory(category.id)}
                        type="button"
                      >
                        {expandedCategories.includes(category.id) ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                      <button
                        className={`flex-1 text-left px-1 py-0.5 rounded-md text-sm ${activeTab === 'category' && selectedCategoryId === category.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                        onClick={() => selectCategory(category.id)}
                        type="button"
                      >
                        {category.name}
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => handleEditCategory(category)}
                        title="Edit category"
                        type="button"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                    
                    {expandedCategories.includes(category.id) && (
                      <div className="pl-6 space-y-0.5">
                        {tags
                          .filter(tag => tag.categoryId === category.id)
                          .map(tag => (
                            <div 
                              key={tag.id}
                              className={`flex items-center px-2 py-1 text-sm rounded-md cursor-pointer ${selectedTagId === tag.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                              onClick={() => handleTagClick(tag.id)}
                            >
                              <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: tag.color }}></span>
                              <span className="truncate">{tag.name}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Category form */}
            {showNewCategoryForm && (
              <div className="mt-4 p-3 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium">
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </h5>
                  <button 
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      resetCategoryForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {categoryFormError && (
                  <div className="mb-2 text-xs text-red-600">
                    {categoryFormError}
                  </div>
                )}
                
                <form onSubmit={handleCategorySubmit}>
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newCategoryName}
                      onChange={handleNewCategoryNameChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newCategoryDescription}
                      onChange={handleNewCategoryDescriptionChange}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                      disabled={createCategoryLoading || updateCategoryLoading}
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Main tag area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search bar and actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tags..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <button
                  className="ml-4 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  onClick={() => {
                    resetTagForm();
                    setShowNewTagForm(true);
                  }}
                  type="button"
                >
                  <Plus size={16} className="mr-1" />
                  New Tag
                </button>
              </div>
              
              {/* Tag tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => {
                    setActiveTab('all');
                    setSelectedCategoryId(null);
                  }}
                  type="button"
                >
                  All Tags
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'uncategorized' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => {
                    setActiveTab('uncategorized');
                    setSelectedCategoryId(null);
                  }}
                  type="button"
                >
                  Uncategorized
                </button>
                {selectedCategoryId && categories && (
                  <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'category' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('category')}
                    type="button"
                  >
                    {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Tag list */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : hasError ? (
                <div className="text-center p-4 text-red-600">
                  Error loading tags. Please try again.
                </div>
              ) : (
                <div>
                  {/* New tag form */}
                  {showNewTagForm && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium">{editingTag ? 'Edit Tag' : 'New Tag'}</h5>
                        <button 
                          onClick={() => {
                            setShowNewTagForm(false);
                            resetTagForm();
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          type="button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {tagFormError && (
                        <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                          {tagFormError}
                        </div>
                      )}
                      
                      <form onSubmit={handleTagSubmit}>
                        <div className="mb-4">
                          <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
                            Tag Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="tagName"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={newTagName}
                            onChange={handleNewTagNameChange}
                            placeholder="Enter tag name"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {predefinedColors.map(colorOption => (
                              <button
                                key={colorOption}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 ${newTagColor === colorOption ? 'border-black' : 'border-transparent'}`}
                                style={{ backgroundColor: colorOption }}
                                onClick={() => setNewTagColor(colorOption)}
                              />
                            ))}
                            <label className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer">
                              <Plus size={16} className="text-gray-500" />
                              <input
                                type="color"
                                className="sr-only"
                                value={newTagColor}
                                onChange={handleColorChange}
                              />
                            </label>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="tagCategory" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            id="tagCategory"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={newTagCategoryId || ''}
                            onChange={handleCategorySelectChange}
                          >
                            <option value="">None (Uncategorized)</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewTagForm(false);
                              resetTagForm();
                            }}
                            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-300"
                            disabled={createTagLoading || updateTagLoading}
                          >
                            {editingTag ? 'Update Tag' : 'Create Tag'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {/* Tag grid */}
                  {filteredTags.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredTags.map(tag => (
                        <div 
                          key={tag.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: tag.color }}
                            ></div>
                            <div>
                              <div className="font-medium">{tag.name}</div>
                              <div className="text-xs text-gray-500">
                                {tag.count} items
                                {tag.categoryId && categories && (
                                  <> • {categories.find(c => c.id === tag.categoryId)?.name}</>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditTag(tag)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                              title="Edit tag"
                              type="button"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md"
                              title="Delete tag"
                              disabled={deleteTagLoading}
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      {searchTerm ? 
                        `No tags found matching '${searchTerm}'` : 
                        'No tags found in this category'
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;