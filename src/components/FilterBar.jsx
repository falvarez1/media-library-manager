import { X, ChevronDown, Loader } from 'lucide-react';
import { useTags } from '../hooks/useMockApi';

const FilterBar = ({ 
  filters, 
  setFilters, 
  setFilterActive,
  onClose
}) => {
  // Fetch tags data using our hook system
  const { data: tags, loading: tagsLoading, error: tagsError } = useTags();
  
  // Handle clearing all filters
  const clearAllFilters = () => {
    setFilters({
      types: [],
      tags: [],
      dateRange: null,
      usage: null,
      status: []
    });
    setFilterActive(false);
  };
  
  // Remove a specific type filter
  const removeTypeFilter = (type) => {
    setFilters({
      ...filters,
      types: filters.types.filter(t => t !== type)
    });
    
    // If no filters remain, deactivate filtering
    if (
      filters.types.length === 1 && 
      filters.tags.length === 0 && 
      !filters.usage && 
      filters.status.length === 0
    ) {
      setFilterActive(false);
    }
  };
  
  // Remove a specific tag filter
  const removeTagFilter = (tag) => {
    setFilters({
      ...filters,
      tags: filters.tags.filter(t => t !== tag)
    });
    
    // If no filters remain, deactivate filtering
    if (
      filters.types.length === 0 && 
      filters.tags.length === 1 && 
      !filters.usage && 
      filters.status.length === 0
    ) {
      setFilterActive(false);
    }
  };
  
  // Remove usage filter
  const removeUsageFilter = () => {
    setFilters({
      ...filters,
      usage: null
    });
    
    // If no filters remain, deactivate filtering
    if (
      filters.types.length === 0 && 
      filters.tags.length === 0 && 
      filters.status.length === 0
    ) {
      setFilterActive(false);
    }
  };
  
  // Remove a specific status filter
  const removeStatusFilter = (status) => {
    setFilters({
      ...filters,
      status: filters.status.filter(s => s !== status)
    });
    
    // If no filters remain, deactivate filtering
    if (
      filters.types.length === 0 && 
      filters.tags.length === 0 && 
      !filters.usage && 
      filters.status.length === 1
    ) {
      setFilterActive(false);
    }
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    if (e.target.value) {
      setFilters({...filters, types: [e.target.value]});
      setFilterActive(true);
    } else {
      setFilters({...filters, types: []});
      
      // Check if any other filters are active
      if (
        filters.tags.length === 0 && 
        !filters.usage && 
        filters.status.length === 0
      ) {
        setFilterActive(false);
      }
    }
  };
  
  // Handle tag filter change
  const handleTagFilterChange = (e) => {
    if (e.target.value) {
      setFilters({...filters, tags: [e.target.value]});
      setFilterActive(true);
    } else {
      setFilters({...filters, tags: []});
      
      // Check if any other filters are active
      if (
        filters.types.length === 0 && 
        !filters.usage && 
        filters.status.length === 0
      ) {
        setFilterActive(false);
      }
    }
  };
  
  // Handle usage filter change
  const handleUsageFilterChange = (e) => {
    if (e.target.value) {
      setFilters({...filters, usage: e.target.value});
      setFilterActive(true);
    } else {
      setFilters({...filters, usage: null});
      
      // Check if any other filters are active
      if (
        filters.types.length === 0 && 
        filters.tags.length === 0 && 
        filters.status.length === 0
      ) {
        setFilterActive(false);
      }
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    if (e.target.value) {
      setFilters({...filters, status: [e.target.value]});
      setFilterActive(true);
    } else {
      setFilters({...filters, status: []});
      
      // Check if any other filters are active
      if (
        filters.types.length === 0 && 
        filters.tags.length === 0 && 
        !filters.usage
      ) {
        setFilterActive(false);
      }
    }
  };
  
  // Render loading state for tags
  const renderTagsDropdown = () => {
    if (tagsLoading) {
      return (
        <div className="bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 px-3 flex items-center">
          <Loader size={12} className="text-gray-500 animate-spin mr-1" />
          <span>Loading tags...</span>
        </div>
      );
    }
    
    if (tagsError) {
      return (
        <div className="bg-red-100 border border-red-200 text-xs text-red-600 rounded-md py-1.5 px-3">
          Error loading tags
        </div>
      );
    }
    
    return (
      <div className="relative inline-block">
        <select 
          className="appearance-none bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={filters.tags.length ? filters.tags[0] : ''}
          onChange={handleTagFilterChange}
        >
          <option value="">All Tags</option>
          {(tags || []).map(tag => (
            <option key={tag.id} value={tag.name}>{tag.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown size={14} />
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Filters</h3>
        <div className="flex space-x-2">
          <button 
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 hover:bg-gray-100 rounded"
            onClick={clearAllFilters}
          >
            Clear All
          </button>
          <button 
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* File Type Filter */}
        <div className="relative inline-block">
          <select 
            className="appearance-none bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.types.length ? filters.types[0] : ''}
            onChange={handleTypeFilterChange}
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
        
        {/* Tags Filter */}
        {renderTagsDropdown()}
        
        {/* Usage Filter */}
        <div className="relative inline-block">
          <select 
            className="appearance-none bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.usage || ''}
            onChange={handleUsageFilterChange}
          >
            <option value="">Usage Status</option>
            <option value="used">Used</option>
            <option value="unused">Unused</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="relative inline-block">
          <select 
            className="appearance-none bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.status.length ? filters.status[0] : ''}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="in_review">In Review</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDown size={14} />
          </div>
        </div>
        
        {/* Active Filter Tags */}
        {(filters.types.length > 0 || filters.tags.length > 0 || filters.usage || filters.status.length > 0) && (
          <div className="flex flex-wrap gap-1 ml-2">
            {filters.types.map(type => (
              <div key={type} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center">
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button 
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  onClick={() => removeTypeFilter(type)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {filters.tags.map(tag => (
              <div key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md flex items-center">
                <span>Tag: {tag}</span>
                <button 
                  className="ml-1 text-green-600 hover:text-green-800"
                  onClick={() => removeTagFilter(tag)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {filters.usage && (
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-md flex items-center">
                <span>{filters.usage === 'used' ? 'Used Items' : 'Unused Items'}</span>
                <button 
                  className="ml-1 text-purple-600 hover:text-purple-800"
                  onClick={removeUsageFilter}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {filters.status.map(status => (
              <div key={status} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md flex items-center">
                <span>Status: {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</span>
                <button 
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                  onClick={() => removeStatusFilter(status)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
