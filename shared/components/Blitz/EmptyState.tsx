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
    <div className='flex min-h-[100dvh] flex-col items-center justify-center p-4'>
      <div className='max-w-md space-y-4 text-center'>
        <Timer size={64} className='mx-auto text-(--main-color)' />
        <h1 className='text-2xl font-bold text-(--secondary-color)'>
          Blitz
        </h1>
        <p className='text-(--muted-color)'>
          Please select some {dojoLabel.toLowerCase()} first to begin the
          challenge.
        </p>
        <Link href={`/${dojoType}`}>
          <button
            className={clsx(
              'flex h-12 w-full flex-row items-center justify-center gap-2 px-6',
              'bg-(--secondary-color) text-(--background-color)',
              'rounded-2xl transition-colors duration-200',
              'border-b-6 border-(--secondary-color-accent) shadow-sm',
              'hover:cursor-pointer',
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
