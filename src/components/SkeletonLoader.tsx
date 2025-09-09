/**
 * SkeletonLoader Component
 * 
 * Comprehensive skeleton loading components that provide visual placeholders
 * while content is loading. Includes prebuilt skeletons for common UI patterns.
 */

import React from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type SkeletonVariant = 'pulse' | 'wave' | 'shimmer';
export type SkeletonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BaseSkeletonProps {
  /** Visual animation variant */
  variant?: SkeletonVariant;
  /** Custom className for styling */
  className?: string;
  /** Whether the skeleton should be rounded */
  rounded?: boolean | 'full';
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
}

interface SkeletonProps extends BaseSkeletonProps {
  /** Content to render when loaded */
  children?: React.ReactNode;
  /** Whether content is loading */
  loading?: boolean;
}

interface MediaGridSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Grid columns (responsive) */
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  /** Whether to show titles under thumbnails */
  showTitles?: boolean;
  /** Whether to show metadata under titles */
  showMeta?: boolean;
}

interface MediaListSkeletonProps extends BaseSkeletonProps {
  /** Number of skeleton items to show */
  count?: number;
  /** Whether to show thumbnails */
  showThumbnails?: boolean;
  /** Whether to show metadata */
  showMeta?: boolean;
}

interface SidebarSkeletonProps extends BaseSkeletonProps {
  /** Number of navigation items */
  navItems?: number;
  /** Whether to show folder tree */
  showFolders?: boolean;
  /** Number of folder items */
  folderItems?: number;
}

interface DetailsSidebarSkeletonProps extends BaseSkeletonProps {
  /** Whether to show thumbnail */
  showThumbnail?: boolean;
  /** Whether to show metadata sections */
  showMetadata?: boolean;
  /** Whether to show tags section */
  showTags?: boolean;
}

// ============================================================================
// ANIMATION STYLES
// ============================================================================

const SKELETON_VARIANTS = {
  pulse: 'animate-pulse bg-gray-200',
  wave: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[wave_1.5s_ease-in-out_infinite]',
  shimmer: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]'
} as const;

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

/**
 * Base skeleton element
 */
const Skeleton: React.FC<SkeletonProps> = ({
  children,
  loading = true,
  variant = 'pulse',
  className = '',
  rounded = false,
  width,
  height,
  ...props
}) => {
  // If not loading and has children, render children
  if (!loading && children) {
    return <>{children}</>;
  }

  // If not loading and no children, render nothing
  if (!loading) {
    return null;
  }

  const baseClasses = SKELETON_VARIANTS[variant];
  const roundedClass = rounded === 'full' ? 'rounded-full' : rounded ? 'rounded' : '';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${roundedClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
      {...props}
    />
  );
};

// ============================================================================
// TEXT SKELETONS
// ============================================================================

/**
 * Text line skeleton
 */
export const SkeletonText: React.FC<BaseSkeletonProps & {
  lines?: number;
  lineHeight?: string;
  lastLineWidth?: string;
}> = ({
  lines = 1,
  lineHeight = 'h-4',
  lastLineWidth = '75%',
  variant = 'pulse',
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text...">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          className={`${lineHeight} ${i === lines - 1 && lines > 1 ? '' : 'w-full'}`}
          width={i === lines - 1 && lines > 1 ? lastLineWidth : undefined}
          {...props}
        />
      ))}
    </div>
  );
};

/**
 * Title skeleton with subtitle
 */
export const SkeletonTitle: React.FC<BaseSkeletonProps & {
  showSubtitle?: boolean;
  size?: SkeletonSize;
}> = ({
  showSubtitle = false,
  size = 'md',
  variant = 'pulse',
  className = '',
  ...props
}) => {
  const titleHeights = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-7',
    xl: 'h-8'
  };

  const subtitleHeights = {
    xs: 'h-3',
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-4',
    xl: 'h-5'
  };

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading title...">
      <Skeleton
        variant={variant}
        className={`${titleHeights[size]} w-3/4`}
        {...props}
      />
      {showSubtitle && (
        <Skeleton
          variant={variant}
          className={`${subtitleHeights[size]} w-1/2`}
          {...props}
        />
      )}
    </div>
  );
};

