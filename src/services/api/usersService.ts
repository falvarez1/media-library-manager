/**
 * Real Users API Service
 * 
 * Implements the same interface as the mock usersApi
 * but makes real API calls to the backend.
 */

import { apiRequest, buildQueryString } from './apiUtils';
import type {
  User,
  UserQuery,
  UserSummary,
  PublicUserProfile,
  CreateUser,
  UpdateUser,
  UserPreferences,
  UserProfile,
  UserSettings,
  UserActivity,
  UserInvitation,
  UserSession,
  AuthCredentials,
  AuthResponse,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmation,
  TwoFactorSetup,
  TwoFactorVerification,
  SecurityAuditLog
} from '../../types/auth.types';
import type {
  FolderId,
  MediaId,
  CollectionId,
  UserId,
  ApiResponse,
  PaginatedResponse
} from '../../types/common.types';

/**
 * Get all users
 * @param options - Query options
 * @returns Promise resolving to users
 */
export const getUsers = async (options: UserQuery = {}): Promise<PaginatedResponse<UserSummary>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<UserSummary>>(`/users${queryString}`);
};

/**
 * Get the current logged-in user
 * @returns Promise resolving to current user
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>('/users/me');
};

/**
 * Get a user by ID
 * @param id - User ID
 * @returns Promise resolving to user
 */
export const getUserById = async (id: UserId): Promise<ApiResponse<PublicUserProfile>> => {
  return apiRequest<ApiResponse<PublicUserProfile>>(`/users/${id}`);
};

/**
 * Update current user's profile
 * @param updates - Profile updates
 * @returns Promise resolving to updated user
 */
export const updateProfile = async (updates: Partial<UserProfile>): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>('/users/me/profile', 'PUT', updates);
};

/**
 * Update user preferences
 * @param preferences - User preferences
 * @returns Promise resolving to updated preferences
 */
export const updatePreferences = async (
  preferences: Partial<UserPreferences>
): Promise<ApiResponse<UserPreferences>> => {
  return apiRequest<ApiResponse<UserPreferences>>('/users/me/preferences', 'PUT', preferences);
};

/**
 * Update user settings
 * @param settings - User settings
 * @returns Promise resolving to updated settings
 */
export const updateSettings = async (
  settings: Partial<UserSettings>
): Promise<ApiResponse<UserSettings>> => {
  return apiRequest<ApiResponse<UserSettings>>('/users/me/settings', 'PUT', settings);
};

/**
 * Update recent folders and files
 * @param type - 'folders', 'files', or 'collections'
 * @param id - ID of folder, file, or collection
 * @returns Promise resolving to updated recent items
 */
export const updateRecent = async (
  type: 'folders' | 'files' | 'collections',
  id: FolderId | MediaId | CollectionId
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/users/me/recent', 'POST', { type, id });
};

/**
 * Get user's recent items
 * @param type - Type of recent items to get
 * @param limit - Maximum number of items to return
 * @returns Promise resolving to recent items
 */
export const getRecentItems = async (
  type?: 'folders' | 'files' | 'collections',
  limit: number = 10
): Promise<ApiResponse<{
  folders: Array<{ id: FolderId; name: string; lastAccessed: string }>;
  files: Array<{ id: MediaId; name: string; lastAccessed: string }>;
  collections: Array<{ id: CollectionId; name: string; lastAccessed: string }>;
}>> => {
  const queryString = buildQueryString({ type, limit });
  return apiRequest<ApiResponse<{
    folders: Array<{ id: FolderId; name: string; lastAccessed: string }>;
    files: Array<{ id: MediaId; name: string; lastAccessed: string }>;
    collections: Array<{ id: CollectionId; name: string; lastAccessed: string }>;
  }>>(`/users/me/recent${queryString}`);
};

/**
 * User login
 * @param credentials - Login credentials
 * @returns Promise resolving to user and token
 */
export const login = async (credentials: AuthCredentials): Promise<ApiResponse<AuthResponse>> => {
  return apiRequest<ApiResponse<AuthResponse>>('/auth/login', 'POST', credentials);
};

/**
 * User logout
 * @returns Promise resolving to success message
 */
export const logout = async (): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/auth/logout', 'POST');
};

/**
 * Refresh authentication token
 * @param refreshToken - Refresh token
 * @returns Promise resolving to new auth response
 */
