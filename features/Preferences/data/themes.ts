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

/* ... all your parseOklch, formatOklch, generateCardColor, generateBorderColor, generateAccentColor, buildTheme, buildThemeGroup functions remain unchanged ... */

/* Base theme definitions - only id, backgroundColor, mainColor, secondaryColor */
const baseThemeSets: BaseThemeGroup[] = [
  /* ... your existing Base, Light, Dark theme groups ... */
  {
    name: 'Dark',
    icon: Moon,
    isLight: false,
    themes: [
      /* ... all your existing Dark themes ... */
      {
        id: 'ginger-koi',
        backgroundColor: 'oklch(95.0% 0.012 85.0 / 1)',
        mainColor: 'oklch(60.0% 0.170 40.0 / 1)',
        secondaryColor: 'oklch(72.0% 0.095 120.0 / 1)',
      },
    ],
  },
];

export default baseThemeSets;
