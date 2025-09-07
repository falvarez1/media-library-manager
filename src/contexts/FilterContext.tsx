'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
  ReactNode
} from 'react';
import { 
  MediaFilterOptions, 
  SortField, 
  SortOrder, 
  TagId,
  MediaType,
  FolderId,
  Status,
  DateString 
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Filter context state interface
 */
interface FilterState {
  /** Current filter options */
  filters: MediaFilterOptions;
  /** Whether any filters are currently active */
  filterActive: boolean;
  /** Current sort field */
  sortBy: SortField;
  /** Current sort order */
  sortOrder: SortOrder;
  /** Currently selected tags */
  selectedTags: TagId[];
}

/**
 * Filter context actions
 */
type FilterAction =
  | { type: 'SET_FILTERS'; payload: MediaFilterOptions }
  | { type: 'UPDATE_FILTER'; payload: Partial<MediaFilterOptions> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT_BY'; payload: SortField }
  | { type: 'SET_SORT_ORDER'; payload: SortOrder }
  | { type: 'TOGGLE_SORT_ORDER' }
  | { type: 'ADD_TAG'; payload: TagId }
  | { type: 'REMOVE_TAG'; payload: TagId }
  | { type: 'CLEAR_TAGS' }
  | { type: 'APPLY_PRESET_FILTER'; payload: PresetFilterType }
  | { type: 'RESTORE_FROM_STORAGE'; payload: FilterState };

/**
 * Preset filter types for common filtering scenarios
 */
type PresetFilterType = 
  | 'recent' 
  | 'favorites' 
  | 'images' 
  | 'videos' 
  | 'documents' 
  | 'unused' 
  | 'starred'
  | 'large_files'
  | 'duplicates';

/**
 * Filter context value interface
 */
interface FilterContextValue {
  // State
  filters: MediaFilterOptions;
  filterActive: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  selectedTags: TagId[];
  
  // Computed values
  hasActiveFilters: boolean;
  filterCount: number;
  appliedFiltersDescription: string;
  
  // Actions
  setFilters: (filters: MediaFilterOptions) => void;
  updateFilter: (partialFilters: Partial<MediaFilterOptions>) => void;
  clearFilters: () => void;
  setSortBy: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  addTag: (tagId: TagId) => void;
  removeTag: (tagId: TagId) => void;
  clearTags: () => void;
  applyPresetFilter: (preset: PresetFilterType) => void;
}

/**
 * Props for the FilterProvider component
 */
interface FilterProviderProps {
  children: ReactNode;
  /** Optional initial filter state */
  initialFilters?: Partial<MediaFilterOptions>;
  /** Whether to persist filters to localStorage */
  persistToStorage?: boolean;
  /** Storage key for persisting filters */
  storageKey?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_FILTERS: MediaFilterOptions = {
  types: [],
  folders: [],
  tags: [],
  status: [],
  dateFrom: undefined,
  dateTo: undefined,
  starred: undefined,
  favorited: undefined,
  used: undefined,
  formats: [],
  hasAttribution: undefined,
  hasMetadata: undefined,
  duplicates: undefined
};

const INITIAL_STATE: FilterState = {
  filters: DEFAULT_FILTERS,
  filterActive: false,
  sortBy: 'modified',
  sortOrder: 'desc',
  selectedTags: []
};

const STORAGE_KEY = 'media_library_filters';

// ============================================================================
// PRESET FILTERS
// ============================================================================

/**
 * Predefined filter configurations for common use cases
 */
const PRESET_FILTERS: Record<PresetFilterType, Partial<MediaFilterOptions>> = {
  recent: {
    ...DEFAULT_FILTERS,
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as DateString
  },
  favorites: {
    ...DEFAULT_FILTERS,
    favorited: true
  },
  images: {
    ...DEFAULT_FILTERS,
    types: ['image']
  },
  videos: {
    ...DEFAULT_FILTERS,
    types: ['video']
  },
  documents: {
    ...DEFAULT_FILTERS,
    types: ['document']
  },
  unused: {
    ...DEFAULT_FILTERS,
    used: false
  },
  starred: {
    ...DEFAULT_FILTERS,
    starred: true
  },
  large_files: {
    ...DEFAULT_FILTERS,
    // This would need additional logic in the backend to filter by file size
  },
  duplicates: {
    ...DEFAULT_FILTERS,
    duplicates: 'only'
  }
};

// ============================================================================
// REDUCER
// ============================================================================

/**
 * Filter state reducer
 */
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload,
        filterActive: hasAnyActiveFilters(action.payload),
        selectedTags: action.payload.tags || []
      };

    case 'UPDATE_FILTER':
      const updatedFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: updatedFilters,
        filterActive: hasAnyActiveFilters(updatedFilters),
        selectedTags: updatedFilters.tags || state.selectedTags
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: DEFAULT_FILTERS,
        filterActive: false,
        selectedTags: []
      };

    case 'SET_SORT_BY':
      return {
        ...state,
        sortBy: action.payload
      };

    case 'SET_SORT_ORDER':
      return {
        ...state,
        sortOrder: action.payload
      };

    case 'TOGGLE_SORT_ORDER':
      return {
        ...state,
        sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
      };

    case 'ADD_TAG':
      if (state.selectedTags.includes(action.payload)) {
        return state;
      }
      const newTagsAdd = [...state.selectedTags, action.payload];
      return {
        ...state,
        selectedTags: newTagsAdd,
        filters: {
          ...state.filters,
          tags: newTagsAdd
        },
        filterActive: true
      };

    case 'REMOVE_TAG':
      const newTagsRemove = state.selectedTags.filter(tag => tag !== action.payload);
      const updatedFiltersRemove = {
        ...state.filters,
        tags: newTagsRemove
      };
      return {
        ...state,
        selectedTags: newTagsRemove,
        filters: updatedFiltersRemove,
        filterActive: hasAnyActiveFilters(updatedFiltersRemove)
      };

    case 'CLEAR_TAGS':
      const updatedFiltersClearTags = {
        ...state.filters,
        tags: []
      };
      return {
        ...state,
        selectedTags: [],
        filters: updatedFiltersClearTags,
        filterActive: hasAnyActiveFilters(updatedFiltersClearTags)
      };

    case 'APPLY_PRESET_FILTER':
      const presetFilters = PRESET_FILTERS[action.payload];
      return {
        ...state,
        filters: presetFilters,
        filterActive: hasAnyActiveFilters(presetFilters),
        selectedTags: presetFilters.tags || []
      };

    case 'RESTORE_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if any filters are currently active
 */
function hasAnyActiveFilters(filters: MediaFilterOptions): boolean {
  return !!(
    (filters.types && filters.types.length > 0) ||
    (filters.folders && filters.folders.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.starred !== undefined ||
    filters.favorited !== undefined ||
    filters.used !== undefined ||
    (filters.formats && filters.formats.length > 0) ||
    filters.hasAttribution !== undefined ||
    filters.hasMetadata !== undefined ||
    filters.duplicates !== undefined
  );
}

/**
 * Counts the number of active filters
 */
function countActiveFilters(filters: MediaFilterOptions): number {
  let count = 0;
  
  if (filters.types && filters.types.length > 0) count++;
  if (filters.folders && filters.folders.length > 0) count++;
  if (filters.tags && filters.tags.length > 0) count++;
  if (filters.status && filters.status.length > 0) count++;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.starred !== undefined) count++;
  if (filters.favorited !== undefined) count++;
  if (filters.used !== undefined) count++;
  if (filters.formats && filters.formats.length > 0) count++;
  if (filters.hasAttribution !== undefined) count++;
  if (filters.hasMetadata !== undefined) count++;
  if (filters.duplicates !== undefined) count++;
  
  return count;
}

/**
 * Generates a human-readable description of applied filters
 */
function getAppliedFiltersDescription(filters: MediaFilterOptions, sortBy: SortField, sortOrder: SortOrder): string {
  const descriptions: string[] = [];
  
  if (filters.types && filters.types.length > 0) {
    descriptions.push(`Types: ${filters.types.join(', ')}`);
  }
  
  if (filters.tags && filters.tags.length > 0) {
    descriptions.push(`Tags: ${filters.tags.length} selected`);
  }
  
  if (filters.folders && filters.folders.length > 0) {
    descriptions.push(`Folders: ${filters.folders.length} selected`);
  }
  
  if (filters.status && filters.status.length > 0) {
    descriptions.push(`Status: ${filters.status.join(', ')}`);
  }
  
  if (filters.dateFrom && filters.dateTo) {
    descriptions.push(`Date range: ${filters.dateFrom} to ${filters.dateTo}`);
  } else if (filters.dateFrom) {
    descriptions.push(`From: ${filters.dateFrom}`);
  } else if (filters.dateTo) {
    descriptions.push(`Until: ${filters.dateTo}`);
  }
  
  if (filters.starred !== undefined) {
    descriptions.push(`Starred: ${filters.starred ? 'Yes' : 'No'}`);
  }
  
  if (filters.favorited !== undefined) {
    descriptions.push(`Favorited: ${filters.favorited ? 'Yes' : 'No'}`);
  }
  
  if (filters.used !== undefined) {
    descriptions.push(`Used: ${filters.used ? 'Yes' : 'No'}`);
  }
  
  if (filters.formats && filters.formats.length > 0) {
    descriptions.push(`Formats: ${filters.formats.join(', ')}`);
  }
  
  if (filters.duplicates) {
    descriptions.push(`Duplicates: ${filters.duplicates}`);
  }
  
  // Add sorting information
  const sortDescription = `Sorted by ${sortBy} (${sortOrder})`;
  descriptions.push(sortDescription);
  
  return descriptions.length > 0 
    ? descriptions.join(' • ') 
    : 'No filters applied';
}

/**
 * Saves filter state to localStorage
 */
function saveToStorage(state: FilterState, storageKey: string): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error);
  }
}

