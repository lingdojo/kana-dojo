'use client';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDiscord,
  faGithub,
  faPatreon
} from '@fortawesome/free-brands-svg-icons';
import { Coffee, Palette, GitBranch, Type, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import useCrazyModeStore from '@/features/CrazyMode/store/useCrazyModeStore';
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
    icon: faGithub,
    url: 'https://github.com/lingdojo/kana-dojo',
    type: 'fontawesome'
  },
  {
    icon: faDiscord,
    url: 'https://discord.gg/CyvBNNrSmb',
    type: 'fontawesome'
  },
  {
    icon: Coffee,
    url: 'https://ko-fi.com/kanadojo',
    type: 'lucide',
    special: 'donate'
  },
  {
    icon: faPatreon,
    url: 'https://www.patreon.com/kanadojo',
    type: 'fontawesome'
  }
];

const MobileBottomBar = () => {
  const { playClick } = useClick();
  const theme = usePreferencesStore(state => state.theme);
  const font = usePreferencesStore(state => state.font);
  const isCrazyMode = useCrazyModeStore(state => state.isCrazyMode);
  const activeThemeId = useCrazyModeStore(state => state.activeThemeId);
  const expandDecorations = useDecorationsStore(
    state => state.expandDecorations
  );
  const effectiveTheme = isCrazyMode && activeThemeId ? activeThemeId : theme;
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);

  const handleClick = (url: string) => {
    playClick();
    window.open(url, '_blank', 'noopener');
  };

  const handleVersionClick = () => {
    playClick();
    setIsPatchNotesOpen(true);
  };

  const baseIconClasses = clsx(
    'hover:cursor-pointer ',
    'active:scale-100 active:duration-225',
    'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
  );

  const infoItems = [
    { icon: Palette, text: effectiveTheme.replace('-', ' ') },
    { icon: Type, text: font.toLowerCase() },
    { icon: GitBranch, text: `v${APP_VERSION_DISPLAY}` }
  ];

  return (
    <div
      id='main-bottom-bar'
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50 max-lg:hidden',
        'bg-[var(--background-color)] border-t-1 border-[var(--border-color)]',
        'px-4 py-1 flex items-center justify-between',
        expandDecorations && 'hidden'
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
            isPatreon && '[animation-delay:750ms]'
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
                    isPatreon && 'text-blue-500 '
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
                      'motion-safe:animate-pulse text-red-500 fill-current '
                  )}
                  onClick={() => handleClick(link.url)}
                />
              )}
              {idx === 1 && socialLinks.length > 2 && (
                <span className='text-sm text-[var(--secondary-color)] select-none'>
                  ~
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className='flex items-center gap-2 text-xs text-[var(--secondary-color)]'>
        <span className='hidden lg:inline-block text-xs text-[var(--secondary-color)]'>
          made with ❤️ by the community
        </span>
        <span className='hidden lg:inline-block text-sm text-[var(--secondary-color)] select-none'>
          ~
        </span>
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
                <span
                  className='flex gap-1 hover:text-[var(--main-color)] hover:cursor-pointer '
                  onClick={handleVersionClick}
                >
                  <item.icon size={16} />
                  {item.text}
                </span>
              ) : (
                content
              )}
              {idx < infoItems.length - 1 && (
                <span className='text-sm text-[var(--secondary-color)] select-none'>
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
    </div>
  );
};

export default MobileBottomBar;
