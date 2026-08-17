'use client';

import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/shared/utils/utils';
import { useThemePreferences } from '@/features/Preferences';
import { useClick } from '@/shared/hooks/generic/useAudio';
import AdSenseDisplay from '@/shared/ui-composite/Ads/AdSenseDisplay';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import BottomBar from '@/shared/ui-composite/layout/BottomBar';

const TRANSITION_AD_SLOT = '5452714175';
const ENABLE_TRANSITION_AD_DECORATIONS = true;
export type TransitionAdvertisementPlacement = 'before' | 'after';

// Configure transition ads here: [], ['before'], ['after'], or ['before', 'after'].
export const TRANSITION_AD_PLACEMENTS: readonly TransitionAdvertisementPlacement[] = [
  // 'before',
  // 'after',
];

export const isTransitionAdvertisementEnabled = (
  placement: TransitionAdvertisementPlacement,
) => TRANSITION_AD_PLACEMENTS.includes(placement);

const Decorations = lazy(
  () => import('@/shared/ui-composite/Decorations/Decorations'),
);

interface TransitionAdvertisementOverlayProps {
  isOpen: boolean;
  placement: TransitionAdvertisementPlacement;
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

export default function TransitionAdvertisementOverlay({
  isOpen,
  placement,
  onDismiss,
}: TransitionAdvertisementOverlayProps) {
  const { isGlassMode } = useThemePreferences();
  const shouldShow = isOpen && isTransitionAdvertisementEnabled(placement);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key='transition-advertisement'
          variants={layerVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          className='fixed inset-0 z-70 flex h-full w-full items-center justify-center bg-(--background-color)'
          role='dialog'
          aria-modal='true'
          aria-label='Advertisement'
        >
          {ENABLE_TRANSITION_AD_DECORATIONS && !isGlassMode && (
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

          <motion.div
            variants={contentVariants}
            initial='hidden'
            animate='visible'
            className='mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 pb-48 text-center select-none'
          >
            {/*
            <motion.div
              variants={itemVariants}
              className={cn(
                'hidden h-28 w-28 items-center justify-center rounded-4xl border-b-20 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-all duration-200 md:inline-flex',
                'motion-safe:animate-float [--float-distance:-8px]',
              )}
            />
            */}
            <motion.h2
              variants={itemVariants}
              className='text-4xl font-semibold tracking-tighter text-(--main-color) sm:text-5xl'
            >
              Advertisement
            </motion.h2>

            <motion.div variants={itemVariants} className='w-full max-w-3xl'>
              <AdSenseDisplay slot={TRANSITION_AD_SLOT} />
            </motion.div>
          </motion.div>
          <TransitionAdvertisementBottomBar onSkip={onDismiss} />
          <BottomBar />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TransitionAdvertisementBottomBar({ onSkip }: { onSkip: () => void }) {
  const { playClick } = useClick();

  const handleSkip = () => {
    playClick();
    onSkip();
  };

  return (
    <div className='absolute right-0 bottom-0 left-0 z-10 flex w-full items-center justify-center border-t-2 border-(--border-color) bg-(--card-color) px-2.5 py-4 sm:py-3 md:bottom-6 md:px-12 md:pt-2 md:pb-4'>
      <div className='flex w-full flex-row items-end justify-center gap-2 sm:w-1/2 sm:gap-3'>
        <div className='flex h-[68px] w-full items-end sm:h-[72px] sm:w-auto'>
          <ActionButton
            borderBottomThickness={12}
            borderRadius='3xl'
            className={cn(
              'animate-float w-full px-6 py-2.5 text-lg font-medium [--float-distance:-2px] sm:w-auto sm:px-12 sm:py-3 sm:text-xl',
            )}
            onClick={handleSkip}
          >
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color)'>
              <svg
                className='h-5 w-5 text-(--main-color)'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </div>
            <span>skip</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
