'use client';

import { Link, usePathname } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { cn } from '@/shared/utils/utils';
import clsx from 'clsx';
import {
  Sparkles,
  House,
  BookOpen,
  Library,
  Languages,
  Repeat,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import { motion } from 'framer-motion';

type NavItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
  charIcon?: string;
};

export default function TopBar() {
  const { playClick } = useClick();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Find the scroll container (ClientLayout div with data-scroll-restoration-id)
    const scrollContainer = document.querySelector(
      '[data-scroll-restoration-id="container"]',
    );

    if (!scrollContainer) {
      console.warn(
        'Scroll container not found, TopBar scroll behavior disabled',
      );
      return;
    }

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;

      // Always show when at top of page
      if (currentScrollY <= 10) {
        setIsVisible(true);
      }
      // Hide when scrolling down past threshold
      else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      }
      // Show when scrolling up
      else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Determine which tab to show based on current route
  const getContextTab = () => {
    if (pathWithoutLocale.startsWith('/resources')) {
      return { name: 'Resources', href: '/resources', icon: Library };
    } else if (pathWithoutLocale.startsWith('/translate')) {
      return { name: 'Translate', href: '/translate', icon: Languages };
    } else if (pathWithoutLocale.startsWith('/conjugate')) {
      return { name: 'Conjugate', href: '/conjugate', icon: Repeat };
    } else if (pathWithoutLocale.startsWith('/anki-converter')) {
      return { name: 'Converter', href: '/anki-converter', icon: Package };
    }
    // Default to Academy
    return { name: 'Academy', href: '/academy', icon: BookOpen };
  };

  const contextTab = getContextTab();

  const navItems: NavItem[] = [
    contextTab,
    { name: 'Kana', href: '/kana', charIcon: 'あ' },
    { name: 'Kanji', href: '/kanji', charIcon: '字' },
    { name: 'Vocab', href: '/vocabulary', charIcon: '語' },
    { name: 'Preferences', href: '/preferences', icon: Sparkles },
  ];

  const mobileNavItems: NavItem[] = [
    { name: 'Home', href: '/', icon: House },
    contextTab,
    { name: 'Kana', href: '/kana', charIcon: 'あ' },
    { name: 'Vocab', href: '/vocabulary', charIcon: '語' },
    { name: 'Kanji', href: '/kanji', charIcon: '字' },
    { name: 'Preferences', href: '/preferences', icon: Sparkles },
  ];

  const isActive = (href: string) => {
    if (href === '/kana') {
      return (
        pathWithoutLocale === href || pathWithoutLocale.startsWith('/kana/')
      );
    }
    return pathWithoutLocale === href;
  };

  return (
    <>
      {/* Desktop Top Bar */}
      <motion.nav
        initial={false}
        animate={{
          y: isVisible ? 0 : '-100%',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className='fixed top-0 right-0 left-0 z-50 border-b-2 border-dashed border-(--border-color) bg-(--background-color) max-lg:hidden'
      >
        <div className='flex h-20 items-center justify-between px-4 md:px-6'>
          {/* Logo */}
          <Link
            href='/'
            onClick={() => playClick()}
            className='flex items-center gap-3 text-lg font-medium text-(--main-color) transition-opacity hover:opacity-80'
          >
            <span className='text-3xl'>KanaDojo</span>
            <span className='text-3xl text-(--secondary-color)'>かな道場</span>
          </Link>

          {/* Navigation Links */}
          <div className='flex items-center gap-1'>
            {navItems.map((item, index) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => playClick()}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-colors',
                    active
                      ? 'bg-(--card-color) text-(--main-color)'
                      : 'text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)',
                  )}
                >
                  {item.charIcon ? (
                    <span
                      className={clsx(
                        'inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg',
                        'bg-(--secondary-color) text-(--background-color)',
                        'border-b-4 border-(--secondary-color-accent)',
                        'transition-all duration-200',
                        'motion-safe:animate-float [--float-distance:-3px]',
                        index === 1 && '[animation-delay:0ms]',
                        index === 2 && '[animation-delay:800ms]',
                        index === 3 && '[animation-delay:1600ms]',
                      )}
                    >
                      {item.charIcon}
                    </span>
                  ) : (
                    item.icon && (
                      <span
                        className={clsx(
                          'inline-flex h-9 w-9 items-center justify-center rounded-xl',
                          'bg-(--secondary-color) text-(--background-color)',
                          'border-b-4 border-(--secondary-color-accent)',
                          'transition-all duration-200',
                          'motion-safe:animate-float [--float-distance:-3px]',
                          index === 0 && '[animation-delay:0ms]',
                          index === 4 && '[animation-delay:2400ms]',
                        )}
                      >
                        <item.icon className='size-4' />
                      </span>
                    )
                  )}
                  <span className={cn('text-xl text-(--main-color)')}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Bar */}
      <motion.aside
        initial={false}
        animate={{
          y: isVisible ? 0 : '100%',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className='fixed bottom-0 z-50 flex w-full items-center justify-evenly border-t-2 border-(--border-color) bg-(--card-color) py-2 lg:hidden'
      >
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href} className='relative'>
              {/* Sliding indicator - smooth spring animation */}
              {active && (
                <motion.div
                  layoutId='mobile-nav-indicator'
                  className='absolute inset-0 rounded-2xl'
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className='motion-safe:animate-float h-full w-full rounded-xl border-b-6 border-(--main-color-accent) bg-(--main-color) [--float-distance:-3.5px]' />
                </motion.div>
              )}
              <Link
                href={item.href}
                prefetch
                onClick={playClick}
                className={clsx(
                  'relative z-10 flex items-center justify-center rounded-2xl px-3 py-2 text-2xl transition-all duration-250',
                  active &&
                    'motion-safe:animate-float [--float-distance:-3.5px]',
                  active
                    ? 'text-(--background-color)'
                    : 'text-(--secondary-color)',
                )}
              >
                {item.charIcon
                  ? item.charIcon
                  : Icon && <Icon className='shrink-0' />}
              </Link>
            </div>
          );
        })}
      </motion.aside>
    </>
  );
}

