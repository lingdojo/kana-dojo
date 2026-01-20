'use client';
import clsx from 'clsx';
import { useState, useEffect, startTransition } from 'react';
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
import { applyTheme } from '@/features/Preferences/data/themes';
import BackToTop from '@/shared/components/navigation/BackToTop';
import MobileBottomBar from '@/shared/components/layout/BottomBar';
import { useVisitTracker } from '@/features/Progress/hooks/useVisitTracker';
import { getGlobalAdaptiveSelector } from '@/shared/lib/adaptiveSelection';
import GlobalAudioController from '@/shared/components/layout/GlobalAudioController';
import ServiceWorkerRegistration from '@/shared/components/ServiceWorkerRegistration';

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

  fontsLoadingPromise = import('@/features/Preferences/data/fonts').then(
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

  // Calculate fontClassName based on the stateful fontsModule
  const fontClassName = fontsModule
    ? fontsModule.find((fontObj: FontObject) => effectiveFont === fontObj.name)
        ?.font.className
    : '';

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

  // Note: Web Audio API context resumption is handled in useAudio.ts

  return (
    <div
      data-scroll-restoration-id='container'
      className={clsx(
        'min-h-[100dvh] max-w-[100dvw] bg-[var(--background-color)] text-[var(--main-color)]',
        fontClassName,
      )}
      style={{
        height: '100dvh',
        overflowY: 'auto',
      }}
    >
      <GlobalAudioController />
      <ServiceWorkerRegistration />
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
