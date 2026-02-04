'use client';
import { memo, useMemo } from 'react';
import { MousePointer } from 'lucide-react';
import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/lib/styles';
import { useKanjiSelection } from '@/features/Kanji';
import { useVocabSelection } from '@/features/Vocabulary';
import { useKanaSelection } from '@/features/Kana';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import { getSelectionLabels } from '@/shared/lib/selectionFormatting';

const GameIntel = memo(({ gameMode: _gameMode }: { gameMode: string }) => {
  void _gameMode;
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const trainingDojo = pathWithoutLocale.split('/')[1];

  const { selectedSets: selectedKanjiSets } = useKanjiSelection();
  const { selectedSets: selectedVocabSets } = useVocabSelection();
  const { selectedGroupIndices: kanaGroupIndices } = useKanaSelection();

  const { full: formattedSelectionFull, compact: formattedSelectionCompact } =
    useMemo(() => {
      const type = trainingDojo as 'kana' | 'kanji' | 'vocabulary';
      const selection =
        type === 'kana'
          ? kanaGroupIndices
          : type === 'kanji'
            ? selectedKanjiSets
            : selectedVocabSets;
      return getSelectionLabels(type, selection);
    }, [trainingDojo, kanaGroupIndices, selectedKanjiSets, selectedVocabSets]);

  const selectionLabel =
    trainingDojo === 'kana' ? 'Selected Groups:' : 'Selected Levels:';

  return (
    <div
      className={clsx(
        'flex flex-col',
        cardBorderStyles,
        'text-(--secondary-color)',
      )}
    >
      <div
        className={clsx(
          'flex w-full flex-col gap-2 border-(--border-color) p-4',
        )}
      >
        <span className='flex items-center gap-2'>
          <MousePointer size={20} className='text-(--main-color)' />
          {selectionLabel}
        </span>
        {/* Compact form on small screens */}
        <span className='text-sm break-words text-(--main-color) md:hidden'>
          {formattedSelectionCompact}
        </span>
        {/* Full form on medium+ screens */}
        <span className='hidden text-sm break-words text-(--main-color) md:inline'>
          {formattedSelectionFull}
        </span>
      </div>
    </div>
  );
});

GameIntel.displayName = 'GameIntel';

export default GameIntel;