export const refreshToken = async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
  return apiRequest<ApiResponse<AuthResponse>>('/auth/refresh', 'POST', { refreshToken });
};

/**
 * Change password
 * @param request - Password change request
 * @returns Promise resolving to success message
 */
export const changePassword = async (
  request: ChangePasswordRequest
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/users/me/password', 'PUT', request);
};

/**
 * Request password reset
 * @param request - Password reset request
 * @returns Promise resolving to success message
 */
export const resetPassword = async (
  request: ResetPasswordRequest
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/auth/reset-password', 'POST', request);
};

/**
 * Confirm password reset with token
 * @param confirmation - Password reset confirmation
 * @returns Promise resolving to success message
 */
export const confirmPasswordReset = async (
  confirmation: ResetPasswordConfirmation
): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/auth/reset-password/confirm', 'POST', confirmation);
};

/**
 * Enable two-factor authentication
 * @returns Promise resolving to 2FA setup information
 */
export const enable2FA = async (): Promise<ApiResponse<TwoFactorSetup>> => {
  return apiRequest<ApiResponse<TwoFactorSetup>>('/users/me/2fa/enable', 'POST');
};

/**
 * Verify and confirm 2FA setup
 * @param verification - 2FA verification code
 * @returns Promise resolving to success message
 */
export const verify2FA = async (
  verification: TwoFactorVerification
): Promise<ApiResponse<{ success: boolean; backupCodes: string[] }>> => {
  return apiRequest<ApiResponse<{ success: boolean; backupCodes: string[] }>>(
    '/users/me/2fa/verify', 
    'POST', 
    verification
  );
};

/**
 * Disable two-factor authentication
 * @param password - Current password for verification
 * @returns Promise resolving to success message
 */
export const disable2FA = async (password: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/users/me/2fa/disable', 'POST', { password });
};

/**
 * Get user's active sessions
 * @returns Promise resolving to active sessions
 */
export const getUserSessions = async (): Promise<ApiResponse<UserSession[]>> => {
  return apiRequest<ApiResponse<UserSession[]>>('/users/me/sessions');
};

/**
 * Terminate a specific session
 * @param sessionId - Session ID to terminate
 * @returns Promise resolving to success message
 */
export const terminateSession = async (sessionId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/users/me/sessions/${sessionId}`, 'DELETE');
};

/**
 * Terminate all sessions except current
 * @returns Promise resolving to success message
 */
export const terminateAllSessions = async (): Promise<ApiResponse<{ success: boolean; terminated: number }>> => {
  return apiRequest<ApiResponse<{ success: boolean; terminated: number }>>('/users/me/sessions/terminate-all', 'POST');
};

/**
 * Get user's security audit log
 * @param options - Query options
 * @returns Promise resolving to audit log entries
 */
export const getSecurityAuditLog = async (options: {
  limit?: number;
  offset?: number;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<PaginatedResponse<SecurityAuditLog>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<SecurityAuditLog>>(`/users/me/security/audit${queryString}`);
};

/**
 * Get user activity statistics
 * @param period - Time period for statistics
 * @returns Promise resolving to activity statistics
 */
export const getUserActivity = async (
  period: 'day' | 'week' | 'month' = 'week'
): Promise<ApiResponse<UserActivity>> => {
  return apiRequest<ApiResponse<UserActivity>>(`/users/me/activity?period=${period}`);
};

/**
 * Create a new user (admin only)
 * @param userData - New user data
 * @returns Promise resolving to created user
 */
export const createUser = async (userData: CreateUser): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>('/users', 'POST', userData);
};

/**
 * Update a user (admin only)
 * @param userId - User ID to update
 * @param updates - User updates
 * @returns Promise resolving to updated user
 */
export const updateUser = async (userId: UserId, updates: UpdateUser): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>(`/users/${userId}`, 'PUT', updates);
};

/**
 * Delete a user (admin only)
 * @param userId - User ID to delete
 * @param options - Delete options
 * @returns Promise resolving to success message
 */
export const deleteUser = async (
  userId: UserId,
  options: { transferDataTo?: UserId } = {}
): Promise<ApiResponse<{ success: boolean }>> => {
  const queryString = buildQueryString(options);
  return apiRequest<ApiResponse<{ success: boolean }>>(`/users/${userId}${queryString}`, 'DELETE');
};

/**
 * Invite a user to join
 * @param invitation - User invitation data
 * @returns Promise resolving to invitation result
 */
export const inviteUser = async (invitation: {
  email: string;
  role: string;
  message?: string;
  permissions?: string[];
}): Promise<ApiResponse<UserInvitation>> => {
  return apiRequest<ApiResponse<UserInvitation>>('/users/invite', 'POST', invitation);
};

/**
 * Get pending invitations
 * @param options - Query options
 * @returns Promise resolving to pending invitations
 */
export const getPendingInvitations = async (options: {
  limit?: number;
  offset?: number;
} = {}): Promise<PaginatedResponse<UserInvitation>> => {
  const queryString = buildQueryString(options);
  return apiRequest<PaginatedResponse<UserInvitation>>(`/users/invitations${queryString}`);
};

/**
 * Resend user invitation
 * @param invitationId - Invitation ID
 * @returns Promise resolving to success message
 */
export const resendInvitation = async (invitationId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/users/invitations/${invitationId}/resend`, 'POST');
};

