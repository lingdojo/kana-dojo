/**
 * Theme Improver
 * Adjusts theme colors to meet WCAG accessibility requirements
 * while preserving the original aesthetic character
 */

import {
  parseColor,
  rgbToHsl,
  hslToRgb,
  getContrastRatio,
  getRelativeLuminance
} from './colorUtils';
import { validateTheme, CONTRAST_REQUIREMENTS } from './themeValidator';

interface Theme {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}

/**
 * Adjust a color's lightness to achieve target contrast ratio
 */
function adjustColorForContrast(
  color: string,
  background: string,
  targetRatio: number,
  preferLighter: boolean
): string {
  const rgb = parseColor(color);
  const hsl = rgbToHsl(rgb);
  const bgLuminance = getRelativeLuminance(background);

  // Binary search for optimal lightness
  let low = preferLighter ? hsl.l : 0;
  let high = preferLighter ? 1 : hsl.l;
  let bestL = hsl.l;

  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;
    const testRgb = hslToRgb({ h: hsl.h, s: hsl.s, l: mid });
    const testLuminance =
      0.2126 * linearize(testRgb.r) +
      0.7152 * linearize(testRgb.g) +
      0.0722 * linearize(testRgb.b);

    const lighter = Math.max(testLuminance, bgLuminance);
    const darker = Math.min(testLuminance, bgLuminance);
    const contrast = (lighter + 0.05) / (darker + 0.05);

    if (contrast >= targetRatio) {
      bestL = mid;
      // Try to stay closer to original
      if (preferLighter) {
        high = mid;
      } else {
        low = mid;
      }
    } else {
      if (preferLighter) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(
    bestL * 100
  )}%, 1)`;
}

function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Improve a theme to meet WCAG requirements
 */
export function improveTheme(theme: Theme): Theme {
  const validation = validateTheme(theme);

  if (validation.isValid) {
    return theme; // Already compliant
  }

  const improved = { ...theme };
  const bgLuminance = getRelativeLuminance(theme.backgroundColor);
  const isDarkTheme = bgLuminance < 0.5;

  // Fix mainColor contrast issues
  const mainOnBg = getContrastRatio(theme.mainColor, theme.backgroundColor);
  const mainOnCard = getContrastRatio(theme.mainColor, theme.cardColor);

  if (
    mainOnBg < CONTRAST_REQUIREMENTS.TEXT_AA ||
    mainOnCard < CONTRAST_REQUIREMENTS.TEXT_AA
  ) {
    improved.mainColor = adjustColorForContrast(
      theme.mainColor,
      theme.backgroundColor,
      CONTRAST_REQUIREMENTS.TEXT_AA,
      isDarkTheme
    );
  }

  // Fix secondaryColor contrast issues
  const secOnBg = getContrastRatio(theme.secondaryColor, theme.backgroundColor);
  const secOnCard = getContrastRatio(theme.secondaryColor, theme.cardColor);

  if (
    secOnBg < CONTRAST_REQUIREMENTS.TEXT_AA ||
    secOnCard < CONTRAST_REQUIREMENTS.TEXT_AA
  ) {
    improved.secondaryColor = adjustColorForContrast(
      theme.secondaryColor,
      theme.backgroundColor,
      CONTRAST_REQUIREMENTS.TEXT_AA,
      isDarkTheme
    );
  }

  // Fix borderColor contrast - needs 3:1 against background
  const borderOnBg = getContrastRatio(theme.borderColor, theme.backgroundColor);

  if (borderOnBg < CONTRAST_REQUIREMENTS.UI_AA) {
    improved.borderColor = adjustColorForContrast(
      theme.borderColor,
      theme.backgroundColor,
      CONTRAST_REQUIREMENTS.UI_AA,
      isDarkTheme
    );
  }

  // Fix cardColor distinction
  const cardOnBg = getContrastRatio(theme.cardColor, theme.backgroundColor);

  if (cardOnBg < CONTRAST_REQUIREMENTS.CARD_DISTINCTION) {
    const cardRgb = parseColor(theme.cardColor);
    const cardHsl = rgbToHsl(cardRgb);
    const newL = isDarkTheme
      ? Math.min(cardHsl.l + 0.05, 0.95)
      : Math.max(cardHsl.l - 0.05, 0.05);
    improved.cardColor = `hsla(${Math.round(cardHsl.h)}, ${Math.round(
      cardHsl.s * 100
    )}%, ${Math.round(newL * 100)}%, 1)`;
  }

  return improved;
}

/**
 * Improve all themes in a list
 */
export function improveAllThemes(themes: Theme[]): Theme[] {
  return themes.map(improveTheme);
}

/**
 * Generate improved theme values as a diff
 */
export function getThemeImprovements(theme: Theme): Partial<Theme> | null {
  const improved = improveTheme(theme);
  const changes: Partial<Theme> = {};
  let hasChanges = false;

  if (improved.mainColor !== theme.mainColor) {
    changes.mainColor = improved.mainColor;
    hasChanges = true;
  }
  if (improved.secondaryColor !== theme.secondaryColor) {
    changes.secondaryColor = improved.secondaryColor;
    hasChanges = true;
  }
  if (improved.borderColor !== theme.borderColor) {
    changes.borderColor = improved.borderColor;
    hasChanges = true;
  }
  if (improved.cardColor !== theme.cardColor) {
    changes.cardColor = improved.cardColor;
    hasChanges = true;
  }

  return hasChanges ? changes : null;
}
