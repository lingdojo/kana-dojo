'use client';
import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { useKanaSelection } from '@/features/Kana';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import { useClick } from '@/shared/hooks/useAudio';
import { CircleCheck, Trash } from 'lucide-react';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

type ContentType = 'kana' | 'kanji' | 'vocabulary';

const SelectionStatusBar = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.slice(1) as ContentType;

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
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
              'px-4 py-3',
            )}
          >
            {/* Selected Levels Info */}
            <div className='flex flex-1 flex-row items-start gap-2'>
              <CircleCheck
                className='mt-0.5 shrink-0 text-(--secondary-color)'
                size={20}
              />
              <span className='text-sm whitespace-nowrap md:text-base'>
                {selectionLabel}
              </span>
              {/* Compact form on small screens: "1, 2, 3" */}
              <span className='text-sm break-words text-(--secondary-color) md:hidden'>
                {formattedSelectionCompact}
              </span>
              {/* Full form on medium+ screens: "Level 1, Level 2" */}
              <span className='hidden text-base break-words text-(--secondary-color) md:inline'>
                {formattedSelectionFull}
              </span>
            </div>

            {/* Clear Button */}
            <ActionButton
              // colorScheme='main'
              borderColorScheme='main'
              borderRadius='3xl'
              borderBottomThickness={10}
              className='w-auto bg-(--main-color)/80 px-4 py-3 lg:px-6'
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
