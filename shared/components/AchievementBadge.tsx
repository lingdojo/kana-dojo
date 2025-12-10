'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { Trophy } from 'lucide-react';
import { useAchievements } from '@/features/Achievements/hooks/useAchievements';
import { useClick } from '@/shared/hooks/useAudio';

interface AchievementBadgeProps {
  onClick?: () => void;
  showNotificationDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
}

const AchievementBadge = ({
  onClick,
  showNotificationDot = true,
  size = 'md',
  variant = 'icon'
}: AchievementBadgeProps) => {
  const { playClick } = useClick();
  const { totalPoints, level, unlockedCount, hasUnseenNotifications } =
    useAchievements();

  const handleClick = () => {
    playClick();
    onClick?.();
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3 text-base',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  if (variant === 'full') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={clsx(
          'relative flex items-center gap-3 rounded-xl',
          'bg-[var(--card-color)] hover:bg-[var(--background-color)]',
          'border border-[var(--border-color)]',
          'transition-all duration-200',
          sizeClasses[size]
        )}
      >
        <div className='relative'>
          <Trophy size={iconSizes[size]} className='text-yellow-500' />
          {showNotificationDot && hasUnseenNotifications && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--card-color)]'
            />
          )}
        </div>

        <div className='text-left'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-[var(--main-color)]'>
              Level {level}
            </span>
            <span className='text-xs text-[var(--secondary-color)]'>
              ({totalPoints} pts)
            </span>
          </div>
          <div className='text-xs text-[var(--secondary-color)]'>
            {unlockedCount} achievements
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={clsx(
        'relative rounded-full',
        'bg-[var(--card-color)] hover:bg-[var(--background-color)]',
        'border border-[var(--border-color)]',
        'transition-all duration-200',
        sizeClasses[size]
      )}
    >
      <Trophy size={iconSizes[size]} className='text-yellow-500' />

      {/* Notification dot */}
      {showNotificationDot && hasUnseenNotifications && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--card-color)]'
        />
      )}

      {/* Level indicator */}
      {level > 1 && (
        <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[var(--card-color)]'>
          {level}
        </div>
      )}
    </motion.button>
  );
};

export default AchievementBadge;
