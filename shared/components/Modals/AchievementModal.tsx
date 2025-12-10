'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { X, Trophy, Star, Zap, Crown, Gem } from 'lucide-react';
import { LucideProps } from 'lucide-react'; //
import confetti from 'canvas-confetti';
import {
  type Achievement,
  type AchievementRarity
} from '@/features/Achievements/store/useAchievementStore';
import { useClick } from '@/shared/hooks/useAudio';
import { cardBorderStyles, buttonBorderStyles } from '@/shared/lib/styles';

const rarityConfig: Record<
  AchievementRarity,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.FC<LucideProps>;
    label: string;
    confettiColors: string[];
  }
> = {
  common: {
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    icon: Star,
    label: 'Common',
    confettiColors: ['#9CA3AF', '#D1D5DB']
  },
  uncommon: {
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: Zap,
    label: 'Uncommon',
    confettiColors: ['#10B981', '#34D399']
  },
  rare: {
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    icon: Trophy,
    label: 'Rare',
    confettiColors: ['#3B82F6', '#60A5FA']
  },
  epic: {
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    icon: Crown,
    label: 'Epic',
    confettiColors: ['#8B5CF6', '#A78BFA']
  },
  legendary: {
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    icon: Gem,
    label: 'Legendary',
    confettiColors: ['#EF4444', '#F87171', '#FCD34D', '#FBBF24']
  }
};

interface AchievementModalProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
}

const AchievementModal = ({
  achievement,
  isVisible,
  onClose
}: AchievementModalProps) => {
  const { playClick } = useClick();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && achievement) {
      setShowConfetti(true);

      // Trigger confetti animation
      // const config = rarityConfig[achievement.rarity];
      // const colors = config.confettiColors;

      // Multiple confetti bursts for higher rarity
      const burstCount =
        achievement.rarity === 'legendary'
          ? 5
          : achievement.rarity === 'epic'
          ? 4
          : achievement.rarity === 'rare'
          ? 3
          : 2;

      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
          confetti({
            particleCount: achievement.rarity === 'legendary' ? 150 : 100,
            spread: 70,
            origin: { y: 0.6 },
            // colors: colors,
            shapes: ['circle', 'square'],
            scalar: achievement.rarity === 'legendary' ? 1.2 : 1,
            gravity: 0.8,
            ticks: 300
          });
        }, i * 200);
      }

      // Special effects for legendary achievements
      if (achievement.rarity === 'legendary') {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
            // colors: colors
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
            // colors: colors
          });
        }, 1000);
      }

      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement]);

  const handleClose = () => {
    playClick();
    onClose();
  };

  if (!achievement) return null;

  const config = rarityConfig[achievement.rarity];
  const RarityIcon = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]'
          onClick={e => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          role='dialog'
          aria-modal='true'
          aria-labelledby='achievement-modal-title'
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
              'w-full max-w-md relative',
              'rounded-2xl bg-[var(--card-color)]',
              'shadow-2xl shadow-black/25',
              cardBorderStyles
            )}
            onClick={e => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: showConfetti ? 0.3 : 0,
                scale: showConfetti ? 1.2 : 0.8
              }}
              className='absolute inset-0 rounded-2xl blur-xl'
              style={{ backgroundColor: config.color }}
            />

            {/* Header with close button */}
            <div className='absolute top-4 right-4 z-10'>
              <button
                onClick={handleClose}
                className={clsx(
                  'p-2 rounded-lg transition-colors duration-200',
                  'hover:bg-[var(--background-color)]',
                  'text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                )}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className='p-8 text-center space-y-6 relative z-10'>
              {/* Achievement Unlocked Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className='space-y-2'
              >
                <h2
                  id='achievement-modal-title'
                  className='text-lg font-semibold text-[var(--main-color)] uppercase tracking-wide'
                >
                  Achievement Unlocked!
                </h2>

                {/* Rarity Badge */}
                <div className='flex items-center justify-center gap-2'>
                  <RarityIcon size={16} style={{ color: config.color }} />
                  <span
                    className='text-sm font-medium uppercase tracking-wider'
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>
              </motion.div>

              {/* Achievement Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.4,
                  type: 'spring',
                  damping: 15,
                  stiffness: 300
                }}
                className='relative'
              >
                <div
                  className={clsx(
                    'w-24 h-24 mx-auto rounded-full flex items-center justify-center',
                    'text-4xl font-bold shadow-lg',
                    'border-4'
                  )}
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    color: config.color
                  }}
                >
                  {achievement.icon}
                </div>

                {/* Animated ring for legendary */}
                {achievement.rarity === 'legendary' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className='absolute inset-0 rounded-full border-2 border-dashed'
                    style={{ borderColor: config.color }}
                  />
                )}
              </motion.div>

              {/* Achievement Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className='space-y-3'
              >
                <h3 className='text-2xl font-bold text-[var(--main-color)]'>
                  {achievement.title}
                </h3>
                <p className='text-[var(--secondary-color)] leading-relaxed'>
                  {achievement.description}
                </p>
              </motion.div>

              {/* Points Earned */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', damping: 20 }}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                  'font-semibold text-sm'
                )}
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                  border: `2px solid ${config.borderColor}`
                }}
              >
                <Trophy size={16} />+{achievement.points} Points
              </motion.div>

              {/* Rewards (if any) */}
              {achievement.rewards && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className='space-y-2'
                >
                  <h4 className='text-sm font-semibold text-[var(--main-color)] uppercase tracking-wide'>
                    Rewards Unlocked
                  </h4>
                  <div className='flex flex-wrap justify-center gap-2'>
                    {achievement.rewards.themes?.map((theme, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-[var(--background-color)] text-[var(--secondary-color)] rounded-full text-xs'
                      >
                        {theme} Theme
                      </span>
                    ))}
                    {achievement.rewards.fonts?.map((font, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-[var(--background-color)] text-[var(--secondary-color)] rounded-full text-xs'
                      >
                        {font} Font
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <button
                  onClick={handleClose}
                  className={clsx(
                    'px-8 py-3 rounded-xl font-medium',
                    'text-[var(--main-color)]',
                    buttonBorderStyles,
                    'hover:bg-[var(--background-color)] transition-all duration-200',
                    'active:scale-95'
                  )}
                >
                  Continue Learning
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementModal;
