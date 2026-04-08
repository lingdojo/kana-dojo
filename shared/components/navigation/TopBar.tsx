'use client';

import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';
import {
  BookOpen,
  Sparkles,
  Languages,
  GraduationCap,
  TrendingUp,
  Settings,
  FlaskConical,
} from 'lucide-react';

export default function TopBar() {
  const { playClick } = useClick();

  const navItems = [
    { name: 'Kana', href: '/kana', icon: BookOpen },
    { name: 'Kanji', href: '/kanji', icon: Sparkles },
    { name: 'Vocab', href: '/vocabulary', icon: Languages },
    { name: 'Practice', href: '/kana-chart', icon: GraduationCap },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Preferences', href: '/preferences', icon: Settings },
    { name: 'Labs', href: '/experiments', icon: FlaskConical },
  ];

  return (
    <nav className='fixed top-0 right-0 left-0 z-50 border-b border-(--border-color) bg-(--background-color)/95 backdrop-blur-sm'>
      <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6'>
        {/* Logo */}
        <Link
          href='/'
          onClick={() => playClick()}
          className='flex items-center gap-2 text-lg font-bold text-(--main-color) transition-opacity hover:opacity-80'
        >
          <span className='text-xl'>KanaDojo</span>
          <span className='text-xs text-(--secondary-color)'>かな道場</span>
        </Link>

        {/* Navigation Links */}
        <div className='hidden items-center gap-1 md:flex'>
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => playClick()}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                'text-(--secondary-color) hover:bg-(--border-color) hover:text-(--main-color)',
              )}
            >
              <item.icon className='size-4' />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2'>
          {/* Ko-fi Button - Commented out for now */}
          {/* <a
            href='https://ko-fi.com/kanadojo'
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => playClick()}
            className='rounded-lg border border-(--border-color) bg-(--background-color) px-3 py-1.5 text-sm font-medium text-(--main-color) transition-colors hover:bg-(--border-color)'
          >
            Ko-fi
          </a> */}

          {/* Patreon Button - Commented out for now */}
          {/* <a
            href='https://patreon.com/kanadojo'
            target='_blank'
            rel='noopener noreferrer'
            onClick={() => playClick()}
            className='rounded-lg bg-(--main-color) px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90'
          >
            Patreon
          </a> */}
        </div>
      </div>
    </nav>
  );
}
