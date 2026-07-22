import { themeSets } from '@/features/Preferences';

// ============================================================================
// TYPES
// ============================================================================

type DecorationFont = {
  name: string;
  font: {
    className: string;
  };
};

// ============================================================================
// MODULE-LEVEL CACHING
// ============================================================================

let decorationsCache: string[] | null = null;
let decorationsLoadingPromise: Promise<string[]> | null = null;
let fontsCache: DecorationFont[] | null = null;
let fontsLoadingPromise: Promise<DecorationFont[]> | null = null;

// Get all available main colors from themes (computed once at module load)
const allMainColors = (() => {
  const colors = new Set<string>();
  themeSets[2].themes.forEach(theme => {
    colors.add(theme.mainColor);
    if (theme.secondaryColor) colors.add(theme.secondaryColor);
  });
  return Array.from(colors);
})();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fisher-Yates shuffle algorithm
 */
const shuffle = <T>(arr: T[]): T[] => {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Load decorations JSON (minimal file with just characters)
 * Results are cached for the session
 */
export const loadDecorations = async (): Promise<string[]> => {
  if (decorationsCache) return decorationsCache;
  if (decorationsLoadingPromise) return decorationsLoadingPromise;

  decorationsLoadingPromise = fetch('/data-kanji/decorations.json')
    .then(res => res.json())
    .then((chars: string[]) => {
      decorationsCache = shuffle(chars);
      decorationsLoadingPromise = null;
      return decorationsCache;
    });

  return decorationsLoadingPromise;
};

/**
 * Get a random color from the theme color palette
 */
export const getRandomColor = (): string => {
  return allMainColors[Math.floor(Math.random() * allMainColors.length)];
};

/**
 * Load decoration fonts (lazy, only in production)
 */
const loadDecorationFonts = async (
  forceLoad = false,
): Promise<DecorationFont[]> => {
  if (process.env.NODE_ENV !== 'production' && !forceLoad) {
    return [];
  }

  if (fontsCache) return fontsCache;
  if (fontsLoadingPromise) return fontsLoadingPromise;

  fontsLoadingPromise = import(
    '@/shared/ui-composite/Decorations/decorationFonts'
  ).then(
    module => {
      fontsCache = module.decorationFonts;
      fontsLoadingPromise = null;
      return module.decorationFonts;
    },
  );

  return fontsLoadingPromise;
};

/**
 * Get random kanji characters with colors and fonts
 * @param count Number of kanji to generate
 * @param forceLoadFonts Force loading fonts even in development
 * @returns Array of objects with char, color, and fontClass properties
 */
export const getRandomKanjiStyles = async (
  count: number,
  forceLoadFonts = false,
): Promise<Array<{ char: string; color: string; fontClass: string }>> => {
  const [allChars, fonts] = await Promise.all([
    loadDecorations(),
    loadDecorationFonts(forceLoadFonts),
  ]);

  // If we need more chars than available, repeat them
  let chars: string[];
  if (count <= allChars.length) {
    chars = allChars.slice(0, count);
  } else {
    // Repeat characters to fill the needed count
    chars = [];
    while (chars.length < count) {
      chars.push(
        ...allChars.slice(0, Math.min(allChars.length, count - chars.length)),
      );
    }
  }

  return chars.map(char => ({
    char,
    color: getRandomColor(),
    fontClass:
      fonts.length > 0
        ? fonts[Math.floor(Math.random() * fonts.length)].font.className
        : '',
  }));
};
