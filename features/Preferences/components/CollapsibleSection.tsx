'use client';
import clsx from 'clsx';
import { useState, useEffect, ReactNode } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import { ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  level?: 'section' | 'subsection' | 'subsubsection';
  className?: string;
  /** Unique ID for session storage persistence */
  storageKey?: string;
}

const levelStyles = {
  section: {
    header: 'text-3xl py-4',
    border: 'border-b-2 border-(--border-color)',
    chevronSize: 24,
    gap: 'gap-4',
  },
  subsection: {
    header: 'text-2xl py-3',
    border: 'border-b-1 border-(--border-color)',
    chevronSize: 22,
    gap: 'gap-3',
  },
  subsubsection: {
    header: 'text-xl py-2',
    border: '',
    chevronSize: 20,
    gap: 'gap-2',
  },
};

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  level = 'section',
  className,
  storageKey,
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
    <div className={clsx('flex flex-col', styles.gap, className)}>
      <button
        className={clsx(
          'group flex w-full flex-row items-center gap-2 text-left',
          'hover:cursor-pointer',
          styles.header,
          styles.border,
        )}
        onClick={handleToggle}
      >
        {/* Chevron icon with rotation animation */}
        <ChevronUp
          className={clsx(
            'transition-transform duration-300 ease-out',
            'transition-colors delay-200 duration-300',
            'text-(--secondary-color)',
            'max-md:group-active:text-(--main-color)',
            'md:group-hover:text-(--main-color)',
            !isOpen && 'rotate-180',
          )}
          size={styles.chevronSize}
        />

        {/* Optional icon */}
        {icon && (
          <span className='flex items-center text-(--secondary-color)'>
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
          'transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='min-h-0'>{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
