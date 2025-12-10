'use client';
import { SquareCheck, SquareX, Star, Coffee } from 'lucide-react';
import { MousePointerClick, Keyboard, MousePointer } from 'lucide-react';
import clsx from 'clsx';
import { cardBorderStyles } from '@/shared/lib/styles';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { miniButtonBorderStyles } from '@/shared/lib/styles';
import { ChartSpline } from 'lucide-react';
import { useStopwatch } from 'react-timer-hook';
import { useClick } from '@/shared/hooks/useAudio';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';

const GameIntel = ({
  gameMode,
  feedback
}: {
  gameMode: string;
  feedback?: React.JSX.Element;
}) => {
  const numCorrectAnswers = useStatsStore(state => state.numCorrectAnswers);
  const numWrongAnswers = useStatsStore(state => state.numWrongAnswers);
  const numStars = useStatsStore(state => state.stars);

  const totalTimeStopwatch = useStopwatch({ autoStart: false });

  const toggleStats = useStatsStore(state => state.toggleStats);
  const setNewTotalMilliseconds = useStatsStore(
    state => state.setNewTotalMilliseconds
  );

  const { playClick } = useClick();

  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const trainingDojo = pathWithoutLocale.split('/')[1];

  const selectedKanjiSets = useKanjiStore(state => state.selectedKanjiSets);
  const selectedVocabSets = useVocabStore(state => state.selectedVocabSets);

  // useEffect(() => {
  //   if (!isHidden) totalTimeStopwatch.start();
  // }, [isHidden]);

  return (
    <div
      className={clsx(
        'flex flex-col',

        cardBorderStyles,
        'text-[var(--secondary-color)]'
      )}
    >
      <div
        className={clsx(
          ' flex flex-col  items-center justify-center',
          'md:flex-row '
        )}
      ></div>

      {feedback && (
        <p className='text-xl flex justify-center items-center gap-1.5 px-4 py-3  w-full  border-[var(--border-color)]'>
          {feedback}
        </p>
      )}

      <p
        className={clsx(
          'p-4  w-full border-[var(--border-color)] flex gap-2  items-center',
          trainingDojo === 'kana' && 'hidden'
        )}
      >
        <span className='flex gap-2 items-center'>
          <MousePointer size={20} className='text-[var(--main-color)]' />
          selected levels:
        </span>
        <span className='text-[var(--main-color)]'>
          {trainingDojo === 'kanji'
            ? selectedKanjiSets
                .sort()
                .join(', ')
                .toLowerCase()
                .replace(/set /g, ' ')
            : trainingDojo === 'vocabulary'
            ? selectedVocabSets
                .sort()
                .join(', ')
                .toLowerCase()
                .replace(/set /g, ' ')
            : null}
        </span>
      </p>
    </div>
  );
};

export default GameIntel;
