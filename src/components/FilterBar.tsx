import React from 'react';
import { X, ChevronDown, Loader, Filter } from 'lucide-react';
import { useTags } from '../hooks/useApi';
import { useFilter } from '../contexts';
import { useUIState } from '../contexts/UIStateContext';
import {
  MediaType,
  TagId,
  Status,
  ChangeEvent
} from '../types';

interface FilterBarProps {
  onClose?: () => void;
  filters?: any;
  setFilters?: any;
  setFilterActive?: any;
}

const FilterBar: React.FC<FilterBarProps> = ({ onClose }) => {
  const { 
    filters, 
    setFilters,
    clearFilters
  } = useFilter();
  // Fetch tags data using our hook system
  const { data: tags, loading: tagsLoading, error: tagsError } = useTags();
  
  // Handle clearing all filters
  const clearAllFilters = (): void => {
    clearFilters();
  };
  
  // Remove a specific type filter
  const removeTypeFilter = (type: string): void => {
    setFilters({
      ...filters,
      types: (filters.types || []).filter(t => t !== type)
    });
  };
  
  // Remove a specific tag filter
  const removeTagFilter = (tag: string): void => {
    setFilters({
      ...filters,
      tags: (filters.tags || []).filter(t => t !== tag)
    });
  };
  
  // Remove usage filter
  const removeUsageFilter = (): void => {
    setFilters({
      ...filters,
      used: undefined
    });
  };
  
  // Remove a specific status filter
  const removeStatusFilter = (status: string): void => {
    setFilters({
      ...filters,
      status: (filters.status || []).filter(s => s !== status)
    });
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (e.target.value) {
      setFilters({...filters, types: [e.target.value as MediaType]});
    } else {
      setFilters({...filters, types: []});
    }
  };
  
  // Handle tag filter change
  const handleTagFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (e.target.value) {
      setFilters({...filters, tags: [e.target.value as TagId]});
    } else {
      setFilters({...filters, tags: []});
    }
  };
  
  // Handle usage filter change
  const handleUsageFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    if (value) {
      setFilters({...filters, used: value === 'used'});
    } else {
      setFilters({...filters, used: undefined});
    }
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    if (e.target.value) {
      setFilters({...filters, status: [e.target.value as Status]});
    } else {
      setFilters({...filters, status: []});
    }
  };
  
  // Render loading state for tags
  const renderTagsDropdown = (): React.JSX.Element => {
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
          value={(filters.tags?.length || 0) > 0 ? filters.tags![0] : ''}
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
          {onClose && (
            <button 
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* File Type Filter */}
        <div className="relative inline-block">
          <select 
            className="appearance-none bg-gray-100 border border-gray-200 text-xs rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={(filters.types?.length || 0) > 0 ? filters.types![0] : ''}
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
            value={filters.used === true ? 'used' : filters.used === false ? 'unused' : ''}
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
            value={(filters.status?.length || 0) > 0 ? filters.status![0] : ''}
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
        {((filters.types?.length || 0) > 0 || (filters.tags?.length || 0) > 0 || filters.used !== undefined || (filters.status?.length || 0) > 0) && (
          <div className="flex flex-wrap gap-1 ml-2">
            {(filters.types || []).map(type => (
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
            
            {(filters.tags || []).map(tag => (
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
            
            {filters.used !== undefined && (
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-md flex items-center">
                <span>{filters.used ? 'Used Items' : 'Unused Items'}</span>
                <button 
                  className="ml-1 text-purple-600 hover:text-purple-800"
                  onClick={removeUsageFilter}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {(filters.status || []).map(status => (
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