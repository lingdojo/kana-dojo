/* prettier-ignore-file */
import { useCustomThemeStore } from '../store/useCustomThemeStore';
import {
  Atom,
  Sun,
  Moon,
  LucideIcon,
  CloudLightning,
  TreePine,
  Sparkles,
} from 'lucide-react';

interface Theme {
  id: string;
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

// Base theme definition - only essential colors, card/border are derived
interface BaseTheme {
  id: string;
  backgroundColor: string;
  mainColor: string;
  secondaryColor: string;
}

interface BaseThemeGroup {
  name: string;
  icon: LucideIcon;
  isLight: boolean;
  themes: BaseTheme[];
}

/**
 * Parses an OKLCH color string into its components.
 * @returns Object with L (0-1), C, H, A values or null if parsing fails
 */
function parseOklch(
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
function formatOklch(L: number, C: number, H: number, A: number): string {
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
 * Builds a complete Theme from a BaseTheme by generating derived colors.
 * @param base - The base theme definition
 * @param isLight - Whether this theme belongs to a light theme group
 */
function buildTheme(base: BaseTheme, isLight: boolean): Theme {
  return {
    id: base.id,
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
function buildThemeGroup(baseGroup: BaseThemeGroup): ThemeGroup {
  return {
    name: baseGroup.name,
    icon: baseGroup.icon,
    themes: baseGroup.themes.map(theme => buildTheme(theme, baseGroup.isLight)),
  };
}

// Base theme definitions - only id, backgroundColor, mainColor, secondaryColor
const baseThemeSets: BaseThemeGroup[] = [
  {
    name: 'Base',
    icon: Atom,
    isLight: false,
    themes: [
      {
        id: 'light',
        backgroundColor: 'oklch(100.00% 0.0000 89.88 / 1)',
        mainColor: 'oklch(0.00% 0.0000 0.00 / 1)',
        secondaryColor: 'oklch(46.49% 0.0000 89.88 / 1)',
      },
      {
        id: 'dark',
        backgroundColor: 'oklch(22.67% 0.0000 89.88 / 1)',
        mainColor: 'oklch(100.00% 0.0000 89.88 / 1)',
        secondaryColor: 'oklch(80.54% 0.0000 89.88 / 1)',
      },
    ],
  },

  {
    name: 'Light',
    icon: Sun,
    isLight: true,
    themes: [
      {
        id: 'long',
        backgroundColor: 'oklch(84.00% 0.055 6.93 / 1)',
        mainColor: ' oklch(63.71% 0.1862 304.76 / 1)',
        secondaryColor: 'oklch(66.54% 0.2210 304.03 / 1)',
      },
      {
        id: 'amethyst',
        backgroundColor: 'oklch(86.00% 0.045 308.12 / 1)',
        mainColor: 'oklch(62.02% 0.2504 302.41 / 1)',
        secondaryColor: 'oklch(66.54% 0.2210 304.03 / 1)',
      },
      {
        id: 'lucky-cat',
        backgroundColor: 'oklch(84.00% 0.040 90.0 / 1)',
        mainColor: 'oklch(65.0% 0.195 40.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.145 85.0 / 1)',
      },
      {
        id: 'sake-glass',
        backgroundColor: 'oklch(88.00% 0.015 90.0 / 1)',
        mainColor: 'oklch(55.0% 0.035 250.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.015 90.0 / 1)',
      },

      {
        id: 'ramune-fizz',
        backgroundColor: 'oklch(85.00% 0.040 210.0 / 1)',
        mainColor: 'oklch(70.0% 0.170 205.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.135 95.0 / 1)',
      },
      {
        id: 'shaved-ice',
        backgroundColor: 'oklch(85.00% 0.045 215.0 / 1)',
        mainColor: 'oklch(60.0% 0.195 25.0 / 1)',
        secondaryColor: 'oklch(65.0% 0.175 215.0 / 1)',
      },
      {
        id: 'soda-float',
        backgroundColor: 'oklch(84.00% 0.050 150.0 / 1)',
        mainColor: 'oklch(62.0% 0.175 155.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.095 95.0 / 1)',
      },
      {
        id: 'hanami-picnic',
        backgroundColor: 'oklch(87.00% 0.035 20.0 / 1)',
        mainColor: 'oklch(70.0% 0.165 350.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.120 135.0 / 1)',
      },
    ],
  },
  {
    name: 'Dark',
    icon: Moon,
    isLight: false,
    themes: [
      {
        id: 'shoji-glow',
        backgroundColor: 'oklch(94.0% 0.010 95.0 / 1)',
        mainColor: 'oklch(45.0% 0.075 65.0 / 1)',
        secondaryColor: 'oklch(60.0% 0.045 30.0 / 1)',
      },
      {
        id: 'seaside-udon',
        backgroundColor: 'oklch(92.0% 0.015 210.0 / 1)',
        mainColor: 'oklch(60.0% 0.130 215.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.155 95.0 / 1)',
      },
      {
        id: 'koi-pond',
        backgroundColor: 'oklch(20.0% 0.048 240.0 / 1)',
        mainColor: 'oklch(80.0% 0.175 55.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.130 220.0 / 1)',
      },
      {
        id: 'seaside-udon',
        backgroundColor: 'oklch(92.0% 0.015 210.0 / 1)',
        mainColor: 'oklch(60.0% 0.130 215.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.155 95.0 / 1)',
      },
      {
        id: 'tsuyu-drizzle',
        backgroundColor: 'oklch(22.0% 0.015 250.0 / 1)',
        mainColor: 'oklch(72.0% 0.105 230.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.025 260.0 / 1)',
      },
      {
        id: 'vending-glow',
        backgroundColor: 'oklch(16.0% 0.025 280.0 / 1)',
        mainColor: 'oklch(85.0% 0.125 220.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.165 45.0 / 1)',
      },
      {
        id: 'winter-kimono',
        backgroundColor: 'oklch(16.0% 0.040 260.0 / 1)',
        mainColor: 'oklch(88.0% 0.020 240.0 / 1)',
        secondaryColor: 'oklch(68.0% 0.110 310.0 / 1)',
      },
      {
        id: 'tsukimi-moon',
        backgroundColor: 'oklch(18.0% 0.028 255.0 / 1)',
        mainColor: 'oklch(92.0% 0.020 95.0 / 1)',
        secondaryColor: 'oklch(65.0% 0.105 270.0 / 1)',
      },
      {
        id: 'jpop-energy',
        backgroundColor: 'oklch(15.0% 0.055 310.0 / 1)',
        mainColor: 'oklch(80.0% 0.210 345.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.175 180.0 / 1)',
      },
      {
        id: 'thunder-god',
        backgroundColor: 'oklch(14.0% 0.058 290.0 / 1)',
        mainColor: 'oklch(88.0% 0.195 95.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.180 275.0 / 1)',
      },
      {
        id: 'holographic-idol',
        backgroundColor: 'oklch(14.0% 0.065 300.0 / 1)',
        mainColor: 'oklch(82.0% 0.185 200.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.210 330.0 / 1)',
      },
      {
        id: 'yakuza-tattoo',
        backgroundColor: 'oklch(17.0% 0.045 255.0 / 1)',
        mainColor: 'oklch(62.0% 0.185 220.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.175 15.0 / 1)',
      },
      {
        id: 'starry-tanabata',
        backgroundColor: 'oklch(15.0% 0.048 275.0 / 1)',
        mainColor: 'oklch(88.0% 0.125 255.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.165 330.0 / 1)',
      },
      {
        id: 'samurai-steel',
        backgroundColor: 'oklch(18.0% 0.022 250.0 / 1)',
        mainColor: 'oklch(80.0% 0.055 240.0 / 1)',

        secondaryColor: 'oklch(65.0% 0.170 15.0 / 1)',
      },
      {
        id: 'frozen-lake',
        backgroundColor: 'oklch(24.0% 0.035 230.0 / 1)',
        mainColor: 'oklch(90.0% 0.075 225.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.055 235.0 / 1)',
      },
      {
        id: 'taiko-thunder',
        backgroundColor: 'oklch(17.0% 0.035 280.0 / 1)',
        mainColor: 'oklch(68.0% 0.175 30.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.125 45.0 / 1)',
      },
      {
        id: 'ghost-parade',
        backgroundColor: 'oklch(15.0% 0.045 310.0 / 1)',
        mainColor: 'oklch(88.0% 0.065 285.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.145 340.0 / 1)',
      },
      {
        id: 'dragon-scale',
        backgroundColor: 'oklch(19.0% 0.055 165.0 / 1)',
        mainColor: 'oklch(68.0% 0.175 160.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.145 140.0 / 1)',
      },

      {
        id: 'ocean-tofu',
        backgroundColor: 'oklch(21.0% 0.042 235.0 / 1)',
        mainColor: 'oklch(92.0% 0.025 240.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.135 225.0 / 1)',
      },
      {
        id: 'okinawa-sea',
        backgroundColor: 'oklch(23.0% 0.055 215.0 / 1)',
        mainColor: 'oklch(82.0% 0.165 195.0 / 1)',
        secondaryColor: 'oklch(90.0% 0.125 180.0 / 1)',
      },

      {
        id: 'sashimi-fresh',
        backgroundColor: 'oklch(17.0% 0.028 280.0 / 1)',
        mainColor: 'oklch(75.0% 0.145 5.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.095 350.0 / 1)',
      },
      {
        id: 'wasabi-punch',
        backgroundColor: 'oklch(20.0% 0.048 160.0 / 1)',
        mainColor: 'oklch(72.0% 0.185 145.0 / 1)',
        secondaryColor: 'oklch(82.0% 0.145 130.0 / 1)',
      },
      {
        id: 'cyber-kitsune',
        backgroundColor: 'oklch(13.0% 0.058 295.0 / 1)',
        mainColor: 'oklch(78.0% 0.195 45.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.220 310.0 / 1)',
      },
      {
        id: 'pixel-retro',
        backgroundColor: 'oklch(14.0% 0.025 280.0 / 1)',
        mainColor: 'oklch(72.0% 0.200 145.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.185 55.0 / 1)',
      },
      {
        id: 'firefly-field',
        backgroundColor: 'oklch(16.0% 0.038 150.0 / 1)',
        mainColor: 'oklch(88.0% 0.175 110.0 / 1)',
        secondaryColor: 'oklch(65.0% 0.125 145.0 / 1)',
      },
      {
        id: 'shinkansen-speed',
        backgroundColor: 'oklch(22.0% 0.035 240.0 / 1)',
        mainColor: 'oklch(90.0% 0.085 220.0 / 1)',
        secondaryColor: 'oklch(65.0% 0.185 25.0 / 1)',
      },
      {
        id: 'akihabara-glow',
        backgroundColor: 'oklch(15.0% 0.065 300.0 / 1)',
        mainColor: 'oklch(80.0% 0.210 180.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.190 320.0 / 1)',
      },

      {
        id: 'wisteria-dream',
        backgroundColor: 'oklch(20.0% 0.048 290.0 / 1)',
        mainColor: 'oklch(72.0% 0.175 295.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.125 320.0 / 1)',
      },
      {
        id: 'volcanic-ash',
        backgroundColor: 'oklch(20.0% 0.018 270.0 / 1)',
        mainColor: 'oklch(70.0% 0.155 25.0 / 1)',
        secondaryColor: 'oklch(55.0% 0.045 260.0 / 1)',
      },
      {
        id: 'plum-blossom',
        backgroundColor: 'oklch(23.0% 0.042 340.0 / 1)',
        mainColor: 'oklch(78.0% 0.165 350.0 / 1)',
        secondaryColor: 'oklch(88.0% 0.095 85.0 / 1)',
      },
      {
        id: 'shibuya-nights',
        backgroundColor: 'oklch(12.0% 0.045 290.0 / 1)',
        mainColor: 'oklch(78.0% 0.225 330.0 / 1)',
        secondaryColor: 'oklch(82.0% 0.180 200.0 / 1)',
      },
      {
        id: 'koi-pond',
        backgroundColor: 'oklch(20.0% 0.048 240.0 / 1)',
        mainColor: 'oklch(80.0% 0.175 55.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.130 220.0 / 1)',
      },
      {
        id: 'bamboo-mist',
        backgroundColor: 'oklch(24.0% 0.032 150.0 / 1)',
        mainColor: 'oklch(78.0% 0.145 145.0 / 1)',
        secondaryColor: 'oklch(68.0% 0.085 130.0 / 1)',
      },
      {
        id: 'neon-sakura',
        backgroundColor: 'oklch(14% 0.04 310 / 1)',
        mainColor: 'oklch(78% 0.23 340 / 1)',
        secondaryColor: 'oklch(68% 0.18 285 / 1)',
      },
      {
        id: 'taikan',
        backgroundColor: 'oklch(21.2% 0.039 255.0 / 1)', // cosmic graphite
        mainColor: 'oklch(93.5% 0.235 122.0 / 1)', // radiant yellow-green
        secondaryColor: 'oklch(79.5% 0.205 28.0 / 1)', // deep coral
      },
      {
        id: 'yumemizu-deepdream',
        backgroundColor: 'oklch(20.5% 0.012 288.7 / 1)',
        mainColor: 'oklch(90.4% 0.216 274.7 / 1)',
        secondaryColor: 'oklch(92.6% 0.173 338.0 / 1)',
      },
      {
        id: 'kuromizu',
        backgroundColor: 'oklch(10.6% 0.034 248.0 / 1)',
        mainColor: 'oklch(74.8% 0.182 305.5 / 1)',
        secondaryColor: 'oklch(82.5% 0.132 187.0 / 1)',
      },
      {
        id: 'monkeytype',
        backgroundColor: 'oklch(33.94% 0.0062 248.01 / 1)',
        mainColor: 'oklch(81.03% 0.1625 94.11 / 1)',
        secondaryColor: 'oklch(86.53% 0.0153 96.38 / 1)',
      },
      {
        id: 'nord',
        backgroundColor: 'oklch(30.81% 0.0237 264.19 / 1)',
        mainColor: 'oklch(77.09% 0.0747 130.82 / 1)',
        secondaryColor: 'oklch(72.67% 0.0638 335.82 / 1)',
      },
      {
        id: 'yukata',
        backgroundColor: 'oklch(20.83% 0.0367 263.24 / 1)',
        mainColor: 'oklch(65.16% 0.1943 14.70 / 1)',
        secondaryColor: 'oklch(68.92% 0.1657 313.51 / 1)',
      },
      {
        id: 'dusk-voyager',
        backgroundColor: 'oklch(21.71% 0.0239 258.33 / 1)',
        mainColor: 'oklch(80.65% 0.0930 227.43 / 1)',
        secondaryColor: 'oklch(87.28% 0.1705 94.99 / 1)',
      },
      {
        id: 'aizome',
        backgroundColor: 'oklch(21.50% 0.0352 256.92 / 1)',
        mainColor: 'oklch(65.35% 0.1437 250.97 / 1)',
        secondaryColor: 'oklch(80.45% 0.0461 76.23 / 1)',
      },
      {
        id: 'fuji',
        backgroundColor: 'oklch(22.26% 0.0193 248.71 / 1)',
        mainColor: 'oklch(81.68% 0.0590 229.99 / 1)',
        secondaryColor: 'oklch(93.89% 0.0000 89.88 / 1)',
      },
      {
        id: 'arashiyama',
        backgroundColor: 'oklch(23.30% 0.0273 161.53 / 1)',
        mainColor: 'oklch(76.25% 0.2262 143.95 / 1)',
        secondaryColor: 'oklch(79.81% 0.1006 126.94 / 1)',
      },
      {
        id: 'moonlit-waterfall',
        backgroundColor: 'oklch(23.46% 0.0439 256.98 / 1)',
        mainColor: 'oklch(77.77% 0.1371 304.09 / 1)',
        secondaryColor: 'oklch(96.20% 0.0564 196.25 / 1)',
      },
      {
        id: 'wasabi-garden',
        backgroundColor: 'oklch(26.82% 0.0502 136.06 / 1)',
        mainColor: 'oklch(83.94% 0.2480 141.92 / 1)',
        secondaryColor: 'oklch(76.54% 0.1356 68.47 / 1)',
      },
      {
        id: 'matrix',
        backgroundColor: 'oklch(0.00% 0.0000 0.00 / 1)',
        mainColor: 'oklch(95.50% 0.2946 142.50 / 1)',
        secondaryColor: 'oklch(71.30% 0.1968 141.94 / 1)',
      },
      {
        id: 'incognito',
        backgroundColor: 'oklch(15.79% 0.0000 89.88 / 1)',
        mainColor: 'oklch(78.54% 0.1978 62.50 / 1)',
        secondaryColor: 'oklch(67.60% 0.1117 74.79 / 1)',
      },
      {
        id: 'noir',
        backgroundColor: 'oklch(0.00% 0.0000 0.00 / 1)',
        mainColor: 'oklch(100.00% 0.0000 89.88 / 1)',
        secondaryColor: 'oklch(80.54% 0.0000 89.88 / 1)',
      },
      {
        id: 'midnight-blossom',
        backgroundColor: 'oklch(22.87% 0.0552 301.41 / 1)',
        mainColor: 'oklch(65.03% 0.2011 353.35 / 1)',
        secondaryColor: 'oklch(67.48% 0.1719 317.18 / 1)',
      },
      {
        id: 'neon-dusk',
        backgroundColor: 'oklch(17.57% 0.0580 286.44 / 1)',
        mainColor: 'oklch(80.54% 0.1459 219.21 / 1)',
        secondaryColor: 'oklch(81.54% 0.1673 84.27 / 1)',
      },
      {
        id: 'mystic-forest',
        backgroundColor: 'oklch(25.62% 0.0314 158.36 / 1)',
        mainColor: 'oklch(69.45% 0.2065 141.03 / 1)',
        secondaryColor: 'oklch(77.00% 0.1352 133.99 / 1)',
      },
      {
        id: 'velvet-night',
        backgroundColor: 'oklch(23.59% 0.0238 263.95 / 1)',
        mainColor: 'oklch(56.39% 0.2560 301.81 / 1)',
        secondaryColor: 'oklch(60.45% 0.2182 7.97 / 1)',
      },
      {
        id: 'cosmic-charcoal',
        backgroundColor: 'oklch(22.41% 0.0104 248.29 / 1)',
        mainColor: 'oklch(70.54% 0.1799 38.53 / 1)',
        secondaryColor: 'oklch(74.54% 0.1778 55.17 / 1)',
      },
      {
        id: 'sapphire-frost',
        backgroundColor: 'oklch(21.22% 0.0365 248.44 / 1)',
        mainColor: 'oklch(81.72% 0.1224 225.37 / 1)',
        secondaryColor: 'oklch(82.37% 0.0918 182.03 / 1)',
      },
      {
        id: 'jade-mirage',
        backgroundColor: 'oklch(26.31% 0.0204 175.21 / 1)',
        mainColor: 'oklch(78.16% 0.1692 156.42 / 1)',
        secondaryColor: 'oklch(78.87% 0.1288 179.07 / 1)',
      },
      {
        id: 'nebula-veil',
        backgroundColor: 'oklch(20.05% 0.0344 289.02 / 1)',
        mainColor: 'oklch(76.15% 0.1814 322.77 / 1)',
        secondaryColor: 'oklch(84.57% 0.1067 216.31 / 1)',
      },
      {
        id: 'citrus-dream',
        backgroundColor: 'oklch(22.81% 0.0444 309.31 / 1)',
        mainColor: 'oklch(90.30% 0.1538 95.00 / 1)',
        secondaryColor: 'oklch(72.77% 0.1706 41.25 / 1)',
      },
      {
        id: 'arctic-inferno',
        backgroundColor: 'oklch(24.29% 0.0410 259.59 / 1)',
        mainColor: 'oklch(69.62% 0.1864 29.03 / 1)',
        secondaryColor: 'oklch(90.62% 0.1382 196.68 / 1)',
      },
      {
        id: 'haunted-lagoon',
        backgroundColor: 'oklch(23.02% 0.0371 221.64 / 1)',
        mainColor: 'oklch(84.05% 0.1487 175.10 / 1)',
        secondaryColor: 'oklch(76.62% 0.1215 143.15 / 1)',
      },
      {
        id: 'celestial-grove',
        backgroundColor: 'oklch(23.71% 0.0245 182.34 / 1)',
        mainColor: 'oklch(82.23% 0.1888 129.99 / 1)',
        secondaryColor: 'oklch(85.46% 0.1464 86.88 / 1)',
      },
      {
        id: 'amethyst-nightfall',
        backgroundColor: 'oklch(21.95% 0.0432 311.57 / 1)',
        mainColor: 'oklch(66.69% 0.2159 319.91 / 1)',
        secondaryColor: 'oklch(68.80% 0.1314 255.70 / 1)',
      },
      {
        id: 'luminous-tide',
        backgroundColor: 'oklch(22.28% 0.0328 247.92 / 1)',
        mainColor: 'oklch(86.48% 0.1570 89.55 / 1)',
        secondaryColor: 'oklch(78.54% 0.1352 212.60 / 1)',
      },
      {
        id: 'andromeda-dream',
        backgroundColor: 'oklch(18.70% 0.0520 299.85 / 1)',
        mainColor: 'oklch(75.15% 0.1685 335.07 / 1)',
        secondaryColor: 'oklch(83.38% 0.1191 221.07 / 1)',
      },
      {
        id: 'luminous-nebula',
        backgroundColor: 'oklch(15.68% 0.0646 275.10 / 1)',
        mainColor: 'oklch(71.79% 0.2345 319.14 / 1)',
        secondaryColor: 'oklch(83.78% 0.1014 229.56 / 1)',
      },
      {
        id: 'seraphic-aurora',
        backgroundColor: 'oklch(22.15% 0.0424 259.54 / 1)',
        mainColor: 'oklch(88.48% 0.1989 157.31 / 1)',
        secondaryColor: 'oklch(71.37% 0.1905 307.67 / 1)',
      },
      {
        id: 'opaline-zodiac',
        backgroundColor: 'oklch(26.41% 0.0350 226.27 / 1)',
        mainColor: 'oklch(91.01% 0.1388 185.50 / 1)',
        secondaryColor: 'oklch(95.51% 0.1496 105.14 / 1)',
      },
      {
        id: 'velvet-abyss',
        backgroundColor: 'oklch(16.24% 0.0498 294.14 / 1)',
        mainColor: 'oklch(64.44% 0.1950 34.93 / 1)',
        secondaryColor: 'oklch(87.65% 0.1319 182.76 / 1)',
      },
      {
        id: 'polaris-veil',
        backgroundColor: 'oklch(21.62% 0.0410 265.53 / 1)',
        mainColor: 'oklch(83.66% 0.1106 224.33 / 1)',
        secondaryColor: 'oklch(97.38% 0.1589 109.02 / 1)',
      },
      {
        id: 'azure-twilight',
        backgroundColor: 'oklch(21.29% 0.0290 262.37 / 1)',
        mainColor: 'oklch(84.26% 0.1387 209.07 / 1)',
        secondaryColor: 'oklch(75.40% 0.1203 299.61 / 1)',
      },
      {
        id: 'ethereal-dawn',
        backgroundColor: 'oklch(20.35% 0.0615 298.46 / 1)',
        mainColor: 'oklch(86.20% 0.1411 83.89 / 1)',
        secondaryColor: 'oklch(86.02% 0.1234 183.17 / 1)',
      },
      {
        id: 'hyperion-skies',
        backgroundColor: 'oklch(22.30% 0.0359 248.20 / 1)',
        mainColor: 'oklch(79.59% 0.1207 231.06 / 1)',
        secondaryColor: 'oklch(88.72% 0.1622 92.81 / 1)',
      },
      {
        id: 'astral-mirage',
        backgroundColor: 'oklch(23.36% 0.0353 215.33 / 1)',
        mainColor: 'oklch(69.91% 0.1962 305.80 / 1)',
        secondaryColor: 'oklch(88.16% 0.1511 93.44 / 1)',
      },
      {
        id: 'oceanic-aurora',
        backgroundColor: 'oklch(24.46% 0.0436 241.01 / 1)',
        mainColor: 'oklch(87.55% 0.1607 168.05 / 1)',
        secondaryColor: 'oklch(75.70% 0.1479 313.81 / 1)',
      },
      {
        id: 'zephyrite-dream',
        backgroundColor: 'oklch(24.42% 0.0251 168.14 / 1)',
        mainColor: 'oklch(81.58% 0.1131 224.68 / 1)',
        secondaryColor: 'oklch(85.83% 0.2104 136.05 / 1)',
      },
      {
        id: 'lapis-cascade',
        backgroundColor: 'oklch(21.47% 0.0366 256.94 / 1)',
        mainColor: 'oklch(70.00% 0.1570 273.18 / 1)',
        secondaryColor: 'oklch(81.56% 0.1374 207.64 / 1)',
      },
      {
        id: 'lucid-dusk',
        backgroundColor: 'oklch(20.83% 0.0537 285.29 / 1)',
        mainColor: 'oklch(70.85% 0.1490 27.94 / 1)',
        secondaryColor: 'oklch(90.41% 0.1302 198.38 / 1)',
      },
      {
        id: 'sapphire-bloom',
        backgroundColor: 'oklch(23.44% 0.0432 267.85 / 1)',
        mainColor: 'oklch(79.09% 0.1242 299.66 / 1)',
        secondaryColor: 'oklch(89.39% 0.1672 171.49 / 1)',
      },
      {
        id: 'celestite-frost',
        backgroundColor: 'oklch(26.22% 0.0304 223.60 / 1)',
        mainColor: 'oklch(90.72% 0.0634 222.26 / 1)',
        secondaryColor: 'oklch(78.12% 0.1599 336.29 / 1)',
      },
      {
        id: 'topaz-drift',
        backgroundColor: 'oklch(24.96% 0.0256 184.90 / 1)',
        mainColor: 'oklch(89.58% 0.1336 91.10 / 1)',
        secondaryColor: 'oklch(72.65% 0.1523 43.04 / 1)',
      },
      {
        id: 'nebulous-maw',
        backgroundColor: 'oklch(15.98% 0.0489 288.97 / 1)',
        mainColor: 'oklch(89.75% 0.1441 92.30 / 1)',
        secondaryColor: 'oklch(79.15% 0.1581 341.83 / 1)',
      },
      {
        id: 'ultraviolet-oracle',
        backgroundColor: 'oklch(16.82% 0.0727 297.93 / 1)',
        mainColor: 'oklch(74.03% 0.1392 250.23 / 1)',
        secondaryColor: 'oklch(70.60% 0.1901 307.64 / 1)',
      },
      {
        id: 'nautilus-star',
        backgroundColor: 'oklch(19.37% 0.0229 240.54 / 1)',
        mainColor: 'oklch(72.83% 0.1420 246.20 / 1)',
        secondaryColor: 'oklch(82.85% 0.1123 65.21 / 1)',
      },
      {
        id: 'cyanic-wisdom',
        backgroundColor: 'oklch(21.86% 0.0305 226.59 / 1)',
        mainColor: 'oklch(86.20% 0.1078 216.26 / 1)',
        secondaryColor: 'oklch(75.50% 0.1398 350.60 / 1)',
      },
      {
        id: 'twilight-oracle',
        backgroundColor: 'oklch(20.48% 0.0501 293.80 / 1)',
        mainColor: 'oklch(69.17% 0.1819 27.93 / 1)',
        secondaryColor: 'oklch(75.61% 0.0937 245.86 / 1)',
      },
      {
        id: 'galaxy-oracle',
        backgroundColor: 'oklch(16.40% 0.0417 259.26 / 1)',
        mainColor: 'oklch(79.95% 0.1588 324.56 / 1)',
        secondaryColor: 'oklch(71.36% 0.1484 265.31 / 1)',
      },
      {
        id: 'fathom-frost',
        backgroundColor: 'oklch(22.55% 0.0320 232.35 / 1)',
        mainColor: 'oklch(83.21% 0.2489 143.51 / 1)',
        secondaryColor: 'oklch(79.37% 0.1483 339.93 / 1)',
      },
      {
        id: 'lapis-solara',
        backgroundColor: 'oklch(19% 0.0468 268.47 / 1)',
        mainColor: 'oklch(96.43% 0.1338 105.98 / 1)',
        secondaryColor: 'oklch(77.85% 0.1273 297.95 / 1)',
      },
      {
        id: 'arcane-fathoms',
        backgroundColor: 'oklch(21.67% 0.0429 245.91 / 1)',
        mainColor: 'oklch(85.76% 0.1843 135.05 / 1)',
        secondaryColor: 'oklch(79.04% 0.1466 314.59 / 1)',
      },
      {
        id: 'melancholy-halo',
        backgroundColor: 'oklch(19.30% 0.0200 266.53 / 1)',
        mainColor: 'oklch(68.33% 0.1789 294.23 / 1)',
        secondaryColor: 'oklch(88.93% 0.1602 165.64 / 1)',
      },
      {
        id: 'cobalt-lumen',
        backgroundColor: 'oklch(19.79% 0.0422 241.46 / 1)',
        mainColor: 'oklch(82.82% 0.1215 219.38 / 1)',
        secondaryColor: 'oklch(71.03% 0.2822 327.32 / 1)',
      },
      {
        id: 'prairie-star',
        backgroundColor: 'oklch(20.92% 0.0367 263.32 / 1)',
        mainColor: 'oklch(62.77% 0.1885 260.52 / 1)',
        secondaryColor: 'oklch(66.30% 0.2056 24.71 / 1)',
      },
      {
        id: 'midnight-fjord',
        backgroundColor: 'oklch(22.37% 0.0385 258.28 / 1)',
        mainColor: 'oklch(89.81% 0.1593 94.71 / 1)',
        secondaryColor: 'oklch(80.50% 0.1237 229.36 / 1)',
      },
      {
        id: 'liquid-graphite',
        backgroundColor: 'oklch(19.94% 0.0081 267.13 / 1)',
        mainColor: 'oklch(76.61% 0.1036 222.57 / 1)',
        secondaryColor: 'oklch(76.33% 0.1672 57.87 / 1)',
      },
      {
        id: 'rainforest-mist',
        backgroundColor: 'oklch(24.08% 0.0271 155.33 / 1)',
        mainColor: 'oklch(76.05% 0.0706 200.04 / 1)',
        secondaryColor: 'oklch(83.86% 0.1351 87.45 / 1)',
      },
      {
        id: 'jungle-twilight',
        backgroundColor: 'oklch(23.37% 0.0231 175.48 / 1)',
        mainColor: 'oklch(78.06% 0.1476 57.34 / 1)',
        secondaryColor: 'oklch(64.23% 0.1482 284.44 / 1)',
      },
      {
        id: 'neon-tokyo',
        backgroundColor: 'oklch(22.71% 0.0340 319.46 / 1)',
        mainColor: 'oklch(70.51% 0.2067 349.65 / 1)',
        secondaryColor: 'oklch(76.88% 0.1491 229.14 / 1)',
      },
      {
        id: 'nyc-midnight',
        backgroundColor: 'oklch(21.05% 0.0241 272.25 / 1)',
        mainColor: 'oklch(88.35% 0.1514 90.24 / 1)',
        secondaryColor: 'oklch(80.43% 0.1296 218.65 / 1)',
      },
      {
        id: 'paris-metro',
        backgroundColor: 'oklch(24.24% 0.0137 258.37 / 1)',
        mainColor: 'oklch(66.40% 0.1844 1.84 / 1)',
        secondaryColor: 'oklch(94.43% 0.1789 109.39 / 1)',
      },
      {
        id: 'london-fog',
        backgroundColor: 'oklch(26.98% 0.0079 234.94 / 1)',
        mainColor: 'oklch(80.86% 0.0632 119.23 / 1)',
        secondaryColor: 'oklch(79.21% 0.0976 244.15 / 1)',
      },
      {
        id: 'synthwave-night',
        backgroundColor: 'oklch(22.85% 0.0341 302.93 / 1)',
        mainColor: 'oklch(71.26% 0.2322 338.26 / 1)',
        secondaryColor: 'oklch(89.39% 0.1507 182.75 / 1)',
      },
      {
        id: 'old-library',
        backgroundColor: 'oklch(24.40% 0.0136 74.48 / 1)',
        mainColor: 'oklch(86.40% 0.1653 93.75 / 1)',
        secondaryColor: 'oklch(71.19% 0.0756 66.11 / 1)',
      },
      {
        id: 'vaporpop',
        backgroundColor: 'oklch(27.52% 0.0194 190.93 / 1)',
        mainColor: 'oklch(81.91% 0.1399 338.07 / 1)',
        secondaryColor: 'oklch(96.69% 0.1969 110.57 / 1)',
      },
      {
        id: 'absolute-darkness',
        backgroundColor: 'oklch(13.77% 0.0125 304.02 / 1)',
        mainColor: 'oklch(65.85% 0.1592 53.69 / 1)',
        secondaryColor: 'oklch(59.04% 0.2430 304.10 / 1)',
      },
      {
        id: 'catppuccin',
        backgroundColor: 'oklch(24.38% 0.0305 283.91 / 1)',
        mainColor: 'oklch(82.07% 0.0990 299.48 / 1)',
        secondaryColor: 'oklch(87.84% 0.0426 272.09 / 1)',
      },
      {
        id: 'cosmic-dream',
        backgroundColor: 'oklch(18.85% 0.0666 294.49 / 1)',
        mainColor: 'oklch(71.93% 0.2621 323.58 / 1)',
        secondaryColor: 'oklch(92.30% 0.0609 214.79 / 1)',
      },
      {
        id: 'dreamwave-mirage',
        backgroundColor: 'oklch(19.69% 0.0908 288.04 / 1)',
        mainColor: 'oklch(66.39% 0.2381 359.36 / 1)',
        secondaryColor: 'oklch(83.18% 0.1354 212.90 / 1)',
      },
      {
        id: 'coral-abyss',
        backgroundColor: 'oklch(21.08% 0.0399 250.21 / 1)',
        mainColor: 'oklch(71.96% 0.1494 39.01 / 1)',
        secondaryColor: 'oklch(88.63% 0.1367 194.97 / 1)',
      },
      {
        id: 'electric-phantasm',
        backgroundColor: 'oklch(16.84% 0.0840 312.74 / 1)',
        mainColor: 'oklch(78.00% 0.1466 226.62 / 1)',
        secondaryColor: 'oklch(88.69% 0.2657 137.42 / 1)',
      },
      {
        id: 'kagehana',
        backgroundColor: 'oklch(17.5% 0.045 285.0 / 1)',
        mainColor: 'oklch(80.5% 0.210 328.0 / 1)',
        secondaryColor: 'oklch(82.0% 0.130 210.0 / 1)',
      },
      {
        id: 'tsukikage',
        backgroundColor: 'oklch(18.5% 0.030 250.0 / 1)',
        mainColor: 'oklch(88.0% 0.120 210.0 / 1)',
        secondaryColor: 'oklch(76.0% 0.090 165.0 / 1)',
      },
      {
        id: 'wabisabi',
        backgroundColor: 'oklch(19.00% 0.0220 260.00 / 1)',
        mainColor: 'oklch(76.00% 0.1100 40.00 / 1)',
        secondaryColor: 'oklch(65.00% 0.0400 148.00 / 1)',
      },
      {
        id: 'ruri',
        backgroundColor: 'oklch(13.0% 0.034 255.0 / 1)',
        mainColor: 'oklch(93.0% 0.047 256.0 / 1)',
        secondaryColor: 'oklch(81.0% 0.164 305.0 / 1)',
      },
      {
        id: 'kurokumo',
        backgroundColor: 'oklch(17.0% 0.032 270.0 / 1)',
        mainColor: 'oklch(87.0% 0.135 215.0 / 1)',
        secondaryColor: 'oklch(74.0% 0.110 305.0 / 1)',
      },
      {
        id: 'yume-mori',
        backgroundColor: 'oklch(20.0% 0.040 190.0 / 1)',
        mainColor: 'oklch(86.0% 0.140 180.0 / 1)',
        secondaryColor: 'oklch(74.0% 0.090 150.0 / 1)',
      },
      {
        id: 'kyoto-lanterns',
        backgroundColor: 'oklch(22.10% 0.0310 265.00 / 1)',
        mainColor: 'oklch(78.90% 0.1820 50.00 / 1)',
        secondaryColor: 'oklch(84.20% 0.1200 90.00 / 1)',
      },
      {
        id: 'suisen',
        backgroundColor: 'oklch(17.0% 0.031 260.0 / 1)',
        mainColor: 'oklch(89.0% 0.053 260.0 / 1)',
        secondaryColor: 'oklch(74.0% 0.170 295.0 / 1)',
      },
      {
        id: 'en',
        backgroundColor: 'oklch(14.5% 0.036 267.0 / 1)',
        mainColor: 'oklch(91.0% 0.042 253.0 / 1)',
        secondaryColor: 'oklch(81.0% 0.170 355.0 / 1)',
      },
      {
        id: 'amatsubu',
        backgroundColor: 'oklch(12.5% 0.032 268.0 / 1)',
        mainColor: 'oklch(91.0% 0.055 263.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.175 200.0 / 1)',
      },
      {
        id: 'kiranami',
        backgroundColor: 'oklch(14.5% 0.046 278.0 / 1)',
        mainColor: 'oklch(94.0% 0.072 92.0 / 1)',
        secondaryColor: 'oklch(81.0% 0.180 328.0 / 1)',
      },
      {
        id: 'tsurara',
        backgroundColor: 'oklch(13.0% 0.041 290.0 / 1)',
        mainColor: 'oklch(88.0% 0.222 192.0 / 1)',
        secondaryColor: 'oklch(90.5% 0.207 28.0 / 1)',
      },
      {
        id: 'hiyozora',
        backgroundColor: 'oklch(11.0% 0.052 270.0 / 1)',
        mainColor: 'oklch(82.0% 0.255 12.0 / 1)',
        secondaryColor: 'oklch(92.0% 0.223 311.0 / 1)',
      },
      {
        id: 'sangosabi',
        backgroundColor: 'oklch(21.0% 0.032 260.0 / 1)',
        mainColor: 'oklch(88.7% 0.216 145.0 / 1)',
        secondaryColor: 'oklch(90.0% 0.230 39.0 / 1)',
      },
      {
        id: 'kureshio',
        backgroundColor: 'oklch(23.0% 0.046 298.2 / 1)',
        mainColor: 'oklch(91.0% 0.210 225.5 / 1)',
        secondaryColor: 'oklch(90.0% 0.219 60.0 / 1)',
      },
      {
        id: 'nirinsou',
        backgroundColor: 'oklch(23.5% 0.039 285.0 / 1)', // starlit indigo-violet
        mainColor: 'oklch(91.0% 0.235 143.0 / 1)', // wildflower lime (yellow-green)
        secondaryColor: 'oklch(93.0% 0.198 60.0 / 1)', // dusk apricot (pastel orange)
      },
      {
        id: 'aosora',
        backgroundColor: 'oklch(21.5% 0.041 230.0 / 1)', // airy night slate
        mainColor: 'oklch(94.0% 0.240 194.0 / 1)', // celestial turquoise
        secondaryColor: 'oklch(92.5% 0.153 284.0 / 1)', // dreamlike pale periwinkle
      },
      {
        id: 'hoshishio',
        backgroundColor: 'oklch(22.0% 0.038 300.0 / 1)', // cosmic twilight
        mainColor: 'oklch(93.0% 0.220 163.0 / 1)', // stardust seafoam (minty green)
        secondaryColor: 'oklch(91.0% 0.183 308.0 / 1)', // bright lavender
      },
      {
        id: 'yumemizu-starlight',
        backgroundColor: 'oklch(20.5% 0.042 220.0 / 1)', // deep dreamwater blue
        mainColor: 'oklch(92.0% 0.246 170.0 / 1)', // nebula teal-mint
        secondaryColor: 'oklch(90.0% 0.176 338.0 / 1)', // magical pale magenta
      },
      {
        id: 'hisui',
        backgroundColor: 'oklch(10.8% 0.018 258.0 / 1)', // meteor graphite
        mainColor: 'oklch(86.0% 0.193 150.0 / 1)', // cosmic jade green
        secondaryColor: 'oklch(88.5% 0.218 55.0 / 1)', // nova tangerine
      },
      {
        id: 'ichigoha',
        backgroundColor: 'oklch(22.3% 0.048 142.7 / 1)', // mossy green night
        mainColor: 'oklch(94.0% 0.266 125.5 / 1)', // radiant lime-leaf
        secondaryColor: 'oklch(91.5% 0.184 10.0 / 1)', // blush pink strawberry skin
      },
      {
        id: 'kumonasu',
        backgroundColor: 'oklch(19.0% 0.043 302.0 / 1)', // rich eggplant moon
        mainColor: 'oklch(93.0% 0.165 265.0 / 1)', // cloud-purple
        secondaryColor: 'oklch(92.0% 0.140 200.0 / 1)', // ethereal soft cyan
      },
      {
        id: 'shirafuji',
        backgroundColor: 'oklch(18.5% 0.042 306.0 / 1)', // pale wisteria night
        mainColor: 'oklch(96.0% 0.125 290.0 / 1)', // soft lavender white
        secondaryColor: 'oklch(98.0% 0.118 111.0 / 1)', // gentle cream
      },
      {
        id: 'ginkou',
        backgroundColor: 'oklch(19.0% 0.039 277.0 / 1)', // atmospheric charcoal
        mainColor: 'oklch(96.5% 0.215 145.0 / 1)', // electric mint
        secondaryColor: 'oklch(74.0% 0.205 40.0 / 1)', // ember orange
      },
      {
        id: 'seiyoubo',
        backgroundColor: 'oklch(18.0% 0.041 172.0 / 1)', // deep green-grey
        mainColor: 'oklch(95.5% 0.184 129.0 / 1)', // light celery
        secondaryColor: 'oklch(90.0% 0.178 276.0 / 1)', // blue-ribbon lavender
      },
      {
        id: 'usumidori',
        backgroundColor: 'oklch(16.0% 0.045 145.0 / 1)', // midnight pine
        mainColor: 'oklch(96.0% 0.225 140.0 / 1)', // luminous mint
        secondaryColor: 'oklch(92.0% 0.132 116.0 / 1)', // pale pastel chartreuse
      },
      {
        id: 'morion',
        backgroundColor: 'oklch(20.0% 0.054 255.0 / 1)',
        mainColor: 'oklch(92.5% 0.190 130.0 / 1)',
        secondaryColor: 'oklch(84.0% 0.140 85.0 / 1)',
      },
      {
        id: 'oboro',
        backgroundColor: 'oklch(23.8% 0.041 270.0 / 1)', // velvet graphite
        mainColor: 'oklch(91.5% 0.212 120.0 / 1)', // pear green
        secondaryColor: 'oklch(80.0% 0.158 340.0 / 1)', // smoky plum
      },
      {
        id: 'hoshikuzu',
        backgroundColor: 'oklch(17.7% 0.044 280.0 / 1)',
        mainColor: 'oklch(97.0% 0.210 90.0 / 1)',
        secondaryColor: 'oklch(92.0% 0.224 200.0 / 1)',
      },
      {
        id: 'shinsei',
        backgroundColor: 'oklch(18.0% 0.046 247.0 / 1)',
        mainColor: 'oklch(92.0% 0.252 210.0 / 1)',
        secondaryColor: 'oklch(93.0% 0.146 338.0 / 1)',
      },
      {
        id: 'ameagari',
        backgroundColor: 'oklch(18.7% 0.030 240.0 / 1)', // slate mist
        mainColor: 'oklch(93.0% 0.170 190.0 / 1)', // dew-spun teal
        secondaryColor: 'oklch(81.0% 0.144 260.0 / 1)', // hydrangea blue
      },
      {
        id: 'suzu',
        backgroundColor: 'oklch(14.2% 0.025 240.0 / 1)', // midnight frosted slate
        mainColor: 'oklch(98.0% 0.175 285.0 / 1)', // radiant snow silver
        secondaryColor: 'oklch(86.0% 0.120 210.0 / 1)', // icy mist blue
      },
      {
        id: 'kumo-no-asa',
        backgroundColor: 'oklch(19.2% 0.026 230.0 / 1)', // mist blue-gray
        mainColor: 'oklch(95.0% 0.125 260.0 / 1)', // soft cloud gray
        secondaryColor: 'oklch(82.0% 0.129 300.0 / 1)', // early sky lavender
      },
      {
        id: 'miharashi',
        backgroundColor: 'oklch(17.0% 0.032 215.0 / 1)', // mountain shadow
        mainColor: 'oklch(89.0% 0.135 145.0 / 1)', // horizon sage green
        secondaryColor: 'oklch(81.0% 0.125 220.0 / 1)', // distant sky blue
      },
      {
        id: 'akebono',
        backgroundColor: 'oklch(18.0% 0.030 280.0 / 1)', // shadowed indigo
        mainColor: 'oklch(94.0% 0.160 25.0 / 1)', // pale sunrise pink
        secondaryColor: 'oklch(88.0% 0.140 305.0 / 1)', // spring mist violet
      },
      {
        id: 'shion',
        backgroundColor: 'oklch(18.5% 0.030 270.0 / 1)', // matte onyx
        mainColor: 'oklch(75.0% 0.146 300.0 / 1)', // refined violet
        secondaryColor: 'oklch(58.8% 0.120 145.0 / 1)', // woodland shadow
      },
      {
        id: 'thunder-temple',
        backgroundColor: 'oklch(16.0% 0.065 280.0 / 1)',
        mainColor: 'oklch(85.0% 0.185 260.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.145 290.0 / 1)',
      },
      {
        id: 'tokyo-metro',
        backgroundColor: 'oklch(20.0% 0.025 260.0 / 1)',
        mainColor: 'oklch(70.0% 0.180 145.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.120 50.0 / 1)',
      },
      {
        id: 'indigo-shibori',
        backgroundColor: 'oklch(19.0% 0.055 255.0 / 1)',
        mainColor: 'oklch(55.0% 0.165 250.0 / 1)',
        secondaryColor: 'oklch(85.0% 0.065 90.0 / 1)',
      },

      {
        id: 'tea-ceremony',
        backgroundColor: 'oklch(25.0% 0.028 145.0 / 1)',
        mainColor: 'oklch(62.0% 0.115 135.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.075 90.0 / 1)',
      },
      {
        id: 'bento-box',
        backgroundColor: 'oklch(22.0% 0.025 45.0 / 1)',
        mainColor: 'oklch(70.0% 0.175 20.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.165 145.0 / 1)',
      },
      {
        id: 'hanabi-festival',
        backgroundColor: 'oklch(14.0% 0.055 275.0 / 1)',
        mainColor: 'oklch(85.0% 0.200 35.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.215 310.0 / 1)',
      },
      {
        id: 'robot-anime',
        backgroundColor: 'oklch(16.0% 0.055 270.0 / 1)',
        mainColor: 'oklch(72.0% 0.195 220.0 / 1)',
        secondaryColor: 'oklch(68.0% 0.205 30.0 / 1)',
      },
      {
        id: 'onsen-steam',
        backgroundColor: 'oklch(25.0% 0.022 210.0 / 1)',
        mainColor: 'oklch(85.0% 0.085 215.0 / 1)',
        secondaryColor: 'oklch(70.0% 0.065 195.0 / 1)',
      },
      {
        id: 'lavender-fields',
        backgroundColor: 'oklch(19.0% 0.058 290.0 / 1)',
        mainColor: 'oklch(70.0% 0.165 295.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.125 285.0 / 1)',
      },
      {
        id: 'bamboo-forest',
        backgroundColor: 'oklch(21.0% 0.045 155.0 / 1)',
        mainColor: 'oklch(70.0% 0.145 150.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.095 140.0 / 1)',
      },
      {
        id: 'umbrella-rain',
        backgroundColor: 'oklch(22.0% 0.018 250.0 / 1)',
        mainColor: 'oklch(70.0% 0.175 225.0 / 1)',
        secondaryColor: 'oklch(75.0% 0.145 350.0 / 1)',
      },
      {
        id: 'vaporwave-shrine',
        backgroundColor: 'oklch(17.0% 0.072 305.0 / 1)',
        mainColor: 'oklch(75.0% 0.175 195.0 / 1)',
        secondaryColor: 'oklch(80.0% 0.195 330.0 / 1)',
      },
      {
        id: 'wind-god',
        backgroundColor: 'oklch(19.0% 0.045 175.0 / 1)',
        mainColor: 'oklch(82.0% 0.155 180.0 / 1)',
        secondaryColor: 'oklch(72.0% 0.135 165.0 / 1)',
      },
      {
        id: 'biwako-blue',
        backgroundColor: 'oklch(22.0% 0.042 230.0 / 1)',
        mainColor: 'oklch(75.0% 0.135 225.0 / 1)',
        secondaryColor: 'oklch(82.0% 0.100 215.0 / 1)',
      },
      {
        id: 'sumi-charcoal',
        backgroundColor: 'oklch(18.0% 0.010 270.0 / 1)',
        mainColor: 'oklch(78.0% 0.010 90.0 / 1)',
        secondaryColor: 'oklch(45.0% 0.020 260.0 / 1)',
      },
      {
        id: 'maple-lacquer',
        backgroundColor: 'oklch(17.0% 0.035 20.0 / 1)',
        mainColor: 'oklch(65.0% 0.215 30.0 / 1)',
        secondaryColor: 'oklch(78.0% 0.135 70.0 / 1)',
      },
      {
        id: 'quiet-library',
        backgroundColor: 'oklch(92.0% 0.012 90.0 / 1)',
        mainColor: 'oklch(35.0% 0.085 255.0 / 1)',
        secondaryColor: 'oklch(55.0% 0.055 65.0 / 1)',
      },
    ],
  },
  {
    name: 'Halloween',
    icon: CloudLightning,
    isLight: false,
    themes: [
      {
        id: 'pumpkin-night',
        backgroundColor: 'oklch(18.52% 0.0184 314.34 / 1)',
        mainColor: 'oklch(74.61% 0.1715 51.56 / 1)',
        secondaryColor: 'oklch(63.26% 0.2293 339.96 / 1)',
      },
      {
        id: 'spooky-glow',
        backgroundColor: 'oklch(15.70% 0.0034 248.05 / 1)',
        mainColor: 'oklch(88.07% 0.1974 131.90 / 1)',
        secondaryColor: 'oklch(67.13% 0.2017 304.62 / 1)',
      },
    ],
  },
  {
    name: 'Christmas',
    icon: TreePine,
    isLight: false,
    themes: [
      {
        id: 'santa-night',
        backgroundColor: 'oklch(21.77% 0.0430 263.13 / 1)',
        mainColor: 'oklch(61.42% 0.2261 23.63 / 1)',
        secondaryColor: 'oklch(85.33% 0.1706 86.75 / 1)',
      },
      {
        id: 'winter-wonderland',
        backgroundColor: 'oklch(94.76% 0.0133 185.08 / 1)',
        mainColor: 'oklch(58.04% 0.2202 24.52 / 1)',
        secondaryColor: 'oklch(70.13% 0.1252 171.56 / 1)',
      },
      {
        id: 'christmas-eve',
        backgroundColor: 'oklch(23.26% 0.0557 272.84 / 1)',
        mainColor: 'oklch(85.68% 0.1599 89.08 / 1)',
        secondaryColor: 'oklch(61.95% 0.1489 150.29 / 1)',
      },
      {
        id: 'northern-lights',
        backgroundColor: 'oklch(21.92% 0.0178 230.20 / 1)',
        mainColor: 'oklch(86.12% 0.1660 169.64 / 1)',
        secondaryColor: 'oklch(65.57% 0.2272 312.53 / 1)',
      },
      {
        id: 'mariah',
        backgroundColor: 'oklch(18.5% 0.015 15.0 / 1)',
        mainColor: 'oklch(92.0% 0.045 95.0 / 1)',
        secondaryColor: 'oklch(64.0% 0.210 28.0 / 1)',
      },
      {
        id: 'neon-arcade',
        backgroundColor: 'oklch(13.0% 0.055 300.0 / 1)',
        mainColor: 'oklch(78.0% 0.220 330.0 / 1)',
        secondaryColor: 'oklch(82.0% 0.185 190.0 / 1)',
      },
    ],
  },
  {
    name: 'Extra',
    icon: Sparkles,
    isLight: false,
    themes: [
      {
        // "kyoki" (狂気) means "madness/craziness" in Japanese
        // Selecting this theme enables random theme cycling on each question
        // Display name is "?" to signify mystery/chaos
        // NOTE: The theme button has a crazy gradient background applied in Themes.tsx
        id: '?',
        backgroundColor: 'oklch(15.0% 0.045 280.0 / 1)', // dark base
        mainColor: 'oklch(95.0% 0.180 320.0 / 1)', // bright magenta-pink
        secondaryColor: 'oklch(90.0% 0.200 180.0 / 1)', // vivid cyan
      },
    ],
  },
];

// Build the complete theme sets with generated card and border colors
const themeSets: ThemeGroup[] = baseThemeSets.map(buildThemeGroup);

export default themeSets;

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

function ensureCustomThemesLoaded(): void {
  if (_customThemesLoaded) return;
  _customThemesLoaded = true;

  const themeMap = getThemeMap();
  useCustomThemeStore
    .getState()
    .themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );

  // Subscribe to store updates
  useCustomThemeStore.subscribe(state => {
    state.themes.forEach(theme =>
      themeMap.set(theme.id, buildThemeFromTemplate(theme)),
    );
  });
}

export function applyTheme(themeId: string) {
  ensureCustomThemesLoaded();
  const theme = getThemeMap().get(themeId);

  if (!theme) {
    console.error(`Theme "${themeId}" not found`);
    return;
  }

  const root = document.documentElement;

  root.style.setProperty('--background-color', theme.backgroundColor);
  root.style.setProperty('--card-color', theme.cardColor);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--main-color', theme.mainColor);
  root.style.setProperty('--main-color-accent', theme.mainColorAccent);

  if (theme.secondaryColor) {
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      theme.secondaryColorAccent,
    );
  }

  root.setAttribute('data-theme', theme.id);
}

// Apply a theme object directly (live preview theme)
export function applyThemeObject(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--background-color', theme.backgroundColor);
  root.style.setProperty('--card-color', theme.cardColor);
  root.style.setProperty('--border-color', theme.borderColor);
  root.style.setProperty('--main-color', theme.mainColor);
  root.style.setProperty('--main-color-accent', theme.mainColorAccent);
  if (theme.secondaryColor) {
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty(
      '--secondary-color-accent',
      theme.secondaryColorAccent,
    );
  }
}

// Helper to get a specific theme
export function getTheme(themeId: string): Theme | undefined {
  ensureCustomThemesLoaded();
  return getThemeMap().get(themeId);
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
