'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Flame } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useThemePreferences } from '@/features/Preferences';
import { useClick } from '@/shared/hooks/generic/useAudio';
import AdSenseDisplay from '@/shared/ui-composite/Ads/AdSenseDisplay';
import { GameBottomBar } from '@/shared/ui-composite/Game/GameBottomBar';
import BottomBar from '@/shared/ui-composite/layout/BottomBar';
import { suppressContinueKeyboardShortcuts } from '@/shared/utils/game/continueShortcutGuard';
import { ENABLE_EVERY_QUESTION_AD_OVERLAY } from '@/shared/utils/game/streakMilestones';

const STREAK_MILESTONE_AD_SLOT = '2642983933';
const ENABLE_STREAK_MILESTONE_DECORATIONS = true;
// Let Enter/Space dismiss the overlay so type-mode keyboard users don't
// accidentally trigger the underlying "next" control (#27829).
const ENABLE_STREAK_MILESTONE_KEYBOARD_SHORTCUTS = true;
// Keep the placement code intact, but do not mount AdSense during the audit.
const ENABLE_STREAK_MILESTONE_AD = false;
const isStreakMilestoneAdEnabled =
  ENABLE_STREAK_MILESTONE_AD &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const Decorations = lazy(
  () => import('@/shared/ui-composite/Decorations/Decorations'),
);

interface StreakMilestoneOverlayProps {
  milestone: number | null;
  onDismiss: () => void;
}

const layerVariants = {
  hidden: { opacity: 0, x: 120 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.85 },
      opacity: { duration: 0.24 },
    },
  },
  exit: {
    opacity: 0,
    x: -140,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.85 },
      opacity: { duration: 0.2 },
    },
  },
};

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 24,
      mass: 0.9,
    },
  },
};

export default function StreakMilestoneOverlay({
  milestone,
  onDismiss,
}: StreakMilestoneOverlayProps) {
  const { isGlassMode } = useThemePreferences();
  const { playClick } = useClick();
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!milestone) return;

    // Move keyboard focus to Skip so Enter targets this dialog, not the
    // type-mode "next" button still mounted underneath.
    skipButtonRef.current?.focus();

    if (!ENABLE_STREAK_MILESTONE_KEYBOARD_SHORTCUTS) return;

    const isSkipShortcut = (event: KeyboardEvent) =>
      event.key === 'Enter' || event.code === 'Space' || event.key === ' ';

    const absorbShortcut = (event: KeyboardEvent) => {
      if (!isSkipShortcut(event)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSkipShortcut(event)) return;
      if (document.querySelector('[data-donation-modal]')) return;

      absorbShortcut(event);
      if (event.repeat) return;

      suppressContinueKeyboardShortcuts();
      skipButtonRef.current?.click();
    };

    // Capture-phase listeners win over the game Input "continue" handlers.
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', absorbShortcut, true);
    window.addEventListener('keypress', absorbShortcut, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', absorbShortcut, true);
      window.removeEventListener('keypress', absorbShortcut, true);
    };
  }, [milestone]);

  const handleDismiss = () => {
    playClick();
    onDismiss();
  };

  useEffect(() => {
    if (!milestone) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 180);
  }, [milestone]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          key={`streak-${milestone}`}
          variants={layerVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          className='fixed inset-0 z-70 flex h-full w-full items-center justify-center bg-(--background-color)'
          role='dialog'
          aria-modal='true'
          aria-label={
            ENABLE_EVERY_QUESTION_AD_OVERLAY
              ? 'Advertisement'
              : `${milestone} in a row`
          }
        >
          {ENABLE_STREAK_MILESTONE_DECORATIONS && !isGlassMode && (
            <div className='absolute inset-0 -z-10'>
              <Suspense fallback={<></>}>
                <Decorations
                  expandDecorations={false}
                  interactive={false}
                  context='streak-milestone'
                />
              </Suspense>
            </div>
          )}

          {/* Main Content */}
          <motion.div
            variants={contentVariants}
            initial='hidden'
            animate='visible'
            className='mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 pb-28 text-center select-none'
          >
            {!ENABLE_EVERY_QUESTION_AD_OVERLAY && (
              <motion.button
                variants={itemVariants}
                className={cn(
                  'hidden h-28 w-28 items-center justify-center rounded-4xl border-b-20 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-all duration-200 md:inline-flex',
                  'motion-safe:animate-float [--float-distance:-8px]',
                )}
              >
                <Flame className='h-16 w-16' strokeWidth={2.5} />
              </motion.button>
            )}

            <motion.h2
              variants={itemVariants}
              className='text-4xl font-semibold tracking-tighter text-(--main-color) sm:text-5xl'
            >
              {ENABLE_EVERY_QUESTION_AD_OVERLAY
                ? 'Advertisement'
                : `${milestone} in a row!`}
            </motion.h2>

            {/*
            <motion.p
              variants={itemVariants}
              className='max-w-2xl text-xl font-semibold text-(--secondary-color) sm:text-2xl'
            >
              {message}
            </motion.p>
*/}
            {isStreakMilestoneAdEnabled && (
              <div className='flex w-full max-w-3xl flex-col items-center gap-2'>
                {!ENABLE_EVERY_QUESTION_AD_OVERLAY && (
                  <p className='text-xs font-medium tracking-wide text-(--secondary-color) uppercase'>
                    Advertisement
                  </p>
                )}
                <div className='w-full'>
                  <AdSenseDisplay slot={STREAK_MILESTONE_AD_SLOT} />
                </div>
              </div>
            )}
          </motion.div>
          <GameBottomBar
            state='check'
            canCheck={true}
            feedbackContent={null}
            actionLabel='skip'
            onAction={handleDismiss}
            buttonRef={skipButtonRef}
          />
          <BottomBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
