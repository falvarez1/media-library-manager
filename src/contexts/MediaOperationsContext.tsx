'use client';

import { 
  createContext, 
  useContext, 
  useCallback, 
  useMemo, 
  useReducer,
  ReactNode,
  useEffect
} from 'react';
import { 
  MediaId,
  ISO8601String 
} from '../types';
import {
  moveMedia,
  copyMedia,
  exportMedia,
  shareMedia,
  bulkImport,
  getJobStatus,
  cancelJob,
  duplicateMedia,
  renameMedia,
  convertMedia,
  compressMedia,
  generateThumbnails,
  extractMetadata,
  validateMedia,
  restoreMedia,
  permanentlyDeleteMedia,
  MoveMediaRequest,
  CopyMediaRequest,
  ExportMediaRequest,
  ShareMediaRequest,
  BulkImportOptions,
  OperationResult,
  ExportResult,
  ShareResult,
  ImportResult,
  JobStatus
} from '../services/api/mediaOperations';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Operation status types
 */
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Active operation info
 */
export interface ActiveOperation {
  id: string;
  type: 'move' | 'copy' | 'export' | 'share' | 'import' | 'duplicate' | 'rename' | 'convert' | 'compress' | 'delete';
  status: OperationStatus;
  progress?: number;
  mediaIds: MediaId[];
  startedAt: ISO8601String;
  completedAt?: ISO8601String;
  result?: OperationResult | ExportResult | ShareResult | ImportResult;
  error?: string;
  jobId?: string;
}

/**
 * Media operations state
 */
export interface MediaOperationsState {
  /** Currently active operations */
  activeOperations: ActiveOperation[];
  /** Last operation result */
  lastResult: OperationResult | ExportResult | ShareResult | ImportResult | null;
  /** Last error message */
  lastError: string | null;
  /** Whether any operation is currently running */
  isOperating: boolean;
  /** Operation history for tracking */
  operationHistory: ActiveOperation[];
}

/**
 * Media operations actions
 */
export type MediaOperationsAction =
  | { type: 'START_OPERATION'; payload: Omit<ActiveOperation, 'status'> & { status?: OperationStatus } }
  | { type: 'UPDATE_OPERATION'; payload: { id: string; updates: Partial<ActiveOperation> } }
  | { type: 'COMPLETE_OPERATION'; payload: { id: string; result: any; error?: string } }
  | { type: 'REMOVE_OPERATION'; payload: string }
  | { type: 'CLEAR_OPERATIONS' }
  | { type: 'SET_LAST_ERROR'; payload: string | null }
  | { type: 'CLEAR_HISTORY' };

/**
 * Media operations context interface
 */
export interface MediaOperationsContextValue {
  // State
  state: MediaOperationsState;
  activeOperations: ActiveOperation[];
  lastResult: OperationResult | ExportResult | ShareResult | ImportResult | null;
  lastError: string | null;
  isOperating: boolean;
  
  // Media management operations
  moveMedia: (request: MoveMediaRequest) => Promise<OperationResult>;
  copyMedia: (request: CopyMediaRequest) => Promise<OperationResult>;
  duplicateMedia: (mediaIds: MediaId[], options?: { namePrefix?: string; nameSuffix?: string; preserveMetadata?: boolean }) => Promise<OperationResult & { newItems: any[] }>;
  renameMedia: (renames: Array<{ mediaId: MediaId; newName: string }>) => Promise<OperationResult>;
  deleteMedia: (mediaIds: MediaId[]) => Promise<OperationResult>;
  restoreMedia: (mediaIds: MediaId[]) => Promise<OperationResult>;
  
  // Export and sharing operations
  exportMedia: (request: ExportMediaRequest) => Promise<ExportResult>;
  shareMedia: (request: ShareMediaRequest) => Promise<ShareResult>;
  
  // Import and conversion operations
  bulkImport: (options: BulkImportOptions) => Promise<ImportResult>;
  convertMedia: (conversions: Array<{ mediaId: MediaId; targetFormat: string; quality?: 'low' | 'medium' | 'high' | 'lossless'; options?: Record<string, any> }>) => Promise<ImportResult>;
  compressMedia: (compressions: Array<{ mediaId: MediaId; quality?: number; maxSize?: number; preserveMetadata?: boolean }>) => Promise<ImportResult>;
  
