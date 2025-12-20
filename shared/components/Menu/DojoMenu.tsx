'use client';
import clsx from 'clsx';
import TrainingActionBar from '@/shared/components/Menu/TrainingActionBar';
import Info from '@/shared/components/Menu/Info';
import KanaCards from '@/features/Kana/components/KanaCards';
import CollectionSelector from '@/shared/components/Menu/CollectionSelector';
import KanjiCards from '@/features/Kanji/components';
import { usePathname } from 'next/navigation';
import VocabCards from '@/features/Vocabulary/components';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import SelectionStatusBar from '@/shared/components/Menu/SelectionStatusBar';
import { ActionButton } from '@/shared/components/ui/ActionButton';
import { MousePointer } from 'lucide-react';
import { kana } from '@/features/Kana/data/kana';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import { useClick } from '@/shared/hooks/useAudio';
import SidebarLayout from '@/shared/components/layout/SidebarLayout';

const DojoMenu = () => {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const addKanaGroupIndices = useKanaStore(state => state.addKanaGroupIndices);

  return (
    <SidebarLayout>
      {pathWithoutLocale === '/kana' ? (
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
            borderBottomThickness={8}
          >
            <MousePointer />
            Select All Kana
          </ActionButton>
          <KanaCards />
          <SelectionStatusBar />
        </div>
      ) : pathWithoutLocale === '/kanji' ? (
        <div className='flex flex-col gap-3'>
          <Info />
          <CollectionSelector />
          <KanjiCards />
        </div>
      ) : pathWithoutLocale === '/vocabulary' ? (
        <div className='flex flex-col gap-3'>
          <Info />
          <CollectionSelector />
          <VocabCards />
        </div>
      ) : null}
      <TrainingActionBar currentDojo={pathWithoutLocale.slice(1)} />
    </SidebarLayout>
  );
};

export default DojoMenu;
