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
  katakanaforeign: [52, 60],
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
    <div className='flex min-h-[100dvh] max-w-[100dvw] flex-col gap-4 px-4 pb-10 sm:px-8 md:px-20 lg:px-30 xl:px-40 2xl:px-60'>
      <div className='flex flex-col rounded-2xl border-1 border-(--border-color) bg-(--card-color) px-4'>
        {kanaToDisplay.map(kanaSubgroup => (
          <div
            key={kanaSubgroup.groupName}
            className={clsx(
              'flex flex-col items-start justify-start gap-6 p-4 md:flex-row md:gap-4',
              'border-b-2 border-(--border-color)',
            )}
          >
            <p lang='ja' className='text-6xl'>
              {kanaSubgroup.kana.join(' ')}
            </p>
            <div className='flex flex-col items-start gap-2'>
              {!displayKana && (
                <span
                  className={clsx(
                    'flex flex-row items-center rounded-2xl px-2 py-1',
                    'bg-(--border-color)',
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
