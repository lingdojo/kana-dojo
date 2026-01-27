'use client';

import Info from '@/shared/components/Menu/Info';
import TrainingActionBar from '@/shared/components/Menu/TrainingActionBar';
import SelectionStatusBar from '@/shared/components/Menu/SelectionStatusBar';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { MousePointer } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useClick } from '@/shared/hooks/useAudio';
import { KanaCards, useKanaContent, useKanaSelection } from '@/features/Kana';

const KanaMenu = () => {
  const { playClick } = useClick();
  const { addGroups: addKanaGroupIndices } = useKanaSelection();
  const { allGroups: kana } = useKanaContent();

  return (
    <>
      <div className='flex flex-col gap-3'>
        <Info />
        <ActionButton
          onClick={e => {
            e.currentTarget.blur();
            playClick();
            const indices = kana
              .map((k, i) => ({ k, i }))
              .filter(({ k }) => !k.groupName.startsWith('challenge.'))
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
        <KanaCards />
        <SelectionStatusBar />
      </div>
      <TrainingActionBar currentDojo='kana' />
    </>
  );
};

export default KanaMenu;
