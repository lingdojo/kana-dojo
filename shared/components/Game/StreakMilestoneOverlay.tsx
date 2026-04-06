'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Random } from 'random-js';
import { Flame } from 'lucide-react';
import { useHasFinePointer } from '@/shared/hooks/generic/useHasFinePointer';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { cn } from '@/shared/lib/utils';
import { getRandomKanjiStyles } from '@/shared/lib/decorations/decorationUtils';
import {
  generateRandomPositions,
  getResponsiveCharSize,
  getExclusionZone,
  type Position,
} from '@/shared/lib/decorations/positioningUtils';
import FloatingKanji from './FloatingKanji';

interface StreakMilestoneOverlayProps {
  milestone: number | null;
  onDismiss: () => void;
}

interface FloatingKanjiData {
  char: string;
  color: string;
  fontClass: string;
  position: Position;
  delay: number;
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
  const hasFinePointer = useHasFinePointer();
  const { playClick } = useClick();
  const [floatingKanji, setFloatingKanji] = useState<FloatingKanjiData[]>([]);
  const [charSize, setCharSize] = useState<'sm' | 'md' | 'lg'>('lg');

  // Generate floating kanji positions and styles
  useEffect(() => {
    if (!milestone) {
      return;
    }

    const generateFloatingKanji = async () => {
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get responsive character size
      const responsiveCharSize = getResponsiveCharSize(viewportWidth);

      // Set size class for rendering
      if (viewportWidth < 768) {
        setCharSize('sm');
      } else if (viewportWidth < 1024) {
        setCharSize('md');
      } else {
        setCharSize('lg');
      }

      // Get exclusion zone (central content area)
      const exclusionZone = getExclusionZone(viewportWidth, viewportHeight);

      // Create seeded random number generator for consistent results
      const rng = new Random();

      // Generate random positions
      const positions = generateRandomPositions(
        milestone,
        viewportWidth,
        viewportHeight,
        responsiveCharSize,
        exclusionZone,
        rng,
      );

      // Load kanji styles
      const styles = await getRandomKanjiStyles(milestone);

      // Combine styles with positions and random delays
      const kanjiData: FloatingKanjiData[] = styles.map((style, index) => ({
        char: style.char,
        color: style.color,
        fontClass: style.fontClass,
        position: positions[index],
        delay: rng.real(0, 3), // Random delay 0-3 seconds for float animation
      }));

      setFloatingKanji(kanjiData);
    };

    generateFloatingKanji();
  }, [milestone]);

  // Handle viewport resize - regenerate positions dynamically
  useEffect(() => {
    if (!milestone || floatingKanji.length === 0) return;

    const handleResize = () => {
      // Get new viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get responsive character size
      const responsiveCharSize = getResponsiveCharSize(viewportWidth);

      // Update size class for rendering
      if (viewportWidth < 768) {
        setCharSize('sm');
      } else if (viewportWidth < 1024) {
        setCharSize('md');
      } else {
        setCharSize('lg');
      }

      // Get exclusion zone (central content area)
      const exclusionZone = getExclusionZone(viewportWidth, viewportHeight);

      // Create seeded random number generator for consistent results
      const rng = new Random();

      // Generate new random positions for current viewport
      const newPositions = generateRandomPositions(
        milestone,
        viewportWidth,
        viewportHeight,
        responsiveCharSize,
        exclusionZone,
        rng,
      );

      // Update positions while keeping existing styles
      setFloatingKanji(prevKanji =>
        prevKanji.map((kanji, index) => ({
          ...kanji,
          position: newPositions[index],
        })),
      );
    };

    // Debounce resize handler
    let resizeTimeout: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [milestone, floatingKanji.length]);

  useEffect(() => {
    if (!milestone) return;

    const absorbKeyboardEvent = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      absorbKeyboardEvent(event);
      playClick();
      onDismiss();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      absorbKeyboardEvent(event);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      absorbKeyboardEvent(event);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('keypress', handleKeyPress, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('keypress', handleKeyPress, true);
    };
  }, [milestone, onDismiss, playClick]);

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
          onClick={handleDismiss}
          role='dialog'
          aria-modal='true'
          aria-label={`${milestone} in a row`}
        >
          {/* Floating Kanji Background */}
          <div className='fixed inset-0' style={{ zIndex: -10 }}>
            {floatingKanji.map((kanji, index) => (
              <FloatingKanji
                key={`kanji-${index}`}
                char={kanji.char}
                color={kanji.color}
                fontClass={kanji.fontClass}
                position={kanji.position}
                delay={kanji.delay}
                size={charSize}
              />
            ))}
          </div>

          {/* Main Content */}
          <motion.div
            variants={contentVariants}
            initial='hidden'
            animate='visible'
            className='mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 text-center select-none'
          >
            <motion.button
              variants={itemVariants}
              className={cn(
                'inline-flex h-28 w-28 items-center justify-center rounded-4xl border-b-20 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-all duration-200',
                'motion-safe:animate-float [--float-distance:-8px]',
              )}
            >
              <Flame className='h-16 w-16' strokeWidth={2.5} />
            </motion.button>

            <motion.h2
              variants={itemVariants}
              className='text-4xl font-semibold tracking-tighter text-(--main-color) sm:text-5xl'
            >
              {milestone} in a row!
            </motion.h2>

            {/*
            <motion.p
              variants={itemVariants}
              className='max-w-2xl text-xl font-semibold text-(--secondary-color) sm:text-2xl'
            >
              {message}
            </motion.p>
*/}
            <motion.p
              variants={itemVariants}
              className='text-sm text-(--secondary-color)/80'
            >
              ({hasFinePointer ? 'click' : 'tap'} to continue)
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
