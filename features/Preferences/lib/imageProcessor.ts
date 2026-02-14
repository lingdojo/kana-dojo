/**
 * Browser-side Image Processing for Custom Wallpaper Themes
 *
 * Adapts the server-side process-wallpapers.ts logic to run entirely
 * in the browser using Canvas API:
 *
 * 1. Load image from URL or File
 * 2. Validate dimensions and file size
 * 3. Resize to target width (matching server script)
 * 4. Encode as AVIF (with WebP fallback if browser doesn't support AVIF encoding)
 * 5. Generate a small thumbnail for theme card preview
 *
 * All configuration values are imported from the shared config to ensure
 * consistency with the CLI pre-processing script.
 */

import {
  TARGET_WIDTH,
  THUMBNAIL_WIDTH,
  CANVAS_AVIF_QUALITY,
  CANVAS_WEBP_QUALITY,
  CANVAS_THUMBNAIL_QUALITY,
  MIN_WIDTH,
  MAX_FILE_SIZE,
  MAX_CUSTOM_WALLPAPERS,
  SUPPORTED_MIME_TYPES,
  SUPPORTED_FORMATS_DISPLAY,
  formatBytes,
  toDisplayName,
  nameToId,
  ensureUniqueId,
  type SupportedMimeType,
} from '@/features/Preferences/config/imageProcessing';

// ============================================================================
// Types
// ============================================================================

export type ProcessingStatus =
  | 'idle'
  | 'loading'
  | 'validating'
  | 'resizing'
  | 'converting'
  | 'generating-thumbnail'
  | 'saving'
  | 'complete'
  | 'error';

export interface ProcessingProgress {
  status: ProcessingStatus;
  /** 0–100 */
  progress: number;
  /** Human-readable status message */
  message: string;
  /** Set only when status === 'error' */
  error?: string;
}

export interface ProcessedImage {
  /** Full-size image blob for storage (AVIF if supported, WebP fallback) */
  blob: Blob;
  /** Small base64 thumbnail for theme card preview */
  thumbnailDataUrl: string;
  /** Processed dimensions */
  width: number;
  height: number;
  /** Original source dimensions */
  originalWidth: number;
  originalHeight: number;
  /** Processed file size in bytes */
  sizeBytes: number;
  /** Auto-generated display name */
  name: string;
}

// Re-export shared constants and utilities for backwards compatibility
export { MAX_CUSTOM_WALLPAPERS, formatBytes, nameToId, ensureUniqueId };

/**
 * Extract a display name from a filename or URL.
 * Delegates to toDisplayName from shared config.
 */
export function extractDisplayName(source: string): string {
  let name: string;

  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const url = new URL(source);
      const pathname = url.pathname;
      const filename = pathname.split('/').pop() || 'custom-wallpaper';
      name = filename.replace(/\.[^.]+$/, '');
    } catch {
      name = 'custom-wallpaper';
    }
  } else {
    name = source.replace(/\.[^.]+$/, '');
  }

  return toDisplayName(name);
}

// ============================================================================
// Image loading
// ============================================================================

/**
 * Load an image from a File or URL into an HTMLImageElement.
 * Handles CORS for URL sources and FileReader for local files.
 */
async function loadImage(
  source: File | string,
  onProgress: (p: ProcessingProgress) => void,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (typeof source === 'string') {
      onProgress({
        status: 'loading',
        progress: 10,
        message: 'Fetching image from URL…',
      });

      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        reject(
          new Error(
            'Failed to load image. The server may not allow cross-origin requests. ' +
              'Try downloading the image and uploading it as a file instead.',
          ),
        );
      };
      img.src = source;
    } else {
      onProgress({
        status: 'loading',
        progress: 10,
        message: 'Reading image file…',
      });

      if (source.size > MAX_FILE_SIZE) {
        reject(
          new Error(
            `File is too large (${(source.size / (1024 * 1024)).toFixed(1)} MB). ` +
              `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`,
          ),
        );
        return;
      }

      // source.type is always a string for File objects, but can be empty.
      // The `&&` operator ensures we only call .has() if source.type is not an empty string.
      if (
        !source.type.startsWith('image/') ||
        (source.type &&
          !SUPPORTED_MIME_TYPES.has(source.type as SupportedMimeType))
      ) {
        reject(
          new Error(
            `Unsupported file type "${source.type}". Accepted formats: ` +
              SUPPORTED_FORMATS_DISPLAY +
              '.',
          ),
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(
            new Error(
              'Failed to decode image file. It may be corrupted or in an unsupported format.',
            ),
          );
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(source);
    }
  });
}

// ============================================================================
// Validation
// ============================================================================

