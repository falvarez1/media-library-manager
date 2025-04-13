import { useState, useRef, useEffect } from 'react';
import { X, Plus, Check, Tag } from 'lucide-react';
import { useTags, useTagSuggestions } from '../hooks/useApi';

const TagSelector = ({ 
  selectedTags = [], 
  onTagsChange,
  maxItems = null,
  showCount = true,
  autoFocus = false,
  multiSelect = true,
  placeholder = "Add tags..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch all tags for display
  const { data: allTags, loading: tagsLoading } = useTags({ sortBy: 'count', sortDir: 'desc' });
  
  // Fetch tag suggestions based on input
  const { data: suggestions, loading: suggestionsLoading } = useTagSuggestions(
    inputValue,
    { limit: 8 },
    [inputValue]
  );

  // Filter out already selected tags from suggestions
  const filteredSuggestions = suggestions ? 
    suggestions.filter(tag => !selectedTags.includes(tag.name)) : [];

  // Focus input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Add a tag
  const addTag = (tagName) => {
    if (!tagName || selectedTags.includes(tagName)) return;
    
    if (!multiSelect) {
      // If not multi-select, replace the current selection
      onTagsChange([tagName]);
    } else {
      // Check if we've hit the maximum number of items (if specified)
      if (maxItems !== null && selectedTags.length >= maxItems) return;
      
      onTagsChange([...selectedTags, tagName]);
    }
    
    setInputValue('');
    setHighlightedIndex(0);
    
    // Re-focus the input after adding a tag
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove a tag
  const removeTag = (tagName) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagName));
    
    // Re-focus the input after removing a tag
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Clear all tags
  const clearTags = () => {
    onTagsChange([]);
    
    // Re-focus the input after clearing tags
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      e.preventDefault();
      addTag(filteredSuggestions[highlightedIndex].name);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      // Remove the last tag when pressing backspace with empty input
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setIsActive(false);
      inputRef.current.blur();
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find tag color from all tags
  const getTagColor = (tagName) => {
    if (!allTags) return '#3B82F6'; // Default blue
    const tag = allTags.find(t => t.name === tagName);
    return tag ? tag.color : '#3B82F6';
  };

  // Get tag count from all tags
  const getTagCount = (tagName) => {
    if (!allTags) return 0;
    const tag = allTags.find(t => t.name === tagName);
    return tag ? tag.count : 0;
  };

  return (
    <div ref={containerRef} className="relative">
      <div 
        className={`flex flex-wrap items-center gap-1 p-2 border rounded-md ${
          isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
        } bg-white min-h-[38px]`}
        onClick={() => {
          setIsActive(true);
          inputRef.current.focus();
        }}
      >
        {/* Selected tags */}
        {selectedTags.map(tag => (
          <div 
            key={tag}
            className="flex items-center px-2 py-1 text-xs rounded-full text-gray-700"
            style={{ 
              backgroundColor: `${getTagColor(tag)}20`, 
              color: getTagColor(tag)
            }}
          >
            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getTagColor(tag) }}></span>
            <span>{tag}</span>
            {showCount && (
              <span className="ml-1 text-xs opacity-70">({getTagCount(tag)})</span>
            )}
            <button 
              onClick={() => removeTag(tag)}
              className="ml-1 p-0.5 rounded-full hover:bg-gray-200"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] outline-none text-sm"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsActive(true);
          }}
          onFocus={() => setIsActive(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
        />
        
        {/* Clear button - only shown when tags are selected */}
        {selectedTags.length > 0 && (
          <button 
            className="ml-auto p-1 text-gray-400 hover:text-gray-600"
            onClick={clearTags}
            title="Clear all tags"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isActive && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestionsLoading ? (
            <div className="p-2 text-center text-gray-500">Loading suggestions...</div>
          ) : filteredSuggestions.length > 0 ? (
            <ul>
              {filteredSuggestions.map((tag, index) => (
                <li 
                  key={tag.id}
                  className={`px-3 py-2 cursor-pointer flex items-center text-sm ${
                    index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => addTag(tag.name)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  ></span>
                  <span className="flex-1">{tag.name}</span>
                  {showCount && (
                    <span className="text-xs text-gray-500">({tag.count})</span>
                  )}
                </li>
              ))}
            </ul>
          ) : inputValue.trim() !== '' ? (
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm">Create "{inputValue}"</span>
              <button 
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => addTag(inputValue.trim())}
              >
                <Plus size={12} className="mr-1 inline" />
                Add
              </button>
            </div>
          ) : (
            <div className="p-2 text-sm text-gray-500">
              {tagsLoading ? (
                <p className="text-center">Loading tags...</p>
              ) : allTags && allTags.length > 0 ? (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-gray-500">Popular Tags</p>
                  <div className="flex flex-wrap gap-1 p-2">
                    {allTags.slice(0, 12).map(tag => (
                      <div 
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded-full cursor-pointer flex items-center"
                        style={{ 
                          backgroundColor: `${tag.color}20`, 
                          color: tag.color
                        }}
                        onClick={() => addTag(tag.name)}
                      >
                        <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }}></span>
                        <span>{tag.name}</span>
                        {showCount && (
                          <span className="ml-1 opacity-70">({tag.count})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center">No tags found. Type to create a new tag.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;