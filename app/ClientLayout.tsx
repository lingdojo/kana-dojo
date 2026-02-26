'use client';
import clsx from 'clsx';
import { useState, useEffect, startTransition, useMemo } from 'react';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useCrazyMode } from '@/features/CrazyMode';
import { useShallow } from 'zustand/react/shallow';
import { usePathname } from 'next/navigation';
import { ScrollRestoration } from 'next-scroll-restoration';
import WelcomeModal from '@/shared/components/Modals/WelcomeModal';
import {
  AchievementNotificationContainer,
  AchievementIntegration,
} from '@/features/Achievements/components';
import {
  applyTheme,
  isPremiumThemeId,
  getThemeDefaultWallpaperId,
} from '@/features/Preferences/data/themes/themes';
import { getWallpaperById } from '@/features/Preferences/data/wallpapers/wallpapers';
import BackToTop from '@/shared/components/navigation/BackToTop';
import MobileBottomBar from '@/shared/components/layout/BottomBar';
import { useVisitTracker } from '@/features/Progress/hooks/useVisitTracker';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import GlobalAudioController from '@/shared/components/layout/GlobalAudioController';
import { useClick } from '@/shared/hooks/useAudio';
import ServiceWorkerRegistration from '@/shared/components/ServiceWorkerRegistration';
import CursorTrailRenderer from '@/features/Preferences/components/CursorTrailRenderer';
import ClickEffectRenderer from '@/features/Preferences/components/ClickEffectRenderer';

// Initialize adaptive selector early to load persisted weights from IndexedDB
// This runs once at module load time, ensuring weights are ready before games start
if (typeof window !== 'undefined') {
  const selector = getGlobalAdaptiveSelector();
  selector.ensureLoaded().catch(console.error);
}

// Define a type for the font object for clarity, adjust as needed
type FontObject = {
  name: string;
  font: {
    className: string;
  };
};

// Module-level cache for fonts (persists across component remounts)
let fontsCache: FontObject[] | null = null;
let fontsLoadingPromise: Promise<FontObject[]> | null = null;

const loadFontsModule = async (): Promise<FontObject[]> => {
  if (fontsCache) return fontsCache;
  if (fontsLoadingPromise) return fontsLoadingPromise;

  fontsLoadingPromise = import('@/features/Preferences/data/fonts/fonts').then(
    module => {
      fontsCache = module.default;
      fontsLoadingPromise = null;
      return module.default;
    },
  );

  return fontsLoadingPromise;
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Redundant comment for deployment trigger
  // Trigger redeployment - 2026-02-08
  // Redundant no-op comment to force a fresh Vercel deployment
  const { theme, font } = usePreferencesStore(
    useShallow(state => ({ theme: state.theme, font: state.font })),
  );

  // Crazy Mode Integration
  const { isCrazyMode, activeThemeId, activeFontName, randomize } =
    useCrazyMode();

  // Determine effective theme and font
  const effectiveTheme = isCrazyMode && activeThemeId ? activeThemeId : theme;
  const effectiveFont = isCrazyMode && activeFontName ? activeFontName : font;

  // 3. Create state to hold the fonts module
  const [fontsModule, setFontsModule] = useState<FontObject[] | null>(null);

  // Memoize fontClassName calculation to prevent recalculation on every render (5-10ms savings)
  const fontClassName = useMemo(() => {
    if (!fontsModule) return '';
    return (
      fontsModule.find((fontObj: FontObject) => effectiveFont === fontObj.name)
        ?.font.className || ''
    );
  }, [fontsModule, effectiveFont]);

  useEffect(() => {
    startTransition(() => {
      applyTheme(effectiveTheme); // This now sets both CSS variables AND data-theme attribute
    });

    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, [effectiveTheme]);

  // Trigger randomization on page navigation
  const pathname = usePathname();
  useEffect(() => {
    if (isCrazyMode) {
      randomize();
    }
  }, [pathname, isCrazyMode, randomize]);

  // Load fonts using cached loader - only in production
  useEffect(() => {
    let isMounted = true;

    const initFonts = async () => {
      try {
        const fonts = await loadFontsModule();
        if (isMounted) {
          setFontsModule(fonts);
        }
      } catch (err) {
        console.error('Failed to dynamically load fonts:', err);
      }
    };

    void initFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Track user visits for streak feature
  useVisitTracker();

  // Global typing sound: play click when user types in any input element.
  // playClick already respects the global silentMode setting via useAudioPreferences,
  // so the effect re-registers automatically whenever that preference changes.
  const { playClick } = useClick();
  useEffect(() => {
    const IGNORED_KEYS = new Set([
      'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape', 'Enter',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'CapsLock',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    ]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || IGNORED_KEYS.has(e.key)) return;
      const el = document.activeElement;
      if (!el) return;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable) {
        playClick();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playClick]);

  // Note: Web Audio API context resumption is handled in useAudio.ts

  return (
    <div
      data-scroll-restoration-id='container'
      className={clsx(
        'min-h-[100dvh] max-w-[100dvw] bg-(--background-color) text-(--main-color)',
        fontClassName,
      )}
      style={{
        height: '100dvh',
        overflowY: 'auto',
        ...(() => {
          if (!isPremiumThemeId(effectiveTheme)) return {};

          const wallpaperId = getThemeDefaultWallpaperId(effectiveTheme);
          if (!wallpaperId) return {};

          const wallpaper = getWallpaperById(wallpaperId);
          if (!wallpaper) return {};

          // Use image-set for AVIF + WebP fallback
          const backgroundImage = wallpaper.urlWebp
            ? `image-set(url('${wallpaper.url}') type('image/avif'), url('${wallpaper.urlWebp}') type('image/webp'))`
            : `url('${wallpaper.url}')`;

          return {
            backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          };
        })(),
      }}
    >
      <GlobalAudioController />
      <ServiceWorkerRegistration />
      <CursorTrailRenderer />
      <ClickEffectRenderer />
      {children}
      <ScrollRestoration />
      <WelcomeModal />
      <AchievementNotificationContainer />
      <AchievementIntegration />
      <BackToTop />
      <MobileBottomBar />
    </div>
  );
}