function validateImage(
  img: HTMLImageElement,
  onProgress: (p: ProcessingProgress) => void,
): void {
  onProgress({
    status: 'validating',
    progress: 25,
    message: `Validating image (${img.naturalWidth}×${img.naturalHeight})…`,
  });

  if (img.naturalWidth < MIN_WIDTH) {
    throw new Error(
      `Image is too small (${img.naturalWidth}×${img.naturalHeight}px). ` +
        `Minimum width is ${MIN_WIDTH}px for a good wallpaper experience.`,
    );
  }

  // Warn about extremely large images (likely to be slow)
  if (img.naturalWidth > 8000 || img.naturalHeight > 8000) {
    // Don't reject — just note it will be resized down
    console.warn(
      `Very large source image (${img.naturalWidth}×${img.naturalHeight}). ` +
        `Will be resized to max ${TARGET_WIDTH}px wide.`,
    );
  }
}

// ============================================================================
// Canvas processing
// ============================================================================

// ============================================================================
// AVIF support detection (cached)
// ============================================================================

let _avifSupported: boolean | null = null;

/**
 * Test whether the browser supports AVIF encoding via canvas.toBlob().
 * Result is cached after the first call.
 */
async function isAvifEncodingSupported(): Promise<boolean> {
  if (_avifSupported !== null) return _avifSupported;

  return new Promise(resolve => {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    c.toBlob(
      blob => {
        _avifSupported = blob !== null && blob.size > 0;
        resolve(_avifSupported);
      },
      'image/avif',
      0.5,
    );
  });
}

/**
 * Resize an image using Canvas API and encode to AVIF (preferred) or WebP (fallback).
 *
 * Mirrors the server script which generates AVIF (quality 50) as the primary
 * format with WebP (quality 78) as fallback.
 */
async function resizeAndConvert(
  img: HTMLImageElement,
  targetWidth: number,
  onProgress: (p: ProcessingProgress) => void,
  isThumbnail: boolean,
): Promise<{ blob: Blob; width: number; height: number; mimeType: string }> {
  const scale = Math.min(1, targetWidth / img.naturalWidth);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  if (!isThumbnail) {
    onProgress({
      status: 'resizing',
      progress: 40,
      message: `Resizing to ${width}×${height}…`,
    });
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Try AVIF first (matches server's primary format), fall back to WebP
  const useAvif = await isAvifEncodingSupported();
  const mimeType = useAvif ? 'image/avif' : 'image/webp';
  const quality = useAvif ? CANVAS_AVIF_QUALITY : CANVAS_WEBP_QUALITY;
  const formatLabel = useAvif ? 'AVIF' : 'WebP';

  if (!isThumbnail) {
    onProgress({
      status: 'converting',
      progress: 60,
      message: `Encoding as ${formatLabel}…`,
    });
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(
            new Error(
              `Failed to encode image as ${formatLabel}. Your browser may not support ${formatLabel} encoding.`,
            ),
          );
          return;
        }
        resolve({ blob, width, height, mimeType });
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Generate a small base64 data URL thumbnail for theme card previews.
 */
async function generateThumbnail(
  img: HTMLImageElement,
  onProgress: (p: ProcessingProgress) => void,
): Promise<string> {
  onProgress({
    status: 'generating-thumbnail',
    progress: 75,
    message: 'Generating preview thumbnail…',
  });

  const scale = Math.min(1, THUMBNAIL_WIDTH / img.naturalWidth);
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/webp', CANVAS_THUMBNAIL_QUALITY);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Process an image (from URL or File) for use as a custom wallpaper theme.
 *
 * Reports progress through the `onProgress` callback. The progress goes
 * through these stages:
 *   loading → validating → resizing → converting → generating-thumbnail → saving → complete
 *
 * @throws Error with a user-friendly message on failure
 */
export async function processImageForWallpaper(
  source: File | string,
  onProgress: (p: ProcessingProgress) => void,
): Promise<ProcessedImage> {
  try {
    onProgress({
      status: 'loading',
      progress: 5,
      message:
        typeof source === 'string'
          ? 'Connecting to image server…'
          : 'Reading file…',
    });

    const img = await loadImage(source, onProgress);

    validateImage(img, onProgress);

    const { blob, width, height } = await resizeAndConvert(
      img,
      TARGET_WIDTH,
      onProgress,
      false,
    );

    const thumbnailDataUrl = await generateThumbnail(img, onProgress);

    const sourceName = typeof source === 'string' ? source : source.name;
    const name = extractDisplayName(sourceName);

    onProgress({
      status: 'complete',
      progress: 100,
      message: 'Processing complete!',
    });

    return {
      blob,
      thumbnailDataUrl,
      width,
      height,
      originalWidth: img.naturalWidth,
      originalHeight: img.naturalHeight,
      sizeBytes: blob.size,
      name,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
    onProgress({
      status: 'error',
      progress: 0,
      message,
      error: message,
    });
    throw err;
  }
}