  // Utility operations
  generateThumbnails: (mediaIds: MediaId[], options?: { sizes?: Array<'small' | 'medium' | 'large'>; quality?: number; format?: 'jpg' | 'png' | 'webp'; overwrite?: boolean }) => Promise<OperationResult>;
  extractMetadata: (mediaIds: MediaId[], options?: { overwrite?: boolean; includeExif?: boolean; includeAI?: boolean }) => Promise<OperationResult>;
  validateMedia: (mediaIds: MediaId[]) => Promise<{ valid: MediaId[]; invalid: Array<{ mediaId: MediaId; reason: string }>; corrupted: Array<{ mediaId: MediaId; error: string }> }>;
  
  // Job management
  getJobStatus: (jobId: string) => Promise<JobStatus>;
  cancelJob: (jobId: string) => Promise<{ success: boolean }>;
  
  // Operation management
  clearOperations: () => void;
  clearHistory: () => void;
  clearLastError: () => void;
  getOperationById: (id: string) => ActiveOperation | undefined;
}

/**
 * Media operations provider props
 */
export interface MediaOperationsProviderProps {
  children: ReactNode;
  /** Initial state override */
  initialState?: Partial<MediaOperationsState>;
  /** Auto-clear completed operations after this many milliseconds */
  autoClearDelay?: number;
}

// ============================================================================
// REDUCER
// ============================================================================

/**
 * Media operations state reducer
 */