// ============================================================================
// MEDIA SKELETONS
// ============================================================================

/**
 * Media thumbnail skeleton
 */
export const SkeletonThumbnail: React.FC<BaseSkeletonProps & {
  size?: number | string;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2';
}> = ({
  size = 200,
  aspectRatio = 'square',
  variant = 'pulse',
  className = '',
  rounded = true,
  ...props
}) => {
  const aspectClasses = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]'
  };

  return (
    <Skeleton
      variant={variant}
      className={`${aspectClasses[aspectRatio]} ${className}`}
      rounded={rounded}
      width={size}
      role="status"
      aria-label="Loading thumbnail..."
      {...props}
    />
  );
};

/**
 * Media grid skeleton
 */
export const MediaGridSkeleton: React.FC<MediaGridSkeletonProps> = ({
  count = 12,
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  showTitles = true,
  showMeta = false,
  variant = 'pulse',
  className = '',
  ...props
}) => {
  const gridCols = `grid-cols-${columns.sm || 2} md:grid-cols-${columns.md || 3} lg:grid-cols-${columns.lg || 4} xl:grid-cols-${columns.xl || 5}`;

  return (
    <div
      className={`grid gap-4 ${gridCols} ${className}`}
      role="status"
      aria-label={`Loading ${count} media items...`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3">
          {/* Thumbnail */}
          <SkeletonThumbnail
            variant={variant}
            aspectRatio="square"
            className="w-full"
            {...props}
          />
          
          {/* Title */}
          {showTitles && (
            <SkeletonText
              variant={variant}
              lines={1}
              lineHeight="h-4"
              {...props}
            />
          )}
          
          {/* Metadata */}
          {showMeta && (
            <SkeletonText
              variant={variant}
              lines={1}
              lineHeight="h-3"
              lastLineWidth="60%"
              {...props}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Media list skeleton
 */
export const MediaListSkeleton: React.FC<MediaListSkeletonProps> = ({
  count = 8,
  showThumbnails = true,
  showMeta = true,
  variant = 'pulse',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`space-y-4 ${className}`}
      role="status"
      aria-label={`Loading ${count} media items...`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center space-x-4">
          {/* Thumbnail */}
          {showThumbnails && (
            <SkeletonThumbnail
              variant={variant}
              size={64}
              aspectRatio="square"
              {...props}
            />
          )}
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <SkeletonText
              variant={variant}
              lines={1}
              lineHeight="h-5"
              lastLineWidth="80%"
              {...props}
            />
            
            {showMeta && (
              <SkeletonText
                variant={variant}
                lines={2}
                lineHeight="h-3"
                lastLineWidth="40%"
                {...props}
              />
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2">
            <Skeleton
              variant={variant}
              className="w-8 h-8"
              rounded="full"
              {...props}
            />
            <Skeleton
              variant={variant}
              className="w-8 h-8"
              rounded="full"
              {...props}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SIDEBAR SKELETONS
// ============================================================================

/**
 * Sidebar navigation skeleton
 */
export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  navItems = 5,
  showFolders = true,
  folderItems = 6,
  variant = 'pulse',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`space-y-6 ${className}`}
      role="status"
      aria-label="Loading sidebar..."
    >
      {/* Navigation items */}
      <div className="space-y-3">
        {Array.from({ length: navItems }, (_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton
              variant={variant}
              className="w-5 h-5"
              rounded="full"
              {...props}
            />
            <Skeleton
              variant={variant}
              className="h-4 flex-1"
              lastLineWidth="70%"
              {...props}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <Skeleton
        variant={variant}
        className="h-px w-full"
        {...props}
      />

      {/* Folder tree */}
      {showFolders && (
        <div className="space-y-2">
          <SkeletonText
            variant={variant}
            lines={1}
            lineHeight="h-4"
            lastLineWidth="50%"
            {...props}
          />
          
          <div className="space-y-2 ml-4">
            {Array.from({ length: folderItems }, (_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton
                  variant={variant}
                  className="w-4 h-4"
                  {...props}
                />
                <Skeleton
                  variant={variant}
                  className="h-3 flex-1"
                  lastLineWidth={`${60 + Math.random() * 30}%`}
                  {...props}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DETAILS SIDEBAR SKELETON
// ============================================================================

/**
 * Details sidebar skeleton
 */
export const DetailsSidebarSkeleton: React.FC<DetailsSidebarSkeletonProps> = ({
  showThumbnail = true,
  showMetadata = true,
  showTags = true,
  variant = 'pulse',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`space-y-6 p-4 ${className}`}
      role="status"
      aria-label="Loading details..."
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonTitle size="lg" variant={variant} {...props} />
        <Skeleton
          variant={variant}
          className="w-6 h-6"
          rounded="full"
          {...props}
        />
      </div>

      {/* Thumbnail */}
      {showThumbnail && (
        <SkeletonThumbnail
          variant={variant}
          aspectRatio="16:9"
          className="w-full"
          {...props}
        />
      )}

      {/* Basic info */}
      <div className="space-y-4">
        <SkeletonText
          variant={variant}
          lines={3}
          lineHeight="h-4"
          lastLineWidth="60%"
          {...props}
        />
      </div>

      {/* Metadata sections */}
      {showMetadata && (
        <>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton
                variant={variant}
                className="h-5 w-1/3"
                {...props}
              />
              <div className="space-y-2 ml-4">
                <SkeletonText
                  variant={variant}
                  lines={2}
                  lineHeight="h-3"
                  lastLineWidth="80%"
                  {...props}
                />
              </div>
            </div>
          ))}
        </>
      )}

      {/* Tags */}
      {showTags && (
        <div className="space-y-3">
          <Skeleton
            variant={variant}
            className="h-4 w-1/4"
            {...props}
          />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton
                key={i}
                variant={variant}
                className="h-6 w-16"
                rounded="full"
                {...props}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CARD SKELETON
// ============================================================================

/**
 * Generic card skeleton
 */
export const SkeletonCard: React.FC<BaseSkeletonProps & {
  showHeader?: boolean;
  showImage?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}> = ({
  showHeader = true,
  showImage = false,
  showContent = true,
  showFooter = false,
  contentLines = 3,
  variant = 'pulse',
  className = '',
  rounded = true,
  ...props
}) => {
  return (
    <div
      className={`border border-gray-200 bg-white ${rounded ? 'rounded-lg' : ''} overflow-hidden ${className}`}
      role="status"
      aria-label="Loading card..."
    >
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-gray-200">
          <SkeletonTitle
            variant={variant}
            showSubtitle
            {...props}
          />
        </div>
      )}

      {/* Image */}
      {showImage && (
        <SkeletonThumbnail
          variant={variant}
          aspectRatio="16:9"
          className="w-full"
          rounded={false}
          {...props}
        />
      )}

      {/* Content */}
      {showContent && (
        <div className="p-4">
          <SkeletonText
            variant={variant}
            lines={contentLines}
            lineHeight="h-4"
            lastLineWidth="75%"
            {...props}
          />
        </div>
      )}

      {/* Footer */}
      {showFooter && (
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <Skeleton
            variant={variant}
            className="h-4 w-1/3"
            {...props}
          />
          <div className="flex space-x-2">
            <Skeleton
              variant={variant}
              className="w-8 h-8"
              rounded="full"
              {...props}
            />
            <Skeleton
              variant={variant}
              className="w-8 h-8"
              rounded="full"
              {...props}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CSS ANIMATIONS (to be added to global styles)
// ============================================================================

/*
Add to your global CSS file (globals.css):

@keyframes wave {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
*/

// ============================================================================
// EXPORTS
// ============================================================================

export default SkeletonLoader;
export type { SkeletonLoaderProps };
