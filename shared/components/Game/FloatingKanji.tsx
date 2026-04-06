'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { generateButtonBorderColor } from '@/features/Preferences/data/themes/themes';
import { cn } from '@/shared/lib/utils';

const useButtonStyle = false;

interface FloatingKanjiProps {
  char: string;
  color: string;
  fontClass: string;
  position: { x: number; y: number };
  delay: number;
  size: 'sm' | 'md' | 'lg';
}

// Animation variants for smooth fade-in
const kanjiVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 0.9,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const, // Smooth cubic-bezier easing
    },
  },
};

const FloatingKanji = memo(
  ({ char, color, fontClass, position, delay, size }: FloatingKanjiProps) => {
    // Map size prop to Tailwind classes
    const sizeClass = {
      sm: 'text-2xl', // 24px - mobile
      md: 'text-3xl', // 30px - tablet
      lg: 'text-4xl', // 36px - desktop
    }[size];
    const buttonBorderColor = useButtonStyle
      ? generateButtonBorderColor(color)
      : undefined;

    return (
      <motion.button
        type='button'
        variants={kanjiVariants}
        initial='hidden'
        animate={{
          opacity: 0.9,
          scale: 1,
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        transition={{
          opacity: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          scale: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
          left: { type: 'spring', stiffness: 100, damping: 20 },
          top: { type: 'spring', stiffness: 100, damping: 20 },
        }}
        className={cn(
          'pointer-events-none fixed inline-flex items-center justify-center select-none',
          sizeClass,
          fontClass,
          'motion-safe:animate-float',
          useButtonStyle &&
            'h-16 w-16 rounded-3xl border-b-8 text-(--background-color)',
        )}
        aria-hidden='true'
        style={{
          color: useButtonStyle ? 'var(--background-color)' : color,
          backgroundColor: useButtonStyle ? color : undefined,
          borderColor: buttonBorderColor,
          zIndex: -10,
          transform: 'translate(-50%, -50%)', // Center the character on the position
          animationDelay: `${delay}s`,
          // @ts-expect-error - CSS variable for float animation
          '--float-distance': '-10px',
        }}
      >
        {useButtonStyle ? <span className='text-(--background-color)'>{char}</span> : char}
      </motion.button>
    );
  },
);

FloatingKanji.displayName = 'FloatingKanji';

export default FloatingKanji;
