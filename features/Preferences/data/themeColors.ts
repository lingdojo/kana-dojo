/**
 * OKLCH Color Utilities
 *
 * Pure color math functions for parsing, formatting, and deriving
 * theme colors in the OKLCH color space. No project dependencies.
 */

/**
 * Parses an OKLCH color string into its components.
 * @returns Object with L (0-1), C, H, A values or null if parsing fails
 */
export function parseOklch(
  oklchColor: string,
): { L: number; C: number; H: number; A: number } | null {
  const match = oklchColor.match(
    /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/,
  );
  if (!match) return null;

  let L = parseFloat(match[1]);
  if (L > 1) L = L / 100; // Normalize percentage to 0-1

  return {
    L,
    C: parseFloat(match[2]),
    H: parseFloat(match[3]),
    A: match[4] ? parseFloat(match[4]) : 1,
  };
}

/**
 * Formats OKLCH components back into a color string.
 */
export function formatOklch(
  L: number,
  C: number,
  H: number,
  A: number,
): string {
  return `oklch(${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${H.toFixed(
    2,
  )} / ${A})`;
}

/**
 * Generates a card color from a background color.
 *
 * For dark themes:
 * - Lightness increases slightly (cards are lighter than background)
 * - Chroma increases for subtle vibrancy
 *
 * For light themes:
 * - Lightness increases toward white (cards are lighter than background)
 * - Chroma decreases to create a neutral, recessive surface
 * - This ensures colored text (mainColor/secondaryColor) pops beautifully
 *
 * @param backgroundColor - OKLCH background color string
 * @param isLight - Whether this is a light theme (uses group membership, not heuristic)
 * @param lightnessBoost - Proportional lightness increase for dark themes (default 0.2)
 * @param chromaMultiplier - Chroma multiplier for dark themes (default 1.2)
 */
export function generateCardColor(
  backgroundColor: string,
  isLight: boolean,
  lightnessBoost = 0.2,
  chromaMultiplier = 1.2,
): string {
  const parsed = parseOklch(backgroundColor);
  if (!parsed) {
    console.warn('Could not parse OKLCH color for card:', backgroundColor);
    return backgroundColor;
  }

  const { L, C, H, A } = parsed;

  let newL: number;
  let newC: number;

  if (isLight) {
    // Light themes: make cards LIGHTER (toward white)
    // This creates a subtle "elevated paper" effect and ensures
    // vibrant colored text remains readable and beautiful
    newL = Math.min(0.99, L + (1 - L) * 0.45);
    // Desaturate to make the card neutral and recessive
    newC = C * 0.5;
  } else {
    // Dark themes: existing logic - make cards slightly lighter
    newL = Math.min(1, L + L * lightnessBoost);
    newC = Math.min(0.37, C * chromaMultiplier);
  }

  return formatOklch(newL, newC, H, A);
}

/**
 * Generates a border color from a background color.
 *
 * For dark themes:
 * - Lightness increases more than cards (borders are more visible)
 * - Chroma increases for subtle definition
 *
 * For light themes:
 * - Lightness decreases slightly to create subtle definition
 * - Chroma is reduced for a soft, elegant border
 *
 * @param backgroundColor - OKLCH background color string
 * @param isLight - Whether this is a light theme
 * @param lightnessBoost - Proportional lightness increase for dark themes (default 0.75)
 * @param chromaMultiplier - Chroma multiplier for dark themes (default 1.85)
 */
export function generateBorderColor(
  backgroundColor: string,
  isLight: boolean,
  lightnessBoost = 0.75,
  chromaMultiplier = 1.85,
): string {
  const parsed = parseOklch(backgroundColor);
  if (!parsed) {
    console.warn('Could not parse OKLCH color for border:', backgroundColor);
    return backgroundColor;
  }

  const { L, C, H, A } = parsed;

  let newL: number;
  let newC: number;

  if (isLight) {
    // Light themes: darken slightly for subtle border definition
    // Not too dark - just enough to separate elements elegantly
    newL = Math.max(0.7, L - (1 - L + 0.1) * 0.4);
    // Reduce chroma for a soft, neutral border
    newC = C * 0.6;
  } else {
    // Dark themes: existing logic - make borders lighter than cards
    newL = Math.min(1, L + L * lightnessBoost);
    newC = Math.min(0.37, C * chromaMultiplier);
  }

  return formatOklch(newL, newC, H, A);
}

/**
 * Generates an accent color from a main/secondary color.
 * Creates a darker, slightly more saturated version for hover states, borders, shadows.
 *
 * Based on generateButtonBorderColor logic:
 * - Lowering lightness creates depth/shadow, making elements feel 3D and pressable
 * - Slightly boosting chroma prevents the darker color from looking muddy/desaturated
 * - Keeping the same hue maintains color harmony
 *
 * @param color - OKLCH color string, e.g. "oklch(74.61% 0.1715 51.56 / 1)"
 * @param lightnessReduction - Proportional lightness reduction (0-1, default 0.25)
 * @param chromaBoost - Absolute chroma increase (default 0.05)
 */
export function generateAccentColor(
  color: string,
  lightnessReduction = 0.25,
  chromaBoost = 0.05,
): string {
  const parsed = parseOklch(color);
  if (!parsed) {
    console.warn('Could not parse OKLCH color for accent:', color);
    return color;
  }

  const { L, C, H, A } = parsed;
  const newL = Math.max(0.05, L - lightnessReduction * L);
  const newC = Math.min(0.37, C + chromaBoost);

  return formatOklch(newL, newC, H, A);
}

/**
 * Generates a border color from an OKLCH color string.
 * Creates a darker, slightly more saturated version for a soft, pressable button effect.
 *
 * Color theory rationale:
 * - Lowering lightness creates depth/shadow, making buttons feel 3D and pressable
 * - Slightly boosting chroma prevents the darker color from looking muddy/desaturated
 * - Keeping the same hue maintains color harmony
 *
 * @param oklchColor - OKLCH color string, e.g. "oklch(74.61% 0.1715 51.56 / 1)"
 * @param lightnessReduction - Proportional lightness reduction (0-1, default 0.18)
 * @param chromaBoost - Absolute chroma increase (default 0.025)
 * @returns OKLCH color string for the border
 */
export function generateButtonBorderColor(
  oklchColor: string,
  lightnessReduction = 0.25,
  chromaBoost = 0.05,
): string {
  const parsed = parseOklch(oklchColor);
  if (!parsed) {
    console.warn('Could not parse OKLCH color:', oklchColor);
    return oklchColor;
  }

  const { L, C, H, A } = parsed;
  const newL = Math.max(0.05, L - lightnessReduction * L);
  const newC = Math.min(0.37, C + chromaBoost);

  return formatOklch(newL, newC, H, A);
}
