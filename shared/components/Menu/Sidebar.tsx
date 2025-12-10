'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import { House, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { useEffect, useRef } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  const hotkeysOn = usePreferencesStore(state => state.hotkeysOn);

  const { playClick } = useClick();

  const escButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        escButtonRef.current?.click();
      } else if (event.key.toLowerCase() === 'h') {
        router.push('/');
      } else if (event.key.toLowerCase() === 'p') {
        router.push('/preferences');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, router]);

  return (
    <div
      id='main-sidebar'
      className={clsx(
        'flex lg:flex-col lg:items-start lg:gap-2',
        'lg:w-1/5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto',
        'lg:pt-6',
        'max-lg:fixed max-lg:bottom-0 max-lg:w-full',
        'max-lg:bg-[var(--card-color)]',
        'z-50',
        'max-lg:border-t-2 border-[var(--border-color)] max-lg:py-2 max-lg:justify-evenly max-lg:items-center',
        'lg:border-r-1 lg:h-auto lg:w-0 lg:px-3'
      )}
    >
      <h1
        className={clsx(
          'flex gap-1.5 items-center text-3xl pl-4',
          'max-lg:hidden max-3xl:flex-col max-3xl:items-start'
        )}
      >
        <span className='font-bold'>KanaDojo</span>
        <span className={clsx('font-normal text-[var(--secondary-color)]')}>
          かな道場️
        </span>
      </h1>
      <Link
        href='/'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:p-3 rounded-xl  lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <House className='' />
        <span className='max-lg:hidden'>Home</span>
      </Link>
      <Link
        href='/kana'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl  lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/kana'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        あ<span className='max-lg:hidden'>Kana</span>
      </Link>

      <Link
        href='/vocabulary'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/vocabulary'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        語<span className='max-lg:hidden'> Vocabulary</span>
      </Link>
      <Link
        href='/kanji'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/kanji'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        字<span className='max-lg:hidden'> Kanji</span>
      </Link>
      <Link
        href='/progress'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/progress'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <TrendingUp />
        <span className='max-lg:hidden'>Progress</span>
      </Link>
      <Link
        href='/achievements'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/achievements'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Trophy />
        <span className='max-lg:hidden'>Achievements</span>
      </Link>
      <Link
        href='/preferences'
        className={clsx(
          'text-2xl  duration-250 transition-all lg:py-2 lg:px-4 max-lg:px-3 max-lg:py-2 rounded-xl lg:w-full flex max-lg:justify-center items-center gap-2',
          pathWithoutLocale === '/preferences'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Sparkles
          // size={32}
          className={clsx(
            pathWithoutLocale !== '/preferences' && 'motion-safe:animate-bounce'
          )}
        />
        <span className='max-lg:hidden'>Preferences</span>
      </Link>
    </div>
  );
};

export default Sidebar;
