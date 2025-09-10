import { ApiResponse, User, UserId } from '../../types';

export function getCurrentUser(): Promise<ApiResponse<User>>;
export function getUserById(id: UserId): Promise<ApiResponse<User>>;
export function updateUser(id: UserId, updates: Partial<User>): Promise<ApiResponse<User>>;
export function getUsers(): Promise<ApiResponse<{ items: User[]; total: number }>>;