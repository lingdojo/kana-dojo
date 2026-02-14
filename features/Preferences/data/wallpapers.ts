/**
 * Wallpaper System — Public API
 *
 * Wallpapers are dynamically generated from source images.
 * Run `npm run images:process` to regenerate after adding/removing images
 * in data/wallpapers-source/.
 *
 * The generated manifest is the single source of truth for built-in wallpapers.
 * Custom wallpapers created by users at runtime are stored in a separate
 * registry and looked up as a fallback.
 */
import {
  GENERATED_WALLPAPERS,
  type GeneratedWallpaper,
} from './wallpapers.generated';

export type { GeneratedWallpaper as Wallpaper };

/** All available wallpapers (re-exported from generated manifest) */
export const WALLPAPERS = GENERATED_WALLPAPERS;

// ============================================================================
// Custom wallpaper registry (populated at runtime)
// ============================================================================

/**
 * Runtime registry for custom wallpapers created by users.
 * Entries use object URLs pointing to IndexedDB blobs.
 */
const customWallpaperRegistry = new Map<string, GeneratedWallpaper>();

/** Register a custom wallpaper so it can be resolved by getWallpaperById. */
export function registerCustomWallpaper(wallpaper: GeneratedWallpaper): void {
  customWallpaperRegistry.set(wallpaper.id, wallpaper);
}

/** Remove a custom wallpaper from the registry. */
export function unregisterCustomWallpaper(id: string): void {
  customWallpaperRegistry.delete(id);
}

// ============================================================================
// Lookup
// ============================================================================

/**
 * Get a wallpaper by ID — checks built-in wallpapers first, then custom.
 */
export function getWallpaperById(id: string): GeneratedWallpaper | undefined {
  return (
    GENERATED_WALLPAPERS.find(w => w.id === id) ??
    customWallpaperRegistry.get(id)
  );
}
