'use client';
import clsx from 'clsx';
import TopBar from '@/shared/components/Menu/TopBar';
import { useEffect } from 'react';
import Sidebar from '@/shared/components/Menu/Sidebar';
import Info from '@/shared/components/Menu/Info';
import KanaCards from '@/features/Kana/components/KanaCards';
import Banner from '@/shared/components/Menu/Banner';
import CollectionSelector from '@/shared/components/Menu/CollectionSelector';
import KanjiCards from '@/features/Kanji/components';
import { usePathname } from 'next/navigation';
import VocabCards from '@/features/Vocabulary/components';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import SelectionStatusBar from '@/shared/components/Menu/SelectionStatusBar';

const DojoMenu = () => {
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  useEffect(() => {
    // clearKanji();
    // clearWords();
  }, []);

  return (
    <div className='min-h-[100dvh] max-w-[100dvw] lg:pr-20 flex gap-4'>
      <Sidebar />
      <div
        className={clsx(
          'flex flex-col gap-4',
          'w-full lg:w-4/5 lg:px-0 px-4 md:px-8 ',
          'pb-20'
        )}
      >
        <Banner />

        {pathWithoutLocale === '/kana' ? (
          <div className='flex flex-col gap-3'>
            <Info />
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
        <TopBar currentDojo={pathWithoutLocale.slice(1)} />
      </div>
    </div>
  );
};

export default DojoMenu;
