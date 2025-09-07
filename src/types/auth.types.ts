/**
 * Authentication and User types for the Media Library Manager
 * 
 * This file contains all types related to authentication, user management,
 * and user preferences.
 */

import {
  UserId,
  FolderId,
  MediaId,
  CollectionId,
  UserRole,
  Theme,
  ViewMode,
  GridSize,
  SortField,
  ISO8601String,
  TimestampFields,
  BaseQuery,
  Permission
} from './common.types';

// ============================================================================
// USER CORE TYPES
// ============================================================================

/**
 * Main user interface
 */
export interface User extends TimestampFields {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // URL to avatar image
  lastActive: ISO8601String;
  preferences: UserPreferences;
  profile?: UserProfile;
  settings?: UserSettings;
  permissions?: UserPermissions;
  status: UserStatus;
  isVerified: boolean;
  recentFolders: FolderId[];
  recentFiles: MediaId[];
  recentCollections?: CollectionId[];
}

/**
 * User preferences for UI and behavior
 */
export interface UserPreferences {
  theme: Theme;
  viewMode: ViewMode;
  gridSize: GridSize;
  defaultSort: SortField;
  language?: string;
  timezone?: string;
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat?: '12h' | '24h';
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
  accessibility?: AccessibilitySettings;
}

/**
 * Extended user profile information
 */
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  title?: string;
  department?: string;
  organization?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  phone?: string;
  timezone?: string;
  birthDate?: string; // YYYY-MM-DD
}

/**
 * User system settings
 */
export interface UserSettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  autoSave: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  keyboardShortcuts: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  digestFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  defaultUploadFolder?: FolderId;
  maxUploadSize: number; // MB
  allowedFileTypes: string[];
}

/**
 * User status enumeration
 */
export type UserStatus = 
  | 'active' 
  | 'inactive' 
  | 'suspended' 
  | 'pending' 
  | 'invited';

/**
 * User permissions for system-wide actions
 */
export interface UserPermissions {
  canCreateFolders: boolean;
  canDeleteMedia: boolean;
  canShareWithExternal: boolean;
  canInviteUsers: boolean;
  canManageUsers: boolean;
  canAccessAnalytics: boolean;
  canExportData: boolean;
  canManageIntegrations: boolean;
  storageQuota: number; // bytes
  collectionLimit: number;
  shareLimit: number; // max shared items per month
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  inApp: InAppNotificationSettings;
  digest: DigestSettings;
}

/**
 * Email notification settings
 */
export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  types: {
    mediaShared: boolean;
    collectionUpdated: boolean;
    commentAdded: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
    storageAlerts: boolean;
  };
}

/**
 * Push notification settings
 */
export interface PushNotificationSettings {
  enabled: boolean;
  types: {
    mediaShared: boolean;
    collectionUpdated: boolean;
    commentAdded: boolean;
    systemUpdates: boolean;
  };
}

/**
 * In-app notification settings
 */
export interface InAppNotificationSettings {
  enabled: boolean;
  sound: boolean;
  types: {
    mediaShared: boolean;
    collectionUpdated: boolean;
    commentAdded: boolean;
    systemUpdates: boolean;
  };
}

/**
 * Digest email settings
 */
export interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time?: string; // HH:MM format
  includeStats: boolean;
  includeRecommendations: boolean;
}

// ============================================================================
// PRIVACY AND ACCESSIBILITY
// ============================================================================

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showActivity: boolean;
  showRecentFiles: boolean;
  allowMentions: boolean;
  allowDirectMessages: boolean;
  shareUsageAnalytics: boolean;
  cookieConsent: boolean;
  trackingConsent: boolean;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  alternativeText: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: ISO8601String;
  permissions: string[];
  requiresTwoFactor?: boolean;
  isFirstLogin?: boolean;
}

/**
 * JWT token payload
 */
export interface JWTPayload {
  sub: UserId; // subject (user ID)
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number; // issued at
  exp: number; // expires at
  aud: string; // audience
  iss: string; // issuer
}

/**
 * Session information
 */
export interface UserSession {
  id: string;
  userId: UserId;
  token: string;
  refreshToken?: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  createdAt: ISO8601String;
  lastActive: ISO8601String;
  expiresAt: ISO8601String;
  isActive: boolean;
}

/**
 * Device information for session tracking
 */
export interface DeviceInfo {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  fingerprint?: string;
}

// ============================================================================
// USER VARIANTS AND SUBSETS
// ============================================================================

/**
 * Minimal user info for display in UI
 */
export type UserSummary = Pick<User, 
  | 'id' 
  | 'name' 
  | 'email'
  | 'avatar' 
  | 'role'
  | 'lastActive'
  | 'status'
>;

/**
 * Public user profile (visible to others)
 */
export type PublicUserProfile = Pick<User, 
  | 'id' 
  | 'name'
  | 'avatar'
  | 'role'
> & {
  profile?: Pick<UserProfile, 
    | 'displayName'
    | 'title' 
    | 'department'
    | 'bio'
    | 'location'
    | 'website'
  >;
};

/**
 * User creation payload
 */
export type CreateUser = Pick<User,
  | 'name'
  | 'email'
  | 'role'
> & {
  password: string;
  avatar?: string;
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
  sendInvitation?: boolean;
  temporaryPassword?: boolean;
};

/**
 * User update payload
 */