function mediaOperationsReducer(
  state: MediaOperationsState, 
  action: MediaOperationsAction
): MediaOperationsState {
  switch (action.type) {
    case 'START_OPERATION': {
      const operation: ActiveOperation = {
        ...action.payload,
        status: action.payload.status || 'loading'
      };

      return {
        ...state,
        activeOperations: [...state.activeOperations, operation],
        isOperating: true,
        lastError: null
      };
    }

    case 'UPDATE_OPERATION': {
      const { id, updates } = action.payload;
      
      return {
        ...state,
        activeOperations: state.activeOperations.map(op => 
          op.id === id ? { ...op, ...updates } : op
        )
      };
    }

    case 'COMPLETE_OPERATION': {
      const { id, result, error } = action.payload;
      const completedAt = new Date().toISOString() as ISO8601String;
      
      const updatedOperations = state.activeOperations.map(op => 
        op.id === id 
          ? { 
              ...op, 
              status: error ? 'error' as OperationStatus : 'success' as OperationStatus, 
              result,
              error,
              completedAt,
              progress: 100
            }
          : op
      );

      const completedOp = updatedOperations.find(op => op.id === id);
      const hasActiveOps = updatedOperations.some(op => op.status === 'loading');

      return {
        ...state,
        activeOperations: updatedOperations,
        lastResult: result || state.lastResult,
        lastError: error || null,
        isOperating: hasActiveOps,
        operationHistory: completedOp 
          ? [...state.operationHistory, completedOp].slice(-50) // Keep last 50 operations
          : state.operationHistory
      };
    }

    case 'REMOVE_OPERATION': {
      const filteredOps = state.activeOperations.filter(op => op.id !== action.payload);
      
      return {
        ...state,
        activeOperations: filteredOps,
        isOperating: filteredOps.some(op => op.status === 'loading')
      };
    }

    case 'CLEAR_OPERATIONS': {
      return {
        ...state,
        activeOperations: [],
        isOperating: false
      };
    }

    case 'SET_LAST_ERROR': {
      return {
        ...state,
        lastError: action.payload
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        operationHistory: []
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

/**
 * Default media operations state
 */
const defaultMediaOperationsState: MediaOperationsState = {
  activeOperations: [],
  lastResult: null,
  lastError: null,
  isOperating: false,
  operationHistory: []
};

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Media operations context
 */
const MediaOperationsContext = createContext<MediaOperationsContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Media operations context provider component
 * 
 * Provides media operation functionality and state management to child components.
 * Handles media operations like move, copy, export, share, and batch operations.
 * 
 * @param children - Child components
 * @param initialState - Optional initial state override
 * @param autoClearDelay - Auto-clear completed operations delay in ms (default: 10000)
 */
export function MediaOperationsProvider({ 
  children, 
  initialState,
  autoClearDelay = 10000
}: MediaOperationsProviderProps) {
  // Initialize state with potential overrides
  const initialStateWithDefaults = useMemo(() => ({
    ...defaultMediaOperationsState,
    ...initialState
  }), [initialState]);

  const [state, dispatch] = useReducer(mediaOperationsReducer, initialStateWithDefaults);

  // Auto-clear completed operations
  useEffect(() => {
    if (autoClearDelay > 0) {
      const completedOps = state.activeOperations.filter(op => 
        op.status === 'success' || op.status === 'error'
      );

      if (completedOps.length > 0) {
        const timeoutId = setTimeout(() => {
          completedOps.forEach(op => {
            if (op.completedAt) {
              const timeSinceCompletion = Date.now() - new Date(op.completedAt).getTime();
              if (timeSinceCompletion >= autoClearDelay) {
                dispatch({ type: 'REMOVE_OPERATION', payload: op.id });
              }
            }
          });
        }, autoClearDelay);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [state.activeOperations, autoClearDelay]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Generate unique operation ID
   */
  const generateOperationId = useCallback(() => {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Execute operation with error handling and state management
   */
  const executeOperation = useCallback(async <T,>(
    type: ActiveOperation['type'],
    mediaIds: MediaId[],
    operation: () => Promise<T>,
    jobId?: string
  ): Promise<T> => {
    const operationId = generateOperationId();
    
    dispatch({
      type: 'START_OPERATION',
      payload: {
        id: operationId,
        type,
        mediaIds,
        startedAt: new Date().toISOString() as ISO8601String,
        jobId,
        status: 'loading'
      }
    });

    try {
      const result = await operation();
      
      dispatch({
        type: 'COMPLETE_OPERATION',
        payload: { id: operationId, result }
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      
      dispatch({
        type: 'COMPLETE_OPERATION',
        payload: { id: operationId, result: null, error: errorMessage }
      });

      throw error;
    }
  }, [generateOperationId]);

  // ============================================================================
  // OPERATION FUNCTIONS
  // ============================================================================

  /**
   * Move media items to a different folder
   */
  const handleMoveMedia = useCallback(async (request: MoveMediaRequest): Promise<OperationResult> => {
    const response = await executeOperation('move', request.mediaIds, async () => {
      const apiResponse = await moveMedia(request);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Move operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Copy media items to a different folder
   */
  const handleCopyMedia = useCallback(async (request: CopyMediaRequest): Promise<OperationResult> => {
    const response = await executeOperation('copy', request.mediaIds, async () => {
      const apiResponse = await copyMedia(request);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Copy operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Duplicate media items
   */
  const handleDuplicateMedia = useCallback(async (
    mediaIds: MediaId[], 
    options: { namePrefix?: string; nameSuffix?: string; preserveMetadata?: boolean } = {}
  ): Promise<OperationResult & { newItems: any[] }> => {
    const response = await executeOperation('duplicate', mediaIds, async () => {
      const apiResponse = await duplicateMedia(mediaIds, options);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Duplicate operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Rename media items
   */
  const handleRenameMedia = useCallback(async (
    renames: Array<{ mediaId: MediaId; newName: string }>
  ): Promise<OperationResult> => {
    const mediaIds = renames.map(r => r.mediaId);
    
    const response = await executeOperation('rename', mediaIds, async () => {
      const apiResponse = await renameMedia(renames);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Rename operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Delete media items (move to trash)
   */
  const handleDeleteMedia = useCallback(async (mediaIds: MediaId[]): Promise<OperationResult> => {
    const response = await executeOperation('delete', mediaIds, async () => {
      const apiResponse = await permanentlyDeleteMedia(mediaIds);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Delete operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Restore media items from trash
   */
  const handleRestoreMedia = useCallback(async (mediaIds: MediaId[]): Promise<OperationResult> => {
    const response = await executeOperation('move', mediaIds, async () => {
      const apiResponse = await restoreMedia(mediaIds);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Restore operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Export media items
   */
  const handleExportMedia = useCallback(async (request: ExportMediaRequest): Promise<ExportResult> => {
    const response = await executeOperation('export', request.mediaIds, async () => {
      const apiResponse = await exportMedia(request);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Export operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Share media items
   */
  const handleShareMedia = useCallback(async (request: ShareMediaRequest): Promise<ShareResult> => {
    const response = await executeOperation('share', request.mediaIds, async () => {
      const apiResponse = await shareMedia(request);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Share operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Bulk import media
   */
  const handleBulkImport = useCallback(async (options: BulkImportOptions): Promise<ImportResult> => {
    const response = await executeOperation('import', [], async () => {
      const apiResponse = await bulkImport(options);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Import operation failed');
      }
      return apiResponse.data;
    }, undefined);
    
    return response;
  }, [executeOperation]);

  /**
   * Convert media formats
   */
  const handleConvertMedia = useCallback(async (
    conversions: Array<{ mediaId: MediaId; targetFormat: string; quality?: 'low' | 'medium' | 'high' | 'lossless'; options?: Record<string, any> }>
  ): Promise<ImportResult> => {
    const mediaIds = conversions.map(c => c.mediaId);
    
    const response = await executeOperation('convert', mediaIds, async () => {
      const apiResponse = await convertMedia(conversions);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Convert operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Compress media items
   */
  const handleCompressMedia = useCallback(async (
    compressions: Array<{ mediaId: MediaId; quality?: number; maxSize?: number; preserveMetadata?: boolean }>
  ): Promise<ImportResult> => {
    const mediaIds = compressions.map(c => c.mediaId);
    
    const response = await executeOperation('compress', mediaIds, async () => {
      const apiResponse = await compressMedia(compressions);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Compress operation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Generate thumbnails
   */
  const handleGenerateThumbnails = useCallback(async (
    mediaIds: MediaId[],
    options: { sizes?: Array<'small' | 'medium' | 'large'>; quality?: number; format?: 'jpg' | 'png' | 'webp'; overwrite?: boolean } = {}
  ): Promise<OperationResult> => {
    const response = await executeOperation('move', mediaIds, async () => {
      const apiResponse = await generateThumbnails(mediaIds, options);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Thumbnail generation failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Extract metadata
   */
  const handleExtractMetadata = useCallback(async (
    mediaIds: MediaId[],
    options: { overwrite?: boolean; includeExif?: boolean; includeAI?: boolean } = {}
  ): Promise<OperationResult> => {
    const response = await executeOperation('move', mediaIds, async () => {
      const apiResponse = await extractMetadata(mediaIds, options);
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Metadata extraction failed');
      }
      return apiResponse.data;
    });
    
    return response;
  }, [executeOperation]);

  /**
   * Validate media files
   */
  const handleValidateMedia = useCallback(async (mediaIds: MediaId[]) => {
    const apiResponse = await validateMedia(mediaIds);
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Media validation failed');
    }
    return apiResponse.data;
  }, []);

  /**
   * Get job status
   */
  const handleGetJobStatus = useCallback(async (jobId: string): Promise<JobStatus> => {
    const apiResponse = await getJobStatus(jobId);
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to get job status');
    }
    return apiResponse.data;
  }, []);

  /**
   * Cancel job
   */
  const handleCancelJob = useCallback(async (jobId: string): Promise<{ success: boolean }> => {
    const apiResponse = await cancelJob(jobId);
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to cancel job');
    }
    return apiResponse.data;
  }, []);

  // ============================================================================
  // STATE MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Clear all operations
   */
  const clearOperations = useCallback(() => {
    dispatch({ type: 'CLEAR_OPERATIONS' });
  }, []);

  /**
   * Clear operation history
   */
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  /**
   * Clear last error
   */
  const clearLastError = useCallback(() => {
    dispatch({ type: 'SET_LAST_ERROR', payload: null });
  }, []);

  /**
   * Get operation by ID
   */
  const getOperationById = useCallback((id: string) => {
    return state.activeOperations.find(op => op.id === id) || 
           state.operationHistory.find(op => op.id === id);
  }, [state.activeOperations, state.operationHistory]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = useMemo<MediaOperationsContextValue>(() => ({
    // State
    state,
    activeOperations: state.activeOperations,
    lastResult: state.lastResult,
    lastError: state.lastError,
    isOperating: state.isOperating,
    
    // Media management operations
    moveMedia: handleMoveMedia,
    copyMedia: handleCopyMedia,
    duplicateMedia: handleDuplicateMedia,
    renameMedia: handleRenameMedia,
    deleteMedia: handleDeleteMedia,
    restoreMedia: handleRestoreMedia,
    
    // Export and sharing operations
    exportMedia: handleExportMedia,
    shareMedia: handleShareMedia,
    
    // Import and conversion operations
    bulkImport: handleBulkImport,
    convertMedia: handleConvertMedia,
    compressMedia: handleCompressMedia,
    
    // Utility operations
    generateThumbnails: handleGenerateThumbnails,
    extractMetadata: handleExtractMetadata,
    validateMedia: handleValidateMedia,
    
    // Job management
    getJobStatus: handleGetJobStatus,
    cancelJob: handleCancelJob,
    
    // Operation management
    clearOperations,
    clearHistory,
    clearLastError,
    getOperationById
  }), [
    state,
    handleMoveMedia,
    handleCopyMedia,
    handleDuplicateMedia,
    handleRenameMedia,
    handleDeleteMedia,
    handleRestoreMedia,
    handleExportMedia,
    handleShareMedia,
    handleBulkImport,
    handleConvertMedia,
    handleCompressMedia,
    handleGenerateThumbnails,
    handleExtractMetadata,
    handleValidateMedia,
    handleGetJobStatus,
    handleCancelJob,
    clearOperations,
    clearHistory,
    clearLastError,
    getOperationById
  ]);

  return (
    <MediaOperationsContext.Provider value={contextValue}>
      {children}
    </MediaOperationsContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing media operations context
 * 
 * @returns Media operations context value
 * @throws Error if used outside of MediaOperationsProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     moveMedia, 
 *     isOperating,
 *     activeOperations,
 *     lastError 
 *   } = useMediaOperations();
 *   
 *   const handleMove = async () => {
 *     try {
 *       await moveMedia({
 *         mediaIds: ['media-1', 'media-2'],
 *         targetFolderId: 'folder-123'
 *       });
 *     } catch (error) {
 *       console.error('Move failed:', error);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleMove} disabled={isOperating}>
 *         {isOperating ? 'Moving...' : 'Move Media'}
 *       </button>
 *       {lastError && <div className="error">{lastError}</div>}
 *       <div>Active operations: {activeOperations.length}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaOperations(): MediaOperationsContextValue {
  const context = useContext(MediaOperationsContext);
  
  if (!context) {
    throw new Error(
      'useMediaOperations must be used within a MediaOperationsProvider. ' +
      'Ensure that your component is wrapped with <MediaOperationsProvider>.'
    );
  }
  
  return context;
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for checking if specific media items are being operated on
 */
export function useIsMediaBeingOperated(mediaIds: MediaId[]): boolean {
  const { activeOperations } = useMediaOperations();
  
  return useMemo(() => {
    return activeOperations.some(op => 
      op.status === 'loading' && 
      mediaIds.some(id => op.mediaIds.includes(id))
    );
  }, [activeOperations, mediaIds]);
}

/**
 * Hook for getting active operations count
 */
export function useActiveOperationsCount(): number {
  const { activeOperations } = useMediaOperations();
  return activeOperations.filter(op => op.status === 'loading').length;
}

/**
 * Hook for getting operations by type
 */
export function useOperationsByType(type: ActiveOperation['type']): ActiveOperation[] {
  const { activeOperations, state } = useMediaOperations();
  
  return useMemo(() => {
    return [
      ...activeOperations.filter(op => op.type === type),
      ...state.operationHistory.filter(op => op.type === type).slice(-10) // Last 10 of this type
    ];
  }, [activeOperations, state.operationHistory, type]);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MediaOperationsContext;

// Export types for external use (avoid conflicts by not re-exporting already exported interfaces)
