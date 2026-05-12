'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useKanaSelection } from '@/features/Kana';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { useInputPreferences } from '@/features/Preferences';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { Play, Zap, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import ModeSetupMenu from '@/shared/ui-composite/Menu/ModeSetupMenu';

// Gauntlet components with onCancel prop support
import { cn } from '@/shared/utils/utils';
import { useScrollVisibility } from '@/shared/hooks/generic/useScrollVisibility';

const TRAINING_ACTION_CLASSIC_FLOAT_CLASSES = '';
  // 'motion-safe:animate-float [--float-distance:-3px] delay-200ms';
const ACTIVATION_SCROLL_DELAY_MS = 180;
const ACTIVATION_SCROLL_DELTA_PX = 6;

interface ITopBarProps {
  currentDojo: string;
}

const TrainingActionBar: React.FC<ITopBarProps> = ({
  currentDojo,
}: ITopBarProps) => {
  const { hotkeysOn } = useInputPreferences();

  const { playClick } = useClick();

  // Modal state
  const [showGameModesModal, setShowGameModesModal] = useState(false);
  const [gameModesMode, setGameModesMode] = useState<
    'train' | 'blitz' | 'gauntlet'
  >('train');

  // Kana store
  const { selectedGroupIndices: kanaGroupIndices } = useKanaSelection();

  // Kanji store
  const { selectedKanji: selectedKanjiObjs } = useKanjiSelection();

  // Vocab store
  const { selectedVocab: selectedWordObjs, selectedSets: selectedVocabSets } =
    useVocabSelection();

  const isFilled =
    currentDojo === 'kana'
      ? kanaGroupIndices.length !== 0
      : currentDojo === 'kanji'
        ? selectedKanjiObjs.length > 0
        : currentDojo === 'vocabulary'
          ? selectedVocabSets.length > 0 || selectedWordObjs.length > 0
          : false;

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      if (event.key === 'Enter' && isFilled) {
        event.preventDefault();
        setShowGameModesModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, isFilled]);

  const showBlitz =
    currentDojo === 'kana' ||
    currentDojo === 'vocabulary' ||
    currentDojo === 'kanji';

  const [layout, setLayout] = useState<{
    bottom: number;
    left: number | string;
    width: number | string;
  }>({
    bottom: 0,
    left: 0,
    width: '100%',
  });
  const isSidebarVisible = useScrollVisibility();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isActivationLocked, setIsActivationLocked] = useState(false);
  const [canUnlockOnScroll, setCanUnlockOnScroll] = useState(false);
  const activationScrollYRef = useRef(0);

  const placeholderRef = useRef<HTMLDivElement | null>(null);

  // Safe useLayoutEffect for SSR
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const bottomBar = document.getElementById('main-bottom-bar');
      const width = window.innerWidth;

      let bottom = 0;
      let left: number | string = 0;
      let barWidth: number | string = '100%';

      // 1. Calculate Bottom Offset
      if (width < 1024) {
        // Mobile: Sidebar is at bottom
        if (sidebar) {
          bottom = sidebar.offsetHeight;
        }
      } else {
        // Desktop: BottomBar is at bottom
        if (bottomBar) {
          bottom = bottomBar.offsetHeight;
        }
      }

      // 2. Calculate Horizontal Layout
      if (width >= 1024) {
        // Desktop: Stretch from sidebar's right edge to viewport right edge
        if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          left = sidebarRect.right;
          barWidth = width - sidebarRect.right;
        }
      } else {
        // Mobile: Full width
        left = 0;
        barWidth = '100%';
      }

      setLayout({ bottom, left, width: barWidth });
    };

    // Initial update
    updateLayout();

    // Setup ResizeObserver on sidebar for layout changes
    let observer: ResizeObserver | null = null;
    const sidebar = document.getElementById('main-sidebar');

    if (sidebar) {
      observer = new ResizeObserver(() => {
        updateLayout();
      });
      observer.observe(sidebar);
    }

    // Also listen to window resize for global changes (like breakpoints)
    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isFilled) {
      setIsActivationLocked(false);
      setCanUnlockOnScroll(false);
      return;
    }

    setIsActivationLocked(true);
    setCanUnlockOnScroll(false);
    const timeoutId = window.setTimeout(() => {
      setCanUnlockOnScroll(true);
    }, ACTIVATION_SCROLL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isFilled]);

  useEffect(() => {
    if (!isFilled || !isActivationLocked) return;

    const scrollContainer = document.querySelector<HTMLElement>(
      '[data-scroll-restoration-id="container"]',
    );
    if (!scrollContainer) return;

    activationScrollYRef.current = scrollContainer.scrollTop;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      const delta = Math.abs(currentScrollY - activationScrollYRef.current);
      activationScrollYRef.current = currentScrollY;

      if (!canUnlockOnScroll) return;
      if (delta < ACTIVATION_SCROLL_DELTA_PX) return;

      setIsActivationLocked(false);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [canUnlockOnScroll, isActivationLocked, isFilled]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  const targetBottom = isMobileViewport && !isSidebarVisible ? 0 : layout.bottom;

  return (
    <>
      {/* Invisible placeholder to measure parent width/position */}
      <div
        ref={placeholderRef}
        className='pointer-events-none h-0 w-full opacity-0'
      />

      <motion.div
        initial={false}
        animate={{
          y: isFilled ? 0 : '100%',
          opacity: isFilled ? 1 : 0,
          bottom: targetBottom,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        aria-hidden={!isFilled}
        style={{
          left:
            typeof layout.left === 'number' ? `${layout.left}px` : layout.left,
          width:
            typeof layout.width === 'number'
              ? `${layout.width}px`
              : layout.width,
        }}
        id='main-training-action-bar'
        className={clsx(
          'fixed z-40',
          'bg-(--background-color)',
          'border-t-2 border-(--border-color)',
          'px-2 py-3',
          !isFilled && 'pointer-events-none',
        )}
      >
            <div
              className={clsx(
                'flex flex-row items-center justify-center gap-2 md:gap-8',
                'mx-auto w-full max-w-4xl',
              )}
            >
              {[
                {
                  id: 'blitz',
                  label: 'Blitz',
                  Icon: Zap,
                  iconClassName: 'fill-current motion-safe:animate-none',
                  show: showBlitz,
                  colorScheme: 'secondary' as const,
                  onClick: () => {
                    setGameModesMode('blitz');
                    setShowGameModesModal(true);
                  },
                },
                {
                  id: 'gauntlet',
                  label: 'Gauntlet',
                  Icon: Swords,
                  iconClassName: 'fill-current',
                  show: showBlitz,
                  colorScheme: 'secondary' as const,
                  onClick: () => {
                    setGameModesMode('gauntlet');
                    setShowGameModesModal(true);
                  },
                },
                {
                  id: 'classic',
                  label: 'Classic',
                  Icon: Play,
                  iconClassName: isFilled ? 'fill-current' : '',
                  show: true,
                  colorScheme: 'primary' as const,
                  onClick: () => {
                    setGameModesMode('train');
                    setShowGameModesModal(true);
                  },
                  ref: buttonRef,
                },
              ]
                .filter(btn => btn.show)
                .map(
                  ({
                    id,
                    label,
                    Icon,
                    iconClassName,
                    colorScheme,
                    onClick,
                    ref,
                  }) => (
                    <button
                      key={id}
                      ref={ref}
                      disabled={id === 'classic' && !isFilled}
                      className={cn(
                        'flex flex-row items-center justify-center gap-2 py-3',
                        id === 'classic' && isFilled && TRAINING_ACTION_CLASSIC_FLOAT_CLASSES,
                        // Mobile: fixed widths (25% for Blitz/Gauntlet, 50% for Classic), no x-padding
                        // Desktop (sm+): flex-based sizing with padding
                        id === 'classic'
                          ? 'w-1/2 sm:w-auto sm:max-w-sm sm:flex-2 sm:px-6'
                          : 'w-1/4 sm:w-auto sm:max-w-sm sm:flex-1 sm:px-6',
                        'rounded-3xl transition-colors duration-200',
                        'border-b-10',
                        'hover:cursor-pointer',
                        colorScheme === 'secondary' &&
                          'border-(--secondary-color-accent) bg-(--secondary-color)/90 text-(--background-color)',
                        colorScheme === 'primary' &&
                          (isFilled
                            ? 'border-(--main-color-accent) bg-(--main-color) text-(--background-color)'
                            : 'cursor-not-allowed bg-(--card-color) text-(--border-color)'),
                      )}
                      onClick={e => {
                        e.currentTarget.blur();
                        playClick();
                        onClick();
                      }}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          iconClassName,
                          id === 'classic' && 'animate-bounce',
                        )}
                      />
                      <span className='hidden whitespace-nowrap sm:inline'>
                        {label}
                      </span>
                    </button>
                  ),
                )}
            </div>
      </motion.div>

      {/* Game Modes Interstitial */}
      <ModeSetupMenu
        isOpen={showGameModesModal}
        onClose={() => setShowGameModesModal(false)}
        currentDojo={currentDojo}
        mode={gameModesMode}
      />
    </>
  );
};

export default TrainingActionBar;

