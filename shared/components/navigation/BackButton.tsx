'use client';

import { useClick } from '@/shared/hooks/useAudio';
import { ChevronsLeft } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import clsx from 'clsx';
import { buttonBorderStyles } from '@/shared/lib/styles';

const BackButton = () => {
  const { playClick } = useClick();

  return (
    <Link href='/' className='w-full md:w-1/3 lg:w-1/4'>
      <button
        onClick={() => playClick()}
        className={clsx(
          buttonBorderStyles,
          'border-b-4 border-(--border-color) px-16 py-4 text-(--main-color) hover:border-(--main-color)/80',
          'w-full',
          'flex cursor-pointer items-center justify-center',
        )}
      >
        <ChevronsLeft />
      </button>
    </Link>
  );
};

export default BackButton;
