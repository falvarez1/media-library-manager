import { ApiResponse, Collection, CollectionId, HexColor, UserId } from '../../types';

export function getCollections(): Promise<ApiResponse<{ items: Collection[]; total: number }>>;
export function getCollectionById(id: CollectionId): Promise<ApiResponse<Collection>>;
export function createCollection(data: { name: string; description?: string; color?: HexColor; parentId?: CollectionId | null; isShared?: boolean; sharedWith?: UserId[] }): Promise<ApiResponse<Collection>>;
export function updateCollection(id: CollectionId, updates: Partial<Collection>): Promise<ApiResponse<Collection>>;
export function deleteCollection(id: CollectionId): Promise<ApiResponse<any>>;