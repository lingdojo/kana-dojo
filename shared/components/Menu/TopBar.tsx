'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { Play, Timer } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import GameModes from '@/shared/components/Menu/GameModes';
// import { ActionButton } from '@/shared/components/ui/ActionButton';

interface ITopBarProps {
  currentDojo: string;
}

const TopBar: React.FC<ITopBarProps> = ({ currentDojo }: ITopBarProps) => {
  const hotkeysOn = usePreferencesStore(state => state.hotkeysOn);

  const { playClick } = useClick();

  // Modal state
  const [showGameModesModal, setShowGameModesModal] = useState(false);

  // Kana store
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  // Kanji store
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);

  // Vocab store
  const selectedWordObjs = useVocabStore(state => state.selectedVocabObjs);

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

  const showTimedChallenge =
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
    width: '100%'
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
        className='w-full h-0 opacity-0 pointer-events-none'
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
                  : layout.width
            }}
            className={clsx(
              'fixed z-40',
              'bg-[var(--background-color)]',
              'border-t-2 border-[var(--border-color)]',
              'py-3 px-4'
            )}
          >
            <div
              className={clsx(
                'flex flex-row items-center justify-center gap-2 md:gap-8 ',
                'w-full max-w-4xl mx-auto'
              )}
            >
              {/* Timed Challenge Button */}
              {showTimedChallenge && (
                <Link
                  href={`/${currentDojo}/blitz`}
                  className='flex-1 max-w-sm'
                >
                  <button
                    className={clsx(
                      'w-full h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                      'bg-[var(--secondary-color)] text-[var(--background-color)]',
                      'rounded-2xl transition-colors duration-200',
                      'border-b-6 border-[var(--secondary-color-accent)] shadow-sm',
                      'hover:cursor-pointer'
                    )}
                    onClick={() => playClick()}
                  >
                    <Timer size={20} />
                    <span className='whitespace-nowrap'>Blitz</span>
                  </button>
                </Link>
              )}

              {/* Start Training Button - Opens Modal */}
              <button
                ref={buttonRef}
                disabled={!isFilled}
                className={clsx(
                  'flex-1 max-w-sm h-12 px-2 sm:px-6 flex flex-row justify-center items-center gap-2',
                  'rounded-2xl transition-colors duration-200',
                  'font-medium border-b-6 shadow-sm',
                  'hover:cursor-pointer',
                  isFilled
                    ? 'bg-[var(--main-color)] text-[var(--background-color)] border-[var(--main-color-accent)]'
                    : 'bg-[var(--card-color)] text-[var(--border-color)] cursor-not-allowed'
                )}
                onClick={e => {
                  e.currentTarget.blur();
                  playClick();
                  setShowGameModesModal(true);
                }}
              >
                <span className='whitespace-nowrap'>Train</span>
                <Play className={clsx(isFilled && 'fill-current')} size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Modes Interstitial */}
      <GameModes
        isOpen={showGameModesModal}
        onClose={() => setShowGameModesModal(false)}
        currentDojo={currentDojo}
      />
    </>
  );
};

export default TopBar;
