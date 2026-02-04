'use client';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faGithub,
  faPatreon,
} from '@fortawesome/free-brands-svg-icons';
import { Coffee, Palette, GitBranch, Type, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import {
  useThemePreferences,
  ThemesModal,
  FontsModal,
} from '@/features/Preferences';
import { useCrazyMode } from '@/features/CrazyMode';
import useDecorationsStore from '@/shared/store/useDecorationsStore';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import PatchNotesModal from '@/features/PatchNotes/components/PatchNotesModal';

import { APP_VERSION_DISPLAY } from '@/shared/lib/constants';

type SocialLink = {
  icon: IconDefinition | LucideIcon;
  url: string;
  type: 'fontawesome' | 'lucide';
  special?: string;
};

const socialLinks: SocialLink[] = [
  {
    icon: faDiscord,
    url: 'https://discord.gg/CyvBNNrSmb',
    type: 'fontawesome',
  },
  {
    icon: faGithub,
    url: 'https://github.com/lingdojo/kana-dojo',
    type: 'fontawesome',
  },
  {
    icon: Coffee,
    url: 'https://ko-fi.com/kanadojo',
    type: 'lucide',
    special: 'donate',
  },
  // {
  //   icon: faPatreon,
  //   url: 'https://www.patreon.com/kanadojo',
  //   type: 'fontawesome'
  // }
];

const MobileBottomBar = () => {
  const { playClick } = useClick();
  const { theme, font } = useThemePreferences();
  const { isCrazyMode, activeThemeId } = useCrazyMode();
  const expandDecorations = useDecorationsStore(
    state => state.expandDecorations,
  );
  const effectiveTheme = isCrazyMode && activeThemeId ? activeThemeId : theme;
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);

  const handleClick = (url: string) => {
    playClick();
    window.open(url, '_blank', 'noopener');
  };

  const handleVersionClick = () => {
    playClick();
    setIsPatchNotesOpen(true);
  };

  const handleThemeClick = () => {
    playClick();
    setIsThemeOpen(true);
  };

  const handleFontClick = () => {
    playClick();
    setIsFontOpen(true);
  };

  const baseIconClasses = clsx(
    'hover:cursor-pointer ',
    'active:scale-100 active:duration-225',
    'text-(--secondary-color) hover:text-(--main-color)',
  );

  const infoItems = [
    {
      icon: Palette,
      text: effectiveTheme.replace('-', ' '),
      onClick: handleThemeClick,
    },
    { icon: Type, text: font.toLowerCase(), onClick: handleFontClick },
    {
      icon: GitBranch,
      text: `v${APP_VERSION_DISPLAY}`,
      onClick: handleVersionClick,
    },
  ];

  return (
    <div
      id='main-bottom-bar'
      className={clsx(
        'fixed right-0 bottom-0 left-0 z-50 max-lg:hidden',
        'border-t-1 border-(--border-color) bg-(--background-color)',
        'flex items-center justify-between px-4 py-1',
        expandDecorations && 'hidden',
      )}
    >
      <div className='flex items-center gap-3'>
        {socialLinks.map((link, idx) => {
          const Icon = link.icon as LucideIcon;
          const isDonate = link.special === 'donate';
          const isPatreon =
            link.type === 'fontawesome' && link.icon === faPatreon;
          const isKofi = link.type === 'lucide' && link.icon === Coffee;

          const pulseClasses = clsx(
            (isKofi || isPatreon) && 'motion-safe:animate-pulse',
            isKofi && '[animation-delay:0ms]',
            isPatreon && '[animation-delay:750ms]',
          );

          return (
            <React.Fragment key={idx}>
              {link.type === 'fontawesome' ? (
                <FontAwesomeIcon
                  icon={link.icon as IconDefinition}
                  size='sm'
                  className={clsx(
                    baseIconClasses,
                    pulseClasses,
                    isPatreon && 'text-blue-500',
                  )}
                  onClick={() => handleClick(link.url)}
                />
              ) : (
                <Icon
                  size={16}
                  className={clsx(
                    baseIconClasses,
                    pulseClasses,
                    isDonate &&
                      'fill-current text-red-500 motion-safe:animate-pulse',
                  )}
                  onClick={() => handleClick(link.url)}
                />
              )}
              {idx === 1 && socialLinks.length > 2 && (
                <span className='text-sm text-(--secondary-color) select-none'>
                  ~
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className='flex items-center gap-2 text-xs text-(--secondary-color)'>
        <span
          className='hidden text-xs text-(--secondary-color) hover:cursor-pointer hover:text-(--main-color) lg:inline-block'
          onClick={() => handleClick('https://ko-fi.com/kanadojo')}
        >
          made with ❤️ by the community
        </span>
        <span className='hidden text-sm text-(--secondary-color) select-none lg:inline-block'>
          ~
        </span>
        {infoItems.map((item, idx) => {
          const content = (
            <span
              className='flex gap-1 hover:cursor-pointer hover:text-(--main-color)'
              onClick={item.onClick}
            >
              <item.icon size={16} />
              {item.text}
            </span>
          );

          return (
            <React.Fragment key={idx}>
              {content}
              {idx < infoItems.length - 1 && (
                <span className='text-sm text-(--secondary-color) select-none'>
                  ~
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <PatchNotesModal
        open={isPatchNotesOpen}
        onOpenChange={setIsPatchNotesOpen}
      />
      <ThemesModal open={isThemeOpen} onOpenChange={setIsThemeOpen} />
      <FontsModal open={isFontOpen} onOpenChange={setIsFontOpen} />
    </div>
  );
};

export default MobileBottomBar;
