'use client';
import clsx from 'clsx';
import { useState, useEffect, ReactNode } from 'react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  level?: 'section' | 'subsection' | 'subsubsection';
  className?: string;
  id?: string;
  /** Unique ID for session storage persistence */
  storageKey?: string;
  /** When true, applies a full border to the header instead of just a bottom border */
  fullBorder?: boolean;
  /** Toggle between original icon style and new badge style */
  useNewIconDesign?: boolean;
}

const levelStyles = {
  section: {
    header: 'text-3xl py-4 pl-4',
    border: 'border-l-40 border-(--border-color)',
    chevronSize: 24,
    gap: 'gap-4',
  },
  subsection: {
    header: 'text-2xl py-3 pl-4',
    border: 'border-l-[20px] border-(--border-color)',
    chevronSize: 22,
    gap: 'gap-3',
  },
  subsubsection: {
    header: 'text-xl py-2 pl-4',
    border: 'border-l-[10px] border-(--border-color)',
    chevronSize: 20,
    gap: 'gap-2',
  },
};

const newIconClassesByLevel = {
  section:
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-6 border-(--secondary-color-accent) bg-(--secondary-color) leading-none text-(--background-color) motion-safe:animate-float [--float-distance:-4px] [&>svg]:h-7 [&>svg]:w-7',
  subsection:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) leading-none text-(--background-color) motion-safe:animate-float [--float-distance:-3px] [&>svg]:h-4 [&>svg]:w-4',
  subsubsection:
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) leading-none text-(--background-color) motion-safe:animate-float [--float-distance:-2px] [&>svg]:h-3.5 [&>svg]:w-3.5',
} as const;

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  level = 'section',
  className,
  id,
  storageKey,
  fullBorder = false,
  useNewIconDesign = false,
}: CollapsibleSectionProps) => {
  const { playClick } = useClick();

  // Initialize state from session storage or default
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = sessionStorage.getItem(`collapsible-${storageKey}`);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultOpen;
  });

  // Persist state to session storage
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      sessionStorage.setItem(`collapsible-${storageKey}`, String(isOpen));
    }
  }, [isOpen, storageKey]);

  const styles = levelStyles[level];

  const handleToggle = () => {
    playClick();
    setIsOpen(prev => !prev);
  };

  return (
    <div
      id={id}
      className={clsx('flex scroll-mt-28 flex-col', styles.gap, className)}
    >
      <button
        className={clsx(
          'group flex w-full flex-row items-center gap-2 text-left',
          'max-md:active:bg-(--card-color)',
          'max-md:focus-visible:bg-(--card-color)',
          'md:hover:bg-(--card-color)',
          'hover:cursor-pointer',
          styles.header,
          fullBorder
            ? 'border-l-40 border-(--border-color) px-4 py-3'
            : styles.border,
        )}
        onClick={handleToggle}
      >
        {/* Chevron icon with rotation animation */}
        <ChevronUp
          className={clsx(
            'transition-transform duration-300 ease-out',
            'transition-colors delay-200 duration-300',
            'text-(--border-color)',
            'group-active:text-(--main-color)',
            'group-focus-visible:text-(--main-color)',
            'md:group-hover:text-(--main-color)',
            !isOpen && 'rotate-180',
          )}
          size={styles.chevronSize}
        />

        {/* Optional icon */}
        {icon && (
          <span
            className={clsx(
              useNewIconDesign
                ? newIconClassesByLevel[level]
                : 'flex h-11 w-11 items-center justify-center rounded-xl bg-(--card-color) text-(--secondary-color)',
              !useNewIconDesign && 'transition-colors duration-300',
              !useNewIconDesign && 'group-active:bg-(--background-color)',
              !useNewIconDesign &&
                'group-focus-visible:bg-(--background-color)',
              !useNewIconDesign && 'md:group-hover:bg-(--background-color)',
            )}
          >
            {icon}
          </span>
        )}

        {/* Title */}
        <span>{title}</span>
      </button>

      {/* Content with smooth height animation using CSS grid trick */}
      <div
        className={clsx(
          'grid overflow-hidden',
          'transition-[grid-template-rows,opacity] duration-500 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='min-h-0'>{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
