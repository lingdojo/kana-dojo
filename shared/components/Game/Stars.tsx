'use client';
import useStatsStore from '@/features/Progress/store/useStatsStore';
import { Star } from 'lucide-react';
import clsx from 'clsx';

const Stars = () => {
  const stars = useStatsStore(state => state.stars);

  return (
    <div className='flex gap-2 mt-4'>
      <div className='grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-2'>
        {Array.from({ length: stars }, (_, index) => (
          <Star
            key={index}
            size={50}
            className={clsx(
              stars >= 15
                ? 'motion-safe:animate-spin'
                : stars >= 10
                ? 'motion-safe:animate-bounce'
                : stars >= 5
                ? 'motion-safe:animate-pulse'
                : '',

              'text-[var(--secondary-color)]'
            )}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Stars;
