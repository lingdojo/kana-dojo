'use client';

import Banner from '../Menu/Banner';
import { X } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface LegalLayoutProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  lastUpdated?: string;
}

const LegalLayout = ({
  children,
  icon,
  title,
  lastUpdated,
}: LegalLayoutProps) => {
  const { playClick } = useClick();

  return (
    <div className='min-h-dvh bg-(--background-color)'>
      <div className='mx-auto max-w-[900px] px-8 pt-8 pb-20 md:px-16 lg:px-20'>
        <Banner />
        <Link href='/' className='w-full md:w-1/3 lg:w-1/4'>
          <button
            onClick={() => playClick()}
            className={clsx(
              'inline-flex h-12 w-12 items-center justify-center rounded-2xl',
              'bg-(--secondary-color) text-(--background-color) hover:bg-(--main-color)',
              'border-b-8 border-(--secondary-color-accent) hover:border-(--main-color-accent)',
              'transition-all duration-200',
              'cursor-pointer',
            )}
          >
            <X />
          </button>
        </Link>
        <article className='mt-8'>
          {icon && title && (
            <div className='mb-2'>
              <div className='mb-3 flex items-center gap-3'>
                <span className='motion-safe:animate-float inline-flex h-12 w-12 items-center justify-center rounded-2xl border-b-8 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) [animation-delay:200ms]'>
                  {icon}
                </span>
                <h1 className='text-5xl font-bold text-(--main-color)'>
                  {title}
                </h1>
              </div>
              {lastUpdated && (
                <p className='text-sm text-(--secondary-color)/70'>
                  Last Updated: {lastUpdated}
                </p>
              )}
            </div>
          )}
          {children}
        </article>
      </div>
    </div>
  );
};

export default LegalLayout;
