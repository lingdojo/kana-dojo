'use client';

import { memo, useEffect, type RefObject } from 'react';
import { motion, type MotionStyle, type Variants } from 'framer-motion';
import clsx from 'clsx';

const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const tileContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

export const tileEntryVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 20,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 25,
      mass: 0.8,
    },
  },
};

export const gameContentVariants = {
  hidden: {
    opacity: 0,
    x: 80,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7,
      },
      opacity: {
        duration: 0.25,
        ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
      },
    },
  },
  exit: {
    opacity: 0,
    x: -80,
    transition: {
      x: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 30,
        mass: 0.7,
      },
      opacity: {
        duration: 0.25,
        ease: [0.4, 0.0, 1, 1] as [number, number, number, number],
      },
    },
  },
};

export const celebrationContainerVariants = {
  idle: {},
  celebrate: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.08,
    },
  },
};

export const celebrationBounceVariants = {
  idle: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
  },
  celebrate: {
    y: [0, -32, -35, 0, -10, 0],
    scaleX: [1, 0.94, 0.96, 1.06, 0.98, 1],
    scaleY: [1, 1.08, 1.04, 0.92, 1.02, 1],
    opacity: [1, 1, 1, 1, 1, 1],
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      times: [0, 0.25, 0.35, 0.6, 0.8, 1],
    },
  },
};

const tileBaseStyles =
  'relative flex items-center justify-center rounded-3xl px-6 sm:px-8 py-3 border-b-10 transition-all duration-150';

interface TileProps {
  id: string;
  char: string;
  onClick: () => void;
  isDisabled?: boolean;
  sizeClassName?: string;
  lang?: string;
  variants?: Variants;
  motionStyle?: MotionStyle;
}

export const ActiveTile = memo(
  ({
    id,
    char,
    onClick,
    isDisabled,
    sizeClassName,
    lang,
    variants,
    motionStyle,
  }: TileProps) => {
    return (
      <motion.button
        layoutId={id}
        layout='position'
        type='button'
        onClick={onClick}
        disabled={isDisabled}
        variants={variants}
        className={clsx(
          tileBaseStyles,
          'cursor-pointer transition-colors',
          'active:mb-[10px] active:translate-y-[10px] active:border-b-0',
          'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color)',
          isDisabled && 'cursor-not-allowed opacity-50',
          sizeClassName,
        )}
        transition={springConfig}
        lang={lang}
        style={motionStyle}
      >
        {char}
      </motion.button>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.char === nextProps.char &&
    prevProps.isDisabled === nextProps.isDisabled &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.sizeClassName === nextProps.sizeClassName &&
    prevProps.lang === nextProps.lang,
);

ActiveTile.displayName = 'ActiveTile';

export const BlankTile = memo(
  ({ char, sizeClassName }: { char: string; sizeClassName?: string }) => {
    return (
      <div
        className={clsx(
          tileBaseStyles,
          'border-transparent bg-(--border-color)/30',
          'select-none',
          sizeClassName,
        )}
      >
        <span className='opacity-0'>{char}</span>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.char === nextProps.char &&
    prevProps.sizeClassName === nextProps.sizeClassName,
);

BlankTile.displayName = 'BlankTile';

export type BottomBarState = 'check' | 'correct' | 'wrong';

export const useWordBuildingActionKey = (
  buttonRef: RefObject<HTMLButtonElement | null>,
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Enter' ||
        event.code === 'Space' ||
        event.key === ' '
      ) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttonRef]);
};
