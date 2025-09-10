import { ApiResponse, MediaItem, MediaId, FolderId, CollectionId } from '../../types';

export function getMediaById(id: MediaId): Promise<ApiResponse<MediaItem>>;
export function getMediaInFolder(folderId: FolderId, options?: any): Promise<ApiResponse<any>>;
export function getMediaInCollection(collectionId: CollectionId, options?: any): Promise<ApiResponse<any>>;
export function searchMedia(query: string, options?: any): Promise<ApiResponse<any>>;
export function uploadMedia(files: File[], folderId?: FolderId): Promise<ApiResponse<any>>;
export function updateMedia(id: MediaId, updates: Partial<MediaItem>): Promise<ApiResponse<MediaItem>>;
export function deleteMedia(ids: MediaId[]): Promise<ApiResponse<any>>;
export function moveMedia(mediaIds: MediaId[], targetFolderId: FolderId): Promise<ApiResponse<any>>;
export function copyMedia(mediaIds: MediaId[], targetFolderId: FolderId): Promise<ApiResponse<any>>;
export function exportMedia(mediaIds: MediaId[], format?: string): Promise<ApiResponse<any>>;
export function shareMedia(mediaIds: MediaId[], recipients: string[]): Promise<ApiResponse<any>>;
export function addMediaToCollection(mediaIds: MediaId[], collectionId: CollectionId): Promise<ApiResponse<any>>;
export function removeMediaFromCollection(mediaIds: MediaId[], collectionId: CollectionId): Promise<ApiResponse<any>>;
export function toggleStar(mediaId: MediaId): Promise<ApiResponse<any>>;
export function toggleFavorite(mediaId: MediaId): Promise<ApiResponse<any>>;