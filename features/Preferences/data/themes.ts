/**
 * Theme System — Public API
 *
 * Orchestrates theme building, lookup, and application.
 * All base theme palettes live in ./themeDefinitions.ts.
 * All color math lives in ./themeColors.ts.
 */
import { useCustomThemeStore } from '../store/useCustomThemeStore';
import { useCustomWallpaperStore } from '../store/useCustomWallpaperStore';
import {
  getWallpaperById,
  registerCustomWallpaper,
  unregisterCustomWallpaper,
} from './wallpapers';
import usePreferencesStore from '../store/usePreferencesStore';
import { LucideIcon } from 'lucide-react';
import baseThemeSets from './themeDefinitions';
import type { BaseTheme } from './themeDefinitions';
import {
  generateCardColor,
  generateBorderColor,
  generateAccentColor,
} from './themeColors';

// Re-export color utilities that consumers may need
export { generateCardColor, generateButtonBorderColor } from './themeColors';

// ============================================================================
// Types
// ============================================================================

interface Theme {
  id: string;
  displayName?: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  mainColorAccent: string;
  secondaryColor: string;
  secondaryColorAccent: string;
}

interface ThemeGroup {
  name: string;
  icon: LucideIcon;
  themes: Theme[];
}

// ============================================================================
// Glass / Premium helpers
// ============================================================================

const PREMIUM_THEME_VARIABLES = {
  backgroundColor: 'oklch(0% 0 0 / 0.95)',
  cardColor: 'oklch(20% 0.01 255 / 0.85)',
  borderColor: 'oklch(30% 0.01 255 / 0.85)',
  mainColor: 'oklch(100% 0 0)',
  secondaryColor: 'oklch(85% 0 0)',
} as const;

const PREMIUM_THEME_ACCENTS = {
  mainColorAccent: generateAccentColor(PREMIUM_THEME_VARIABLES.mainColor),
  secondaryColorAccent: generateAccentColor(
    PREMIUM_THEME_VARIABLES.secondaryColor,
  ),
} as const;

function getPremiumThemeVariables() {
  return {
    ...PREMIUM_THEME_VARIABLES,
    ...PREMIUM_THEME_ACCENTS,
  };
}

/**
 * Handles special cases for transparency (Glass themes).
 * Returns the card color with specific opacity for glass effects.
 */
export function getModifiedCardColor(
  themeId: string,
  cardColor: string,
): string {
  if (isPremiumThemeId(themeId)) {
    return PREMIUM_THEME_VARIABLES.cardColor;
  }
  return cardColor;
}

/**
 * Handles special cases for border transparency.
 */
export function getModifiedBorderColor(
  themeId: string,
  borderColor: string,
): string {
  if (isPremiumThemeId(themeId)) {
    return PREMIUM_THEME_VARIABLES.borderColor;
  }
  return borderColor;
}

// ============================================================================
// Wallpaper helpers
// ============================================================================

/**
 * Get wallpaper styles for a given wallpaper
 * Uses CSS image-set() for AVIF with WebP fallback
 * @param wallpaperUrl - Primary AVIF URL
 * @param wallpaperUrlWebp - Optional WebP fallback URL
 * @param isHighlighted - Whether the theme is currently hovered/highlighted
 * @returns CSS properties for wallpaper background, or empty object if no URL
 */
export function getWallpaperStyles(
  wallpaperUrl: string | undefined,
  isHighlighted: boolean,
  wallpaperUrlWebp?: string,
): React.CSSProperties {
  if (!wallpaperUrl) return {};

  // Use image-set for AVIF + WebP fallback when both are available
  const backgroundImage = wallpaperUrlWebp
    ? `image-set(url('${wallpaperUrl}') type('image/avif'), url('${wallpaperUrlWebp}') type('image/webp'))`
    : `url('${wallpaperUrl}')`;

  return {
    backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: isHighlighted ? 'brightness(1)' : 'brightness(0.85)',
  };
}

// ============================================================================
// Legacy aliases & theme ID resolution
// ============================================================================

const legacyThemeAliases = new Map<string, string>([
  ['neon-city-glass', 'neon-city'],
]);

const resolveThemeId = (themeId: string): string =>
  legacyThemeAliases.get(themeId) ?? themeId;

/**
 * Get default wallpaper ID for a theme (if any).
 * Dynamically reads from theme definitions — no hardcoded mapping needed.
 */
export function getThemeDefaultWallpaperId(
  themeId: string,
): string | undefined {
  const resolvedId = resolveThemeId(themeId);

  // Custom wallpaper themes use their own ID as the wallpaper ID
  if (resolvedId.startsWith('custom-')) return resolvedId;

  for (const group of baseThemeSets) {
    const theme = group.themes.find(t => t.id === resolvedId);
    if (theme?.wallpaperId) return theme.wallpaperId;
  }
  return undefined;
}

