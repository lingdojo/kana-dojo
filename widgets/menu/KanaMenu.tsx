'use client';

import { useState } from 'react';
import Info from '@/shared/ui-composite/Menu/Info';
import TrainingActionBar from '@/shared/ui-composite/Menu/TrainingActionBar';
import SelectionStatusBar from '@/shared/ui-composite/Menu/SelectionStatusBar';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import { LayoutGrid, List, MousePointer } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { KanaCards, useKanaContent, useKanaSelection } from '@/features/Kana';

type KanaMenuFilter = 'all' | 'hiragana' | 'katakana';

const KanaMenu = ({ filter = 'all' }: { filter?: KanaMenuFilter }) => {
  const { playClick } = useClick();
  const { addGroups: addKanaGroupIndices } = useKanaSelection();
  const { allGroups: kana } = useKanaContent();
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');

  return (
    <>
      <div className='flex flex-col gap-3'>
        <Info />
        <div className='flex w-full flex-row items-center gap-2'>
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
            className='flex-1 px-2 py-3'
            borderBottomThickness={14}
            borderRadius='3xl'
          >
            <MousePointer className={cn('fill-current')} />
            Select All Kana
          </ActionButton>
          <ActionButton
            onClick={() => {
              playClick();
              setViewMode(v => v === 'full' ? 'compact' : 'full');
            }}
            className='w-auto self-stretch px-8 py-3'
            borderBottomThickness={14}
            borderRadius='3xl'
            colorScheme='secondary'
            borderColorScheme='secondary'
          >
            {viewMode === 'full' ? <LayoutGrid size={22} fill='currentColor' /> : <List size={22} />}
          </ActionButton>
        </div>
        <KanaCards filter={filter} viewMode={viewMode} />
        <SelectionStatusBar />
      </div>
      <TrainingActionBar currentDojo='kana' />
    </>
  );
};

export default KanaMenu;
