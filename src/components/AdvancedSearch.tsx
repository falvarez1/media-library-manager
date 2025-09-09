import React, { useState, useEffect, useRef } from 'react';
import storage from '../utils/storage';
import { 
  Search, 
  Calendar, 
  FileType, 
  Tag, 
  X, 
  Save, 
  ArrowLeft, 
  Clock, 
  ChevronDown,
  Info,
  Filter
} from 'lucide-react';
import { useTags } from '../hooks/useApi';
import {
  MediaType,
  TagId,
  BaseComponentProps,
  EventHandler,
  MouseEvent,
  ChangeEvent
} from '../types';

// ============================================================================
// INTERFACES
// ============================================================================

interface FileTypeOption {
  id: MediaType;
  name: string;
  icon: string;
}

interface Tag {
  id: TagId;
  name: string;
  color: string;
}

interface SearchHistoryItem {
  timestamp: string;
  params: SearchParams;
  query: string;
}

interface SavedSearch {
  id: string;
  name: string;
  timestamp: string;
  params: SearchParams;
}

interface SearchParams {
  query: string;
  types: MediaType[];
  tags: string[];
  dateStart: string;
  dateEnd: string;
  sizeMin: string;
  sizeMax: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface SizeRange {
  min: string;
  max: string;
}

interface AdvancedSearchProps extends BaseComponentProps {
  onSearch?: (searchParams: SearchParams) => void;
  onClose: () => void;
  initialSearchParams?: Partial<SearchParams>;
  savedSearches?: SavedSearch[];
  onSaveSearch?: (search: SavedSearch) => void;
  onDeleteSavedSearch?: (searchId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClose,
  initialSearchParams = {},
  savedSearches = [],
  onSaveSearch,
  onDeleteSavedSearch,
  className,
  testId
}) => {
  // States for search form
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParams.query || '');
  const [selectedTypes, setSelectedTypes] = useState<MediaType[]>(initialSearchParams.types || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSearchParams.tags || []);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: initialSearchParams.dateStart || '',
    end: initialSearchParams.dateEnd || ''
  });
  const [sizeRange, setSizeRange] = useState<SizeRange>({
    min: initialSearchParams.sizeMin || '',
    max: initialSearchParams.sizeMax || ''
  });
  const [savedSearchName, setSavedSearchName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Get available tags
  const { data: tagsData } = useTags();
  const tags = (tagsData as Tag[]) || [];
  
  // Ref for click outside detection
  const historyRef = useRef<HTMLDivElement>(null);
  
  // Media file types
  const fileTypes: FileTypeOption[] = [
    { id: 'image', name: 'Images', icon: '🖼️' },
    { id: 'video', name: 'Videos', icon: '🎬' },
    { id: 'audio', name: 'Audio', icon: '🎵' },
    { id: 'document', name: 'Documents', icon: '📄' },
    { id: 'archive', name: 'Archives', icon: '🗄️' },
    { id: 'other', name: 'Other', icon: '📁' }
  ];
  
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = storage.get<SearchHistoryItem[]>('searchHistory', []);
    setSearchHistory(savedHistory.slice(0, 10)); // Keep last 10 searches
  }, []);
  
  // Handle clicks outside of history dropdown
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Submit search
  const handleSearch = (): void => {
    const searchParams: SearchParams = {
      query: searchQuery,
      types: selectedTypes,
      tags: selectedTags,
      dateStart: dateRange.start,
      dateEnd: dateRange.end,
      sizeMin: sizeRange.min,
      sizeMax: sizeRange.max
    };
    
    // Save to search history
    const newHistoryItem: SearchHistoryItem = {
      timestamp: new Date().toISOString(),
      params: searchParams,
      query: searchQuery
    };
    
    const newHistory = [newHistoryItem, ...searchHistory].slice(0, 10);
    
    setSearchHistory(newHistory);
    storage.set('searchHistory', newHistory);
    
    if (onSearch) {
      onSearch(searchParams);
    }
  };
  
  // Toggle file type selection
  const toggleFileType = (typeId: MediaType): void => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };
  
  // Toggle tag selection
  const toggleTag = (tagName: string): void => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(name => name !== tagName)
        : [...prev, tagName]
    );
  };
  
  // Handle save search
  const saveSearch = (): void => {
    if (!savedSearchName.trim()) {
      return;
    }
    
    const searchToSave: SavedSearch = {
      id: `saved-search-${Date.now()}`,
      name: savedSearchName,
      timestamp: new Date().toISOString(),
      params: {
        query: searchQuery,
        types: selectedTypes,
        tags: selectedTags,
        dateStart: dateRange.start,
        dateEnd: dateRange.end,
        sizeMin: sizeRange.min,
        sizeMax: sizeRange.max
      }
    };
    
    if (onSaveSearch) {
      onSaveSearch(searchToSave);
    }
    
    setSavedSearchName('');
    setShowSaveDialog(false);
  };
  
  // Handle search history item click
  const handleHistoryItemClick = (historyItem: SearchHistoryItem): void => {
    setSearchQuery(historyItem.params.query || '');
    setSelectedTypes(historyItem.params.types || []);
    setSelectedTags(historyItem.params.tags || []);
    setDateRange({
      start: historyItem.params.dateStart || '',
      end: historyItem.params.dateEnd || ''
    });
    setSizeRange({
      min: historyItem.params.sizeMin || '',
      max: historyItem.params.sizeMax || ''
    });
    
    setShowHistory(false);
  };
  
  // Handle saved search click
  const handleSavedSearchClick = (savedSearch: SavedSearch): void => {
    setSearchQuery(savedSearch.params.query || '');
    setSelectedTypes(savedSearch.params.types || []);
    setSelectedTags(savedSearch.params.tags || []);
    setDateRange({
      start: savedSearch.params.dateStart || '',
      end: savedSearch.params.dateEnd || ''
    });
    setSizeRange({
      min: savedSearch.params.sizeMin || '',
      max: savedSearch.params.sizeMax || ''
    });
    
    // Automatically run the search
    if (onSearch) {
      onSearch(savedSearch.params);
    }
  };
  
  // Clear all search params
  const clearSearch = (): void => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedTags([]);
    setDateRange({ start: '', end: '' });
    setSizeRange({ min: '', max: '' });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Event handlers
  const handleSearchQueryChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateStartChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setDateRange({ ...dateRange, start: e.target.value });
  };

  const handleDateEndChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setDateRange({ ...dateRange, end: e.target.value });
  };

  const handleSizeMinChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setSizeRange({ ...sizeRange, min: e.target.value });
  };

  const handleSizeMaxChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setSizeRange({ ...sizeRange, max: e.target.value });
  };

  const handleSavedSearchNameChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    setSavedSearchName(e.target.value);
  };

  const handleDeleteSavedSearch = (e: MouseEvent<HTMLButtonElement>, searchId: string): void => {
    e.stopPropagation();
    if (onDeleteSavedSearch) {
      onDeleteSavedSearch(searchId);
    }
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col ${className || ''}`}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            className="mr-2 text-gray-500 hover:text-gray-700"
            onClick={onClose}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-medium">Advanced Search</h2>
        </div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Search form */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Search query */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search media by name, content, or description"
                value={searchQuery}
                onChange={handleSearchQueryChange}
              />
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Search history */}
            <div className="relative mt-2" ref={historyRef}>
              <button
                className="text-xs text-gray-500 hover:text-blue-500 flex items-center"
                onClick={() => setShowHistory(!showHistory)}
                type="button"
              >
                <Clock size={14} className="mr-1" />
                Search History
                <ChevronDown size={14} className="ml-1" />
              </button>
              
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute z-10 left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100">
                    <h3 className="text-xs font-medium text-gray-500">Recent Searches</h3>
                  </div>
                  <div className="py-1">
                    {searchHistory.map((historyItem, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleHistoryItemClick(historyItem)}
                        type="button"
                      >
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2 text-gray-400" />
                          <span className="truncate">
                            {historyItem.query || 'Advanced search'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(historyItem.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Saved searches */}
          {savedSearches && savedSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Saved Searches</h3>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((savedSearch) => (
                  <div
                    key={savedSearch.id}
                    className="group bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm flex items-center cursor-pointer hover:bg-blue-100"
                    onClick={() => handleSavedSearchClick(savedSearch)}
                  >
                    <Save size={14} className="mr-1.5" />
                    <span>{savedSearch.name}</span>
                    <button
                      className="ml-1.5 opacity-0 group-hover:opacity-100 text-blue-400 hover:text-red-500"
                      onClick={(e) => handleDeleteSavedSearch(e, savedSearch.id)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* File types */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <FileType size={16} className="mr-1.5 text-gray-500" />
              File Types
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {fileTypes.map((type) => (
                <button
                  key={type.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-md border transition-colors ${
                    selectedTypes.includes(type.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFileType(type.id)}
                  type="button"
                >
                  <span className="text-xl mb-1">{type.icon}</span>
                  <span className="text-xs font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <Tag size={16} className="mr-1.5 text-gray-500" />
              Tags
            </h3>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                      selectedTags.includes(tag.name)
                        ? 'bg-opacity-20 text-opacity-100'
                        : 'bg-opacity-10 text-opacity-70 hover:bg-opacity-20 hover:text-opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${tag.color}${selectedTags.includes(tag.name) ? '30' : '15'}`,
                      color: tag.color
                    }}
                    onClick={() => toggleTag(tag.name)}
                    type="button"
                  >
                    <span>{tag.name}</span>
                    {selectedTags.includes(tag.name) && (
                      <X size={14} className="ml-1.5" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No tags found</div>
            )}
          </div>
          
          {/* Date range */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <Calendar size={16} className="mr-1.5 text-gray-500" />
              Date Range
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={dateRange.start}
                  onChange={handleDateStartChange}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={dateRange.end}
                  onChange={handleDateEndChange}
                />
              </div>
            </div>
          </div>
          
          {/* File size range */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
              <Info size={16} className="mr-1.5 text-gray-500" />
              File Size (KB)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min size</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                  value={sizeRange.min}
                  onChange={handleSizeMinChange}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max size</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Unlimited"
                  value={sizeRange.max}
                  onChange={handleSizeMaxChange}
                />
              </div>
            </div>
          </div>
          
          {/* Active filters summary */}
          {(selectedTypes.length > 0 || selectedTags.length > 0 || dateRange.start || dateRange.end || sizeRange.min || sizeRange.max) && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter size={16} className="mr-1.5 text-gray-500" />
                  Active Filters
                </h3>
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={clearSearch}
                  type="button"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTypes.length > 0 && (
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <FileType size={12} className="mr-1" />
                    <span>{selectedTypes.length} file types</span>
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <Tag size={12} className="mr-1" />
                    <span>{selectedTags.length} tags</span>
                  </div>
                )}
                {(dateRange.start || dateRange.end) && (
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>
                      {dateRange.start ? formatDate(dateRange.start) : 'Any'} to {dateRange.end ? formatDate(dateRange.end) : 'Any'}
                    </span>
                  </div>
                )}
                {(sizeRange.min || sizeRange.max) && (
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center">
                    <Info size={12} className="mr-1" />
                    <span>
                      {sizeRange.min || '0'} KB to {sizeRange.max || 'Unlimited'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <div>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200"
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            type="button"
          >
            <Save size={16} className="mr-1.5" />
            Save Search
          </button>
          
          {/* Save search dialog */}
          {showSaveDialog && (
            <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-80">
              <h3 className="text-sm font-medium mb-2">Save Current Search</h3>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter a name for this search"
                value={savedSearchName}
                onChange={handleSavedSearchNameChange}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  onClick={() => setShowSaveDialog(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={saveSearch}
                  disabled={!savedSearchName.trim()}
                  type="button"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            onClick={clearSearch}
            type="button"
          >
            Reset
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleSearch}
            type="button"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;