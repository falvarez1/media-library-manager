import { ApiResponse, Tag, TagId, TagCategory, HexColor } from '../../types';

export function getTags(): Promise<ApiResponse<Tag[]>>;
export function getTagById(id: TagId): Promise<ApiResponse<Tag>>;
export function createTag(data: { name: string; category?: TagCategory; color?: HexColor }): Promise<ApiResponse<Tag>>;
export function updateTag(id: TagId, updates: Partial<Tag>): Promise<ApiResponse<Tag>>;
export function deleteTag(id: TagId): Promise<ApiResponse<any>>;
export function getTagSuggestions(query: string): Promise<ApiResponse<Tag[]>>;