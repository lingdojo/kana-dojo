'use client';

import {
  applyTheme,
  isPremiumThemeId,
  getWallpaperStyles,
  getThemeDefaultWallpaperId,
} from '@/features/Preferences/data/themes';
import { getWallpaperById } from '@/features/Preferences/data/wallpapers';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { memo, useCallback, useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ThemesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Local type definitions for lazy-loaded themes
interface Theme {
  id: string;
  backgroundColor: string;
  cardColor: string;
  borderColor: string;
  mainColor: string;
  secondaryColor: string;
}

interface ThemeGroup {
  name: string;
  icon: LucideIcon;
  themes: Theme[];
}

interface ThemeCardProps {
  theme: {
    id: string;
    backgroundColor: string;
    cardColor: string;
    borderColor: string;
    mainColor: string;
    secondaryColor: string;
  };
  isSelected: boolean;
  onClick: (id: string) => void;
}

const CHAOS_THEME_GRADIENT = `linear-gradient(
  142deg,
  oklch(66.0% 0.18 25.0 / 1) 0%,
  oklch(72.0% 0.22 80.0 / 1) 12%,
  oklch(68.0% 0.20 145.0 / 1) 24%,
  oklch(70.0% 0.19 200.0 / 1) 36%,
  oklch(67.0% 0.18 235.0 / 1) 48%,
  oklch(73.0% 0.22 290.0 / 1) 60%,
  oklch(69.0% 0.21 330.0 / 1) 74%,
  oklch(74.0% 0.20 355.0 / 1) 88%,
  oklch(66.0% 0.18 25.0 / 1) 100%
)`;

const ThemeCard = memo(function ThemeCard({
  theme,
  isSelected,
  onClick,
}: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const selectedWallpaperId = usePreferencesStore(
    state => state.selectedWallpaperId,
  );
  const customWallpapers = usePreferencesStore(state => state.customWallpapers);

  const themeName = theme.id.replaceAll('-', ' ');
  const isChaosTheme = theme.id === '?';
  const isPremiumTheme = isPremiumThemeId(theme.id);

  // Check if theme has a default wallpaper (premium themes)
  const themeWallpaperId = getThemeDefaultWallpaperId(theme.id);
  const wallpaperIdToUse = themeWallpaperId || selectedWallpaperId;

  const wallpaper = wallpaperIdToUse
    ? getWallpaperById(wallpaperIdToUse, customWallpapers)
    : undefined;

  const background = isChaosTheme
    ? CHAOS_THEME_GRADIENT
    : isHovered
      ? theme.cardColor
      : theme.backgroundColor;

  const wallpaperStyles = wallpaper
    ? getWallpaperStyles(wallpaper.url, isHovered)
    : {};

  return (
    <div
      className='cursor-pointer rounded-lg p-3'
      style={{
        ...(wallpaper ? wallpaperStyles : { background }),
        border: isSelected
          ? `1px solid ${theme.mainColor}`
          : `1px solid ${theme.borderColor}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(theme.id)}
    >
      <div className='mb-2'>
        {isChaosTheme ? (
          <span className='relative flex items-center justify-center text-sm text-white capitalize'>
            <span
              className='absolute left-1/2 -translate-x-1/2'
              style={{ color: isSelected ? '#000' : 'transparent' }}
            >
              {'\u2B24'}
            </span>
            <span className='opacity-0'>?</span>
          </span>
        ) : (
          <span
            className='text-sm capitalize'
            style={{ color: theme.mainColor }}
          >
            {isSelected && '\u2B24 '}
            {themeName}
          </span>
        )}
      </div>
      <div
        className='flex min-h-4 gap-1.5'
        style={{ visibility: isChaosTheme ? 'hidden' : 'visible' }}
      >
        <div
          className={`h-4 w-4 rounded-full ${isPremiumTheme ? 'hidden' : ''}`}
          style={{ background: theme.mainColor }}
        />
        <div
          className={`h-4 w-4 rounded-full ${isPremiumTheme ? 'hidden' : ''}`}
          style={{ background: theme.secondaryColor }}
        />
      </div>
    </div>
  );
});

export default function ThemesModal({ open, onOpenChange }: ThemesModalProps) {
  const { playClick } = useClick();
  const selectedTheme = usePreferencesStore(state => state.theme);
  const setSelectedTheme = usePreferencesStore(state => state.setTheme);

  // Lazy load themes
  const [themeSets, setThemeSets] = useState<ThemeGroup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (open && !isLoaded) {
      import('@/features/Preferences/data/themes').then(module => {
        setThemeSets(module.default);
        setIsLoaded(true);
      });
    }
  }, [open, isLoaded]);

  const handleThemeClick = useCallback(
    (themeId: string) => {
      playClick();
      setSelectedTheme(themeId);
      applyTheme(themeId);
    },
    [playClick, setSelectedTheme],
  );

  const handleClose = useCallback(() => {
    playClick();
    onOpenChange(false);
  }, [playClick, onOpenChange]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DialogPrimitive.Content
          className='fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 rounded-2xl border-0 border-(--border-color) bg-(--background-color) p-0 sm:max-h-[80vh] sm:w-[90vw]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className='sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl border-b border-(--border-color) bg-(--background-color) px-6 pt-6 pb-4'>
            <DialogPrimitive.Title className='text-2xl font-semibold text-(--main-color)'>
              Themes
            </DialogPrimitive.Title>
            <button
              onClick={handleClose}
              className='shrink-0 rounded-xl p-2 hover:cursor-pointer hover:bg-(--card-color)'
            >
              <X size={24} className='text-(--secondary-color)' />
            </button>
          </div>
          <div id='modal-scroll' className='flex-1 overflow-y-auto px-6 py-6'>
            <div className='space-y-6'>
              {themeSets.map(group => {
                const Icon = group.icon;
                return (
                  <div key={group.name} className='space-y-3'>
                    <div className='flex items-center gap-2 text-lg font-medium text-(--main-color)'>
                      <Icon size={20} />
                      {group.name}
                      {/* <span className='text-sm font-normal text-(--secondary-color)'>
                        ({group.themes.length})
                      </span> */}
                    </div>
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
                      {group.themes.map(theme => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          isSelected={selectedTheme === theme.id}
                          onClick={handleThemeClick}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
