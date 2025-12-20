'use client';
import { useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { kana } from '@/features/Kana/data/kana';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import { useClick } from '@/shared/hooks/useAudio';
import { CircleCheck, Trash } from 'lucide-react';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { AnimatePresence, motion } from 'framer-motion';
import { formatLevelsAsRanges } from '@/shared/lib/helperFunctions';

type ContentType = 'kana' | 'kanji' | 'vocabulary';

const SelectionStatusBar = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const contentType = pathWithoutLocale.slice(1) as ContentType;

  const isKana = contentType === 'kana';
  const isKanji = contentType === 'kanji';

  // Kana store
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);
  const addKanaGroupIndices = useKanaStore(state => state.addKanaGroupIndices);

  // Kanji store
  const { selectedKanjiSets, clearKanjiObjs, clearKanjiSets } = useKanjiStore();

  // Vocab store
  const { selectedVocabSets, clearVocabObjs, clearVocabSets } = useVocabStore();

  const { kanaGroupNamesFull, kanaGroupNamesCompact } = useMemo(() => {
    const selected = new Set(kanaGroupIndices);

    // Parent group definitions (for "All Hiragana", "All Katakana", "All Challenge")
    const parentGroupDefs: Array<{
      label: string;
      start: number;
      end: number;
    }> = [
      { label: 'All Hiragana', start: 0, end: 26 },
      { label: 'All Katakana', start: 26, end: 60 },
      { label: 'All Challenge', start: 60, end: 69 }
    ];

    const subgroupDefs: Array<{
      label: string;
      start: number;
      end: number;
      isChallenge: boolean;
    }> = [
      { label: 'Hiragana Base', start: 0, end: 10, isChallenge: false },
      { label: 'Hiragana Dakuon', start: 10, end: 15, isChallenge: false },
      { label: 'Hiragana Yoon', start: 15, end: 26, isChallenge: false },
      { label: 'Katakana Base', start: 26, end: 36, isChallenge: false },
      { label: 'Katakana Dakuon', start: 36, end: 41, isChallenge: false },
      { label: 'Katakana Yoon', start: 41, end: 52, isChallenge: false },
      {
        label: 'Katakana Foreign Sounds',
        start: 52,
        end: 60,
        isChallenge: false
      },
      {
        label: 'Challenge Similar Hiragana',
        start: 60,
        end: 65,
        isChallenge: true
      },
      {
        label: 'Challenge Confusing Katakana',
        start: 65,
        end: 69,
        isChallenge: true
      }
    ];

    const nonChallengeIndices = kana
      .map((k, i) => ({ k, i }))
      .filter(({ k }) => !k.groupName.startsWith('challenge.'))
      .map(({ i }) => i);
    const allNonChallengeSelected = nonChallengeIndices.every(i =>
      selected.has(i)
    );

    const full: string[] = [];
    const compact: string[] = [];

    const covered = new Set<number>();

    if (allNonChallengeSelected) {
      full.push('all kana');
      compact.push('all kana');

      nonChallengeIndices.forEach(i => covered.add(i));
    }

    // Check parent groups first (All Hiragana, All Katakana, All Challenge)
    parentGroupDefs.forEach(parentDef => {
      // Skip if already covered by "all kana" and not a challenge group
      if (allNonChallengeSelected && parentDef.label !== 'All Challenge')
        return;

      // Check if all indices in this parent group are already covered
      let allCovered = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      // Check if all indices in this parent group are selected
      let allInRange = true;
      for (let i = parentDef.start; i < parentDef.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      // All selected - add parent group label and mark as covered
      full.push(parentDef.label);
      compact.push(parentDef.label);
      for (let i = parentDef.start; i < parentDef.end; i++) covered.add(i);
    });

    // Then check individual subgroups for partial selections
    subgroupDefs.forEach(def => {
      // Skip if covered by "all kana" or parent group
      let allCovered = true;
      for (let i = def.start; i < def.end; i++) {
        if (!covered.has(i)) {
          allCovered = false;
          break;
        }
      }
      if (allCovered) return;

      let allInRange = true;
      for (let i = def.start; i < def.end; i++) {
        if (!selected.has(i)) {
          allInRange = false;
          break;
        }
      }

      if (!allInRange) return;

      full.push(def.label);
      compact.push(def.label);
      for (let i = def.start; i < def.end; i++) covered.add(i);
    });

    const sortedSelected = [...kanaGroupIndices].sort((a, b) => a - b);
    sortedSelected.forEach(i => {
      if (covered.has(i)) return;

      const group = kana[i];
      if (!group) {
        const fallback = `Group ${i + 1}`;
        full.push(fallback);
        compact.push(fallback);
        return;
      }

      const firstKana = group.kana[0];
      const isChallenge = group.groupName.startsWith('challenge.');
      full.push(
        isChallenge ? `${firstKana}-group (challenge)` : `${firstKana}-group`
      );
      compact.push(firstKana);
    });

    return { kanaGroupNamesFull: full, kanaGroupNamesCompact: compact };
  }, [kanaGroupIndices]);

  const hasSelection = isKana
    ? kanaGroupIndices.length > 0
    : isKanji
      ? selectedKanjiSets.length > 0
      : selectedVocabSets.length > 0;

  const handleClear = () => {
    playClick();
    if (isKana) {
      // Clear all kana by toggling all currently selected indices
      addKanaGroupIndices(kanaGroupIndices);
    } else if (isKanji) {
      clearKanjiSets();
      clearKanjiObjs();
    } else {
      clearVocabSets();
      clearVocabObjs();
    }
  };

  const [layout, setLayout] = useState<{
    top: number;
    left: number | string;
    width: number | string;
  }>({
    top: 0,
    left: 0,
    width: '100%'
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

  // For kanji/vocab: sort by set number
  const selectedSets = isKanji ? selectedKanjiSets : selectedVocabSets;
  const sortedSets =
    selectedSets.length > 0
      ? selectedSets.sort((a, b) => {
          const numA = parseInt(a.replace('Set ', ''));
          const numB = parseInt(b.replace('Set ', ''));
          return numA - numB;
        })
      : [];

  // Compact: "1-5, 8-10" for kanji/vocab
  const formattedSelectionCompact = isKana
    ? kanaGroupNamesCompact.length > 0
      ? kanaGroupNamesCompact.join(', ')
      : 'None'
    : formatLevelsAsRanges(sortedSets);

  // Full: "Level 1-5, Level 8-10" for kanji/vocab
  const formattedSelectionFull = isKana
    ? kanaGroupNamesFull.length > 0
      ? kanaGroupNamesFull.join(', ')
      : 'None'
    : sortedSets.length > 0
      ? formatLevelsAsRanges(sortedSets)
          .split(', ')
          .map(range => `${range.includes('-') ? 'Levels' : 'Level'} ${range}`)
          .join(', ')
      : 'None';

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
                : layout.width
          }}
          className={clsx(
            'fixed z-40',
            'bg-[var(--background-color)]',
            'w-full border-b-2 border-[var(--border-color)]'
          )}
        >
          <div
            className={clsx(
              'flex flex-row items-center justify-center gap-2 md:gap-4',
              'w-full',
              'px-4 py-3'
            )}
          >
            {/* Selected Levels Info */}
            <div className='flex flex-1 flex-row items-start gap-2'>
              <CircleCheck
                className='mt-0.5 shrink-0 text-[var(--secondary-color)]'
                size={20}
              />
              <span className='text-sm whitespace-nowrap md:text-base'>
                {selectionLabel}
              </span>
              {/* Compact form on small screens: "1, 2, 3" */}
              <span className='text-sm break-words text-[var(--secondary-color)] md:hidden'>
                {formattedSelectionCompact}
              </span>
              {/* Full form on medium+ screens: "Level 1, Level 2" */}
              <span className='hidden text-base break-words text-[var(--secondary-color)] md:inline'>
                {formattedSelectionFull}
              </span>
            </div>

            {/* Clear Button */}
            <ActionButton
              // colorScheme='main'
              borderColorScheme='main'
              borderRadius='2xl'
              borderBottomThickness={8}
              className='w-auto bg-[var(--main-color)]/80 px-4 py-3'
              onClick={handleClear}
              aria-label='Clear selected levels'
            >
              <Trash size={20} />
            </ActionButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SelectionStatusBar;
