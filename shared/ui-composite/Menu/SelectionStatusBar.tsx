'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { useKanaSelection } from '@/features/Kana';
import { getSelectionLabels } from '@/shared/utils/selectionFormatting';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useScrollVisibility } from '@/shared/hooks/generic/useScrollVisibility';
import { CircleCheck, Trash } from 'lucide-react';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/utils/utils';

type ContentType = 'kana' | 'kanji' | 'vocabulary';
const ACTIVATION_SCROLL_DELAY_MS = 180;
const ACTIVATION_SCROLL_DELTA_PX = 6;

const renderLabelWithDotSeparator = (label: string) => {
  const parts = label.split(', ');
  if (parts.length === 1) return label;

  return parts.map((part, index) => (
    <span key={`${part}-${index}`} className='inline'>
      {part}
      {index < parts.length - 1 && (
        <span aria-hidden='true' className='mx-1 text-(--main-color)'>
          ・
        </span>
      )}
    </span>
  ));
};

const SelectionStatusBar = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.split('/')[1] as ContentType;

  const isKana = contentType === 'kana';
  const isKanji = contentType === 'kanji';

  // Kana store
  const kanaSelection = useKanaSelection();
  const kanaGroupIndices = kanaSelection.selectedGroupIndices;

  // Kanji store
  const kanjiSelection = useKanjiSelection();
  const selectedKanjiSets = kanjiSelection.selectedSets;

  // Vocab store
  const vocabSelection = useVocabSelection();
  const selectedVocabSets = vocabSelection.selectedSets;

  const { full: formattedSelectionFull, compact: formattedSelectionCompact } =
    useMemo(() => {
      const selection = isKana
        ? kanaGroupIndices
        : isKanji
          ? selectedKanjiSets
          : selectedVocabSets;
      return getSelectionLabels(contentType, selection);
    }, [
      contentType,
      isKana,
      isKanji,
      kanaGroupIndices,
      selectedKanjiSets,
      selectedVocabSets,
    ]);

  const hasSelection = isKana
    ? kanaGroupIndices.length > 0
    : isKanji
      ? selectedKanjiSets.length > 0
      : selectedVocabSets.length > 0;

  const handleClear = () => {
    playClick();
    if (isKana) {
      kanaSelection.clearSelection();
    } else if (isKanji) {
      kanjiSelection.clearSets();
      kanjiSelection.clearKanji();
    } else {
      vocabSelection.clearSets();
      vocabSelection.clearVocab();
    }
  };

  const [layout, setLayout] = useState<{
    top: number;
    left: number | string;
    width: number | string;
  }>({
    top: 0,
    left: 0,
    width: '100%',
  });
  const isVisible = useScrollVisibility();
  const [isActivationLocked, setIsActivationLocked] = useState(false);
  const [canUnlockOnScroll, setCanUnlockOnScroll] = useState(false);
  const activationScrollYRef = useRef(0);

  useEffect(() => {
    if (!hasSelection) {
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
  }, [hasSelection]);

  useEffect(() => {
    if (!hasSelection || !isActivationLocked) return;

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
  }, [canUnlockOnScroll, hasSelection, isActivationLocked]);

  useEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const width = window.innerWidth;

      const top = 0;
      let left: number | string = 0;
      let barWidth: number | string = '100%';

      // Calculate Horizontal Layout
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

      setLayout({ top, left, width: barWidth });
    };

    updateLayout();

    let observer: ResizeObserver | null = null;
    const sidebar = document.getElementById('main-sidebar');

    if (sidebar) {
      observer = new ResizeObserver(() => {
        updateLayout();
      });
      observer.observe(sidebar);
    }

    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Label text
  const selectionLabel = isKana ? 'Selected Groups:' : 'Selected Levels:';

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{
            y: isActivationLocked || isVisible ? 0 : '-100%',
            opacity: isActivationLocked || isVisible ? 1 : 0,
          }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            top: `${layout.top}px`,
            left:
              typeof layout.left === 'number'
                ? `${layout.left}px`
                : layout.left,
            width:
              typeof layout.width === 'number'
                ? `${layout.width}px`
                : layout.width,
          }}
          className={clsx(
            'fixed z-40',
            'bg-(--background-color)',
            'w-full border-b-2 border-(--border-color)',
          )}
        >
          <div
            className={clsx(
              'flex flex-row items-center justify-center gap-2 md:gap-4',
              'w-full',
              'px-4 py-2 sm:py-3',
            )}
          >
            {/* Selected Levels Info */}
            <div className='flex flex-1 flex-row items-start gap-2'>
              <div
                className={clsx(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                  'border-(--secondary-color) bg-(--secondary-color)',
                )}
              >
                <svg
                  className='h-3 w-3 text-(--background-color)'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={3}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <span className='text-sm whitespace-nowrap md:text-base'>
                {selectionLabel}
              </span>
              {/* Compact form on small screens: "1, 2, 3" */}
              <span className='text-sm break-words text-(--secondary-color) md:hidden'>
                {renderLabelWithDotSeparator(formattedSelectionCompact)}
              </span>
              {/* Full form on medium+ screens: "Level 1, Level 2" */}
              <span className='hidden text-base break-words text-(--secondary-color) md:inline'>
                {renderLabelWithDotSeparator(formattedSelectionFull)}
              </span>
            </div>

            {/* Clear Button */}
            <ActionButton
              // colorScheme='main'
              borderColorScheme='main'
              borderRadius='3xl'
              borderBottomThickness={10}
              className='w-auto bg-(--main-color)/80 px-4 py-3 lg:px-6 motion-safe:animate-float [--float-distance:-3px] sm:[--float-distance:-5px]'
              onClick={handleClear}
              aria-label='Clear selected levels'
            >
              <Trash size={20} className={cn('fill-current')} />
            </ActionButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionStatusBar;
