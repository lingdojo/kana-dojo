'use client';
import clsx from 'clsx';
import { kana } from '@/features/Kana/data/kana';
import { useParams } from 'next/navigation';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';

const sliceRanges = {
  hiraganabase: [0, 10],
  hiraganadakuon: [10, 15],
  hiraganayoon: [15, 26],
  katakanabase: [26, 36],
  katakanadakuon: [36, 41],
  katakanayoon: [41, 52],
  katakanaforeign: [52, 60]
};

const SetDictionary = () => {
  const params = useParams<{ subset: string }>();
  const { subset }: { subset: string } = params;
  const [group, subgroup] = subset.split('-');
  const displayKana = usePreferencesStore(state => state.displayKana);

  const key = (group + subgroup) as keyof typeof sliceRanges;
  const range = sliceRanges[key];

  if (!range) return null;

  const [startIndex, endIndex] = range;

  const kanaToDisplay = kana.slice(startIndex, endIndex);

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] px-4 sm:px-8 md:px-20 lg:px-30 xl:px-40 2xl:px-60 flex flex-col gap-4 pb-10'>
      <div className='flex flex-col border-1 border-[var(--border-color)] rounded-2xl px-4 bg-[var(--card-color)]'>
        {kanaToDisplay.map(kanaSubgroup => (
          <div
            key={kanaSubgroup.groupName}
            className={clsx(
              'flex flex-col md:flex-row justify-start items-start gap-6 md:gap-4 p-4 ',
              'border-b-2 border-[var(--border-color)]'
            )}
          >
            <p lang='ja' className='text-6xl'>
              {kanaSubgroup.kana.join(' ')}
            </p>
            <div className='flex flex-col gap-2 items-start'>
              {!displayKana && (
                <span
                  className={clsx(
                    'rounded-2xl px-2 py-1 flex flex-row items-center',
                    'bg-[var(--border-color)]'
                  )}
                >
                  {kanaSubgroup.romanji.join(' ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetDictionary;