/**
 * Loads filter state from localStorage
 */
function loadFromStorage(storageKey: string): FilterState | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that the stored data has the correct structure
      if (parsed && typeof parsed === 'object' && parsed.filters) {
        return {
          ...INITIAL_STATE,
          ...parsed,
          filters: { ...DEFAULT_FILTERS, ...parsed.filters }
        };
      }
    }
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error);
  }
  return null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * FilterProvider component that manages filter state and provides filtering functionality
 * 
 * @param props - Provider props including children and configuration options
 */
export function FilterProvider({
  children,
  initialFilters = {},
  persistToStorage = true,
  storageKey = STORAGE_KEY
}: FilterProviderProps) {
  // Initialize state with stored values or defaults
  const [state, dispatch] = useReducer(filterReducer, INITIAL_STATE, (initial) => {
    if (persistToStorage) {
      const stored = loadFromStorage(storageKey);
      if (stored) {
        return stored;
      }
    }
    
    const initialState = {
      ...initial,
      filters: { ...DEFAULT_FILTERS, ...initialFilters }
    };
    
    initialState.filterActive = hasAnyActiveFilters(initialState.filters);
    initialState.selectedTags = initialState.filters.tags || [];
    
    return initialState;
  });

  // Save to storage whenever state changes
  useEffect(() => {
    if (persistToStorage) {
      saveToStorage(state, storageKey);
    }
  }, [state, persistToStorage, storageKey]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  /**
   * Sets the complete filter configuration
   * 
   * @param filters - New filter configuration
   */
  const setFilters = useCallback((filters: MediaFilterOptions) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  /**
   * Updates filters with partial configuration (merges with existing)
   * 
   * @param partialFilters - Partial filter configuration to merge
   */
  const updateFilter = useCallback((partialFilters: Partial<MediaFilterOptions>) => {
    dispatch({ type: 'UPDATE_FILTER', payload: partialFilters });
  }, []);

  /**
   * Clears all active filters and resets to defaults
   */
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  /**
   * Sets the sort field
   * 
   * @param field - Sort field to apply
   */
  const setSortBy = useCallback((field: SortField) => {
    dispatch({ type: 'SET_SORT_BY', payload: field });
  }, []);

  /**
   * Sets the sort order
   * 
   * @param order - Sort order to apply (asc/desc)
   */
  const setSortOrder = useCallback((order: SortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: order });
  }, []);

  /**
   * Toggles the current sort order between ascending and descending
   */
  const toggleSortOrder = useCallback(() => {
    dispatch({ type: 'TOGGLE_SORT_ORDER' });
  }, []);

  /**
   * Adds a tag to the current filter selection
   * 
   * @param tagId - Tag ID to add
   */
  const addTag = useCallback((tagId: TagId) => {
    dispatch({ type: 'ADD_TAG', payload: tagId });
  }, []);

  /**
   * Removes a tag from the current filter selection
   * 
   * @param tagId - Tag ID to remove
   */
  const removeTag = useCallback((tagId: TagId) => {
    dispatch({ type: 'REMOVE_TAG', payload: tagId });
  }, []);

  /**
   * Clears all selected tags
   */
  const clearTags = useCallback(() => {
    dispatch({ type: 'CLEAR_TAGS' });
  }, []);

  /**
   * Applies a preset filter configuration for common filtering scenarios
   * 
   * @param preset - Preset filter type to apply
   */
  const applyPresetFilter = useCallback((preset: PresetFilterType) => {
    dispatch({ type: 'APPLY_PRESET_FILTER', payload: preset });
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Whether any filters are currently active
   */
  const hasActiveFilters = useMemo(() => {
    return state.filterActive;
  }, [state.filterActive]);

  /**
   * Number of currently active filters
   */
  const filterCount = useMemo(() => {
    return countActiveFilters(state.filters);
  }, [state.filters]);

  /**
   * Human-readable description of currently applied filters
   */
  const appliedFiltersDescription = useMemo(() => {
    return getAppliedFiltersDescription(state.filters, state.sortBy, state.sortOrder);
  }, [state.filters, state.sortBy, state.sortOrder]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: FilterContextValue = useMemo(() => ({
    // State
    filters: state.filters,
    filterActive: state.filterActive,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    selectedTags: state.selectedTags,
    
    // Computed values
    hasActiveFilters,
    filterCount,
    appliedFiltersDescription,
    
    // Actions
    setFilters,
    updateFilter,
    clearFilters,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    addTag,
    removeTag,
    clearTags,
    applyPresetFilter
  }), [
    state.filters,
    state.filterActive,
    state.sortBy,
    state.sortOrder,
    state.selectedTags,
    hasActiveFilters,
    filterCount,
    appliedFiltersDescription,
    setFilters,
    updateFilter,
    clearFilters,
    setSortBy,
    setSortOrder,
    toggleSortOrder,
    addTag,
    removeTag,
    clearTags,
    applyPresetFilter
  ]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook for accessing filter context
 * 
 * @returns Filter context value with state and actions
 * @throws Error if used outside of FilterProvider
 * 
 * @example
 * ```tsx
 * function MediaGrid() {
 *   const { 
 *     filters, 
 *     sortBy, 
 *     sortOrder, 
 *     hasActiveFilters,
 *     updateFilter,
 *     clearFilters 
 *   } = useFilter();
 * 
 *   // Use filters in your component
 *   return (
 *     <div>
 *       {hasActiveFilters && (
 *         <button onClick={clearFilters}>Clear Filters</button>
 *       )}
 *       // Render filtered media items
 *     </div>
 *   );
 * }
 * ```
 */
export function useFilter(): FilterContextValue {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { FilterContextValue, FilterProviderProps, PresetFilterType };
export { FilterContext };