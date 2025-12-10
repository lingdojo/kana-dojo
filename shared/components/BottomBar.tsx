'use client';
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  Keyboard,
  Mountain,
  Heart,
  Palette,
  GitBranch,
  Type,
  LucideIcon
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import useCrazyModeStore from '@/features/CrazyMode/store/useCrazyModeStore';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const APP_VERSION = '0.1.9 (alpha)';

type SocialLink = {
  icon: IconDefinition | LucideIcon;
  url: string;
  type: 'fontawesome' | 'lucide';
  special?: string;
};

const socialLinks: SocialLink[] = [
  {
    icon: faGithub,
    url: 'https://github.com/lingdojo/kana-dojo',
    type: 'fontawesome'
  },
  {
    icon: faDiscord,
    url: 'https://discord.gg/CyvBNNrSmb',
    type: 'fontawesome'
  },
  { icon: Keyboard, url: 'https://monkeytype.com', type: 'lucide' },
  { icon: Mountain, url: 'https://hanabira.org', type: 'lucide' },
  {
    icon: Heart,
    url: 'https://ko-fi.com/kanadojo',
    type: 'lucide',
    special: 'donate'
  }
];

const MobileBottomBar = () => {
  const { playClick } = useClick();
  const theme = usePreferencesStore(state => state.theme);
  const font = usePreferencesStore(state => state.font);
  const isCrazyMode = useCrazyModeStore(state => state.isCrazyMode);
  const activeThemeId = useCrazyModeStore(state => state.activeThemeId);
  const effectiveTheme = isCrazyMode && activeThemeId ? activeThemeId : theme;

  const handleClick = (url: string) => {
    playClick();
    window.open(url, '_blank', 'noopener');
  };

  const baseIconClasses = clsx(
    'hover:cursor-pointer ',
    'active:scale-100 active:duration-225',
    'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
  );

  const infoItems = [
    { icon: Palette, text: effectiveTheme.replace('-', ' ') },
    { icon: Type, text: font.toLowerCase() },
    { icon: GitBranch, text: `v${APP_VERSION}` }
  ];

  return (
    <div
      id='main-bottom-bar'
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50 max-md:hidden',
        'bg-[var(--background-color)] border-t-1 border-[var(--border-color)]',
        'px-4 py-1 flex items-center justify-between'
      )}
    >
      <div className='flex items-center gap-3'>
        {socialLinks.map((link, idx) => {
          const Icon = link.icon as LucideIcon;
          const isDonate = link.special === 'donate';

          return link.type === 'fontawesome' ? (
            <FontAwesomeIcon
              key={idx}
              icon={link.icon as IconDefinition}
              size='sm'
              className={baseIconClasses}
              onClick={() => handleClick(link.url)}
            />
          ) : (
            <Icon
              key={idx}
              size={16}
              className={clsx(
                baseIconClasses,
                isDonate &&
                  'motion-safe:animate-pulse text-red-500 fill-current hover:text-red-500'
              )}
              onClick={() => handleClick(link.url)}
            />
          );
        })}
      </div>

      <div className='flex items-center gap-2 text-xs text-[var(--secondary-color)]'>
        {infoItems.map((item, idx) => {
          const isVersionItem = idx === infoItems.length - 1;
          const content = (
            <span className='flex gap-1'>
              <item.icon size={16} />
              {item.text}
            </span>
          );

          return (
            <React.Fragment key={idx}>
              {isVersionItem ? (
                <Link
                  href='/patch-notes'
                  className='flex gap-1 hover:text-[var(--main-color)] hover:cursor-pointer '
                  onClick={playClick}
                >
                  <item.icon size={16} />
                  {item.text}
                </Link>
              ) : (
                content
              )}
              {idx < infoItems.length - 1 && <span>~</span>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomBar;
