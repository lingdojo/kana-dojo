'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import {
  BookOpen,
  Brain,
  CloudRain,
  House,
  Keyboard,
  Languages,
  Leaf,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  Wind
} from 'lucide-react';
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
      // Don't trigger shortcuts when typing in form elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

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
        'lg:border-r-1 lg:h-auto lg:px-3',
        'lg:pb-12'
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
        <Trophy />
        <span className='max-lg:hidden'>Progress</span>
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
            'shrink-0',
            pathWithoutLocale !== '/preferences' && 'motion-safe:animate-bounce'
          )}
        />
        <span className='max-lg:hidden'>Preferences</span>
      </Link>

      <div className='max-lg:hidden w-full mt-3 px-4 text-xs uppercase  text-[var(--main-color)] opacity-70'>
        Academy
      </div>
      <Link
        href='/academy'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/academy'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <BookOpen className='shrink-0' />
        <span>Guides</span>
      </Link>

      <div className='max-lg:hidden w-full mt-3 px-4 text-xs uppercase  text-[var(--main-color)] opacity-70'>
        Tools
      </div>
      <Link
        href='/translate'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/translate'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Languages className='shrink-0' />
        <span>Translate</span>
      </Link>

      <div className='max-lg:hidden w-full mt-3 px-4 text-xs uppercase  text-[var(--main-color)] opacity-70'>
        Experiments
      </div>
      <Link
        href='/experiments'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Sparkles className='shrink-0' />
        <span>All Experiments</span>
      </Link>
      <Link
        href='/zen'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/zen'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Leaf className='shrink-0' />
        <span>Zen Mode</span>
      </Link>
      <Link
        href='/experiments/breathing'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/breathing'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Wind className='shrink-0' />
        <span>Breathing</span>
      </Link>
      <Link
        href='/experiments/ambient'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/ambient'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Sparkles className='shrink-0' />
        <span>Ambient</span>
      </Link>
      <Link
        href='/experiments/rain'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/rain'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <CloudRain className='shrink-0' />
        <span>Kana Rain</span>
      </Link>
      <Link
        href='/experiments/sound'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/sound'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Volume2 className='shrink-0' />
        <span>Sound Garden</span>
      </Link>
      <Link
        href='/experiments/haiku'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/haiku'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <BookOpen className='shrink-0' />
        <span>Haiku Garden</span>
      </Link>
      <Link
        href='/experiments/constellation'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/constellation'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Star className='shrink-0' />
        <span>Constellation</span>
      </Link>
      <Link
        href='/experiments/typing'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/typing'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Keyboard className='shrink-0' />
        <span>Speed Typing</span>
      </Link>
      <Link
        href='/experiments/memory'
        className={clsx(
          'max-lg:hidden text-xl duration-250 transition-all py-2 px-4 rounded-xl w-full flex items-center gap-2',
          pathWithoutLocale === '/experiments/memory'
            ? 'text-[var(--main-color)] bg-[var(--border-color)] lg:bg-[var(--card-color)]'
            : 'hover:bg-[var(--card-color)] text-[var(--secondary-color)]'
        )}
        onClick={playClick}
      >
        <Brain className='shrink-0' />
        <span>Memory Palace</span>
      </Link>
    </div>
  );
};

export default Sidebar;
