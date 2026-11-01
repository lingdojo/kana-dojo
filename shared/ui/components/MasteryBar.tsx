'use client';

import clsx from 'clsx';
import { Star } from 'lucide-react';

import { cn } from '@/shared/utils/utils';

type MasteryBarProps = {
  percent: number;
  stars?: number;
  className?: string;
  height?: string;
  rounded?: string;
};

const MasteryBar = ({
  percent,
  stars = 0,
  className,
  height = 'h-8',
  rounded = 'rounded-2xl',
}: MasteryBarProps) => (
  <div className={cn('w-full', className)}>
    <div
      className={cn(
        'w-full overflow-hidden bg-(--background-color)',
        height,
        rounded,
      )}
    >
      <div
        className={cn('h-full transition-all duration-500', rounded)}
        style={{
          width: `${percent}%`,
          background:
            'linear-gradient(to right, var(--secondary-color), var(--main-color))',
        }}
      />
    </div>

    {stars > 0 && (
      <div className='mt-1 flex items-center gap-1'>
        {Array.from({ length: 3 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={clsx(
              'transition-colors duration-300',
              i < stars
                ? 'fill-(--main-color) text-(--main-color)'
                : 'fill-current text-(--border-color)',
            )}
          />
        ))}
      </div>
    )}
  </div>
);

export default MasteryBar;