/**
 * Cancel user invitation
 * @param invitationId - Invitation ID
 * @returns Promise resolving to success message
 */
export const cancelInvitation = async (invitationId: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>(`/users/invitations/${invitationId}`, 'DELETE');
};

/**
 * Accept user invitation
 * @param invitationId - Invitation ID
 * @param userData - User registration data
 * @returns Promise resolving to created user
 */
export const acceptInvitation = async (
  invitationId: string,
  userData: {
    name: string;
    password: string;
    profile?: Partial<UserProfile>;
  }
): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>(`/users/invitations/${invitationId}/accept`, 'POST', userData);
};

/**
 * Search users
 * @param query - Search query
 * @param options - Search options
 * @returns Promise resolving to matching users
 */
export const searchUsers = async (
  query: string,
  options: Partial<UserQuery> = {}
): Promise<PaginatedResponse<UserSummary>> => {
  const searchParams = {
    search: query,
    ...options
  };
  const queryString = buildQueryString(searchParams);
  return apiRequest<PaginatedResponse<UserSummary>>(`/users/search${queryString}`);
};

/**
 * Upload user avatar
 * @param file - Avatar image file
 * @returns Promise resolving to updated user
 */
export const uploadAvatar = async (file: File): Promise<ApiResponse<User>> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return apiRequest<ApiResponse<User>>('/users/me/avatar', 'POST', formData);
};

/**
 * Remove user avatar
 * @returns Promise resolving to updated user
 */
export const removeAvatar = async (): Promise<ApiResponse<User>> => {
  return apiRequest<ApiResponse<User>>('/users/me/avatar', 'DELETE');
};

/**
 * Export user data (GDPR compliance)
 * @returns Promise resolving to export data
 */
export const exportUserData = async (): Promise<ApiResponse<{
  downloadUrl: string;
  expiresAt: string;
}>> => {
  return apiRequest<ApiResponse<{
    downloadUrl: string;
    expiresAt: string;
  }>>('/users/me/export', 'POST');
};

/**
 * Delete user account and all associated data
 * @param password - Current password for verification
 * @returns Promise resolving to success message
 */
export const deleteAccount = async (password: string): Promise<ApiResponse<{ success: boolean }>> => {
  return apiRequest<ApiResponse<{ success: boolean }>>('/users/me/delete', 'POST', { password });
};

// Export all user API functions
const usersService = {
  // User management
  getUsers,
  getCurrentUser,
  getUserById,
  updateProfile,
  updatePreferences,
  updateSettings,
  updateRecent,
  getRecentItems,
  
  // Authentication
  login,
  logout,
  refreshToken,
  
  // Password management
  changePassword,
  resetPassword,
  confirmPasswordReset,
  
  // Two-factor authentication
  enable2FA,
  verify2FA,
  disable2FA,
  
  // Session management
  getUserSessions,
  terminateSession,
  terminateAllSessions,
  
  // Security and audit
  getSecurityAuditLog,
  getUserActivity,
  
  // Admin functions
  createUser,
  updateUser,
  deleteUser,
  
  // User invitations
  inviteUser,
  getPendingInvitations,
  resendInvitation,
  cancelInvitation,
  acceptInvitation,
  
  // Search and discovery
  searchUsers,
  
  // Avatar management
  uploadAvatar,
  removeAvatar,
  
  // Data management
  exportUserData,
  deleteAccount
};

export default usersService;