// ============================================================================
// Theme building
// ============================================================================

/**
 * Builds a complete Theme from a BaseTheme by generating derived colors.
 * @param base - The base theme definition
 * @param isLight - Whether this theme belongs to a light theme group
 */
function buildTheme(base: BaseTheme, isLight: boolean): Theme {
  return {
    id: base.id,
    displayName: base.displayName,
    backgroundColor: base.backgroundColor,
    cardColor: generateCardColor(base.backgroundColor, isLight),
    borderColor: generateBorderColor(base.backgroundColor, isLight),
    mainColor: base.mainColor,
    mainColorAccent: generateAccentColor(base.mainColor),
    secondaryColor: base.secondaryColor,
    secondaryColorAccent: generateAccentColor(base.secondaryColor),
  };
}

/**
 * Builds a complete ThemeGroup from a BaseThemeGroup.
 * Passes the isLight flag to each theme for proper card/border color generation.
 */
function buildThemeGroup(baseGroup: {
  name: string;
  icon: LucideIcon;
  isLight: boolean;
  themes: BaseTheme[];
}): ThemeGroup {
  return {
    name: baseGroup.name,
    icon: baseGroup.icon,
    themes: baseGroup.themes.map(theme => buildTheme(theme, baseGroup.isLight)),
  };
}

// ============================================================================
// Premium theme resolution
// ============================================================================

const premiumThemeIds = new Set(
  baseThemeSets
    .find(group => group.name.startsWith('Premium'))
    ?.themes.map(theme => theme.id) ?? [],
);

/**
 * Check if a theme uses premium (glass) styling.
 * Built-in premium themes are in the static set; custom wallpaper themes
 * are identified by the `custom-` prefix.
 */
export const isPremiumThemeId = (themeId: string): boolean => {
  const resolved = resolveThemeId(themeId);
  return premiumThemeIds.has(resolved) || resolved.startsWith('custom-');
};

// ============================================================================
// Built theme sets (default export)
// ============================================================================

// Build the complete theme sets with generated card and border colors
const themeSets: ThemeGroup[] = baseThemeSets.map(buildThemeGroup);

export default themeSets;

// ============================================================================
// Theme map & lookup
// ============================================================================

// Lazy-initialized theme map for efficient lookups
let _themeMap: Map<string, Theme> | null = null;

function getThemeMap(): Map<string, Theme> {
  if (!_themeMap) {
    _themeMap = new Map<string, Theme>();
    themeSets.forEach(group => {
      group.themes.forEach(theme => {
        _themeMap!.set(theme.id, theme);
      });
    });
  }
  return _themeMap;
}

/**
 * Converts a ThemeTemplate (from custom store) to a full Theme with accent colors.
 */
function buildThemeFromTemplate(template: {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}): Theme {
  return {
    ...template,
    mainColorAccent: generateAccentColor(template.mainColor),
    secondaryColorAccent: generateAccentColor(template.secondaryColor),
  };
}

// Populate map with custom themes from store (lazy)
let _customThemesLoaded = false;

/**
 * Build a Theme object for a custom wallpaper (uses glass overlay colors).
 */
function buildCustomWallpaperTheme(id: string): Theme {
  const base = {
    id,
    backgroundColor: 'oklch(0% 0 0 / 0.95)',
    cardColor: 'oklch(0% 0 0 / 0.95)',
    borderColor: 'oklch(0% 0 0 / 0.95)',
    mainColor: 'oklch(100% 0 0)',
    secondaryColor: 'oklch(85% 0 0)',
  };
  return buildThemeFromTemplate(base);
}

/**
 * Sync all custom wallpapers into the wallpaper registry and theme map.
 */
function syncCustomWallpapers(): void {
  const themeMap = getThemeMap();
  const { wallpapers, objectUrls } = useCustomWallpaperStore.getState();

  // Collect current custom IDs so we can detect removals
  const currentCustomIds = new Set(wallpapers.map(w => w.id));

  // Remove stale entries from previous sync
  for (const key of themeMap.keys()) {
    if (key.startsWith('custom-') && !currentCustomIds.has(key)) {
      themeMap.delete(key);
      unregisterCustomWallpaper(key);
    }
  }

  // Register each current custom wallpaper
  for (const wp of wallpapers) {
    // Register in the wallpaper lookup registry
    const url = objectUrls[wp.id] || wp.thumbnailDataUrl;
    registerCustomWallpaper({
      id: wp.id,
      name: wp.name,
      url, // Object URL (full-size) or thumbnail fallback
      urlWebp: '', // Not needed — url is already WebP
    });

    // Register in the theme map
    themeMap.set(wp.id, buildCustomWallpaperTheme(wp.id));
  }
}

