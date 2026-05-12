'use client';
import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { themeSets } from '@/features/Preferences';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

// Animation keyframes for interactive mode only
const animationKeyframes = `
@keyframes explode {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2.4);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;

type DecorationFont = {
  name: string;
  font: {
    className: string;
  };
};

type CharacterStyle = {
  char: string;
  color: string;
  fontClass: string;
};

type AnimState = 'idle' | 'exploding' | 'hidden' | 'fading-in';
type BreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl';
type LayoutConfig = {
  cols: number;
  cellSize: number;
  gap: number;
  bufferRows: number;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

// Grid configuration per breakpoint.
// xl+ intentionally stays unchanged from the previous desktop behavior.
const GRID_CONFIGS: Record<BreakpointKey, LayoutConfig> = {
  base: { cols: 9, cellSize: 18, gap: 2, bufferRows: 1 },
  sm: { cols: 12, cellSize: 20, gap: 2, bufferRows: 1 },
  md: { cols: 16, cellSize: 24, gap: 2, bufferRows: 2 },
  lg: { cols: 22, cellSize: 30, gap: 2, bufferRows: 2 },
  xl: { cols: 28, cellSize: 36, gap: 2, bufferRows: 2 },
};

const GRID_COL_CLASSES =
  'grid-cols-9 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-22 xl:grid-cols-28';
const CHAR_SIZE_CLASSES =
  'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl';
const DIMMED_OPACITY_CLASS = 'opacity-25';
const ENABLE_MODE_SETUP_DECORATIONS = false;
const ENABLE_STREAK_MILESTONE_DECORATIONS = true;

const getBreakpointKey = (width: number): BreakpointKey => {
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'base';
};

const getLayoutConfig = (width: number): LayoutConfig =>
  GRID_CONFIGS[getBreakpointKey(width)];

// Calculate how many characters to render based on viewport
const calculateVisibleCount = (): number => {
  if (typeof window === 'undefined') {
    // SSR fallback - render enough for large screens (28 cols × 28 rows)
    return 784;
  }

  const config = getLayoutConfig(window.innerWidth);

  const { cols, cellSize, gap } = config;
  const viewHeight = window.innerHeight;

  // Calculate rows that fit in viewport
  const effectiveHeight = viewHeight - 16; // padding
  const rowHeight = cellSize + gap;
  const visibleRows = Math.ceil(effectiveHeight / rowHeight);

  // Add buffer rows for scroll/resize
  const { bufferRows } = config;
  const totalRows = visibleRows + bufferRows;

  return cols * totalRows;
};

// ============================================================================
// MODULE-LEVEL CACHING - Load once, use forever within session
// ============================================================================

let decorationsCache: string[] | null = null;
let decorationsLoadingPromise: Promise<string[]> | null = null;
let fontsCache: DecorationFont[] | null = null;
let fontsLoadingPromise: Promise<DecorationFont[]> | null = null;
const precomputedStylesCache: Map<number, CharacterStyle[]> = new Map();

// Get all available main colors from themes (computed once at module load)
const allMainColors = (() => {
  const colors = new Set<string>();
  themeSets[2].themes.forEach(theme => {
    colors.add(theme.mainColor);
    if (theme.secondaryColor) colors.add(theme.secondaryColor);
  });
  return Array.from(colors);
})();

// Fisher-Yates shuffle (more efficient and unbiased)
const shuffle = <T,>(arr: T[]): T[] => {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Load decorations JSON (minimal file with just characters)
const loadDecorations = async (): Promise<string[]> => {
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

// Load decoration fonts (lazy, only in production)
const loadDecorationFonts = async (
  forceLoad = false,
): Promise<DecorationFont[]> => {
  if (process.env.NODE_ENV !== 'production' && !forceLoad) {
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

// Pre-compute styles for a specific count of characters
const precomputeStyles = async (
  count: number,
  forceShow = false,
): Promise<CharacterStyle[]> => {
  // Check cache for this count
  const cached = precomputedStylesCache.get(count);
  if (cached) return cached;

  const [allChars, fonts] = await Promise.all([
    loadDecorations(),
    loadDecorationFonts(forceShow),
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

  const styles = chars.map(char => ({
    char,
    color: allMainColors[Math.floor(Math.random() * allMainColors.length)],
    fontClass:
      fonts.length > 0
        ? fonts[Math.floor(Math.random() * fonts.length)].font.className
        : '',
  }));

  precomputedStylesCache.set(count, styles);
  return styles;
};

// ============================================================================
// INTERACTIVE CHARACTER COMPONENT
// Each manages its own animation state - prevents parent re-renders
// ============================================================================

interface InteractiveCharProps {
  style: CharacterStyle;
  onExplode: () => void;
  intrinsicSize: number;
}

const InteractiveChar = memo(
  ({ style, onExplode, intrinsicSize }: InteractiveCharProps) => {
    const [animState, setAnimState] = useState<AnimState>('idle');
    const isAnimating = useRef(false);

    const handleClick = useCallback(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      onExplode();

      setAnimState('exploding');

      // Animation state transitions - all self-contained
      setTimeout(() => {
        setAnimState('hidden');
        setTimeout(() => {
          setAnimState('fading-in');
          setTimeout(() => {
            setAnimState('idle');
            isAnimating.current = false;
          }, 500);
        }, 1500);
      }, 300);
    }, [onExplode]);

    const getAnimationStyle = (): React.CSSProperties => {
      switch (animState) {
        case 'exploding':
          return { animation: 'explode 300ms ease-out forwards' };
        case 'hidden':
          return { opacity: 0 };
        case 'fading-in':
          return { animation: 'fadeIn 500ms ease-in forwards' };
        default:
          return {};
      }
    };

    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center',
          CHAR_SIZE_CLASSES,
          style.fontClass,
          animState === 'idle' && 'cursor-pointer',
        )}
        aria-hidden='true'
        style={{
          color: style.color,
          transformOrigin: 'center center',
          pointerEvents: animState !== 'idle' ? 'none' : undefined,
          contentVisibility: 'auto',
          containIntrinsicSize: `${intrinsicSize}px`,
          ...getAnimationStyle(),
        }}
        onClick={animState === 'idle' ? handleClick : undefined}
      >
        {style.char}
      </span>
    );
  },
);

InteractiveChar.displayName = 'InteractiveChar';

// ============================================================================
// STATIC CHARACTER COMPONENT
// Simple span with no state - maximum performance for non-interactive mode
// ============================================================================

interface StaticCharProps {
  style: CharacterStyle;
  intrinsicSize: number;
}

const StaticChar = memo(({ style, intrinsicSize }: StaticCharProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center',
        CHAR_SIZE_CLASSES,
        style.fontClass,
      )}
      aria-hidden='true'
      style={{
        color: style.color,
        contentVisibility: 'auto',
        containIntrinsicSize: `${intrinsicSize}px`,
      }}
    >
      {style.char}
    </span>
  );
});

StaticChar.displayName = 'StaticChar';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Decorations = ({
  expandDecorations,
  forceShow = false,
  interactive = false,
  context = 'main-menu',
}: {
  expandDecorations: boolean;
  forceShow?: boolean;
  interactive?: boolean;
  context?: 'main-menu' | 'mode-setup' | 'streak-milestone';
}) => {
  if (
    (context === 'mode-setup' && !ENABLE_MODE_SETUP_DECORATIONS) ||
    (context === 'streak-milestone' && !ENABLE_STREAK_MILESTONE_DECORATIONS)
  ) {
    return null;
  }

  const [styles, setStyles] = useState<CharacterStyle[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(() =>
    calculateVisibleCount(),
  );
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(() =>
    typeof window === 'undefined'
      ? GRID_CONFIGS.xl
      : getLayoutConfig(window.innerWidth),
  );
  const { playClick } = useClick();

  // Store latest playClick in ref to keep handleExplode stable
  const playClickRef = useRef(playClick);
  useEffect(() => {
    playClickRef.current = playClick;
  }, [playClick]);

  // Stable callback for explosion sound - truly stable, no recreations
  const handleExplode = useCallback(() => {
    playClickRef.current();
  }, []);

  // Handle viewport resize with debounce
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        const newConfig = getLayoutConfig(window.innerWidth);
        const newCount = calculateVisibleCount();
        setLayoutConfig(prev =>
          prev.cols === newConfig.cols &&
          prev.cellSize === newConfig.cellSize &&
          prev.gap === newConfig.gap &&
          prev.bufferRows === newConfig.bufferRows
            ? prev
            : newConfig,
        );
        if (newCount !== visibleCount) {
          setVisibleCount(newCount);
        }
      }, 100); // Debounce 100ms
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, [visibleCount]);

  // Load styles when visible count changes
  useEffect(() => {
    let isMounted = true;

    precomputeStyles(visibleCount, forceShow).then(computedStyles => {
      if (isMounted) {
        setStyles(computedStyles);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [visibleCount, forceShow]);

  // Inject animation keyframes once when component mounts (for interactive mode only)
  useEffect(() => {
    const styleId = 'decorations-animation-keyframes';
    // Only inject if not already present
    if (document.getElementById(styleId)) return;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = animationKeyframes;
    document.head.appendChild(styleElement);

    return () => {
      // Cleanup when component unmounts
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Memoize grid content - using separate components for interactive vs static
  const gridContent = useMemo(() => {
    if (styles.length === 0) return null;

    if (interactive) {
      // Interactive mode: each char manages its own animation state
      // Note: Using index as key is acceptable here since styles array is stable after precomputation
      return styles.map((style, index) => (
        <InteractiveChar
          key={index}
          style={style}
          onExplode={handleExplode}
          intrinsicSize={layoutConfig.cellSize}
        />
      ));
    } else {
      // Static mode: simple display, no animations
      return styles.map((style, index) => (
        <StaticChar key={index} style={style} intrinsicSize={layoutConfig.cellSize} />
      ));
    }
  }, [styles, interactive, handleExplode, layoutConfig.cellSize]);

  if (styles.length === 0) return null;

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 overflow-hidden',
          expandDecorations ? 'opacity-100' : DIMMED_OPACITY_CLASS,
          interactive ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={clsx(
            'grid h-full w-full gap-0.5 p-2',
            GRID_COL_CLASSES,
          )}
        >
          {gridContent}
        </div>
      </div>
    </>
  );
};

export default Decorations;
