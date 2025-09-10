import { ApiResponse, Folder, FolderId, HexColor } from '../../types';

export function getFolders(): Promise<ApiResponse<{ items: Folder[]; total: number }>>;
export function getFolderById(id: FolderId): Promise<ApiResponse<Folder>>;
export function createFolder(data: { name: string; parent: FolderId | null; color?: HexColor; description?: string }): Promise<ApiResponse<Folder>>;
export function updateFolder(id: FolderId, updates: Partial<Folder>): Promise<ApiResponse<Folder>>;
export function deleteFolder(id: FolderId): Promise<ApiResponse<any>>;
export function moveFolders(folderIds: FolderId[], targetId: FolderId | null): Promise<ApiResponse<any>>;