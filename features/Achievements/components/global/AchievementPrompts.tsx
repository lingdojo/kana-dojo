'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';
import { useAchievementPrompts } from '../../hooks/useAchievementPrompts';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { cardBorderStyles } from '@/shared/utils/styles';
import type { AchievementPrompt } from '../../hooks/useAchievementPrompts';

interface AchievementPromptCardProps {
  prompt: AchievementPrompt;
  onDismiss: () => void;
}

const AchievementPromptCard = ({ prompt, onDismiss }: AchievementPromptCardProps) => {
  const { playClick } = useClick();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 4 seconds for progress, 8 seconds for unlocks
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, prompt.isUnlocked ? 8000 : 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const getProgressIcon = () => {
    if (prompt.isUnlocked) return <Trophy size={16} className="text-yellow-500" />;
    if (prompt.progress >= 75) return <Zap size={16} className="text-orange-500" />;
    if (prompt.progress >= 50) return <TrendingUp size={16} className="text-blue-500" />;
    return <Target size={16} className="text-gray-500" />;
  };

  const getProgressColor = () => {
    if (prompt.isUnlocked) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (prompt.progress >= 75) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (prompt.progress >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRarityColor = () => {
    switch (prompt.achievement.rarity) {
      case 'legendary': return 'text-purple-600';
      case 'epic': return 'text-purple-500';
      case 'rare': return 'text-blue-500';
      case 'uncommon': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={clsx(
            'relative w-80 cursor-pointer p-3',
            cardBorderStyles,
            'border border-solid border-gray-200',
            'shadow-none',
            'transition-colors duration-200',
            prompt.isUnlocked ? 'bg-linear-to-r from-yellow-50 to-orange-50' : 'bg-white'
          )}
          onClick={handleDismiss}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClick();
              handleDismiss();
            }}
            className={clsx(
              'absolute top-1 right-1 cursor-pointer rounded p-1',
              'text-(--secondary-color) hover:text-(--main-color)',
              'transition-colors duration-200 hover:bg-(--background-color)',
            )}
          >
            <span className="text-xs">×</span>
          </button>

          <div className="flex items-start gap-2 pr-4">
            {/* Progress Icon */}
            <div className='shrink-0 mt-1'>
              {getProgressIcon()}
            </div>

            {/* Content */}
            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center gap-2'>
                <span className={clsx(
                  'text-xs font-semibold tracking-wide uppercase',
                  prompt.isUnlocked ? 'text-yellow-600' : 'text-(--secondary-color)'
                )}>
                  {prompt.isUnlocked ? 'Achievement Unlocked!' : 'Progress Update'}
                </span>
                <span className={clsx('text-xs', getRarityColor())}>
                  {prompt.achievement.rarity}
                </span>
              </div>

              <h4 className='mb-1 truncate text-sm font-semibold text-(--main-color)'>
                {prompt.achievement.icon} {prompt.achievement.title}
              </h4>

              <p className='mb-2 line-clamp-2 text-xs text-(--secondary-color)'>
                {prompt.context}
                {prompt.achievement.description}
              </p>

              {/* Progress Bar */}
              <div className='mb-2'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs font-medium text-(--secondary-color)'>
                    {prompt.isUnlocked ? 'Completed!' : `${Math.round(prompt.progress)}%`}
                  </span>
                  {!prompt.isUnlocked && prompt.nextMilestone && (
                    <span className='text-xs text-(--secondary-color)'>
                      Next: {prompt.nextMilestone}%
                    </span>
                  )}
                </div>
                <div className='w-full bg-gray-200 rounded-full h-1.5'>
                  <motion.div
                    className={clsx(
                      'h-1.5 rounded-full transition-colors duration-300',
                      prompt.isUnlocked
                        ? 'bg-linear-to-r from-yellow-400 to-yellow-600'
                        : 'bg-blue-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${prompt.progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Points indicator */}
              <div className='flex items-center justify-between'>
                <span className={clsx(
                  'text-xs font-medium',
                  prompt.isUnlocked ? 'text-yellow-600' : 'text-(--secondary-color)'
                )}>
                  {prompt.isUnlocked ? `+${prompt.achievement.points} points` : `${prompt.achievement.points} points`}
                </span>
                <span className='text-xs text-(--secondary-color) opacity-75'>
                  Click to dismiss
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Container component for managing achievement prompts
export const AchievementPromptsContainer = () => {
  const [isClient, setIsClient] = useState(false);
  const { recentPrompts, clearPrompts } = useAchievementPrompts();
  const [prompts, setPrompts] = useState<AchievementPrompt[]>([]);

  // Sync prompts with hook results
  useEffect(() => {
    setPrompts(recentPrompts);
  }, [recentPrompts]);

  // Client-side only initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || prompts.length === 0) {
    return null;
  }

  const handleDismiss = (index: number) => {
    // Remove the specific prompt by recreating the array without it
    setPrompts((prev: AchievementPrompt[]) => prev.filter((_: AchievementPrompt, i: number) => i !== index));
  };

  return (
    <div className='fixed top-20 right-4 z-40 space-y-2'>
      {prompts.map((prompt, index) => (
        <motion.div
          key={`${prompt.achievement.id}-${index}`}
          initial={{ y: -20 * index }}
          animate={{ y: 0 }}
          style={{ zIndex: 40 - index }}
        >
          <AchievementPromptCard
            prompt={prompt}
            onDismiss={() => handleDismiss(index)}
          />
        </motion.div>
      ))}

      {/* Clear all button if multiple prompts */}
      {prompts.length > 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            clearPrompts();
            setPrompts([]);
          }}
          className={clsx(
            'w-full p-2 text-xs text-(--secondary-color)',
            'bg-(--card-color) border border-(--border-color) rounded',
            'hover:bg-(--background-color) transition-colors duration-200'
          )}
        >
          Clear all ({prompts.length})
        </motion.button>
      )}
    </div>
  );
};

export default AchievementPromptsContainer;