export type UpdateUser = Partial<Pick<User,
  | 'name'
  | 'email'
  | 'role'
  | 'avatar'
  | 'status'
  | 'preferences'
  | 'profile'
  | 'settings'
  | 'permissions'
>>;

// ============================================================================
// PASSWORD AND SECURITY
// ============================================================================

/**
 * Password change request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string;
  redirectUrl?: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetup {
  secret: string;
  qrCode: string; // base64 encoded QR code image
  backupCodes: string[];
}

/**
 * Two-factor authentication verification
 */
export interface TwoFactorVerification {
  code: string;
  backupCode?: string;
  trustDevice?: boolean;
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  id: string;
  userId: UserId;
  action: SecurityAction;
  details: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: ISO8601String;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Security actions for audit logging
 */
export type SecurityAction = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_changed'
  | 'email_changed'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'session_terminated'
  | 'suspicious_activity'
  | 'account_locked'
  | 'account_unlocked';

// ============================================================================
// USER QUERIES AND MANAGEMENT
// ============================================================================

/**
 * User query options
 */
export interface UserQuery extends BaseQuery {
  role?: UserRole | UserRole[];
  status?: UserStatus | UserStatus[];
  department?: string;
  organization?: string;
  lastActiveAfter?: ISO8601String;
  lastActiveBefore?: ISO8601String;
  includeInactive?: boolean;
  hasAvatar?: boolean;
  permissions?: Permission[];
}

/**
 * User invitation
 */
export interface UserInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: UserId;
  invitedAt: ISO8601String;
  expiresAt: ISO8601String;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  acceptedAt?: ISO8601String;
  permissions?: Partial<UserPermissions>;
  customWelcomeMessage?: string;
}

/**
 * User activity summary
 */
export interface UserActivity {
  userId: UserId;
  period: 'day' | 'week' | 'month';
  stats: {
    mediaViewed: number;
    mediaUploaded: number;
    mediaDownloaded: number;
    collectionsCreated: number;
    collectionsShared: number;
    commentsAdded: number;
    searchesPerformed: number;
    loginCount: number;
    timeSpent: number; // minutes
  };
}

// ============================================================================
// TEAM AND ORGANIZATION
// ============================================================================

/**
 * Team/Organization information
 */
export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  settings: OrganizationSettings;
  created: ISO8601String;
  memberCount: number;
  storageUsed: number;
  storageQuota: number;
  plan: SubscriptionPlan;
}

/**
 * Organization settings
 */
export interface OrganizationSettings {
  allowExternalSharing: boolean;
  requireTwoFactor: boolean;
  sessionTimeout: number; // minutes
  allowedDomains: string[];
  allowPublicCollections: boolean;
  defaultUserRole: UserRole;
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    customCss?: string;
  };
  integrations: {
    sso?: SSOConfig;
    storage?: ExternalStorageConfig;
    analytics?: AnalyticsConfig;
  };
}

/**
 * SSO configuration
 */
export interface SSOConfig {
  enabled: boolean;
  provider: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml' | 'oidc';
  clientId: string;
  domain?: string;
  autoProvision: boolean;
  defaultRole: UserRole;
}

/**
 * External storage configuration
 */
export interface ExternalStorageConfig {
  provider: 'aws' | 'gcp' | 'azure' | 'dropbox' | 's3';
  region?: string;
  bucket?: string;
  accessKey?: string;
  enabled: boolean;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  provider: 'google' | 'mixpanel' | 'amplitude';
  trackingId: string;
  enabled: boolean;
  anonymizeIp: boolean;
}

/**
 * Subscription plan information
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    users: number;
    storage: number; // bytes
    collections: number;
    apiCalls: number;
  };
  isActive: boolean;
  expiresAt?: ISO8601String;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Check if user has specific role
 */
export const hasRole = (user: User, role: UserRole): boolean => 
  user.role === role;

/**
 * Check if user has admin privileges
 */
export const isAdmin = (user: User): boolean => 
  user.role === 'admin';

/**
 * Check if user has edit privileges
 */
export const canEdit = (user: User): boolean => 
  user.role === 'admin' || user.role === 'editor';

/**
 * Check if user is active
 */
export const isActiveUser = (user: User): boolean => 
  user.status === 'active' && user.isVerified;

/**
 * Check if user has specific permission
 */
export const hasUserPermission = (
  user: User, 
  permission: keyof UserPermissions
): boolean => {
  if (!user.permissions) return false;
  const value = user.permissions[permission];
  return typeof value === 'boolean' ? value : false;
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: User): string => 
  user.profile?.displayName || user.name;

/**
 * Check if user session is valid
 */
export const isValidSession = (session: UserSession): boolean => 
  session.isActive && new Date(session.expiresAt) > new Date();

// ============================================================================
// CONSTANTS
// ============================================================================

export const USER_ROLES: UserRole[] = ['admin', 'editor', 'viewer'];
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended', 'pending', 'invited'];
export const THEMES: Theme[] = ['light', 'dark', 'system'];
export const VIEW_MODES: ViewMode[] = ['grid', 'list'];
export const GRID_SIZES: GridSize[] = ['small', 'medium', 'large'];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  viewMode: 'grid',
  gridSize: 'medium',
  defaultSort: 'name',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h'
};

export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const REFRESH_TOKEN_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds