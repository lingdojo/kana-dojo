'use client';

import Info from '@/shared/components/Menu/Info';
import TrainingActionBar from '@/shared/components/Menu/TrainingActionBar';
import SelectionStatusBar from '@/shared/components/Menu/SelectionStatusBar';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { MousePointer } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useClick } from '@/shared/hooks/useAudio';
import { KanaCards, useKanaContent, useKanaSelection } from '@/features/Kana';

type KanaMenuFilter = 'all' | 'hiragana' | 'katakana';

const KanaMenu = ({ filter = 'all' }: { filter?: KanaMenuFilter }) => {
  const { playClick } = useClick();
  const { addGroups: addKanaGroupIndices } = useKanaSelection();
  const { allGroups: kana } = useKanaContent();

  const headerText =
    filter === 'hiragana'
      ? { label: 'Hiragana', char: 'ひ' }
      : filter === 'katakana'
        ? { label: 'Katakana', char: 'カ' }
        : { label: 'Kana', char: 'あ' };

  return (
    <>
      <div className='flex flex-col gap-3'>
        {filter !== 'all' && (
          <div className='flex items-center gap-2 pt-1 text-2xl font-medium'>
            <span className='text-3xl text-(--secondary-color)' lang='ja'>
              {headerText.char}
            </span>
            <span className='text-(--main-color)'>{headerText.label}</span>
          </div>
        )}
        <Info />
        <ActionButton
          onClick={e => {
            e.currentTarget.blur();
            playClick();
            const indices = kana
              .map((k, i) => ({ k, i }))
              .filter(({ k }) => {
                if (k.groupName.startsWith('challenge.')) return false;
                if (filter === 'hiragana') return k.groupName.startsWith('h.');
                if (filter === 'katakana') return k.groupName.startsWith('k.');
                return true;
              })
              .map(({ i }) => i);
            addKanaGroupIndices(indices);
          }}
          className='px-2 py-3'
          borderBottomThickness={14}
          borderRadius='3xl'
        >
          <MousePointer className={cn('fill-current')} />
          Select All Kana
        </ActionButton>
        <KanaCards filter={filter} />
        <SelectionStatusBar />
      </div>
      <TrainingActionBar currentDojo='kana' />
    </>
  );
};

export default KanaMenu;
