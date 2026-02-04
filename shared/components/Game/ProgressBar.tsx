'use client';
import { useEffect } from 'react';
import { useStatsDisplay } from '@/features/Progress';
// import useIndefiniteConfetti from '@/lib/hooks/useInfiniteConfetti';
import { Random } from 'random-js';
import { animalIconsLength } from '@/shared/lib/icons';

const random = new Random();

interface Checkpoint {
  position: number;
  label: string;
}

type CheckpointInput = number | Checkpoint;

interface ProgressBarProps {
  value?: number;
  max?: number;
  checkpoints?: CheckpointInput[];
}

const ProgressBar = ({
  max = 20,
}: // checkpoints = [10, 25, 50, 75] // Default checkpoints at 25%, 50%, 75%
ProgressBarProps) => {
  const { score, setScore, stars, setStars, addIconIndex } = useStatsDisplay();

  const percentage = (score / max) * 100;

  // const [active, setActive] = useState(false);

  // const emojiArray = ['🍹'];

  useEffect(() => {
    if (score >= max) {
      setScore(0);
      setStars(stars + 1);
      const newIconIndex = random.integer(0, animalIconsLength - 1);
      addIconIndex(newIconIndex);
    }
  }, [score]);

  return (
    <div className='relative flex w-full flex-col items-center'>
      {/* Progress Bar Background */}
      <div className='relative h-4 w-full overflow-hidden rounded-full bg-(--card-color)'>
        {/* Progress Indicator */}
        <div
          className='relative z-10 h-4 rounded-full transition-all duration-500'
          style={{
            width: `${percentage}%`,
            background:
              'linear-gradient(to right, var(--secondary-color), var(--main-color))',
          }}
        />
        {/* Checkpoints */}
        {[25, 50, 75].map(cp => (
          <div
            key={cp}
            className='absolute top-0 z-0 h-4 w-0 bg-(--border-color)'
            style={{
              left: `calc(${cp}% - 2px)`, // Adjust for marker width
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
