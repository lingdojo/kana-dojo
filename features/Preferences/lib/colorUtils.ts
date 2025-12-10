/**
 * WCAG Color Utility Functions
 * Provides color parsing, conversion, and contrast ratio calculations
 * following WCAG 2.1 accessibility guidelines.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Parse any CSS color format to RGB values (0-255)
 * Supports: hex (#fff, #ffffff), rgb(), rgba(), hsl(), hsla()
 */
export function parseColor(color: string): RGB {
  const trimmed = color.trim().toLowerCase();

  // Hex format: #fff or #ffffff
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }

  // RGB/RGBA format
  if (trimmed.startsWith('rgb')) {
    return parseRgb(trimmed);
  }

  // HSL/HSLA format
  if (trimmed.startsWith('hsl')) {
    return parseHsl(trimmed);
  }

  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Parse hex color to RGB
 */
function parseHex(hex: string): RGB {
  let h = hex.replace('#', '');

  // Expand shorthand (#fff -> #ffffff)
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  if (h.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16)
  };
}

/**
 * Parse rgb() or rgba() to RGB
 */
function parseRgb(rgb: string): RGB {
  const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) {
    throw new Error(`Invalid RGB color: ${rgb}`);
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };
}

/**
 * Parse hsl() or hsla() to RGB
 */
function parseHsl(hsl: string): RGB {
  // Match various HSL formats: hsl(h, s%, l%), hsla(h, s%, l%, a), hsl(hdeg, s%, l%)
  const match = hsl.match(
    /hsla?\s*\(\s*([\d.]+)(?:deg)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/
  );
  if (!match) {
    throw new Error(`Invalid HSL color: ${hsl}`);
  }

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  return hslToRgb({ h, s, l });
}

/**
 * Convert HSL to RGB
 * h: 0-360, s: 0-1, l: 0-1
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;

  if (s === 0) {
    // Achromatic (gray)
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hueToRgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hNorm) * 255),
    b: Math.round(hueToRgb(p, q, hNorm - 1 / 3) * 255)
  };
}

/**
 * Convert RGB to HSL
 * Returns h: 0-360, s: 0-1, l: 0-1
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: h * 360, s, l };
}

/**
 * Linearize an sRGB channel value for luminance calculation
 * WCAG formula: if value <= 0.03928, linear = value/12.92
 *               else linear = ((value + 0.055)/1.055)^2.4
 */
function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance of a color
 * WCAG formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * Returns value between 0 (black) and 1 (white)
 */
export function getRelativeLuminance(color: string): number {
  const rgb = parseColor(color);
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get relative luminance from RGB values directly
 */
export function getRelativeLuminanceFromRgb(rgb: RGB): number {
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 is lighter
 * Returns ratio as number (e.g., 4.5 for 4.5:1)
 * Range: 1:1 (same color) to 21:1 (black/white)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard for normal text (4.5:1)
 */
export function meetsWcagAA(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard for normal text (7:1)
 */
export function meetsWcagAAA(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 7;
}

/**
 * Check if contrast ratio meets WCAG AA standard for large text/UI (3:1)
 */
export function meetsWcagAALarge(color1: string, color2: string): boolean {
  return getContrastRatio(color1, color2) >= 3;
}

/**
 * Get hue difference between two colors in degrees (0-180)
 */
export function getHueDifference(color1: string, color2: string): number {
  const hsl1 = rgbToHsl(parseColor(color1));
  const hsl2 = rgbToHsl(parseColor(color2));

  const diff = Math.abs(hsl1.h - hsl2.h);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Get luminance contrast ratio between two colors
 * Used for checking accent color distinguishability
 */
export function getLuminanceRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  // Avoid division by zero for very dark colors
  if (darker < 0.001) {
    return lighter < 0.001 ? 1 : lighter / 0.001;
  }

  return lighter / darker;
}

/**
 * Check if a hue is in the red range (330-30 degrees)
 */
export function isRedHue(color: string): boolean {
  const hsl = rgbToHsl(parseColor(color));
  return hsl.h >= 330 || hsl.h <= 30;
}

/**
 * Check if a hue is in the green range (90-150 degrees)
 */
export function isGreenHue(color: string): boolean {
  const hsl = rgbToHsl(parseColor(color));
  return hsl.h >= 90 && hsl.h <= 150;
}

/**
 * Convert RGB to HSL string
 */
export function rgbToHslString(rgb: RGB): string {
  const hsl = rgbToHsl(rgb);
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(
    hsl.l * 100
  )}%)`;
}

/**
 * Adjust lightness of a color to achieve target contrast ratio
 * Returns new color as HSL string
 */
export function adjustLightness(
  color: string,
  background: string,
  targetContrast: number
): string {
  const rgb = parseColor(color);
  const hsl = rgbToHsl(rgb);
  const bgLuminance = getRelativeLuminance(background);

  // Binary search for the right lightness
  let low = 0;
  let high = 1;
  let bestL = hsl.l;
  let bestContrast = getContrastRatio(color, background);

  // Determine if we need to go lighter or darker
  const needsLighter = bgLuminance < 0.5;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const testRgb = hslToRgb({ h: hsl.h, s: hsl.s, l: mid });
    const testColor = rgbToHslString(testRgb);
    const contrast = getContrastRatio(testColor, background);

    if (contrast >= targetContrast) {
      bestL = mid;
      bestContrast = contrast;

      // Try to get closer to original lightness
      if (needsLighter) {
        high = mid;
      } else {
        low = mid;
      }
    } else {
      if (needsLighter) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // If we couldn't achieve target, use the best we found
  const finalRgb = hslToRgb({ h: hsl.h, s: hsl.s, l: bestL });
  return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(
    bestL * 100
  )}%, 1)`;
}
