'use client';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';

const Banner = () => {
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  const subheading =
    pathWithoutLocale === '/kana'
      ? 'Kana あ'
      : pathWithoutLocale === '/kanji'
      ? 'Kanji 字'
      : pathWithoutLocale === '/vocabulary'
      ? 'Vocabulary 語'
      : pathWithoutLocale === '/preferences'
      ? 'Preferences 設'
      : '';
  return (
    <h2 className={clsx('text-3xl pt-3 lg:pt-6', 'flex items-center gap-2 overflow-hidden')}>
      <span className="text-[var(--secondary-color)]">
        {subheading.split(' ')[1]}
      </span>
      <span>{subheading.split(' ')[0]}</span>
    </h2>
  );
};

export default Banner;
