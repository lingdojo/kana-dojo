'use client';
import { useEffect, useState } from 'react';
import themeSets from '@/features/Preferences/data/themes';
import clsx from 'clsx';

type RawKanjiEntry = {
  kanjiChar: string;
};

type DecorationFont = {
  name: string;
  font: {
    className: string;
  };
};

const kanjiSources = ['N5', 'N4', 'N3'] as const;

const shuffle = <T,>(arr: T[]) => arr.slice().sort(() => Math.random() - 0.5);

// Tailwind animations
const animations = [
  'motion-safe:animate-pulse'
  // 'animate-bounce',
  //   'animate-ping',
  //   'animate-spin',
];

// Get all available main colors from themes
const getAllMainColors = () => {
  const colors = new Set<string>();
  /* themeSets.forEach(themeGroup => {
    themeGroup.themes.forEach(theme => {
      colors.add(theme.mainColor);
      if (theme.secondaryColor) colors.add(theme.secondaryColor);
    });
  }); */
  themeSets[2].themes.forEach(theme => {
    colors.add(theme.mainColor);
    if (theme.secondaryColor) colors.add(theme.secondaryColor);
  });
  return Array.from(colors);
};

const allMainColors = getAllMainColors();

// Lazy-load fonts cache
let fontsCache: DecorationFont[] | null = null;
let fontsLoadingPromise: Promise<DecorationFont[]> | null = null;

const loadDecorationFonts = async (): Promise<DecorationFont[]> => {
  // Only load decoration fonts in production
  if (process.env.NODE_ENV !== 'production') {
    return [];
  }

  if (fontsCache) return fontsCache;
  if (fontsLoadingPromise) return fontsLoadingPromise;

  fontsLoadingPromise = import('./decorationFonts').then(module => {
    fontsCache = module.decorationFonts;
    fontsLoadingPromise = null;
    return module.decorationFonts;
  });

  return fontsLoadingPromise;
};

// Component to render a single kanji character with random styles
const KanjiCharacter = ({ char }: { char: string }) => {
  const [mounted, setMounted] = useState(false);
  const [styles, setStyles] = useState({
    color: '',
    fontClass: '',
    animation: ''
  });

  useEffect(() => {
    let isMounted = true;

    const initializeStyles = async () => {
      // Lazy load fonts
      const fonts = await loadDecorationFonts();

      if (!isMounted) return;

      // Generate random styles on mount
      const randomColor =
        allMainColors[Math.floor(Math.random() * allMainColors.length)];
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      const randomAnimation =
        animations[Math.floor(Math.random() * animations.length)];

      setStyles({
        color: randomColor,
        fontClass: randomFont.font.className,
        animation: randomAnimation
      });
      setMounted(true);
    };

    void initializeStyles();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!mounted) return null;

  return (
    <span
      className={`text-4xl transition-all duration-1000 ${styles.fontClass} ${styles.animation}`}
      aria-hidden='true'
      style={{
        color: styles.color,
        animationDelay: `${Math.random() * 1000}ms`
      }}
    >
      {char}
    </span>
  );
};

const Decorations = ({ expandDecorations }: { expandDecorations: boolean }) => {
  const [kanjiList, setKanjiList] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadKanji = async () => {
      const results = await Promise.all(
        kanjiSources.map(async level => {
          const response = await fetch(`/kanji/${level}.json`);
          const data = (await response.json()) as RawKanjiEntry[];
          return data.map(entry => entry.kanjiChar);
        })
      );

      if (!isMounted) return;
      setKanjiList(shuffle(results.flat()));
    };

    void loadKanji();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={clsx(
        'fixed inset-0 overflow-hidden pointer-events-none ',
        expandDecorations ? 'opacity-100' : 'opacity-30'
      )}
    >
      <div className='grid grid-cols-28 gap-0.5 p-2 h-full w-full'>
        {kanjiList.map((char, index) => (
          <KanjiCharacter char={char} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Decorations;
