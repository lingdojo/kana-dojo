'use client';

import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import { Swords, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  dojoType: 'kana' | 'kanji' | 'vocabulary';
  dojoLabel: string;
}

export default function EmptyState({ dojoType, dojoLabel }: EmptyStateProps) {
  const minRequired = dojoType === 'kana' ? 1 : 10;
  const itemLabel = dojoType === 'kana' ? 'group' : 'item';

  return (
    <div className='flex min-h-[100dvh] flex-col items-center justify-center gap-6 p-4'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='flex h-20 w-20 items-center justify-center rounded-full bg-(--card-color)'>
          <Swords className='h-10 w-10 text-(--muted-color)' />
        </div>
        <h2 className='text-2xl font-bold text-(--secondary-color)'>
          No {dojoLabel} Selected
        </h2>
        <p className='max-w-sm text-(--muted-color)'>
          Select at least {minRequired} {itemLabel}
          {minRequired > 1 ? 's' : ''} to start the Gauntlet challenge.
        </p>
      </div>

      <Link
        href={`/${dojoType}`}
        className={clsx(
          'flex flex-row items-center gap-2 px-6 py-3',
          'rounded-2xl transition-colors duration-200',
          'bg-(--main-color) text-(--background-color)',
          'border-b-4 border-(--main-color-accent)',
          'hover:opacity-90',
        )}
      >
        <ArrowLeft size={20} />
        <span>Select {dojoLabel}</span>
      </Link>
    </div>
  );
}
