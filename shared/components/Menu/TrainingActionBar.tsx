'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { KanaGauntlet, useKanaSelection } from '@/features/Kana';
import { KanjiGauntlet, useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection, VocabGauntlet } from '@/features/Vocabulary';
import { useInputPreferences } from '@/features/Preferences';
import { useClick } from '@/shared/hooks/useAudio';
import { Play, Zap, Swords } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import GameModes from '@/shared/components/Menu/GameModes';

// Gauntlet components with onCancel prop support
import { cn } from '@/shared/lib/utils';

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
  const [showGauntletModal, setShowGauntletModal] = useState(false);

  // Kana store
  const { selectedGroupIndices: kanaGroupIndices } = useKanaSelection();

  // Kanji store
  const { selectedKanji: selectedKanjiObjs } = useKanjiSelection();

  // Vocab store
  const { selectedVocab: selectedWordObjs } = useVocabSelection();

  const isFilled =
    currentDojo === 'kana'
      ? kanaGroupIndices.length !== 0
      : currentDojo === 'kanji'
        ? selectedKanjiObjs.length >= 10
        : currentDojo === 'vocabulary'
          ? selectedWordObjs.length >= 10
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

  const placeholderRef = useRef<HTMLDivElement | null>(null);

  // Safe useLayoutEffect for SSR
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useEffect : useEffect;

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

  return (
    <>
      {/* Invisible placeholder to measure parent width/position */}
      <div
        ref={placeholderRef}
        className='pointer-events-none h-0 w-full opacity-0'
      />

      <AnimatePresence>
        {isFilled && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              bottom: `${layout.bottom}px`,
              left:
                typeof layout.left === 'number'
                  ? `${layout.left}px`
                  : layout.left,
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
                  onClick: () => setShowGauntletModal(true),
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
        )}
      </AnimatePresence>

      {/* Game Modes Interstitial */}
      <GameModes
        isOpen={showGameModesModal}
        onClose={() => setShowGameModesModal(false)}
        currentDojo={currentDojo}
        mode={gameModesMode}
      />

      {/* Gauntlet Modal - shows Gauntlet component without route change */}
      {showGauntletModal && (
        <div className='fixed inset-0 z-[80] bg-(--background-color)'>
          {currentDojo === 'kana' && (
            <KanaGauntlet onCancel={() => setShowGauntletModal(false)} />
          )}
          {currentDojo === 'kanji' && (
            <KanjiGauntlet onCancel={() => setShowGauntletModal(false)} />
          )}
          {currentDojo === 'vocabulary' && (
            <VocabGauntlet onCancel={() => setShowGauntletModal(false)} />
          )}
        </div>
      )}
    </>
  );
};

export default TrainingActionBar;
