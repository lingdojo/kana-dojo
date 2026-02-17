'use client';
import { Fragment, lazy, Suspense, useState, useEffect } from 'react';
import { Link } from '@/core/i18n/routing';
import Banner from './Banner';
import Info from '@/shared/components/Menu/Info';
import NightlyBanner from '@/shared/components/Modals/NightlyBanner';
import {
  ScrollText,
  FileLock2,
  Cookie,
  Sun,
  Moon,
  Heart,
  Sparkle,
  FileDiff,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import { useThemePreferences } from '@/features/Preferences';
import useDecorationsStore from '@/shared/store/useDecorationsStore';
import { useMediaQuery } from 'react-responsive';
import { buttonBorderStyles } from '@/shared/lib/styles';
import { Button } from '@/shared/components/ui/button';

const Decorations = lazy(() => import('./Decorations'));

const MainMenu = () => {
  const [isMounted, setIsMounted] = useState(false);
  const isLG = useMediaQuery({ minWidth: 1024 });

  const { theme, setTheme, isGlassMode } = useThemePreferences();

  const { playClick } = useClick();

  const expandDecorations = useDecorationsStore(
    state => state.expandDecorations,
  );
  const toggleExpandDecorations = useDecorationsStore(
    state => state.toggleExpandDecorations,
  );

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if the user has already dismissed the banner
    const hasDismissed = localStorage.getItem('nightly_banner_dismissed');

    // Only show if they haven't dismissed it yet
    if (!hasDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('nightly_banner_dismissed', 'true');
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const links = [
    {
      name_en: 'Kana',
      name_ja: 'あ',
      href: '/kana',
    },
    {
      name_en: 'Vocab',
      name_ja: '語',
      href: '/vocabulary',
    },
    {
      name_en: 'Kanji',
      name_ja: '字',
      href: '/kanji',
    },

    // {
    //   name_en: 'Sentences',
    //   name_ja: 'цЦЗ',
    //   href: '/sentences'
    // }
  ];

  const legalLinks = [
    { name: 'terms', href: '/terms', icon: ScrollText },
    { name: 'privacy', href: '/privacy', icon: Cookie },
    { name: 'security', href: '/security', icon: FileLock2 },
    { name: 'patch notes', href: '/patch-notes', icon: FileDiff },
    { name: 'credits', href: '/credits', icon: Sparkle },
  ];

  return (
    <div
      className={clsx(
        'flex min-h-[100dvh] max-w-[100dvw] flex-row justify-center',
      )}
    >
      {isMounted && isLG && (
        <Suspense fallback={<></>}>
          {!isGlassMode && (
            <Decorations
              expandDecorations={expandDecorations}
              forceShow={true}
              interactive={true}
            />
          )}
          <Button
            variant='secondary'
            size='icon'
            className={clsx(
              'fixed top-4 right-8 z-50',
              !isGlassMode && 'opacity-90',
              buttonBorderStyles,
              'transition-transform duration-250 active:scale-95',
            )}
            onClick={() => {
              playClick();
              toggleExpandDecorations();
            }}
          >
            <Sparkle />
          </Button>

          {/* <Button
            variant='secondary'
            size='icon'
            className={clsx(
              'fixed top-4 left-4 z-50 opacity-90',
              buttonBorderStyles,
              'transition-transform duration-250 active:scale-95'
            )}
            onClick={() => {
              playClick();
            }}
          >
            <a href='https://monkeytype.com/' rel='noopener' target='_blank'>
              <Keyboard />
            </a>
          </Button>
 */}
        </Suspense>
      )}
      <div
        className={clsx(
          '3xl:w-2/5 flex w-full flex-col items-center gap-4 px-4 pb-16 max-md:pt-4 sm:w-3/4 md:justify-center lg:w-1/2',
          'z-50',
          !isGlassMode && 'opacity-90',
          expandDecorations && 'hidden',
        )}
      >
        <div className='flex w-full flex-row items-center justify-between gap-2 px-1'>
          <Banner />
          <div className='flex w-1/2 flex-row justify-end gap-2 md:w-1/3'>
            {theme === 'dark' ? (
              <Moon
                size={32}
                onClick={() => {
                  playClick();
                  setTheme('light');
                }}
                className={clsx(
                  'duration-250 hover:cursor-pointer',
                  'active:scale-100 active:duration-225',
                  'text-(--secondary-color) hover:text-(--main-color)',
                )}
              />
            ) : (
              <Sun
                size={32}
                onClick={() => {
                  playClick();
                  setTheme('dark');
                }}
                className={clsx(
                  'duration-250 hover:cursor-pointer',
                  'active:scale-100 active:duration-225',
                  'text-(--secondary-color) hover:text-(--main-color)',
                )}
              />
            )}
            {/* <Settings
              size={32}
              className={clsx(
                'hover:cursor-pointer duration-250 hover:scale-120',
                'active:scale-100 active:duration-225'
              )}
              onClick={() => {
                playClick();
                window.open('/settings', '_self');
              }}
            /> */}

            <FontAwesomeIcon
              icon={faDiscord}
              size='2x'
              className={clsx(
                'duration-250 hover:cursor-pointer',
                'active:scale-100 active:duration-225',
                'md:hidden',
                'text-(--secondary-color) hover:text-(--main-color)',
              )}
              onClick={() => {
                playClick();
                window.open('https://discord.gg/CyvBNNrSmb', '_blank');
              }}
            />
            <FontAwesomeIcon
              icon={faGithub}
              size='2x'
              className={clsx(
                'duration-250 hover:cursor-pointer',
                'active:scale-100 active:duration-225',
                'text-(--secondary-color) hover:text-(--main-color)',
              )}
              onClick={() => {
                playClick();
                window.open('https://github.com/lingdojo/kana-dojo', '_blank');
              }}
            />
            <Heart
              size={32}
              className={clsx(
                'duration-250 hover:cursor-pointer',
                'active:scale-100 active:duration-225',
                'animate-bounce fill-current text-red-500',
              )}
              onClick={() => {
                playClick();
                window.open('https://ko-fi.com/kanadojo', '_blank');
              }}
            />
          </div>
        </div>
        <Info />
        <div
          className={clsx(
            'rounded-2xl bg-(--card-color)',
            'duration-250',
            'transition-all ease-in-out',
            'flex flex-col md:flex-row',
            'w-full',
            'max-md:border-b-4 max-md:border-(--border-color)',
            // 'backdrop-blur-xl',
          )}
        >
          {links.map((link, i) => (
            <Fragment key={i}>
              <Link
                href={link.href}
                prefetch
                className={clsx('w-full overflow-hidden')}
              >
                <button
                  className={clsx(
                    'flex h-full w-full text-2xl',
                    'items-center justify-center gap-1.5 border-(--border-color)',
                    'md:border-b-4',
                    'py-8',
                    'group',
                    i === 0 && 'rounded-tl-2xl rounded-bl-2xl',
                    i === links.length - 1 && 'rounded-tr-2xl rounded-br-2xl',
                    'hover:cursor-pointer md:hover:border-(--main-color)/80',
                    'hover:bg-(--border-color)',
                  )}
                  onClick={() => playClick()}
                >
                  <span
                    lang='ja'
                    className='font-normal text-(--secondary-color)'
                  >
                    {link.name_ja}
                  </span>
                  <span lang='en' className=''>
                    {link.name_en}
                  </span>
                </button>
              </Link>

              {i < links.length - 1 && (
                <div
                  className={clsx(
                    'md:h-auto md:w-0 md:border-l-1',
                    'border-(--border-color)',
                    'w-full border-t-1 border-(--border-color)',
                  )}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div
        className={clsx(
          'fixed right-0 bottom-0 left-0 z-50 md:bottom-6',
          'justify-center gap-2 max-md:flex',
          'border-(--border-color) max-md:border-t-2',
          'px-2 py-2 sm:px-4',
          'flex items-center justify-between max-md:bg-(--background-color)',
          expandDecorations && 'hidden',
        )}
      >
        <div className='flex w-full items-center justify-evenly lg:w-2/5'>
          {legalLinks.map((link, i) => (
            <Link
              href={link.href}
              prefetch
              key={i}
              className={clsx(
                'flex flex-row items-center gap-1 text-(--secondary-color) hover:cursor-pointer hover:text-(--main-color)',
                link.name === 'credits' && 'hidden lg:flex',
              )}
              onClick={() => playClick()}
            >
              <link.icon className='size-4' />
              <span className='text-xs'>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
      {/* {showBanner && (
        <NightlyBanner onSwitch={handleSwitch} onDismiss={handleDismiss} />
      )} */}
    </div>
  );
};

export default MainMenu;