function ensureCustomThemesLoaded(): void {
  if (_customThemesLoaded) return;
  _customThemesLoaded = true;

  const themeMap = getThemeMap();

  // --- Custom color themes (from useCustomThemeStore) ---
  useCustomThemeStore
    .getState()
    .themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );

  useCustomThemeStore.subscribe(state => {
    state.themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );
    _themeMap = null;
  });

  // --- Custom wallpaper themes (from useCustomWallpaperStore) ---
  syncCustomWallpapers();

  useCustomWallpaperStore.subscribe(() => {
    syncCustomWallpapers();
    // Clear cache so next lookup rebuilds
    _themeMap = null;
  });
}

// ============================================================================
// Theme application (DOM)
// ============================================================================

export function applyTheme(themeId: string) {
  ensureCustomThemesLoaded();
  const resolvedThemeId = resolveThemeId(themeId);
  const theme = getThemeMap().get(resolvedThemeId);

  if (!theme) {
    console.error(`Theme "${themeId}" not found`);
    return;
  }

  usePreferencesStore
    .getState()
    .setGlassMode(isPremiumThemeId(resolvedThemeId));

  const root = document.documentElement;

  const isPremium = isPremiumThemeId(resolvedThemeId);
  const effectiveTheme = isPremium
    ? getPremiumThemeVariables()
    : {
        backgroundColor: theme.backgroundColor,
        cardColor: getModifiedCardColor(theme.id, theme.cardColor),
        borderColor: getModifiedBorderColor(theme.id, theme.borderColor),
        mainColor: theme.mainColor,
        mainColorAccent: theme.mainColorAccent,
        secondaryColor: theme.secondaryColor,
        secondaryColorAccent: theme.secondaryColorAccent,
      };

  root.style.setProperty('--background-color', effectiveTheme.backgroundColor);
  root.style.setProperty('--card-color', effectiveTheme.cardColor);
  root.style.setProperty('--border-color', effectiveTheme.borderColor);
  root.style.setProperty('--main-color', effectiveTheme.mainColor);
  root.style.setProperty('--main-color-accent', effectiveTheme.mainColorAccent);

  if (effectiveTheme.secondaryColor) {
    root.style.setProperty('--secondary-color', effectiveTheme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      effectiveTheme.secondaryColorAccent,
    );
  }

  root.setAttribute('data-theme', resolvedThemeId);

  // Apply wallpaper if theme has one
  const wallpaperId = getThemeDefaultWallpaperId(resolvedThemeId);
  if (wallpaperId) {
    const wallpaper = getWallpaperById(wallpaperId);

    if (wallpaper) {
      // Use image-set for AVIF + WebP fallback
      const backgroundImage = wallpaper.urlWebp
        ? `image-set(url('${wallpaper.url}') type('image/avif'), url('${wallpaper.urlWebp}') type('image/webp'))`
        : `url('${wallpaper.url}')`;
      document.body.style.backgroundImage = backgroundImage;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    }
  } else {
    // Clear wallpaper if theme doesn't have one
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
  }
}

// Apply a theme object directly (live preview theme)
export function applyThemeObject(theme: Theme) {
  const root = document.documentElement;

  const isPremium = isPremiumThemeId(theme.id);
  const effectiveTheme = isPremium
    ? getPremiumThemeVariables()
    : {
        backgroundColor: theme.backgroundColor,
        cardColor: getModifiedCardColor(theme.id, theme.cardColor),
        borderColor: getModifiedBorderColor(theme.id, theme.borderColor),
        mainColor: theme.mainColor,
        mainColorAccent: theme.mainColorAccent,
        secondaryColor: theme.secondaryColor,
        secondaryColorAccent: theme.secondaryColorAccent,
      };

  root.style.setProperty('--background-color', effectiveTheme.backgroundColor);
  root.style.setProperty('--card-color', effectiveTheme.cardColor);
  root.style.setProperty('--border-color', effectiveTheme.borderColor);
  root.style.setProperty('--main-color', effectiveTheme.mainColor);
  root.style.setProperty('--main-color-accent', effectiveTheme.mainColorAccent);
  if (effectiveTheme.secondaryColor) {
    root.style.setProperty('--secondary-color', effectiveTheme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      effectiveTheme.secondaryColorAccent,
    );
  }
}

// Helper to get a specific theme
export function getTheme(themeId: string): Theme | undefined {
  ensureCustomThemesLoaded();
  return getThemeMap().get(resolveThemeId(themeId));
}
