'use client';

import { Timer, ArrowLeft } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import clsx from 'clsx';

interface EmptyStateProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
}

export default function EmptyState({ dojoType, dojoLabel }: EmptyStateProps) {
  return (
    <div className='min-h-[100dvh] flex flex-col items-center justify-center p-4'>
      <div className='max-w-md text-center space-y-4'>
        <Timer size={64} className='mx-auto text-[var(--main-color)]' />
        <h1 className='text-2xl font-bold text-[var(--secondary-color)]'>
          Blitz
        </h1>
        <p className='text-[var(--muted-color)]'>
          Please select some {dojoLabel.toLowerCase()} first to begin the timed
          challenge.
        </p>
        <Link href={`/${dojoType}`}>
          <button
            className={clsx(
              'w-full h-12 px-6 flex flex-row justify-center items-center gap-2',
              'bg-[var(--secondary-color)] text-[var(--background-color)]',
              'rounded-2xl transition-colors duration-200',
              'border-b-6 border-[var(--secondary-color-accent)] shadow-sm',
              'hover:cursor-pointer'
            )}
          >
            <ArrowLeft size={20} />
            <span>Select {dojoLabel}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
