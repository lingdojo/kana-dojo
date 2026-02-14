/**
 * Shared Image Processing Configuration
 *
 * This file contains all core settings for image processing used by both:
 * 1. CLI script (scripts/process-wallpapers.ts) - Server-side with Sharp
 * 2. Browser script (features/Preferences/lib/imageProcessor.ts) - Client-side with Canvas API
 *
 * By centralizing these values, we ensure consistency between server-side
 * pre-processing and client-side user uploads.
 */

// ============================================================================
// Core Processing Settings
// ============================================================================

/**
 * Target width for processed wallpaper images.
 * Images are resized to this width while maintaining aspect ratio.
 */
const TARGET_WIDTHS = [1920, 2560, 3840];

export const TARGET_WIDTH = TARGET_WIDTHS[1];

/**
 * AVIF quality setting (0-100 scale).
 * Used by Sharp on server, converted to 0-1 scale for Canvas API in browser.
 *
 * Set to 70 for premium visual quality. With 1-year immutable caching,
 * the one-time download cost is justified by long-term quality benefits.
 */
export const AVIF_QUALITY = 70;

/**
 * WebP quality setting (0-100 scale).
 * Used as fallback when AVIF is not supported.
 * Used by Sharp on server, converted to 0-1 scale for Canvas API in browser.
 *
 * Set to 85 for near-lossless quality on browsers without AVIF support.
 */
export const WEBP_QUALITY = 85;

/**
 * Thumbnail width for theme card previews.
 * Used for generating small preview images.
 */
export const THUMBNAIL_WIDTH = 320;

/**
 * Thumbnail quality (0-100 scale).
 * Lower quality for smaller base64 size.
 */
export const THUMBNAIL_QUALITY = 60;

/**
 * Minimum acceptable width for a wallpaper image.
 */
export const MIN_WIDTH = 800;

/**
 * Maximum file size in bytes (50 MB).
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Maximum number of custom wallpapers a user can create.
 */
export const MAX_CUSTOM_WALLPAPERS = 20;

/**
 * Array of widths to generate for CLI pre-processing.
 * Server generates multiple sizes for responsive images.
 */
export const OUTPUT_WIDTHS = [1920, 2560, 3840];

// ============================================================================
// Supported Image Formats
// ============================================================================

/**
 * File extension to MIME type mapping for supported image formats.
 */
export const SUPPORTED_FORMATS = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.tiff': 'image/tiff',
  '.bmp': 'image/bmp',
} as const;

/**
 * Type for supported MIME types.
 */
export type SupportedMimeType =
  (typeof SUPPORTED_FORMATS)[keyof typeof SUPPORTED_FORMATS];

/**
 * Set of supported file extensions (for CLI script).
 */
export const SUPPORTED_EXTENSIONS = new Set(Object.keys(SUPPORTED_FORMATS));

/**
 * Set of supported MIME types (for browser script).
 */
export const SUPPORTED_MIME_TYPES = new Set(
  Object.values(SUPPORTED_FORMATS),
) as ReadonlySet<SupportedMimeType>;

/**
 * Human-readable list of supported formats for error messages.
 */
export const SUPPORTED_FORMATS_DISPLAY =
  'JPEG, PNG, WebP, AVIF, GIF, TIFF, BMP';

// ============================================================================
// Sharp Options (for CLI script)
// ============================================================================

/**
 * Sharp library options for AVIF encoding.
 * Used by the CLI pre-processing script.
 */
export const SHARP_AVIF_OPTIONS = {
  quality: AVIF_QUALITY,
  effort: 6,
} as const;

/**
 * Sharp library options for WebP encoding.
 * Used by the CLI pre-processing script.
 */
export const SHARP_WEBP_OPTIONS = {
  quality: WEBP_QUALITY,
} as const;

// ============================================================================
// Canvas API Options (for browser script)
// ============================================================================

/**
 * Canvas toBlob() quality for AVIF (0-1 scale).
 * Derived from AVIF_QUALITY for consistency.
 */
export const CANVAS_AVIF_QUALITY = AVIF_QUALITY / 100;

/**
 * Canvas toBlob() quality for WebP (0-1 scale).
 * Derived from WEBP_QUALITY for consistency.
 */
export const CANVAS_WEBP_QUALITY = WEBP_QUALITY / 100;

/**
 * Canvas toBlob() quality for thumbnails (0-1 scale).
 * Derived from THUMBNAIL_QUALITY for consistency.
 */
export const CANVAS_THUMBNAIL_QUALITY = THUMBNAIL_QUALITY / 100;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format bytes to a human-readable string.
 * Used by both CLI and browser scripts for consistent output.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Convert a filename or name to a Title Case display name.
 * e.g., "neon-city-nights" → "Neon City Nights"
 */
export function toDisplayName(name: string): string {
  return (
    name
      .replace(/[-_]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim() || 'Custom Wallpaper'
  );
}

/**
 * Generate a kebab-case ID from a display name.
 * All custom wallpaper IDs are prefixed with `custom-` for easy identification.
 */
export function nameToId(name: string): string {
  return (
    'custom-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

/**
 * Ensure a unique ID by appending a numeric suffix if needed.
 */
export function ensureUniqueId(
  baseId: string,
  existingIds: Set<string>,
): string {
  if (!existingIds.has(baseId)) return baseId;
  let suffix = 2;
  while (existingIds.has(`${baseId}-${suffix}`)) suffix++;
  return `${baseId}-${suffix}`;
}
