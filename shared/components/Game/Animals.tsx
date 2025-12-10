'use client';
import useStatsStore from '@/features/Progress/store/useStatsStore';
// import { Star } from 'lucide-react';
import clsx from 'clsx';
import { animalIcons } from '@/shared/lib/icons';

const Stars = () => {
  // const stars = useStatsStore(state => state.stars);
  const iconIndices = useStatsStore(state => state.iconIndices);
  const animalIconsToDisplay = iconIndices.map(index => animalIcons[index]);

  return (
    <div className='flex gap-2 mt-4'>
      <div className='grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20 gap-2'>
        {/* {Array.from({ length: stars }, (_, index) => (
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
        ))} */}
        {animalIconsToDisplay.map((Icon, index) => (
          <div
            key={index}
            className={clsx(
              'text-[var(--secondary-color)]',
              iconIndices.length >= 20
                ? 'motion-safe:animate-ping'
                : iconIndices.length >= 15
                ? 'motion-safe:animate-spin'
                : iconIndices.length >= 10
                ? 'motion-safe:animate-bounce'
                : iconIndices.length >= 5
                ? 'motion-safe:animate-pulse'
                : ''
            )}
            style={{
              animationDelay: `${
                index * (iconIndices.length >= 20 ? 500 : 100)
              }ms`
            }}
          >
            {Icon}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stars;
