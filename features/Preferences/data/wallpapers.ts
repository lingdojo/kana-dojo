/* prettier-ignore-file */

export interface Wallpaper {
  id: string; // Unique identifier (e.g., 'neon-city-1')
  name: string; // Display name (e.g., 'Neon City Nights')
  url: string; // Direct image URL
  thumbnailUrl?: string; // Optional thumbnail for preview
  category: WallpaperCategory; // Category for organization
  isUserAdded: boolean; // true = user can delete, false = immutable
  source?: string; // Attribution/source (e.g., 'Unsplash')
  createdAt: number; // Timestamp
}

export type WallpaperCategory =
  | 'neon-cyberpunk'
  | 'nature'
  | 'abstract'
  | 'minimal'
  | 'anime'
  | 'custom';

/**
 * Curated base wallpapers (immutable)
 * These wallpapers are provided by default and cannot be deleted by users.
 * All images are sourced from Unsplash with CC0 license (free for commercial use).
 */
export const CURATED_WALLPAPERS: Wallpaper[] = [
  // Local wallpapers (hosted in /public/wallpapers/)
  {
    id: 'neon-city-local',
    name: 'Neon City (Original)',
    url: '/wallpapers/neonretrocarcity.jpg',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Local',
    createdAt: Date.now(),
  },
  // External wallpapers (hosted on Unsplash CDN)
  {
    id: 'neon-city-1',
    name: 'Neon City Nights',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'tokyo-rain',
    name: 'Tokyo Rain',
    url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'cyberpunk-street',
    name: 'Cyberpunk Street',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'sakura-night',
    name: 'Sakura Night',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
    category: 'nature',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'mt-fuji-sunset',
    name: 'Mt. Fuji Sunset',
    url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&q=80',
    category: 'nature',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'minimal-gradient-purple',
    name: 'Purple Gradient',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80',
    category: 'minimal',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'kyoto-lanterns',
    name: 'Kyoto Lantern Walk',
    url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1920&q=80',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'arashiyama-bamboo',
    name: 'Arashiyama Bamboo Glow',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
    category: 'nature',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'nara-temple',
    name: 'Nara Temple Dawn',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80',
    category: 'nature',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
  {
    id: 'osaka-riverwalk',
    name: 'Osaka Riverwalk Lights',
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=80',
    category: 'neon-cyberpunk',
    isUserAdded: false,
    source: 'Unsplash',
    createdAt: Date.now(),
  },
];

/**
 * Get a wallpaper by ID from both curated and user wallpapers
 */
export function getWallpaperById(
  id: string,
  userWallpapers: Wallpaper[],
): Wallpaper | undefined {
  return [...CURATED_WALLPAPERS, ...userWallpapers].find(w => w.id === id);
}

/**
 * Validate if a URL is a valid image URL
 * Checks for common image extensions or Unsplash/Pexels query parameters
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const pathname = urlObj.pathname.toLowerCase();

    // Check if URL ends with valid image extension
    const hasValidExtension = validExtensions.some(ext =>
      pathname.endsWith(ext),
    );

    // Support query params like Unsplash (?w=1920) or other CDN parameters
    const hasImageParams =
      urlObj.searchParams.has('w') || urlObj.searchParams.has('width');

    return hasValidExtension || hasImageParams;
  } catch {
    return false;
  }
}

/**
 * Generate a unique ID for custom wallpapers
 */
export function generateWallpaperId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
