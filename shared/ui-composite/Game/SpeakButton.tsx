'use client';

import { Volume2 } from 'lucide-react';
import { useSpeak } from '@/shared/hooks/generic/useSpeak';
import clsx from 'clsx';

interface SpeakButtonProps {
  text: string;
  className?: string;
}

export function SpeakButton({ text, className }: SpeakButtonProps) {
  const { speak } = useSpeak();

  return (
    <button
      type='button'
      aria-label='Read aloud'
      onClick={() => speak(text)}
      className={clsx(
        'inline-flex items-center justify-center rounded-md p-1.5',
        'text-(--secondary-color) transition-colors',
        'hover:bg-(--background-color) hover:text-(--primary-color)',
        'focus-visible:ring-2 focus-visible:ring-(--primary-color) focus-visible:outline-none',
        className,
      )}
    >
      <Volume2 className='h-4 w-4' />
    </button>
  );
}
