'use client';
import { memo, useMemo } from 'react';
import { useStatsDisplay } from '@/features/Progress';
import { Star } from 'lucide-react';
import clsx from 'clsx';

// Memoized individual star component to prevent re-renders
interface StarItemProps {
  index: number;
  totalStars: number;
}

const StarItem = memo(({ index, totalStars }: StarItemProps) => (
  <Star
    size={50}
    className={clsx(
      totalStars >= 15
        ? 'motion-safe:animate-spin'
        : totalStars >= 10
          ? 'motion-safe:animate-bounce'
          : totalStars >= 5
            ? 'motion-safe:animate-pulse'
            : '',
      'text-(--secondary-color)',
    )}
    style={{
      animationDelay: `${index * 100}ms`,
    }}
  />
));

StarItem.displayName = 'StarItem';

const Stars = () => {
  const { stars } = useStatsDisplay();

  // Memoize the star array to prevent recreation on every render
  const starElements = useMemo(
    () =>
      Array.from({ length: stars }, (_, index) => (
        <StarItem key={index} index={index} totalStars={stars} />
      )),
    [stars],
  );

  return (
    <div className='mt-4 flex gap-2'>
      <div className='grid grid-cols-5 gap-2 md:grid-cols-10 lg:grid-cols-15 xl:grid-cols-20'>
        {starElements}
      </div>
    </div>
  );
};

export default Stars;
